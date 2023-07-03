import { DownloadOutlined } from '@ant-design/icons'
import { gql, useApolloClient } from '@apollo/client'
import { Button, Col, DatePicker, Form, Input, message, Row, Select } from 'antd'
import moment from 'moment'
import { flatten, uniq } from 'ramda'
import { RangeValue } from 'rc-picker/lib/interface'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { AllMemberSelector } from '../../components/form/MemberSelector'
import MemberPropertySelector from '../../components/member/MemberPropertySelector'
import ProgramPackageCategorySelect from '../../components/programPackage/ProgramPackageCategorySelect'
import { OwnedProgramPackageSelector } from '../../components/programPackage/ProgramPackageSelector'
import hasura from '../../hasura'
import { downloadCSV, toCSV } from '../../helpers'
import pageMessages from '../translation'
import { GetMaterialAuditLog, GetMaterialLogMembers } from './ProgramProcessBlock'

type ProgramPackageFilter =
  | { type: 'all' }
  | { type: 'selectedProgramPackage'; programPackageIds: string[] }
  | { type: 'selectedCategory'; categoryIds: string[] }

type MemberFilter =
  | { type: 'enrolledMember' }
  | { type: 'selectedMember'; memberIds: string[] }
  | { type: 'property'; propertyId?: string; valueLike: string }

const ProgramPackageProcessBlock: React.VFC = () => {
  const apolloClient = useApolloClient()
  const { formatMessage } = useIntl()
  const [exporting, setExporting] = useState(false)
  const [startedAt, setStartedAt] = useState<Date | null>(moment().startOf('month').startOf('minute').toDate())
  const [endedAt, setEndedAt] = useState<Date | null>(moment().endOf('month').startOf('minute').toDate())
  const [programPackageFilter, setProgramPackageFilter] = useState<ProgramPackageFilter>({ type: 'all' })
  const [memberFilter, setMemberFilter] = useState<MemberFilter>({ type: 'enrolledMember' })

  const programPackageCondition =
    programPackageFilter.type === 'all'
      ? {}
      : programPackageFilter.type === 'selectedCategory'
      ? {
          program_package_categories: { category_id: { _in: programPackageFilter.categoryIds } },
        }
      : {
          id: { _in: programPackageFilter.programPackageIds },
        }

  const memberCondition =
    memberFilter.type === 'enrolledMember'
      ? {}
      : memberFilter.type === 'selectedMember'
      ? {
          id: { _in: memberFilter.memberIds },
        }
      : {
          member_properties: {
            property_id: { _eq: memberFilter.propertyId },
            value: { _ilike: `%${memberFilter.valueLike}%` },
          },
        }

  const handleExport = () => {
    setExporting(true)
    apolloClient
      .query<
        hasura.GET_ADVANCED_PROGRAM_PACKAGE_CONTENT_PROGRESS,
        hasura.GET_ADVANCED_PROGRAM_PACKAGE_CONTENT_PROGRESSVariables
      >({
        query: GET_ADVANCED_PROGRAM_PACKAGE_CONTENT_PROGRESS,
        variables: {
          programPackageCondition,
          memberCondition,
          startedAt,
          endedAt,
        },
      })
      .then(async ({ data }) => {
        const rows: string[][] = [
          [
            formatMessage(pageMessages.ProgramPackageProcessBlock.programPackageTitle),
            formatMessage(pageMessages.ProgramPackageProcessBlock.programPackageCategories),
            formatMessage(pageMessages['*'].programTitle),
            formatMessage(pageMessages['*'].programContentSectionTitle),
            formatMessage(pageMessages['*'].programContentTitle),
            formatMessage(pageMessages.ProgramPackageProcessBlock.instructorName),
            formatMessage(pageMessages['*'].memberName),
            formatMessage(pageMessages['*'].memberEmail),
            ...data.property.map(v => v.name),
            formatMessage(pageMessages.ProgramPackageProcessBlock.minutes),
          ],
        ]
        const editors = uniq(
          flatten(
            data.program_package_plan_enrollment.map(
              v =>
                v.program_package_plan?.program_package.program_package_programs.map(w =>
                  w.program.editors.map(x => x?.member_id || ''),
                ) || [],
            ),
          ),
        )
        let editorNames: { [key: string]: string } = {}
        await apolloClient
          .query<hasura.GET_EDITORS, hasura.GET_EDITORSVariables>({
            query: GET_EDITORS,
            variables: { memberIds: editors },
          })
          .then(({ data }) => {
            editorNames = data.member.reduce((accumulator, value) => {
              return { ...accumulator, [value.id]: value.name }
            }, {})
          })
          .catch(error => message.error(error))
        data.program_package_plan_enrollment.forEach(pe => {
          const programPackageTitle = pe.program_package_plan?.program_package.title || ''
          const categories =
            pe.program_package_plan?.program_package.program_package_categories
              .map(ppc => ppc.category.name)
              .join(',') || ''
          pe.program_package_plan?.program_package.program_package_programs.forEach(ppp => {
            const programTitle = ppp.program.title
            const editors = uniq(ppp.program.editors)
              .map(e => editorNames[e?.member_id || ''])
              .join(',')
            ppp.program.program_content_sections.forEach(pcs => {
              const programContentSectionTitle = pcs.title
              pcs.program_contents.forEach(pc => {
                const programContentTitle = pc.title
                const programContentDuration = pc.duration
                data.program_package_plan_enrollment.forEach(pe => {
                  const memberName = pe.member?.name || ''
                  const memberEmail = pe.member?.email || ''
                  const memberProgramContentProgress = pc.program_content_progress.find(
                    pcp => pcp.member_id === pe.member?.id,
                  )
                  const watchedProgress = memberProgramContentProgress?.progress || 0
                  const watchedDuration = programContentDuration * watchedProgress
                  rows.push([
                    programPackageTitle,
                    categories,
                    programTitle,
                    programContentSectionTitle,
                    programContentTitle,
                    editors,
                    memberName,
                    memberEmail,
                    ...data.property.map(
                      v => pe.member?.member_properties.find(mp => mp.property_id === v.id)?.value || '',
                    ),
                    Math.ceil(Number(watchedDuration) / 60).toString(),
                  ])
                })
              })
            })
          })
        })
        downloadCSV('learning_program_package_' + moment().format('MMDDSSS'), toCSV(uniq(rows)))
      })
      .catch(error => {
        message.error(error)
      })
      .finally(() => setExporting(false))
  }

  const handleExportMaterialLog = async () => {
    setExporting(true)
    try {
      const { data: enrolledProgramPackageData } = await apolloClient.query<
        hasura.GetMaterialAuditLogEnrolledProgramPackage,
        hasura.GetMaterialAuditLogEnrolledProgramPackageVariables
      >({
        query: GetMaterialAuditLogEnrolledProgramPackage,
        variables: {
          programPackageCondition,
          memberCondition,
        },
      })
      const programIds = uniq(
        flatten(
          enrolledProgramPackageData.program_package_plan_enrollment.map(pple =>
            pple.program_package_plan?.program_package.program_package_programs.map(ppp => ppp.program.id),
          ),
        ),
      )
      const { data: programContentData } = await apolloClient.query<
        hasura.GetProgramContentByProgramId,
        hasura.GetProgramContentByProgramIdVariables
      >({
        query: GetProgramContentByProgramId,
        variables: {
          programIds: programIds,
        },
      })
      const { data: programData } = await apolloClient.query<
        hasura.GetProgramPackageByProgramId,
        hasura.GetProgramPackageByProgramIdVariables
      >({
        query: GetProgramPackageByProgramId,
        variables: {
          programIds: programIds,
        },
      })
      const { data: materialAuditLogData } = await apolloClient.query<
        hasura.GetMaterialAuditLog,
        hasura.GetMaterialAuditLogVariables
      >({
        query: GetMaterialAuditLog,
        variables: {
          memberCondition,
          programContentIds: programContentData.program_content.map(pc => pc.id),
        },
      })
      const { data: memberData } = await apolloClient.query<
        hasura.GetMaterialLogMembers,
        hasura.GetMaterialLogMembersVariables
      >({
        query: GetMaterialLogMembers,
        variables: { memberIds: materialAuditLogData.material_audit_log.map(mal => mal.member_id) },
      })

      const rows: string[][] = [
        [
          formatMessage(pageMessages.ProgramPackageProcessBlock.programPackageCategories),
          formatMessage(pageMessages.ProgramPackageProcessBlock.programPackageTitle),
          formatMessage(pageMessages['*'].programCategories),
          formatMessage(pageMessages['*'].programTitle),
          formatMessage(pageMessages['*'].programContentSectionTitle),
          formatMessage(pageMessages['*'].programContentTitle),
          formatMessage(pageMessages['*'].programContentType),
          formatMessage(pageMessages['*'].materialName),
          formatMessage(pageMessages['*'].downloadedAt),
          formatMessage(pageMessages['*'].memberName),
          formatMessage(pageMessages['*'].memberEmail),
          ...memberData.property.map(property => property.name),
        ],
      ]
      materialAuditLogData.material_audit_log.forEach(v => {
        const programContent = programContentData.program_content.find(
          pc => pc.id === v.program_content_material?.program_content_id,
        )
        const member = memberData.member.find(m => m.id === v.member_id)
        const programPackageCategories = uniq(
          flatten(
            programData.program.map(p =>
              p.program_package_programs.map(ppp =>
                ppp.program_package.program_package_categories.map(ppc => ppc.category.name),
              ),
            ),
          ),
        ).join('')
        const programPackageTitle = uniq(
          flatten(programData.program.map(p => p.program_package_programs.map(ppp => ppp.program_package.title))),
        )
        const programCategories = programContent?.program_content_section.program.program_categories
          .map(ppc => ppc.category.name)
          .join(',')
        const programTitle = programContent?.program_content_section.program.title
        const programContentSectionTitle = programContent?.program_content_section.title
        const programContentTitle = programContent?.title
        const programContentType = programContent?.content_type
        const materialName = v.program_content_material?.data?.name
        const downloadedAt = v.created_at
        rows.push([
          programPackageCategories,
          programPackageTitle,
          programCategories,
          programTitle,
          programContentSectionTitle,
          programContentTitle,
          programContentType,
          materialName,
          downloadedAt,
          member?.name,
          member?.email,
          ...memberData.property.map(p => member?.member_properties.find(mp => mp.property_id === p.id)?.value),
        ])
      })
      downloadCSV('programPackageMaterialDownloadLog_' + moment().format('MMDDSSS'), toCSV(rows))
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message)
      }
    } finally {
      setExporting(false)
    }
  }

  const handleRangePickerChange = (v: RangeValue<moment.Moment>) => {
    v && v[0] && setStartedAt(v?.[0].startOf('minute').toDate())
    v && v[1] && setEndedAt(v[1].startOf('minute').toDate())
  }

  return (
    <Form labelCol={{ span: 3 }} wrapperCol={{ span: 13 }} layout="horizontal">
      <Form.Item label={formatMessage(pageMessages['*'].programPackage)}>
        <Input.Group size="large">
          <Row gutter={8}>
            <Col span={8}>
              <Select
                style={{ width: '100%' }}
                value={programPackageFilter.type}
                onSelect={v =>
                  v === 'all'
                    ? setProgramPackageFilter({ type: v })
                    : v === 'selectedCategory'
                    ? setProgramPackageFilter({ type: v, categoryIds: [] })
                    : setProgramPackageFilter({ type: v, programPackageIds: [] })
                }
              >
                <Select.Option value="all">
                  {formatMessage(pageMessages.ProgramPackageProcessBlock.allProgramPackage)}
                </Select.Option>
                <Select.Option value="selectedProgramPackage">
                  {formatMessage(pageMessages.ProgramPackageProcessBlock.selectedProgramPackage)}
                </Select.Option>
                <Select.Option value="selectedCategory">
                  {formatMessage(pageMessages.ProgramPackageProcessBlock.selectedPackageCategory)}
                </Select.Option>
              </Select>
            </Col>
            {programPackageFilter.type === 'selectedCategory' && (
              <Col span={16}>
                <ProgramPackageCategorySelect
                  placeholder={formatMessage(pageMessages.ProgramPackageProcessBlock.chooseProgramPackageCategory)}
                  value={programPackageFilter.categoryIds}
                  onChange={categoryIds =>
                    setProgramPackageFilter({
                      ...programPackageFilter,
                      categoryIds: Array.isArray(categoryIds) ? categoryIds : [categoryIds],
                    })
                  }
                />
              </Col>
            )}
            {programPackageFilter.type === 'selectedProgramPackage' && (
              <Col span={16}>
                <OwnedProgramPackageSelector
                  noAll
                  mode="multiple"
                  showArrow
                  placeholder={formatMessage(pageMessages.ProgramPackageProcessBlock.chooseProgramPackage)}
                  value={programPackageFilter.programPackageIds}
                  onChange={programPackageIds =>
                    setProgramPackageFilter({
                      ...programPackageFilter,
                      programPackageIds: Array.isArray(programPackageIds) ? programPackageIds : [programPackageIds],
                    })
                  }
                />
              </Col>
            )}
          </Row>
        </Input.Group>
      </Form.Item>
      <Form.Item label={formatMessage(pageMessages['*'].member)}>
        <Input.Group size="large">
          <Row gutter={8}>
            <Col span={8}>
              <Select
                style={{ width: '100%' }}
                value={memberFilter.type}
                onSelect={v =>
                  v === 'enrolledMember'
                    ? setMemberFilter({ type: v })
                    : v === 'selectedMember'
                    ? setMemberFilter({ type: v, memberIds: [] })
                    : setMemberFilter({ type: v, propertyId: undefined, valueLike: '' })
                }
              >
                <Select.Option value="enrolledMember">{formatMessage(pageMessages['*'].enrolledMember)}</Select.Option>
                <Select.Option value="selectedMember">{formatMessage(pageMessages['*'].selectedMember)}</Select.Option>
                <Select.Option value="property">{formatMessage(pageMessages['*'].property)}</Select.Option>
              </Select>
            </Col>
            {memberFilter.type === 'property' && (
              <>
                <Col span={8}>
                  <MemberPropertySelector
                    mode={undefined}
                    showArrow
                    showSearch={false}
                    allowClear={false}
                    placeholder={formatMessage(pageMessages.ProgramProcessBlock.chooseProperty)}
                    value={memberFilter.propertyId}
                    onChange={propertyId =>
                      setMemberFilter({
                        ...memberFilter,
                        propertyId: Array.isArray(propertyId) ? propertyId[0] : propertyId,
                      })
                    }
                  />
                </Col>
                <Col span={8}>
                  <Input
                    placeholder={formatMessage(pageMessages.ProgramProcessBlock.containKeyword)}
                    value={memberFilter.valueLike}
                    onChange={e => setMemberFilter({ ...memberFilter, valueLike: e.target.value })}
                  />
                </Col>
              </>
            )}
            {memberFilter.type === 'selectedMember' && (
              <Col span={16}>
                <AllMemberSelector
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder={formatMessage(pageMessages['*'].chooseMember)}
                  value={memberFilter.memberIds}
                  onChange={memberIds =>
                    setMemberFilter({
                      ...memberFilter,
                      memberIds: Array.isArray(memberIds) ? memberIds : [memberIds],
                    })
                  }
                />
              </Col>
            )}
          </Row>
        </Input.Group>
      </Form.Item>
      <Form.Item
        label={formatMessage(pageMessages['*'].date)}
        extra={
          <span style={{ fontSize: '14px' }}>
            {formatMessage(pageMessages.ProgramPackageProcessBlock.rangePickText)}
          </span>
        }
      >
        <DatePicker.RangePicker
          format="YYYY-MM-DD"
          showTime
          value={[moment(startedAt), moment(endedAt)]}
          onChange={v => handleRangePickerChange(v)}
        />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 2 }}>
        <Button className="mr-4" loading={exporting} type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
          {formatMessage(pageMessages.ProgramProcessBlock.exportProgramProgress)}
        </Button>
        <Button loading={exporting} type="primary" icon={<DownloadOutlined />} onClick={handleExportMaterialLog}>
          {formatMessage(pageMessages.ProgramProcessBlock.exportMaterialAuditLog)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const GET_EDITORS = gql`
  query GET_EDITORS($memberIds: [String!]) {
    member(where: { id: { _in: $memberIds } }) {
      id
      name
    }
  }
`
const GET_ADVANCED_PROGRAM_PACKAGE_CONTENT_PROGRESS = gql`
  query GET_ADVANCED_PROGRAM_PACKAGE_CONTENT_PROGRESS(
    $programPackageCondition: program_package_bool_exp
    $memberCondition: member_bool_exp
    $startedAt: timestamptz
    $endedAt: timestamptz
  ) {
    property(where: { type: { _eq: "member" } }) {
      id
      name
    }
    program_package_plan_enrollment(
      where: { program_package_plan: { program_package: $programPackageCondition }, member: $memberCondition }
    ) {
      member {
        id
        name
        email
        member_properties {
          property_id
          value
        }
      }
      program_package_plan {
        program_package {
          title
          program_package_categories(order_by: { position: asc }) {
            category {
              name
            }
          }
          program_package_programs {
            program {
              title
              editors {
                member_id
              }
              program_content_sections(order_by: { position: asc }) {
                title
                program_contents(order_by: { position: asc }) {
                  title
                  duration
                  program_content_progress(where: { updated_at: { _lte: $endedAt, _gte: $startedAt } }) {
                    member_id
                    progress
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

const GetMaterialAuditLogEnrolledProgramPackage = gql`
  query GetMaterialAuditLogEnrolledProgramPackage(
    $programPackageCondition: program_package_bool_exp
    $memberCondition: member_bool_exp
  ) {
    program_package_plan_enrollment(
      where: { program_package_plan: { program_package: $programPackageCondition }, member: $memberCondition }
    ) {
      program_package_plan {
        id
        program_package {
          id
          program_package_programs {
            id
            program {
              id
            }
          }
        }
      }
    }
  }
`
const GetProgramPackageByProgramId = gql`
  query GetProgramPackageByProgramId($programIds: [uuid!]) {
    program(where: { id: { _in: $programIds } }) {
      id
      program_package_programs {
        id
        program_package {
          id
          title
          program_package_categories(order_by: { position: asc }) {
            category {
              name
            }
          }
        }
      }
    }
  }
`
const GetProgramContentByProgramId = gql`
  query GetProgramContentByProgramId($programIds: [uuid!]) {
    program_content(where: { program_content_section: { program: { id: { _in: $programIds } } } }) {
      id
      title
      content_type
      program_content_section {
        id
        title
        program {
          id
          title
          program_categories(order_by: { position: asc }) {
            category {
              name
            }
          }
        }
      }
    }
  }
`

export default ProgramPackageProcessBlock
