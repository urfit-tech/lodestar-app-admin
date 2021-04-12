import { Bar } from '@ant-design/charts'
import BraftEditor from 'braft-editor'
import React from 'react'
import styled from 'styled-components'
import { BraftContent } from '../../../components/common/StyledBraftEditor'
import { QuestionProps } from '../../../types/program'
import { ExerciseDisplayProps } from './ExerciseDisplayTable'

const StyledQuestionBlock = styled.div`
  margin-bottom: 1.25rem;
  padding: 1.5rem;
  border-radius: 4px;
  background: white;
`
const StyledQuestionDescription = styled.div`
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
`

const QuestionChartsBlock: React.VFC<{
  questions: QuestionProps[]
  exercises: ExerciseDisplayProps[]
}> = ({ questions, exercises }) => {
  const choiceCount = exercises.reduce<{ [key: string]: number }>((accumulator, exercise) => {
    const updates: { [key: string]: number } = {}
    exercise.answer.forEach(answer => {
      answer.choiceIds.forEach(choiceId => {
        const key = `${answer.questionId}_${choiceId}`
        updates[key] = (updates[key] || accumulator[key] || 0) + 1
      })
    })
    return {
      ...accumulator,
      ...updates,
    }
  }, {})

  const chartConfigs = Object.fromEntries(
    questions.map(
      question =>
        [
          question.id,
          {
            data: question.choices.map(choice => ({
              choice: BraftEditor.createEditorState(choice.description).toText(),
              count: choiceCount[`${question.id}_${choice.id}`],
              isCorrect: choice.isCorrect,
            })),
          },
        ] as const,
    ),
  )

  return (
    <>
      {questions.map(question => (
        <StyledQuestionBlock key={question.id}>
          <StyledQuestionDescription className="mb-4">
            <BraftContent>{question.description}</BraftContent>
          </StyledQuestionDescription>
          <Bar
            data={chartConfigs[question.id].data}
            seriesField="isCorrect"
            color={data => (data.isCorrect ? '#4c5b8f' : '#cdcdcd')}
            xField="count"
            yField="choice"
            legend={false}
            tooltip={false}
          />
        </StyledQuestionBlock>
      ))}
    </>
  )
}

export default QuestionChartsBlock
