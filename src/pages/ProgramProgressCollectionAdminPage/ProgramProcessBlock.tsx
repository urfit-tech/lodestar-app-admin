import { DownloadOutlined } from '@ant-design/icons'
import { useApolloClient } from '@apollo/react-hooks'
import { Button, Col, DatePicker, Form, Input, message, Row, Select } from 'antd'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import gql from 'graphql-tag'
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
  const [exporting, setExporting] = useState(false)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Moment | null>(null)
  const [programFilter, setProgramFilter] = useState<ProgramFilter>({ type: 'all' })
  const [memberFilter, setMemberFilter] = useState<MemberFilter>({ type: 'selectedMember', memberIds: [] })

  const handleExport = () => {
    setExporting(true)
    apolloClient
      .query<hasura.GET_ADVANCED_PROGRAM_CONTENT_PROGRESS, hasura.GET_ADVANCED_PROGRAM_CONTENT_PROGRESSVariables>({
        query: GET_ADVANCED_PROGRAM_CONTENT_PROGRESS,
        variables: {
          memberCondition:
            memberFilter.type === 'all'
              ? undefined
              : memberFilter.type === 'selectedMember'
              ? { id: { _in: memberFilter.memberIds } }
              : {
                  member_properties: {
                    property_id: { _eq: memberFilter.propertyId },
                    value: { _ilike: `%${memberFilter.valueLike}%` },
                  },
                },
          programCondition:
            programFilter.type === 'all'
              ? undefined
              : programFilter.type === 'selectedCategory'
              ? {
                  program_categories: { category_id: { _in: programFilter.categoryIds } },
                }
              : {
                  id: { _in: programFilter.programIds },
                },
          lastUpdatedAt: lastUpdatedAt?.toDate(),
        },
      })
      .then(({ data }) => {
        const rows: string[][] = [
          [
            formatMessage(pageMessages.ProgramProcessBlock.categories),
            formatMessage(pageMessages['*'].programTitle),
            formatMessage(pageMessages['*'].programContentSectionTitle),
            formatMessage(pageMessages['*'].programContentTitle),
            formatMessage(pageMessages.ProgramProcessBlock.programContentType),
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
          const programDuration = sum(
            p.program_content_sections.flatMap(pcs => pcs.program_contents.map(pc => pc.duration || 0)),
          )
          p.program_content_sections.forEach(pcs => {
            const programContentSectionTitle = pcs.title
            pcs.program_contents.forEach(pc => {
              const programContentTitle = pc.title
              const programContentDuration = pc.duration
              const programContentType = pc.program_content_body.type
              data.member.forEach(m => {
                const memberName = m.name
                const memberEmail = m.email
                const memberWatchedDuration = sum(
                  p.program_content_sections.flatMap(pcs =>
                    pcs.program_contents.flatMap(pc =>
                      pc.program_content_progress
                        .filter(pcp => pcp.member_id === m.id)
                        .map(pcp => pcp.progress * pc.duration),
                    ),
                  ),
                )
                const memberProgramContentProgress = pc.program_content_progress.find(pcp => pcp.member_id === m.id)
                const watchedProgress = memberProgramContentProgress?.progress || 0
                const firstWatchedAt = memberProgramContentProgress?.created_at || ''
                const lastWatchedAt = memberProgramContentProgress?.updated_at || ''
                const watchedDuration = programContentDuration * watchedProgress
                const exercises = pc.exercises.filter(exercise => exercise.member_id === m.id)
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
                    updatedAt: ex.updated_at,
                  }))
                  .reduce(
                    (accu, curr) => {
                      return curr.totalGainedPoints > accu.totalGainedPoints ? curr : accu
                    },
                    { totalGainedPoints: 0, updatedAt: null },
                  )
                const exerciseStatus =
                  programContentType === 'exercise'
                    ? hightestScore.totalGainedPoints >= pc.metadata?.passingScore
                      ? formatMessage(pageMessages.ProgramProcessBlock.exercisePassed)
                      : formatMessage(pageMessages.ProgramProcessBlock.exerciseFailed)
                    : ''
                const exercisePassedAt =
                  exerciseStatus === formatMessage(pageMessages.ProgramProcessBlock.exercisePassed)
                    ? hightestScore.updatedAt
                    : ''

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
                  ((memberWatchedDuration / (programDuration || 1)) * 100).toFixed(0) + '%',
                  exerciseStatus,
                  exercisePoint,
                  exercisePassedAt,
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
      .finally(() => setExporting(false))
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
        <Button loading={exporting} type="primary" icon={<DownloadOutlined />} className="mb-4" onClick={handleExport}>
          {formatMessage(pageMessages.ProgramProcessBlock.exportProgramProgress)}
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

export default ProgramProcessBlock
