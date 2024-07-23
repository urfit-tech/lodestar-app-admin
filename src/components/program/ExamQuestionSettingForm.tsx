import { gql, useQuery } from '@apollo/client'
import { Form, InputNumber, Skeleton, Tag } from 'antd'
import { flatten, sum } from 'ramda'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { QuestionLibrary } from '../../types/program'
import TreeTransfer from '../common/TreeTransfer'
import { QuestionExam } from './ExerciseAdminModalBlock'
import programMessages from './translation'

const StyledLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-darker);
  letter-spacing: 0.2px;
  margin-bottom: 20px;
`
const StyledFormItemLabel = styled.span`
  font-size: 14px;
  color: var(--gray-darker);
  letter-spacing: 0.4px;
`
const StyledQuestionAmount = styled(Tag)`
  && {
    font-size: 12px;
    letter-spacing: 0.6px;
    border-radius: 4px;
    color: var(--gray);
    border: solid 1px var(--gray);
    background-color: transparent;
  }
`

const ExamQuestionSettingForm: React.VFC<{
  questionExam: QuestionExam
  currentQuestionExam: QuestionExam
  onChange: React.Dispatch<React.SetStateAction<QuestionExam>>
}> = ({ questionExam, currentQuestionExam, onChange }) => {
  const { formatMessage } = useIntl()
  const [targetKeys, setTargetKeys] = useState<string[]>(questionExam.questionGroupIds)
  const [point, setPoint] = useState<number>(questionExam.point)
  const { loading, error, questionLibraries } = useExamQuestionLibrary()

  if (loading) return <Skeleton active />
  if (error) return <div>{formatMessage(programMessages['*'].fetchDataError)}</div>

  const treeData = questionLibraries
    .filter(
      questionLibrary => sum(questionLibrary.questionGroups?.map(questionGroup => questionGroup.amount) || []) !== 0,
    )
    .map(v => ({
      key: v.id,
      title: v.title || '',
      children: v.questionGroups
        // if question group does not have any question
        ?.filter(questionGroup => questionGroup.amount !== 0)
        ?.map(w => ({
          key: w.id,
          title: (
            <div>
              {w.title}
              <StyledQuestionAmount className="ml-3">{w.amount}</StyledQuestionAmount>
            </div>
          ),
        })),
    }))

  const questionAmount = sum(
    flatten(
      questionLibraries.map(
        questionLibrary =>
          questionLibrary.questionGroups?.map(questionGroup => {
            if (targetKeys.find(targetKey => targetKey === questionGroup.id)) {
              return questionGroup.amount
            }
            return 0
          }) || [],
      ),
    ),
  )

  return (
    <>
      <StyledLabel>{formatMessage(programMessages.ExamQuestionSettingForm.questionSetting)}</StyledLabel>
      {/* questionTarget */}
      <Form.Item>
        <TreeTransfer
          dataSource={treeData}
          targetKeys={currentQuestionExam.id ? currentQuestionExam.questionGroupIds : questionExam.questionGroupIds}
          onChange={(keys: string[]) => {
            setTargetKeys(keys)
            onChange(prevState =>
              currentQuestionExam.id
                ? {
                    ...prevState,
                    ...currentQuestionExam,
                    questionGroupIds: keys,
                  }
                : {
                    ...prevState,
                    ...questionExam,
                    questionGroupIds: keys,
                  },
            )
          }}
        />
      </Form.Item>
      <StyledLabel>{formatMessage(programMessages.ExamQuestionSettingForm.examScore)}</StyledLabel>
      <Form.Item
        label={
          <StyledFormItemLabel>
            {formatMessage(programMessages.ExamQuestionSettingForm.pointPerQuestion)}
          </StyledFormItemLabel>
        }
      >
        {/* point */}
        <Form.Item>
          <InputNumber
            min={0}
            value={currentQuestionExam.id ? currentQuestionExam.point : questionExam.point}
            onChange={v => {
              setPoint(Number(v))
              onChange(prevState =>
                currentQuestionExam.id
                  ? {
                      ...prevState,
                      ...currentQuestionExam,
                      point: Number(v),
                    }
                  : {
                      ...prevState,
                      ...questionExam,
                      point: Number(v),
                    },
              )
            }}
          />
          <span className="ml-2">
            * {questionAmount} = {point * questionAmount}
          </span>
        </Form.Item>
      </Form.Item>
      <Form.Item
        label={
          <StyledFormItemLabel>
            {formatMessage(programMessages.ExamQuestionSettingForm.passingScore)}
          </StyledFormItemLabel>
        }
      >
        {/* passingScore */}
        <Form.Item>
          <InputNumber
            min={0}
            value={currentQuestionExam.id ? currentQuestionExam.passingScore : questionExam.passingScore}
            onChange={v =>
              onChange(prevState =>
                currentQuestionExam.id
                  ? {
                      ...prevState,
                      ...currentQuestionExam,
                      passingScore: Number(v),
                    }
                  : {
                      ...prevState,
                      ...questionExam,
                      passingScore: Number(v),
                    },
              )
            }
          />
          <span className="ml-2"> / {point * questionAmount}</span>
        </Form.Item>
      </Form.Item>
    </>
  )
}

const useExamQuestionLibrary = () => {
  const { loading, error, data } = useQuery<hasura.GET_ALL_QUESTION>(gql`
    query GET_ALL_QUESTION {
      question_library {
        id
        title
        question_groups {
          id
          title
          questions_aggregate {
            aggregate {
              count
            }
          }
        }
      }
    }
  `)

  const questionLibraries: QuestionLibrary[] =
    data?.question_library.map(v => ({
      id: v.id,
      title: v?.title || '',
      questionGroups: v?.question_groups.map(w => ({
        id: w.id,
        title: w.title || '',
        amount: w.questions_aggregate.aggregate?.count || 0,
      })),
    })) || []

  return {
    loading,
    error,
    questionLibraries,
  }
}

export default ExamQuestionSettingForm
