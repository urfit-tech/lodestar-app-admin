import Icon from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Select, Skeleton, Spin } from 'antd'
import gql from 'graphql-tag'
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
import { QuestionProps } from '../../types/program'

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

const messages = defineMessages({
  averageScore: { id: 'program.text.averageScore', defaultMessage: '平均成績 {averageScore} 分' },
  exerciseInformation: {
    id: 'program.text.exerciseInformation',
    defaultMessage: '滿分 {totalScore} 分，及格 {passingScore} 分',
  },
  totalStudents: { id: 'program.text.totalStudents', defaultMessage: '學生總數 {count} 人' },
  submittedStudents: { id: 'program.text.submittedStudents', defaultMessage: '作答人數 {count} 人' },
  acceptedStudents: { id: 'program.text.acceptedStudents', defaultMessage: '通過人數 {count} 人 ({percent}%)' },
})

const ExerciseResultBlock: React.VFC<{
  programContentId: string
}> = ({ programContentId }) => {
  const { formatMessage } = useIntl()
  const { loadingExercises, errorExercises, programContent, exercises } = useExerciseCollection(programContentId)
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

  if (loadingExercises) {
    return <Skeleton active />
  }

  if (errorExercises || !programContent) {
    return <>{formatMessage(errorMessages.data.fetch)}</>
  }

  return (
    <>
      <SummaryBlock className="d-flex align-items-center p-4">
        <div className="flex-shrink-0">
          <StyledSummaryTitle>{formatMessage(messages.averageScore, { averageScore })}</StyledSummaryTitle>
          <StyledSummaryMeta>
            {formatMessage(messages.exerciseInformation, {
              totalScore: sum(programContent.questions.map(question => question.points) || []),
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
        exercise(
          where: { program_content_id: { _eq: $programContentId } }
          distinct_on: [member_id]
          order_by: [{ member_id: asc }, { created_at: desc }]
        ) {
          id
          member_id
          answer
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
  } | null = data?.program_content_by_pk
    ? {
        id: data.program_content_by_pk.id,
        passingScore: data.program_content_by_pk.metadata?.passingScore || 0,
        questions: data.program_content_by_pk.program_content_body.data?.questions || [],
        enrollments: data.program_content_by_pk.enrollments_aggregate.aggregate?.count || 0,
      }
    : null

  const exercises: {
    id: string
    memberId: string
    answer: {
      questionId: string
      choiceIds: string[]
      questionPoints: number
      gainedPoints: number
    }[]
  }[] =
    data?.exercise.map(v => ({
      id: v.id,
      memberId: v.member_id,
      answer: v.answer || [],
    })) || []

  return {
    loadingExercises: loading,
    errorExercises: error,
    programContent,
    exercises,
    refetchExercises: refetch,
  }
}

export default ExerciseResultPage
