import Icon from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Select, Skeleton, Spin, Table, Tabs } from 'antd'
import gql from 'graphql-tag'
import moment from 'moment'
import { flatten, sum, uniqBy } from 'ramda'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'
import hasura from '../../hasura'
import { commonMessages, errorMessages, programMessages } from '../../helpers/translation'
import { ReactComponent as BookIcon } from '../../images/icon/book.svg'
import { ExerciseProps, QuestionProps } from '../../types/program'

type FilterProps = {
  programId?: string
  contentId?: string
}

const ExerciseResultPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { currentUserRole, currentMemberId } = useAuth()

  const [filter, setFilter] = useState<FilterProps>({})

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <BookIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.practice)}</span>
      </AdminPageTitle>

      <div className="mb-4">
        <ProgramExerciseSelector
          creatorId={currentUserRole === 'content-creator' ? currentMemberId || '' : undefined}
          value={filter}
          onChange={value => setFilter(value)}
        />
      </div>

      {filter.contentId && <ExerciseResultBlock programContentId={filter.contentId} />}
    </AdminLayout>
  )
}

const ProgramExerciseSelector: React.VFC<{
  creatorId?: string
  value: FilterProps
  onChange?: (value: FilterProps) => void
}> = ({ creatorId, value, onChange }) => {
  const { formatMessage } = useIntl()
  const { loadingPrograms, errorPrograms, programs } = useProgramWithExercises(creatorId)

  if (loadingPrograms) {
    return <Spin />
  }

  if (errorPrograms) {
    return <>{formatMessage(errorMessages.data.fetch)}</>
  }

  return (
    <>
      <Select
        showSearch
        placeholder={<>{formatMessage(programMessages.label.select)}</>}
        optionFilterProp="children"
        value={value.programId || undefined}
        onChange={newProgramId =>
          onChange?.({
            programId: newProgramId,
          })
        }
        className="mr-3"
        style={{ width: '24rem' }}
      >
        {programs.map(program => (
          <Select.Option key={program.id} value={program.id}>
            {program.title}
          </Select.Option>
        ))}
      </Select>
      <Select
        showSearch
        placeholder={<>{formatMessage(programMessages.label.selectExercise)}</>}
        optionFilterProp="children"
        value={value.contentId || undefined}
        onChange={newContentId =>
          onChange?.({
            programId: value.programId,
            contentId: newContentId,
          })
        }
        style={{ width: '12rem' }}
      >
        {programs
          .find(program => program.id === value.programId)
          ?.contents.map(content => (
            <Select.Option key={content.id} value={content.id}>
              {content.title}
            </Select.Option>
          ))}
      </Select>
    </>
  )
}

const SummaryBlock = styled.div`
  background: white;
`
const StyledSummaryTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.6;
  letter-spacing: 0.8px;
`
const StyledSummaryMeta = styled.div`
  color: var(--gray-dark);
  letter-spacing: 0.2px;
`
const StyledSummaryCount = styled.div`
  color: var(--gray-darker);
  line-height: 1.5;
  letter-spacing: 0.2px;

  & + & {
    margin-left: 0.75rem;
    padding-left: 0.75rem;
    border-left: 1px solid var(--gray);
  }
`
const StyledTableWrapper = styled.div`
  color: var(--gray-darker);
  white-space: nowrap;
  line-height: 1.5;
  letter-spacing: 0.2px;
`
const StyledTag = styled.div<{ variant: 'accepted' | 'failed' }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: ${props => (props.variant === 'accepted' ? 'var(--success)' : 'var(--error)')};
  color: white;
  font-size: 12px;
`

const messages = defineMessages({
  averageScore: { id: 'program.text.averageScore', defaultMessage: '平均成績 {averageScore} 分' },
  exerciseInformation: {
    id: 'program.text.exerciseInformation',
    defaultMessage: '滿分 {totalPoints} 分，及格 {passingScore} 分',
  },
  totalStudents: { id: 'program.text.totalStudents', defaultMessage: '學生總數 {count} 人' },
  submittedStudents: { id: 'program.text.submittedStudents', defaultMessage: '作答人數 {count} 人' },
  acceptedStudents: { id: 'program.text.acceptedStudents', defaultMessage: '通過人數 {count} 人 ({percent}%)' },
  exerciseStatistics: { id: 'program.label.exerciseStatistics', defaultMessage: '答題狀況' },
  individualExercise: { id: 'program.label.individualExercise', defaultMessage: '個別表現' },
  exerciseCreatedAt: { id: 'program.label.exerciseCreatedAt', defaultMessage: '測驗日期' },
})

type ExerciseDisplayProps = ExerciseProps & {
  createdAt: Date
  member: {
    id: string
    name: string
    email: string
  }
  score: number
  status: 'accepted' | 'failed'
}

const ExerciseResultBlock: React.VFC<{
  programContentId: string
}> = ({ programContentId }) => {
  const { formatMessage } = useIntl()
  const { loadingExercises, errorExercises, programContent, exercises } = useExerciseCollection(programContentId)
  const [tab, setTab] = useState('')

  if (loadingExercises) {
    return <Skeleton active />
  }

  if (errorExercises || !programContent) {
    return <>{formatMessage(errorMessages.data.fetch)}</>
  }

  const averageScore = exercises.length
    ? (
        sum(exercises.map(exercise => exercise.answer.map(question => question.gainedPoints)).flat()) / exercises.length
      ).toFixed(1)
    : 0
  const submittedStudents = uniqBy(exercise => exercise.memberId, exercises).length
  const acceptedStudents = uniqBy(
    exercise => exercise.memberId,
    exercises.filter(
      exercise =>
        !programContent?.passingScore ||
        sum(exercise.answer.map(answer => answer.gainedPoints)) > programContent.passingScore,
    ),
  ).length

  return (
    <>
      <SummaryBlock className="d-flex align-items-center p-4 mb-4">
        <div className="flex-shrink-0">
          <StyledSummaryTitle>{formatMessage(messages.averageScore, { averageScore })}</StyledSummaryTitle>
          <StyledSummaryMeta>
            {formatMessage(messages.exerciseInformation, {
              totalPoints: programContent.totalPoints,
              passingScore: programContent.passingScore || 0,
            })}
          </StyledSummaryMeta>
        </div>
        <div className="flex-grow-1 d-flex align-items-center justify-content-end">
          <StyledSummaryCount>
            {formatMessage(messages.totalStudents, { count: programContent.enrollments || 0 })}
          </StyledSummaryCount>
          <StyledSummaryCount>
            {formatMessage(messages.submittedStudents, { count: submittedStudents })}
          </StyledSummaryCount>
          <StyledSummaryCount>
            {formatMessage(messages.acceptedStudents, {
              count: acceptedStudents,
              percent: submittedStudents ? Math.floor((acceptedStudents * 100) / submittedStudents) : 0,
            })}
          </StyledSummaryCount>
        </div>
      </SummaryBlock>

      <Tabs activeKey={tab || 'statistics'} onChange={key => setTab(key)}>
        <Tabs.TabPane key="statistics" tab={formatMessage(messages.exerciseStatistics)}></Tabs.TabPane>
        <Tabs.TabPane key="individual" tab={formatMessage(messages.individualExercise)}>
          <StyledTableWrapper>
            <Table<ExerciseDisplayProps>
              rowKey="id"
              scroll={{ x: true }}
              columns={[
                {
                  dataIndex: 'createdAt',
                  title: formatMessage(messages.exerciseCreatedAt),
                  sorter: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
                  render: value => moment(value).format('YYYY-MM-DD HH:mm'),
                },
                {
                  key: 'memberId',
                  title: formatMessage(commonMessages.label.nameAndEmail),
                  render: (_, record, i) => (
                    <>
                      {record.member.name} / {record.member.email}
                    </>
                  ),
                },
                {
                  dataIndex: 'score',
                  title: formatMessage(programMessages.label.score),
                  sorter: (a, b) => a.score - b.score,
                  render: value => (
                    <>
                      {Math.floor(value * 10) / 10}/{programContent.totalPoints}
                    </>
                  ),
                },
                {
                  dataIndex: 'status',
                  title: formatMessage(commonMessages.label.status),
                  render: value =>
                    value === 'accepted' ? (
                      <StyledTag variant="accepted">{formatMessage(programMessages.status.accepted)}</StyledTag>
                    ) : (
                      <StyledTag variant="failed">{formatMessage(programMessages.status.failed)}</StyledTag>
                    ),
                  filters: [
                    {
                      text: formatMessage(programMessages.status.accepted),
                      value: 'accepted',
                    },
                    {
                      text: formatMessage(programMessages.status.failed),
                      value: 'failed',
                    },
                  ],
                  onFilter: (value, record) => record.status === value,
                },
              ]}
              dataSource={exercises}
            />
          </StyledTableWrapper>
        </Tabs.TabPane>
      </Tabs>
    </>
  )
}

const useProgramWithExercises = (creatorId?: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PROGRAMS_WITH_EXERCISES,
    hasura.GET_PROGRAMS_WITH_EXERCISESVariables
  >(
    gql`
      query GET_PROGRAMS_WITH_EXERCISES($creatorId: String) {
        program(
          where: {
            program_roles: { name: { _eq: "owner" }, member_id: { _eq: $creatorId } }
            program_content_sections: { program_contents: { program_content_body: { type: { _eq: "exercise" } } } }
          }
        ) {
          id
          title
          program_content_sections {
            id
            program_contents(where: { program_content_body: { type: { _eq: "exercise" } } }) {
              id
              title
            }
          }
        }
      }
    `,
    { variables: { creatorId } },
  )

  const programs: {
    id: string
    title: string
    contents: {
      id: string
      title: string
    }[]
  }[] =
    data?.program.map(v => ({
      id: v.id,
      title: v.title,
      contents: flatten(v.program_content_sections.map(s => s.program_contents)),
    })) || []

  return {
    loadingPrograms: loading,
    errorPrograms: error,
    programs,
    refetchPrograms: refetch,
  }
}

const useExerciseCollection = (programContentId: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_EXERCISE_COLLECTION,
    hasura.GET_EXERCISE_COLLECTIONVariables
  >(
    gql`
      query GET_EXERCISE_COLLECTION($programContentId: uuid!) {
        program_content_by_pk(id: $programContentId) {
          id
          metadata
          program_content_body {
            id
            data
          }
          enrollments_aggregate {
            aggregate {
              count
            }
          }
        }
        member: exercise(where: { program_content_id: { _eq: $programContentId } }, distinct_on: [member_id]) {
          member {
            id
            name
            username
            email
          }
        }
        exercise(where: { program_content_id: { _eq: $programContentId } }, order_by: [{ created_at: desc }]) {
          id
          member_id
          answer
          created_at
        }
      }
    `,
    { variables: { programContentId } },
  )

  const programContent: {
    id: string
    passingScore: number
    questions: QuestionProps[]
    enrollments: number
    totalPoints: number
  } | null = data?.program_content_by_pk
    ? {
        id: data.program_content_by_pk.id,
        passingScore: data.program_content_by_pk.metadata?.passingScore || 0,
        questions: data.program_content_by_pk.program_content_body.data?.questions || [],
        enrollments: data.program_content_by_pk.enrollments_aggregate.aggregate?.count || 0,
        totalPoints: sum(
          data.program_content_by_pk.program_content_body.data?.questions?.map((question: any) => question.points) ||
            [],
        ),
      }
    : null

  const membersMap =
    data?.member.reduce<
      {
        [memberId in string]?: {
          name: string
          email: string
        }
      }
    >(
      (accumulator, { member }) => ({
        ...accumulator,
        [member.id]: {
          name: member.name || member.username,
          email: member.email,
        },
      }),
      {},
    ) || {}

  const exercises: ExerciseDisplayProps[] =
    data?.exercise.map(v => {
      const score = sum(v.answer.map((answer: any) => answer.gainedPoints))
      return {
        id: v.id,
        memberId: v.member_id,
        member: {
          id: v.member_id,
          name: membersMap[v.member_id]?.name || '',
          email: membersMap[v.member_id]?.email || '',
        },
        answer: v.answer || [],
        createdAt: v.created_at,
        score,
        status: score < (programContent?.passingScore || 0) ? 'failed' : 'accepted',
      }
    }) || []

  return {
    loadingExercises: loading,
    errorExercises: error,
    programContent,
    exercises,
    refetchExercises: refetch,
  }
}

export default ExerciseResultPage
