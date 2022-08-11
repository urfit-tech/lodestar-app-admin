import { Checkbox, Radio } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import BraftEditor from 'braft-editor'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import AdminBraftEditor from '../../components/form/AdminBraftEditor'
import { BarsIcon, GridIcon } from '../../images/icon'
import { Question, QuestionOption } from '../../types/questionLibrary'
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
    fill: ${props => (props.layoutOption === 'column' ? '#fff' : '#585858')};
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
    height: 200px;
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
  const [layoutOption, setLayoutOption] = useState<string>(question.layout || 'column')
  const [isUseZhuYin, setIsUseZhuYin] = useState<boolean>(question.font === 'zhuyin')
  const [subjectValue, setSubjectValue] = useState<string>('')

  const onLayoutOptionChange = (e: RadioChangeEvent) => {
    const newQuestion = { ...question, layout: e.target.value }
    setLayoutOption(e.target.value)
    onQuestionChange?.(newQuestion)
  }

  const handleOptionListChange = (newOptions: QuestionOption[]) => {
    const newQuestion = { ...question, options: newOptions }
    onQuestionChange?.(newQuestion)
  }

  const handleSubjectValueChange = (value: string) => {
    const newQuestion = { ...question, subject: value }
    onQuestionChange?.(newQuestion)
  }

  useEffect(() => {
    setSubjectValue(BraftEditor.createEditorState(question.subject))
  }, [question])

  return (
    <>
      <StyledP>版型選項</StyledP>
      <LayoutOptionsBlock>
        <LayoutOptionsButtonGroup
          defaultValue={layoutOption}
          value={layoutOption}
          buttonStyle="solid"
          onChange={onLayoutOptionChange}
        >
          <LayoutOptionButton value="column">
            <StyledBarsIcon layoutOption={layoutOption} />
          </LayoutOptionButton>
          <LayoutOptionButton value="grid">
            <StyledGridIcon layoutOption={layoutOption} />
          </LayoutOptionButton>
        </LayoutOptionsButtonGroup>
        <StyledCheckBox checked={isUseZhuYin ? true : false} onClick={() => setIsUseZhuYin(!isUseZhuYin)}>
          使用注音字型
        </StyledCheckBox>
      </LayoutOptionsBlock>
      <StyledP>題目</StyledP>
      <QuestionSubject>
        <AdminBraftEditor
          variant="short"
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
        <StyledP>解答說明</StyledP>
        <AdminBraftEditor variant="short" />
      </ExplanationBlock>
    </>
  )
}

export default QuestionBlock
