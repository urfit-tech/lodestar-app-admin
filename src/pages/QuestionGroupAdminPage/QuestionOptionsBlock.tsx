import { Checkbox } from 'antd'
import BraftEditor from 'braft-editor'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import AdminBraftEditor from '../../components/form/AdminBraftEditor'
import { questionLibraryMessage } from '../../helpers/translation'
import { PlusIcon, TrashOIcon } from '../../images/icon'
import { QuestionOption } from '../../types/questionLibrary'
import pageMessages from '../translation'
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
  const { formatMessage } = useIntl()

  const handleIsAnswerClick = (optionId: string) => {
    const newOptions = optionList.map(option => ({
      ...option,
      isAnswer: option.id === optionId ? true : false,
    }))
    onOptionListChange?.(newOptions)
  }

  const handleAddOption = () => {
    const newOptions = [
      ...optionList,
      { id: uuid(), value: '<p>選項內容</p>', isAnswer: false, position: (optionList.length += 1) },
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

  return (
    <StyledBlock>
      {optionList.map((option, idx) => {
        const optionValue = BraftEditor.createEditorState(option.value)
        return (
          <Option key={option.id}>
            <OptionHeader>
              <span>{`${formatMessage(pageMessages.QuestionGroupAdminPage.option)} ${(idx += 1)}`}</span>
              {optionList.length > 1 && (
                <TrashOIcon
                  onClick={() => {
                    handleDeleteOption(option.id)
                  }}
                />
              )}
            </OptionHeader>
            {/* <OptionBraftEditor optionId={option.id} value={option.value} onEditorChange={handleEditorChange} /> */}
            <AdminBraftEditor
              variant="question"
              value={optionValue}
              onChange={v => {
                if (optionValue.toHTML() !== v.toHTML()) {
                  handleEditorChange(option.id, v.toHTML())
                }
              }}
            />
            <StyledCheckbox
              checked={option.isAnswer}
              onClick={() => {
                handleIsAnswerClick(option.id)
              }}
            >
              {formatMessage(questionLibraryMessage.ui.isAnswer)}
            </StyledCheckbox>
          </Option>
        )
      })}
      <AddButton type="link" icon={<PlusIcon />} className="align-items-center" onClick={handleAddOption}>
        <span>{formatMessage(questionLibraryMessage.ui.addOption)}</span>
      </AddButton>
    </StyledBlock>
  )
}

export default QuestionOptionsBlock
