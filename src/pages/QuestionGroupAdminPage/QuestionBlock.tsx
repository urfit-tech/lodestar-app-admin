import { Checkbox, Radio } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import BraftEditor from 'braft-editor'
import React, { useState } from 'react'
import styled from 'styled-components'
import AdminBraftEditor from '../../components/form/AdminBraftEditor'
import { BarsIcon, GridIcon, PlusIcon } from '../../images/icon'
import { Question } from '../../types/questionLibrary'
import { AddButton } from './QuestionCollapse'
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

const QuestionOptionsBlock = styled.div`
  padding: 0 0 32px 24px;
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

const QuestionBlock: React.VFC<{ question?: Question; idx: number }> = ({ question, idx }) => {
  const [layoutOption, setLayoutOption] = useState<string>(question?.layout || 'column')
  const [isUseZhuYin, setIsUseZhuYin] = useState<boolean>(question?.font === 'zhuyin')
  const [questionOptions, setQuestionOptions] = useState<Array<string>>(['選項一', '選項二'])
  const onLayoutOptionChange = (e: RadioChangeEvent) => {
    setLayoutOption(e.target.value)
  }
  return (
    <>
      <StyledP>版型選項</StyledP>
      <LayoutOptionsBlock>
        <LayoutOptionsButtonGroup
          defaultValue={question?.layout}
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
        <AdminBraftEditor variant="short" value={BraftEditor.createEditorState(question?.subject)} />
      </QuestionSubject>
      <QuestionOptionsBlock>
        {questionOptions.map((option, idx) => (
          <QuestionOptionBlock key={idx} option={option} idx={idx} />
        ))}
        <AddButton type="link" icon={<PlusIcon />} className="align-items-center" onClick={() => alert('新增選項')}>
          <span>新增選項</span>
        </AddButton>
      </QuestionOptionsBlock>
      <ExplanationBlock>
        <StyledP>解答說明</StyledP>
        <AdminBraftEditor variant="short" />
      </ExplanationBlock>
    </>
  )
}

export default QuestionBlock
