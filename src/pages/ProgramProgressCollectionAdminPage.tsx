import { DownloadOutlined, FileTextFilled } from '@ant-design/icons'
import { useApolloClient } from '@apollo/react-hooks'
import { Button, Col, DatePicker, Form, Input, message, Row, Select } from 'antd'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment, { Moment } from 'moment'
import { sum } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../components/admin'
import { AllMemberSelector } from '../components/form/MemberSelector'
import AdminLayout from '../components/layout/AdminLayout'
import MemberPropertySelector from '../components/member/MemberPropertySelector'
import ProgramCategorySelect from '../components/program/ProgramCategorySelect'
import { OwnedProgramSelector } from '../components/program/ProgramSelector'
import hasura from '../hasura'
import { downloadCSV, stableSort, toCSV } from '../helpers'
import { commonMessages } from '../helpers/translation'
import ForbiddenPage from './ForbiddenPage'
import LoadingPage from './LoadingPage'
import pageMessages from './translation'

type MemberFilter =
  | { type: 'all' }
  | { type: 'selectedMember'; memberIds: string[] }
  | { type: 'property'; propertyId: string; valueLike: string }

type ProgramFilter =
  | { type: 'all' }
  | { type: 'selectedProgram'; programIds: string[] }
  | { type: 'selectedCategory'; categoryIds: string[] }

const ProgramProgressCollectionAdminPage: React.FC = () => {
  const [exporting, setExporting] = useState(false)
  const { formatMessage } = useIntl()
  const { currentMemberId, permissions } = useAuth()
  const apolloClient = useApolloClient()
  const { enabledModules, loading } = useApp()
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
            formatMessage(pageMessages.ProgramProgressCollectionAdminPage.categories),
            formatMessage(pageMessages.ProgramProgressCollectionAdminPage.programTitle),
            formatMessage(pageMessages.ProgramProgressCollectionAdminPage.programContentSectionTitle),
            formatMessage(pageMessages.ProgramProgressCollectionAdminPage.programContentTitle),
            formatMessage(pageMessages.ProgramProgressCollectionAdminPage.programContentType),
            formatMessage(pageMessages.ProgramProgressCollectionAdminPage.programContentDuration),
            formatMessage(pageMessages.ProgramProgressCollectionAdminPage.memberName),
            formatMessage(pageMessages.ProgramProgressCollectionAdminPage.memberEmail),
            ...data.property.map(p => p.name),
            formatMessage(pageMessages.ProgramProgressCollectionAdminPage.watchedDuration),
            formatMessage(pageMessages.ProgramProgressCollectionAdminPage.watchedPercentage),
            formatMessage(pageMessages.ProgramProgressCollectionAdminPage.firstWatchedAt),
            formatMessage(pageMessages.ProgramProgressCollectionAdminPage.lastWatchedAt),
            formatMessage(pageMessages.ProgramProgressCollectionAdminPage.totalPercentage),
            formatMessage(pageMessages.ProgramProgressCollectionAdminPage.exerciseStatus),
            formatMessage(pageMessages.ProgramProgressCollectionAdminPage.exerciseScores),
            formatMessage(pageMessages.ProgramProgressCollectionAdminPage.exercisePassedAt),
            formatMessage(pageMessages.ProgramProgressCollectionAdminPage.practices),
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
                    ? hightestScore.totalGainedPoints > pc.metadata?.passingScore
                      ? formatMessage(pageMessages.ProgramProgressCollectionAdminPage.exercisePassed)
                      : formatMessage(pageMessages.ProgramProgressCollectionAdminPage.exerciseFailed)
                    : ''
                const exercisePassedAt =
                  exerciseStatus === formatMessage(pageMessages.ProgramProgressCollectionAdminPage.exercisePassed)
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
                  firstWatchedAt,
                  lastWatchedAt,
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

  if (!currentMemberId || loading) {
    return <LoadingPage />
  }

  if (!enabledModules.learning_statistics && !permissions.PROGRAM_PROGRESS_READ) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-5">
        <FileTextFilled className="mr-3" />
        <span>{formatMessage(commonMessages.menu.programProgress)}</span>
      </AdminPageTitle>

      <Form labelCol={{ span: 2 }} wrapperCol={{ span: 14 }} layout="horizontal">
        <Form.Item label={formatMessage(pageMessages.ProgramProgressCollectionAdminPage.program)}>
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
                  <Select.Option value="all">
                    {formatMessage(pageMessages.ProgramProgressCollectionAdminPage.all)}
                  </Select.Option>
                  <Select.Option value="selectedProgram">
                    {formatMessage(pageMessages.ProgramProgressCollectionAdminPage.selectedProgram)}
                  </Select.Option>
                  <Select.Option value="selectedCategory">
                    {formatMessage(pageMessages.ProgramProgressCollectionAdminPage.selectedCategory)}
                  </Select.Option>
                </Select>
              </Col>
              {programFilter.type === 'selectedCategory' && (
                <Col span={16}>
                  <ProgramCategorySelect
                    placeholder={formatMessage(pageMessages.ProgramProgressCollectionAdminPage.chooseProgramCategory)}
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
                    placeholder={formatMessage(pageMessages.ProgramProgressCollectionAdminPage.chooseProgram)}
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
        <Form.Item label={formatMessage(pageMessages.ProgramProgressCollectionAdminPage.member)}>
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
                      : setMemberFilter({ type: v, propertyId: '', valueLike: '' })
                  }
                >
                  <Select.Option value="selectedMember">
                    {formatMessage(pageMessages.ProgramProgressCollectionAdminPage.selectedMember)}
                  </Select.Option>
                  <Select.Option value="property">
                    {formatMessage(pageMessages.ProgramProgressCollectionAdminPage.property)}
                  </Select.Option>
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
                      placeholder={formatMessage(pageMessages.ProgramProgressCollectionAdminPage.chooseProperty)}
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
                      placeholder={formatMessage(pageMessages.ProgramProgressCollectionAdminPage.containKeyword)}
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
                    placeholder={formatMessage(pageMessages.ProgramProgressCollectionAdminPage.chooseMember)}
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
          label={formatMessage(pageMessages.ProgramProgressCollectionAdminPage.date)}
          extra={
            <span style={{ fontSize: '14px' }}>
              {formatMessage(pageMessages.ProgramProgressCollectionAdminPage.lastUpdatedAtText)}
            </span>
          }
        >
          <DatePicker onChange={setLastUpdatedAt} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 2 }}>
          <Button
            loading={exporting}
            type="primary"
            icon={<DownloadOutlined />}
            className="mb-4"
            onClick={handleExport}
          >
            {formatMessage(pageMessages.ProgramProgressCollectionAdminPage.exportProgramProgress)}
          </Button>
        </Form.Item>
      </Form>
    </AdminLayout>
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

export default ProgramProgressCollectionAdminPage
