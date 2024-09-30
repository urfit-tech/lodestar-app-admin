import { Checkbox, Radio } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import BraftEditor, { EditorState } from 'braft-editor'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import AdminBraftEditor from '../../components/form/AdminBraftEditor'
import { questionLibraryMessage } from '../../helpers/translation'
import { BarsIcon, GridIcon, PlusIcon } from '../../images/icon'
import { Question, QuestionOption } from '../../types/questionLibrary'
import pageMessages from '../translation'
import { AddButton } from './QuestionGroupAdminPage'
import QuestionOptionBlock from './QuestionOptionBlock'

const StyledP = styled.p`
  font-size: 16px;
  color: var(--gray-darker);
  padding-bottom: 16px;
`

const LayoutOptionsBlock = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 32px;
  .ant-radio-group {
    display: flex;
    flex-direction: row;
  }
  .ant-radio-button-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .ant-checkbox-wrapper {
    margin-left: 16px;
  }
`

const LayoutOptionsButtonGroup = styled(Radio.Group)`
  display: flex;
  flex-direction: row;
`

const LayoutOptionButton = styled(Radio.Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
`

const StyledBarsIcon = styled(BarsIcon)<{ layout: string }>`
  path {
    fill: ${props => (props.layout === 'lists' ? '#fff' : '#585858')};
  }
`

const StyledGridIcon = styled(GridIcon)<{ layout: string }>`
  path {
    fill: ${props => (props.layout === 'grid' ? '#fff' : '#585858')};
  }
`

const StyledCheckBox = styled(Checkbox)`
  margin-left: 16px;
`

const QuestionSubject = styled.div`
  padding-bottom: 20px;
  .bf-content {
    height: 120px;
    border: 1px solid var(--gray);
    border-top: none;
    border-radius: 4px;
  }
`

const OptionsBlock = styled.div`
  padding: 0 0 30px 24px;
  width: 100%;
`

const ExplanationBlock = styled.div`
  .bf-content {
    height: 120px;
    border: 1px solid var(--gray);
    border-top: none;
    border-radius: 4px;
  }
`

const QuestionBlock: React.VFC<{
  question: Question
  onQuestionChange?: (question: Question) => void
}> = ({ question, onQuestionChange }) => {
  const { formatMessage } = useIntl()
  const [subjectValue, setSubjectValue] = useState<EditorState>(BraftEditor.createEditorState(question.subject))
  const [explanationValue, setExplanationValue] = useState<EditorState>(
    BraftEditor.createEditorState(question.explanation),
  )
  const layoutOption = question.layout || 'lists'
  const isUseZhuYin = question.font === 'zhuyin'

  const onLayoutOptionChange = (e: RadioChangeEvent) => {
    const newQuestion = { ...question, layout: e.target.value }
    onQuestionChange?.(newQuestion)
  }

  const handleOptionChange = (newOption: QuestionOption) => {
    const newQuestion = {
      ...question,
      options: question.options?.map(option => {
        if (option.id === newOption.id) {
          return {
            ...option,
            value: newOption.value,
            isAnswer: newOption.isAnswer,
          }
        }
        return option
      }),
    }
    onQuestionChange?.(newQuestion)
  }

  const handleFontChange = () => {
    const newQuestion = { ...question, font: !isUseZhuYin ? 'zhuyin' : 'auto' }
    onQuestionChange?.(newQuestion)
  }

  const handleAddOption = () => {
    const optionsLength = question.options?.length || 0
    const newQuestion = {
      ...question,
      options: [
        ...(question.options || []),
        {
          id: uuid(),
          value: `<p>${formatMessage(pageMessages.QuestionBlock.optionContent)}</p>`,
          isAnswer: false,
          position: optionsLength + 1,
        },
      ],
    }
    onQuestionChange?.(newQuestion)
  }

  const handleOptionDelete = (optionId: string) => {
    const newOptions = question.options?.filter(option => option.id !== optionId)
    const newQuestion = {
      ...question,
      options: newOptions,
    }
    onQuestionChange?.(newQuestion)
  }

  return (
    <>
      <StyledP>{formatMessage(questionLibraryMessage.label.layout)}</StyledP>
      <LayoutOptionsBlock>
        <LayoutOptionsButtonGroup
          defaultValue={layoutOption}
          value={layoutOption}
          buttonStyle="solid"
          onChange={onLayoutOptionChange}
        >
          <LayoutOptionButton value="lists">
            <StyledBarsIcon layout={layoutOption} />
          </LayoutOptionButton>
          <LayoutOptionButton value="grid">
            <StyledGridIcon layout={layoutOption} />
          </LayoutOptionButton>
        </LayoutOptionsButtonGroup>
        <StyledCheckBox checked={isUseZhuYin ? true : false} onClick={handleFontChange}>
          {formatMessage(questionLibraryMessage.ui.useZhuYinFont)}
        </StyledCheckBox>
      </LayoutOptionsBlock>
      <StyledP>{formatMessage(pageMessages.QuestionGroupAdminPage.question)}</StyledP>
      <QuestionSubject>
        <AdminBraftEditor
          variant="question"
          value={subjectValue}
          onChange={v => {
            setSubjectValue(v)
            const newQuestion = {
              ...question,
              title: v.toHTML().replace(/<[^>]+>/g, ''),
              subject: v.toHTML(),
            }
            onQuestionChange?.(newQuestion)
          }}
        />
      </QuestionSubject>
      <OptionsBlock>
        {question.options?.map((option, idx, options) => (
          <QuestionOptionBlock
            key={option.id}
            idx={idx}
            option={option}
            showDelete={options.length > 1 ? true : false}
            onOptionChange={handleOptionChange}
            onOptionDelete={handleOptionDelete}
          />
        ))}
        <AddButton type="link" icon={<PlusIcon />} className="align-items-center" onClick={handleAddOption}>
          <span>{formatMessage(questionLibraryMessage.ui.addOption)}</span>
        </AddButton>
      </OptionsBlock>
      <ExplanationBlock>
        <StyledP>{formatMessage(questionLibraryMessage.label.explanation)}</StyledP>
        <AdminBraftEditor
          variant="question"
          value={explanationValue}
          onChange={v => {
            setExplanationValue(v)
            const newQuestion = { ...question, explanation: v.toHTML() }
            onQuestionChange?.(newQuestion)
          }}
        />
      </ExplanationBlock>
    </>
  )
}

export default QuestionBlock
