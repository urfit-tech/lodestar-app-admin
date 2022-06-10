import { DownloadOutlined } from '@ant-design/icons'
import { useApolloClient } from '@apollo/react-hooks'
import { Button, Col, DatePicker, Form, Input, message, Row, Select } from 'antd'
import gql from 'graphql-tag'
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
  const [loading, setLoading] = useState(false)
  const [startedAt, setStartedAt] = useState<Date | null>(
    moment().startOf('month').startOf('minute').subtract(3, 'months').toDate(),
  )
  const [endedAt, setEndedAt] = useState<Date | null>(moment().endOf('month').startOf('minute').toDate())
  const [programPackageFilter, setProgramPackageFilter] = useState<ProgramPackageFilter>({ type: 'all' })
  const [memberFilter, setMemberFilter] = useState<MemberFilter>({ type: 'enrolledMember' })

  const handleExport = () => {
    if (moment(endedAt).diff(moment(startedAt), 'months') > 3) {
      return message.warning(formatMessage(pageMessages.ProgramPackageProcessBlock.dateRangeWarning))
    }
    setLoading(true)

    apolloClient
      .query<
        hasura.GET_ADVANCED_PROGRAM_PACKAGE_CONTENT_PROGRESS,
        hasura.GET_ADVANCED_PROGRAM_PACKAGE_CONTENT_PROGRESSVariables
      >({
        query: GET_ADVANCED_PROGRAM_PACKAGE_CONTENT_PROGRESS,
        variables: {
          programPackageCondition:
            programPackageFilter.type === 'all'
              ? {}
              : programPackageFilter.type === 'selectedProgramPackage'
              ? {
                  id: { _in: programPackageFilter.programPackageIds },
                }
              : programPackageFilter.type === 'selectedCategory'
              ? {
                  program_package_categories: { category_id: { _in: programPackageFilter.categoryIds } },
                }
              : {},
          memberCondition:
            memberFilter.type === 'enrolledMember'
              ? {}
              : memberFilter.type === 'selectedMember'
              ? {
                  id: { _in: memberFilter.memberIds },
                }
              : memberFilter.type === 'property'
              ? {
                  member_properties: {
                    property_id: { _eq: memberFilter.propertyId },
                    value: { _ilike: `%${memberFilter.valueLike}%` },
                  },
                }
              : {},
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
        downloadCSV('learning_program_package_' + moment().format('MMDDSSS'), toCSV(rows))
      })
      .catch(error => {
        message.error(error)
      })
      .finally(() => setLoading(false))
  }

  const handleRangePickerChange = (v: RangeValue<moment.Moment>) => {
    const pickStartedAt = moment(v?.[0])
    const pickEndedAt = moment(v?.[1])
    const diffMonths = pickEndedAt?.diff(pickStartedAt, 'months')

    v && v[0] && setStartedAt(v?.[0].startOf('minute').toDate())
    v && v[1] && setEndedAt(v[1].startOf('minute').toDate())

    if (diffMonths > 3) {
      message.warning(formatMessage(pageMessages.ProgramPackageProcessBlock.dateRangeWarning))
    }
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
        <Button loading={loading} type="primary" icon={<DownloadOutlined />} className="mb-4" onClick={handleExport}>
          {formatMessage(pageMessages.ProgramProcessBlock.exportProgramProgress)}
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
export default ProgramPackageProcessBlock
