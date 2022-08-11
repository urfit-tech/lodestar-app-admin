import { Checkbox } from 'antd'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import { PlusIcon, TrashOIcon } from '../../images/icon'
import { QuestionOption } from '../../types/questionLibrary'
import OptionBraftEditor from './OptionBraftEditor'
import { AddButton } from './QuestionGroupAdminPage'

const Option = styled.div`
  padding: 24px;
  margin-bottom: 20px;
  background-color: #f7f8f8;
  border-radius: 4px;
  .bf-content {
    background-color: #fff;
    height: 100px;
    border: 1px solid var(--gray);
    border-top: none;
    border-radius: 4px;
  }
`

const OptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  span {
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 0.8px;
    color: var(--gray-darker);
  }
  svg {
    cursor: pointer;
  }
`

const StyledCheckbox = styled(Checkbox)`
  padding-top: 16px;
  span {
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.4px;
    color: var(--gray-darker);
  }
`

const StyledBlock = styled.div`
  padding: 0 0 30px 24px;
  width: 100%;
`

const QuestionOptionsBlock: React.VFC<{
  optionList: QuestionOption[]
  onOptionListChange?: (options: QuestionOption[]) => void
}> = ({ optionList, onOptionListChange }) => {
  // const { questionOptionsLoading, questionOptionsError, questionOptions, refetchQuestionOptions } =
  //   useQuestionOptions(questionId)
  const [answerOptionId, setAnswerOptionId] = useState<string>('')

  const handleIsAnswerClick = (optionId: string) => {
    setAnswerOptionId(optionId)
    const newOptions = optionList.map(option => ({
      ...option,
      isAnswer: option.id === optionId ? true : false,
    }))
    onOptionListChange?.(newOptions)
  }

  const handleAddOption = () => {
    const newOptions = [
      ...optionList,
      { id: uuid(), value: '<p><strong>選項內容</strong></p>', isAnswer: false, position: (optionList.length += 1) },
    ]
    onOptionListChange?.(newOptions)
  }

  const handleDeleteOption = (optionId: string) => {
    const newOptions = optionList.filter(option => option.id !== optionId)
    onOptionListChange?.(newOptions)
  }

  const handleEditorChange = (optionId: string, value: string) => {
    const newOptionList = optionList.map(option => (option.id === optionId ? { ...option, value: value } : option))
    onOptionListChange?.(newOptionList)
  }

  useEffect(() => {
    optionList.forEach(option => {
      if (option.isAnswer) {
        setAnswerOptionId(option.id)
      }
    })
  }, [optionList])

  return (
    <StyledBlock>
      {optionList.map((option, idx) => {
        return (
          <Option key={option.id}>
            <OptionHeader>
              <span>選項 {(idx += 1)}</span>
              {optionList.length > 1 && (
                <TrashOIcon
                  onClick={() => {
                    handleDeleteOption(option.id)
                  }}
                />
              )}
            </OptionHeader>
            <OptionBraftEditor optionId={option.id} value={option.value} onEditorChange={handleEditorChange} />
            <StyledCheckbox
              checked={option.id === answerOptionId ? true : false}
              onClick={() => {
                handleIsAnswerClick(option.id)
              }}
            >
              此為正確解答
            </StyledCheckbox>
          </Option>
        )
      })}
      <AddButton type="link" icon={<PlusIcon />} className="align-items-center" onClick={handleAddOption}>
        <span>新增選項</span>
      </AddButton>
    </StyledBlock>
  )
}

export default QuestionOptionsBlock

// const useQuestionOptions = (questionId: string) => {
//   const { loading, error, data, refetch } = useQuery<hasura.GET_QUESTION_OPTIONS, hasura.GET_QUESTION_OPTIONSVariables>(
//     GET_QUESTION_OPTIONS,
//     {
//       variables: {
//         questionId,
//       },
//     },
//   )

//   const question_options: QuestionOption[] =
//     data?.question_option.map(v => ({
//       id: v.id,
//       value: v.value,
//       isAnswer: v.is_answer || false,
//       position: v.position,
//     })) || []

//   return {
//     questionOptions: question_options,
//     refetchQuestionOptions: refetch,
//     questionOptionsLoading: loading,
//     questionOptionsError: error,
//   }
// }

// const GET_QUESTION_OPTIONS = gql`
//   query GET_QUESTION_OPTIONS($questionId: uuid!) {
//     question_option(where: { question_id: { _eq: $questionId }, deleted_at: { _is_null: true } }) {
//       id
//       value
//       is_answer
//       position
//     }
//   }
// `
