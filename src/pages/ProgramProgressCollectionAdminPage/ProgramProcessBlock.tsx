import { DownloadOutlined } from '@ant-design/icons'
import { gql, useApolloClient } from '@apollo/client'
import { Button, Col, DatePicker, Form, Input, message, Row, Select } from 'antd'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import moment, { Moment } from 'moment'
import { sum } from 'ramda'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { AllMemberSelector } from '../../components/form/MemberSelector'
import MemberPropertySelector from '../../components/member/MemberPropertySelector'
import ProgramCategorySelect from '../../components/program/ProgramCategorySelect'
import { OwnedProgramSelector } from '../../components/program/ProgramSelector'
import hasura from '../../hasura'
import { downloadCSV, stableSort, toCSV } from '../../helpers'
import pageMessages from '../translation'

type MemberFilter =
  | { type: 'all' }
  | { type: 'selectedMember'; memberIds: string[] }
  | { type: 'property'; propertyId?: string; valueLike: string }

type ProgramFilter =
  | { type: 'all' }
  | { type: 'selectedProgram'; programIds: string[] }
  | { type: 'selectedCategory'; categoryIds: string[] }

dayjs.extend(utc)
dayjs.extend(timezone)
let currentTimeZone = dayjs.tz.guess()

const ProgramProcessBlock: React.VFC = () => {
  const apolloClient = useApolloClient()
  const { formatMessage } = useIntl()
  const [programProcessExporting, setProgramProcessExporting] = useState(false)
  const [materialAuditLogExporting, setMaterialAuditLogExporting] = useState(false)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Moment | null>(null)
  const [programFilter, setProgramFilter] = useState<ProgramFilter>({ type: 'all' })
  const [memberFilter, setMemberFilter] = useState<MemberFilter>({ type: 'selectedMember', memberIds: [] })

  const memberCondition =
    memberFilter.type === 'all'
      ? {}
      : memberFilter.type === 'selectedMember'
      ? { id: { _in: memberFilter.memberIds } }
      : {
          member_properties: {
            property_id: { _eq: memberFilter.propertyId },
            value: { _ilike: `%${memberFilter.valueLike}%` },
          },
        }
  const programCondition =
    programFilter.type === 'all'
      ? {}
      : programFilter.type === 'selectedCategory'
      ? {
          program_categories: { category_id: { _in: programFilter.categoryIds } },
        }
      : {
          id: { _in: programFilter.programIds },
        }

  const handleProgramProgressExport = () => {
    setProgramProcessExporting(true)
    apolloClient
      .query<hasura.GET_ADVANCED_PROGRAM_CONTENT_PROGRESS, hasura.GET_ADVANCED_PROGRAM_CONTENT_PROGRESSVariables>({
        query: GET_ADVANCED_PROGRAM_CONTENT_PROGRESS,
        variables: {
          memberCondition: memberCondition,
          programCondition: programCondition,
          lastUpdatedAt: lastUpdatedAt?.toDate(),
        },
      })
      .then(({ data }) => {
        const rows: string[][] = [
          [
            formatMessage(pageMessages['*'].programCategories),
            formatMessage(pageMessages['*'].programTitle),
            formatMessage(pageMessages['*'].programContentSectionTitle),
            formatMessage(pageMessages['*'].programContentTitle),
            formatMessage(pageMessages['*'].programContentType),
            formatMessage(pageMessages.ProgramProcessBlock.programContentDuration),
            formatMessage(pageMessages['*'].memberName),
            formatMessage(pageMessages['*'].memberEmail),
            ...data.property.map(p => p.name),
            formatMessage(pageMessages.ProgramProcessBlock.watchedDuration),
            formatMessage(pageMessages.ProgramProcessBlock.watchedPercentage),
            formatMessage(pageMessages.ProgramProcessBlock.firstWatchedAt),
            formatMessage(pageMessages.ProgramProcessBlock.lastWatchedAt),
            formatMessage(pageMessages.ProgramProcessBlock.totalPercentage),
            formatMessage(pageMessages.ProgramProcessBlock.exerciseStatus),
            formatMessage(pageMessages.ProgramProcessBlock.exerciseScores),
            formatMessage(pageMessages.ProgramProcessBlock.exercisePassedAt),
            formatMessage(pageMessages.ProgramProcessBlock.practices),
          ],
        ]
        data.program.forEach(p => {
          const categories = p.program_categories.map(pc => pc.category.name).join(',')
          const programTitle = p.title
          p.program_content_sections.forEach(pcs => {
            const programContentSectionTitle = pcs.title
            pcs.program_contents.forEach(pc => {
              const programContentTitle = pc.title
              const programContentDuration = pc.duration
              const programContentType = pc.program_content_body.type
              data.member.forEach(m => {
                const memberName = m.name
                const memberEmail = m.email
                const memberProgramContentProgress = pc.program_content_progress.find(pcp => pcp.member_id === m.id)
                const exercises = pc.exercises.filter(exercise => exercise.member_id === m.id)

                const firstWatchedAt = memberProgramContentProgress?.created_at || ''
                const lastWatchedAt = memberProgramContentProgress?.updated_at || ''

                const exercisePoint = exercises
                  .map(ex => {
                    const totalQuestionPoints = sum(
                      ex.answer.map((ans: { questionPoints: number }) => ans.questionPoints || 0),
                    )
                    const totalGainedPoints = sum(
                      ex.answer.map((ans: { gainedPoints: number }) => ans.gainedPoints || 0),
                    )
                    return `${totalGainedPoints}/${totalQuestionPoints}`
                  })
                  .join(', ')
                const hightestScore = exercises
                  .map(ex => ({
                    totalGainedPoints: sum(ex.answer.map((ans: { gainedPoints: number }) => ans.gainedPoints || 0)),
                    passingScore: ex.exam?.passing_score,
                    updatedAt: ex.updated_at,
                  }))
                  .reduce(
                    (accu, curr) => {
                      return curr.totalGainedPoints > accu.totalGainedPoints ? curr : accu
                    },
                    { totalGainedPoints: 0, updatedAt: null, passingScore: 0 },
                  )
                // TODO: remove exercise
                let exerciseStatus = ''
                if (programContentType === 'exercise' && hightestScore.updatedAt !== null) {
                  exerciseStatus =
                    hightestScore.totalGainedPoints >= pc.metadata?.passingScore
                      ? formatMessage(pageMessages.ProgramProcessBlock.exercisePassed)
                      : formatMessage(pageMessages.ProgramProcessBlock.exerciseFailed)
                } else if (programContentType === 'exam' && hightestScore.updatedAt !== null) {
                  exerciseStatus =
                    hightestScore.totalGainedPoints >= hightestScore.passingScore
                      ? formatMessage(pageMessages.ProgramProcessBlock.exercisePassed)
                      : formatMessage(pageMessages.ProgramProcessBlock.exerciseFailed)
                }

                const exercisePassedAt =
                  exerciseStatus === formatMessage(pageMessages.ProgramProcessBlock.exercisePassed)
                    ? hightestScore.updatedAt
                    : ''
                const examProgressPercentage =
                  exerciseStatus === formatMessage(pageMessages.ProgramProcessBlock.exercisePassed) &&
                  hightestScore.totalGainedPoints >= hightestScore.passingScore
                    ? 1
                    : 0
                const watchedProgress =
                  programContentType === 'exam' || programContentType === 'exercise'
                    ? examProgressPercentage
                    : memberProgramContentProgress?.progress || 0
                const watchedDuration = programContentDuration * watchedProgress
                let programContentProgress = p.program_content_sections.flatMap(pcs =>
                  pcs.program_contents.map(pc =>
                    pc.program_content_progress
                      .filter(pcp => pcp.member_id === m.id)
                      .map(contentProgress => contentProgress.progress || 0),
                  ),
                )

                const viewRate =
                  programContentProgress.length > 0
                    ? Math.floor(
                        (sum(programContentProgress.flatMap(item => item)) / programContentProgress.length) * 100,
                      )
                    : 0

                rows.push([
                  categories,
                  programTitle,
                  programContentSectionTitle,
                  programContentTitle,
                  programContentType,
                  Math.ceil(Number(programContentDuration) / 60).toString(),
                  memberName,
                  memberEmail,
                  ...data.property.map(p => m.member_properties.find(mp => mp.property_id === p.id)?.value || ''),
                  Math.ceil(Number(watchedDuration) / 60).toString(),
                  (watchedProgress * 100).toFixed(0) + '%',
                  firstWatchedAt && dayjs(firstWatchedAt).tz(currentTimeZone).format('YYYY-MM-DD HH:mm:ss'),
                  lastWatchedAt && dayjs(lastWatchedAt).tz(currentTimeZone).format('YYYY-MM-DD HH:mm:ss'),
                  viewRate + '%',
                  exerciseStatus,
                  exercisePoint,
                  exercisePassedAt && dayjs(exercisePassedAt).tz(currentTimeZone).format('YYYY-MM-DD HH:mm:ss'),
                  pc.practices.filter(p => p.member_id === m.id).length,
                ])
              })
            })
          })
        })
        const memberBaseRows = stableSort(rows, (a, b) => {
          if (a[7] > b[7]) return 1
          else if (a[7] < b[7]) return -1
          else return 0
        })
        downloadCSV('learning_' + moment().format('MMDDSSS'), toCSV(memberBaseRows))
      })
      .catch(error => {
        message.error(error)
      })
      .finally(() => setProgramProcessExporting(false))
  }

  const handleMaterialAuditLogExport = async () => {
    setMaterialAuditLogExporting(true)
    try {
      const { data: programContentData } = await apolloClient.query<
        hasura.GetProgramContentByProgramCondition,
        hasura.GetProgramContentByProgramConditionVariables
      >({
        query: GetProgramContentByProgramCondition,
        variables: {
          programCondition,
        },
      })
      const { data: materialAuditLogData } = await apolloClient.query<
        hasura.GetMaterialAuditLog,
        hasura.GetMaterialAuditLogVariables
      >({
        query: GetMaterialAuditLog,
        variables: {
          memberCondition: memberCondition,
          programContentIds: programContentData.program_content.map(pc => pc.id),
          lastUpdatedAt: lastUpdatedAt?.toDate(),
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
        const member = memberData.member.find(m => m.id === v.member_id)
        const programContent = programContentData.program_content.find(
          pc => pc.id === v.program_content_material?.program_content?.id,
        )
        const categories = programContent?.program_content_section.program.program_categories
          .map(programCategory => programCategory.category.name)
          .join(',')
        const programTitle = programContent?.program_content_section.program.title
        const programContentSectionTitle = programContent?.program_content_section.title
        const programContentTitle = programContent?.title
        const programContentType = programContent?.content_type
        const materialName = v.program_content_material?.data?.name
        const downloadedAt = v.created_at
        const memberName = member?.name
        const memberEmail = member?.email

        rows.push([
          categories,
          programTitle,
          programContentSectionTitle,
          programContentTitle,
          programContentType,
          materialName,
          downloadedAt,
          memberName,
          memberEmail,
          ...memberData.property.map(p => member?.member_properties.find(mp => mp.property_id === p.id)?.value || ''),
        ])
      })
      downloadCSV('programMateriaDownloadLog_' + moment().format('MMDDSSS'), toCSV(rows))
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message)
      }
    } finally {
      setMaterialAuditLogExporting(false)
    }
  }

  return (
    <Form labelCol={{ span: 3 }} wrapperCol={{ span: 13 }} layout="horizontal">
      <Form.Item label={formatMessage(pageMessages['*'].program)}>
        <Input.Group size="large">
          <Row gutter={8}>
            <Col span={8}>
              <Select
                style={{ width: '100%' }}
                value={programFilter.type}
                onSelect={v =>
                  v === 'all'
                    ? setProgramFilter({ type: v })
                    : v === 'selectedCategory'
                    ? setProgramFilter({ type: v, categoryIds: [] })
                    : setProgramFilter({ type: v, programIds: [] })
                }
              >
                <Select.Option value="all">{formatMessage(pageMessages['*'].all)}</Select.Option>
                <Select.Option value="selectedProgram">
                  {formatMessage(pageMessages.ProgramProcessBlock.selectedProgram)}
                </Select.Option>
                <Select.Option value="selectedCategory">
                  {formatMessage(pageMessages['*'].selectedCategory)}
                </Select.Option>
              </Select>
            </Col>
            {programFilter.type === 'selectedCategory' && (
              <Col span={16}>
                <ProgramCategorySelect
                  placeholder={formatMessage(pageMessages.ProgramProcessBlock.chooseProgramCategory)}
                  value={programFilter.categoryIds}
                  onChange={categoryIds =>
                    setProgramFilter({
                      ...programFilter,
                      categoryIds: Array.isArray(categoryIds) ? categoryIds : [categoryIds],
                    })
                  }
                />
              </Col>
            )}
            {programFilter.type === 'selectedProgram' && (
              <Col span={16}>
                <OwnedProgramSelector
                  noAll
                  mode="multiple"
                  showArrow
                  placeholder={formatMessage(pageMessages.ProgramProcessBlock.chooseProgram)}
                  value={programFilter.programIds}
                  onChange={programIds =>
                    setProgramFilter({
                      ...programFilter,
                      programIds: Array.isArray(programIds) ? programIds : [programIds],
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
                  v === 'all'
                    ? setMemberFilter({ type: v })
                    : v === 'selectedMember'
                    ? setMemberFilter({ type: v, memberIds: [] })
                    : setMemberFilter({ type: v, propertyId: undefined, valueLike: '' })
                }
              >
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
          <span style={{ fontSize: '14px' }}>{formatMessage(pageMessages.ProgramProcessBlock.lastUpdatedAtText)}</span>
        }
      >
        <DatePicker onChange={setLastUpdatedAt} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 2 }}>
        <Button
          className="mr-4"
          loading={programProcessExporting}
          disabled={materialAuditLogExporting}
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleProgramProgressExport}
        >
          {formatMessage(pageMessages.ProgramProcessBlock.exportProgramProgress)}
        </Button>
        <Button
          loading={materialAuditLogExporting}
          disabled={programProcessExporting}
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleMaterialAuditLogExport}
        >
          {formatMessage(pageMessages.ProgramProcessBlock.exportMaterialAuditLog)}
        </Button>
      </Form.Item>
    </Form>
  )
}
const GET_ADVANCED_PROGRAM_CONTENT_PROGRESS = gql`
  query GET_ADVANCED_PROGRAM_CONTENT_PROGRESS(
    $memberCondition: member_bool_exp
    $programCondition: program_bool_exp
    $lastUpdatedAt: timestamptz
  ) {
    property(where: { type: { _eq: "member" } }) {
      id
      name
    }
    member(where: $memberCondition) {
      id
      name
      email
      member_properties {
        property_id
        value
      }
    }
    program(where: $programCondition) {
      title
      program_categories(order_by: { position: asc }) {
        category {
          name
        }
      }
      program_content_sections(order_by: { position: asc }) {
        title
        program_contents(order_by: { position: asc }) {
          title
          duration
          metadata
          practices(where: { updated_at: { _lte: $lastUpdatedAt } }) {
            member_id
          }
          exercises(where: { updated_at: { _lte: $lastUpdatedAt } }) {
            id
            member_id
            answer
            updated_at
            exam {
              passing_score
            }
          }
          program_content_progress(where: { updated_at: { _lte: $lastUpdatedAt } }) {
            member_id
            progress
            created_at
            updated_at
          }
          program_content_body {
            type
          }
        }
      }
    }
  }
`

export const GetMaterialAuditLog = gql`
  query GetMaterialAuditLog(
    $memberCondition: member_bool_exp
    $programContentIds: [uuid!]
    $lastUpdatedAt: timestamptz
  ) {
    material_audit_log(
      where: {
        member: $memberCondition
        program_content_material: { program_content_id: { _in: $programContentIds } }
        created_at: { _lte: $lastUpdatedAt }
      }
      order_by: { created_at: desc }
    ) {
      id
      member_id
      target
      created_at
      program_content_material {
        id
        data
        program_content {
          id
          title
          content_type
          program_content_section {
            id
            title
            program {
              id
              title
            }
          }
        }
      }
    }
  }
`

export const GetMaterialLogMembers = gql`
  query GetMaterialLogMembers($memberIds: [String!]) {
    member(where: { id: { _in: $memberIds } }) {
      id
      name
      email
      member_properties {
        property_id
        value
      }
    }
    property(where: { type: { _eq: "member" } }) {
      id
      name
    }
  }
`

const GetProgramContentByProgramCondition = gql`
  query GetProgramContentByProgramCondition($programCondition: program_bool_exp) {
    program_content(where: { program_content_section: { program: $programCondition } }) {
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

export default ProgramProcessBlock
