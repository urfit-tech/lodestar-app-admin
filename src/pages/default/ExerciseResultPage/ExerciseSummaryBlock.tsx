import { filter, pipe, sum, uniqBy } from 'ramda'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { ExerciseDisplayProps } from './ExerciseDisplayTable'

const messages = defineMessages({
  averageScore: { id: 'program.text.averageScore', defaultMessage: '平均成績 {averageScore} 分' },
  exerciseInformation: {
    id: 'program.text.exerciseInformation',
    defaultMessage: '滿分 {totalPoints} 分，及格 {passingScore} 分',
  },
  totalStudents: { id: 'program.text.totalStudents', defaultMessage: '學生總數 {count} 人' },
  submittedStudents: { id: 'program.text.submittedStudents', defaultMessage: '作答人數 {count} 人' },
  acceptedStudents: { id: 'program.text.acceptedStudents', defaultMessage: '通過人數 {count} 人 ({percent}%)' },
})

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

const ExerciseSummaryBlock: React.VFC<{
  totalPoints: number
  passingScore: number
  enrollments: number
  exercises: ExerciseDisplayProps[]
}> = ({ totalPoints, passingScore, enrollments, exercises }) => {
  const { formatMessage } = useIntl()

  const averageScore = exercises.length
    ? (sum(exercises.map(exercise => exercise.score)) / exercises.length).toFixed(1)
    : 0
  const submittedStudents = uniqBy(exercise => exercise.memberId, exercises).length
  const getAcceptedMemberIds = pipe(
    filter<ExerciseDisplayProps, 'array'>(v => v.status === 'accepted'),
    uniqBy(v => v.memberId),
  )
  const acceptedStudents = getAcceptedMemberIds(exercises).length

  return (
    <SummaryBlock className="d-flex align-items-center p-4 mb-4">
      <div className="flex-shrink-0">
        <StyledSummaryTitle>{formatMessage(messages.averageScore, { averageScore })}</StyledSummaryTitle>
        <StyledSummaryMeta>
          {formatMessage(messages.exerciseInformation, {
            totalPoints,
            passingScore,
          })}
        </StyledSummaryMeta>
      </div>
      <div className="flex-grow-1 d-flex align-items-center justify-content-end">
        <StyledSummaryCount>{formatMessage(messages.totalStudents, { count: enrollments })}</StyledSummaryCount>
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
  )
}

export default ExerciseSummaryBlock
