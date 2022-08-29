import { Checkbox, Radio } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
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
  const layoutOption = question.layout || 'lists'
  const isUseZhuYin = question.font === 'zhuyin'

  const onLayoutOptionChange = (e: RadioChangeEvent) => {
    const newQuestion = { ...question, layout: e.target.value }
    onQuestionChange?.(newQuestion)
  }

  const handleOptionListChange = (newOptions: QuestionOption[]) => {
    const newQuestion = { ...question, options: newOptions }
    onQuestionChange?.(newQuestion)
  }

  const handleFontChange = () => {
    const newQuestion = { ...question, font: !isUseZhuYin ? 'zhuyin' : 'auto' }
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
        {/* <AdminBraftEditor
          variant="question"
          value={BraftEditor.createEditorState(question.subject)}
          onChange={v => {
            const newQuestion = {
              ...question,
              title: v.toHTML().replace(/<[^>]+>/g, ''),
              subject: v.toHTML(),
            }
            onQuestionChange?.(newQuestion)
          }}
        /> */}
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
        {/* <AdminBraftEditor
          variant="question"
          value={BraftEditor.createEditorState(question.explanation)}
          onChange={v => {
            const newQuestion = { ...question, explanation: v.toHTML() }
            onQuestionChange?.(newQuestion)
          }}
        /> */}
      </ExplanationBlock>
    </>
  )
}

export default QuestionBlock
