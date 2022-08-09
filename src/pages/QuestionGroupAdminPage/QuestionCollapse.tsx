import { Button, Collapse } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { TrashOIcon } from '../../images/icon'
import { Question } from '../../types/questionLibrary'
import QuestionBlock from './QuestionBlock'

const StyledCollapse = styled(Collapse)`
  background-color: #fff;
  margin-bottom: 20px;
  .ant-collapse-content {
    background-color: #fff;
    border: none;
  }
  .ant-collapse-content-active {
    height: auto;
  }
`

const StyledPanel = styled(Collapse.Panel)`
  .ant-collapse-content-box {
    padding: 16px 24px;
  }
`

const QuestionTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const AddButton = styled(Button)`
  padding: 0;
  span {
    margin-left: 8px;
  }
`

const QuestionCollapse: React.VFC<{ questions?: Question[] }> = ({ questions }) => {
  return (
    <StyledCollapse accordion>
      {questions?.map((question, idx) => {
        return (
          <StyledPanel
            header={
              <QuestionTitle>
                題目 {(idx += 1)}
                <TrashOIcon
                  onClick={() => {
                    alert(345)
                  }}
                />
              </QuestionTitle>
            }
            key={question.id}
            showArrow={false}
          >
            <QuestionBlock question={question} idx={idx} />
          </StyledPanel>
        )
      })}
    </StyledCollapse>
  )
}

export default QuestionCollapse
