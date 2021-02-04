import Icon, { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, InputNumber } from 'antd'
import BraftEditor, { EditorState } from 'braft-editor'
import { clone } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { programMessages } from '../../helpers/translation'
import { ReactComponent as AngleRightIcon } from '../../images/icon/angle-right.svg'
import AdminBraftEditor from './AdminBraftEditor'

const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
`
const StyledAction = styled(Icon)<{ variant?: 'primary'; direction?: 'down' }>`
  color: ${props => (props.variant === 'primary' ? props.theme['@primary'] : 'var(--gray-darker)')};
  cursor: pointer;
  font-size: 20px;
  ${props => (props.direction === 'down' ? 'transform: rotate(90deg);' : '')};
  transition: all 0.2s ease-in-out;
`
const QuestionBlock = styled.div<{ variant?: 'collapsed' }>`
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  ${props => (props.variant === 'collapsed' ? 'height: 75px;' : '')}
  border-radius: 4px;
  border: solid 1px var(--gray);
  overflow: hidden;
`
const ChoiceBlock = styled.div`
  margin-bottom: 1.25rem;
  padding: 1.5rem;
  border-radius: 4px;
  background: var(--gray-lighter);
`
const StyledEditorWrapper = styled.div`
  .bf-controlbar {
    box-shadow: none;
  }
  .bf-content {
    border-radius: 4px;
    border: solid 1px var(--gray);
  }
`

export type QuestionProps = {
  id?: string
  points: number
  description: string | null
  answerDescription: string | null
  maxChoicePosition?: number
  choices: ChoiceProps[]
}

export type ChoiceProps = {
  id?: string
  description: string | null
  isCorrect: boolean
}

const QuestionInput: React.FC<{
  index: number
  value: QuestionProps
  onChange?: (value: QuestionProps) => void
  onRemove?: () => void
}> = ({ index, value, onChange, onRemove }) => {
  const { formatMessage } = useIntl()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [description, setDescription] = useState<EditorState>(BraftEditor.createEditorState(value.description))
  const [answerDescription, setAnswerDescription] = useState<EditorState>(
    BraftEditor.createEditorState(value.answerDescription),
  )

  return (
    <QuestionBlock variant={isCollapsed ? 'collapsed' : undefined}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <StyledTitle>
          {formatMessage(programMessages.label.question)} {index + 1}
        </StyledTitle>
        <div className="d-flex align-items-center">
          {!isCollapsed && (
            <StyledAction
              component={() => <DeleteOutlined />}
              variant="primary"
              className="mr-3"
              onClick={() => onRemove?.()}
            />
          )}
          <StyledAction
            component={() => <AngleRightIcon />}
            variant="primary"
            direction={isCollapsed ? undefined : 'down'}
            onClick={() => setIsCollapsed(!isCollapsed)}
          />
        </div>
      </div>

      <Form.Item label={formatMessage(programMessages.label.points)}>
        <InputNumber
          value={value?.points}
          onChange={v =>
            onChange?.({
              ...value,
              points: typeof v === 'string' ? parseInt(v) : Math.floor(v || 0),
            })
          }
        />
      </Form.Item>

      <Form.Item label={formatMessage(programMessages.label.question)}>
        <StyledEditorWrapper>
          <AdminBraftEditor
            variant="short"
            value={description}
            onChange={v => setDescription(v)}
            onBlur={() =>
              onChange?.({
                ...value,
                description: description.toRAW(),
              })
            }
          />
        </StyledEditorWrapper>
      </Form.Item>

      {value?.choices.map((choice, index) => (
        <ChoiceInput
          key={choice.id || index}
          index={index}
          value={choice}
          onChange={newChoice => {
            const newQuestion = clone(value)
            newQuestion.choices.splice(index, 1, newChoice)
            onChange?.(newQuestion)
          }}
          onRemove={() =>
            onChange?.({
              ...value,
              choices: value.choices.filter((_, i) => i !== index),
            })
          }
        />
      ))}

      <Button
        type="link"
        icon={<PlusOutlined />}
        className="mb-4"
        onClick={() =>
          onChange?.({
            ...value,
            choices: [
              ...value.choices,
              {
                description: null,
                isCorrect: false,
              },
            ],
          })
        }
      >
        {formatMessage(programMessages.ui.createExerciseChoice)}
      </Button>

      <Form.Item label={formatMessage(programMessages.label.answerDescription)}>
        <StyledEditorWrapper>
          <AdminBraftEditor
            variant="short"
            value={answerDescription}
            onChange={v => setAnswerDescription(v)}
            onBlur={() =>
              onChange?.({
                ...value,
                answerDescription: answerDescription.toRAW(),
              })
            }
          />
        </StyledEditorWrapper>
      </Form.Item>
    </QuestionBlock>
  )
}

const ChoiceInput: React.FC<{
  index: number
  value: ChoiceProps
  onChange?: (value: ChoiceProps) => void
  onRemove?: () => void
}> = ({ index, value, onChange, onRemove }) => {
  const { formatMessage } = useIntl()
  const [description, setDescription] = useState<EditorState>(BraftEditor.createEditorState(value.description))

  return (
    <ChoiceBlock>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <StyledTitle>
          {formatMessage(programMessages.label.choice)} {index + 1}
        </StyledTitle>
        <StyledAction component={() => <DeleteOutlined />} onClick={() => onRemove?.()} />
      </div>

      <Form.Item>
        <StyledEditorWrapper>
          <AdminBraftEditor
            variant="short"
            value={description}
            onChange={v => setDescription(v)}
            onBlur={() =>
              onChange?.({
                ...value,
                description: description.toRAW(),
              })
            }
          />
        </StyledEditorWrapper>
      </Form.Item>
      <Form.Item className="m-0">
        <Checkbox
          checked={value.isCorrect}
          onChange={e =>
            onChange?.({
              ...value,
              isCorrect: e.target.checked,
            })
          }
        >
          {formatMessage(programMessages.label.isCorrectAnswer)}
        </Checkbox>
      </Form.Item>
    </ChoiceBlock>
  )
}

export default QuestionInput
