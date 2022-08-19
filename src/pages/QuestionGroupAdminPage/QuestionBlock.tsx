import { Checkbox, Radio } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import BraftEditor from 'braft-editor'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import AdminBraftEditor from '../../components/form/AdminBraftEditor'
import { questionLibraryMessage } from '../../helpers/translation'
import { BarsIcon, GridIcon } from '../../images/icon'
import { Question, QuestionOption } from '../../types/questionLibrary'
import pageMessages from '../translation'
import QuestionOptionsBlock from './QuestionOptionsBlock'

const StyledP = styled.p`
  font-size: 16px;
  color: var(--gray-darker);
  padding-bottom: 16px;
`

const LayoutOptionsBlock = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 32px;
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

const StyledBarsIcon = styled(BarsIcon)<{ layoutOption: string }>`
  path {
    fill: ${props => (props.layoutOption === 'lists' ? '#fff' : '#585858')};
  }
`

const StyledGridIcon = styled(GridIcon)<{ layoutOption: string }>`
  path {
    fill: ${props => (props.layoutOption === 'grid' ? '#fff' : '#585858')};
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
  const [layoutOption, setLayoutOption] = useState<string>(question.layout || 'lists')
  const [isUseZhuYin, setIsUseZhuYin] = useState<boolean>(question.font === 'zhuyin')
  const [subjectValue, setSubjectValue] = useState<string>('')
  const [explanationValue, setExplanationValue] = useState<string>('')

  const onLayoutOptionChange = (e: RadioChangeEvent) => {
    const newQuestion = { ...question, layout: e.target.value }
    setLayoutOption(e.target.value)
    onQuestionChange?.(newQuestion)
  }

  const handleOptionListChange = (newOptions: QuestionOption[]) => {
    const newQuestion = { ...question, options: newOptions }
    onQuestionChange?.(newQuestion)
  }

  const handleFontChange = () => {
    const newQuestion = { ...question, font: !isUseZhuYin ? 'zhuyin' : 'auto' }
    setIsUseZhuYin(!isUseZhuYin)
    onQuestionChange?.(newQuestion)
  }

  const handleSubjectValueChange = (value: string) => {
    const newQuestion = {
      ...question,
      title: value.replace(/<[^>]+>/g, ''),
      subject: value,
    }
    onQuestionChange?.(newQuestion)
  }

  const handleExplanationValueChange = (value: string) => {
    const newQuestion = { ...question, explanation: value }
    onQuestionChange?.(newQuestion)
  }

  useEffect(() => {
    setSubjectValue(BraftEditor.createEditorState(question.subject))
    setExplanationValue(BraftEditor.createEditorState(question.explanation))
  }, [question])

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
            <StyledBarsIcon layoutOption={layoutOption} />
          </LayoutOptionButton>
          <LayoutOptionButton value="grid">
            <StyledGridIcon layoutOption={layoutOption} />
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
          onChange={v => setSubjectValue(v.toHTML())}
          onBlur={() => handleSubjectValueChange(subjectValue)}
        />
      </QuestionSubject>
      {question.options && (
        <QuestionOptionsBlock
          key={question.id}
          optionList={question.options}
          onOptionListChange={handleOptionListChange}
        />
      )}
      <ExplanationBlock>
        <StyledP>{formatMessage(questionLibraryMessage.label.explanation)}</StyledP>
        <AdminBraftEditor
          variant="question"
          value={explanationValue}
          onChange={v => setExplanationValue(v.toHTML())}
          onBlur={() => handleExplanationValueChange(explanationValue)}
        />
      </ExplanationBlock>
    </>
  )
}

export default QuestionBlock
