import { Checkbox } from 'antd'
import BraftEditor, { EditorState } from 'braft-editor'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import AdminBraftEditor from '../../components/form/AdminBraftEditor'
import { questionLibraryMessage } from '../../helpers/translation'
import { TrashOIcon } from '../../images/icon'
import { QuestionOption } from '../../types/questionLibrary'
import pageMessages from '../translation'

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

const QuestionOptionBlock: React.VFC<{
  idx: number
  option: QuestionOption
  showDelete: boolean
  onOptionChange?: (option: QuestionOption) => void
  onOptionDelete?: (optionId: string) => void
}> = ({ idx, option, showDelete, onOptionChange, onOptionDelete }) => {
  const { formatMessage } = useIntl()
  const [optionValue, setOptionValue] = useState<EditorState>(BraftEditor.createEditorState(option.value))

  const handleDeleteOption = (optionId: string) => {
    onOptionDelete?.(optionId)
  }

  return (
    <Option>
      <OptionHeader>
        <span>{`${formatMessage(pageMessages.QuestionGroupAdminPage.option)} ${(idx += 1)}`}</span>
        {showDelete && (
          <TrashOIcon
            onClick={() => {
              handleDeleteOption(option.id)
            }}
          />
        )}
      </OptionHeader>
      <AdminBraftEditor
        variant="question"
        value={optionValue}
        onChange={v => {
          setOptionValue(v)
          onOptionChange?.({ ...option, value: v.toHTML() })
        }}
      />
      <StyledCheckbox
        checked={option.isAnswer}
        onClick={() => {
          onOptionChange?.({ ...option, isAnswer: !option.isAnswer })
        }}
      >
        {formatMessage(questionLibraryMessage.ui.isAnswer)}
      </StyledCheckbox>
    </Option>
  )
}

export default QuestionOptionBlock
