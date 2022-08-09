import BraftEditor from 'braft-editor'
import React from 'react'
import styled from 'styled-components'
import AdminBraftEditor from '../../components/form/AdminBraftEditor'
import { TrashOIcon } from '../../images/icon'

const QuestionOption = styled.div`
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

const QuestionOptionBlock: React.VFC<{ option: string; idx: number }> = ({ option, idx }) => {
  return (
    <QuestionOption>
      <OptionHeader>
        <span>選項 {(idx += 1)}</span>
        <TrashOIcon
          onClick={() => {
            alert(123)
          }}
        />
      </OptionHeader>
      <AdminBraftEditor variant="short" value={BraftEditor.createEditorState(option)} />
    </QuestionOption>
  )
}

export default QuestionOptionBlock
