import { EditOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, Divider, Dropdown, Form, Input, InputNumber, Menu, message, Modal } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { clone, sum } from 'ramda'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuidV4 } from 'uuid'
import { handleError } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import { useMutateProgramContent } from '../../hooks/program'
import types from '../../types'
import { ProgramContentBodyProps, ProgramContentProps } from '../../types/program'
import QuestionInput, { QuestionProps } from '../form/QuestionInput'

const StyledTitle = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--gray-darker);
  letter-spacing: 0.2px;
`

type FieldProps = {
  isTrial: boolean
  isVisible: boolean
  isAvailableToGoBack: boolean
  isAvailableToRetry: boolean
  isNotifyUpdate: boolean
  title: string
  baseline: number
}

const ExerciseAdminModal: React.FC<{
  programContent: ProgramContentProps
  programContentBody: ProgramContentBodyProps
  onRefetch?: () => void
}> = ({ programContent, programContentBody, onRefetch }) => {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <EditOutlined onClick={() => setVisible(true)} />

      <Modal
        width="70vw"
        footer={null}
        maskStyle={{ background: 'rgba(255, 255, 255, 0.8)' }}
        maskClosable={false}
        closable={false}
        visible={visible}
      >
        <ExerciseAdminForm
          programContent={programContent}
          programContentBody={programContentBody}
          onCancel={() => setVisible(false)}
          onRefetch={() => onRefetch?.()}
        />
      </Modal>
    </>
  )
}

const ExerciseAdminForm: React.FC<{
  programContent: ProgramContentProps
  programContentBody: ProgramContentBodyProps
  onCancel?: () => void
  onRefetch?: () => void
}> = ({ programContent, programContentBody, onCancel, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { deleteProgramContent } = useMutateProgramContent()
  const [updateExercise] = useMutation<types.UPDATE_EXERCISE, types.UPDATE_EXERCISEVariables>(UPDATE_EXERCISE)

  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<QuestionProps[]>(programContentBody.data?.questions || [])

  const totalPoints = sum(questions.map(question => question.points))
  const handleSubmit = async (values: FieldProps) => {
    setLoading(true)
    updateExercise({
      variables: {
        programContentId: programContent.id,
        programContentBodyId: programContentBody.id,
        content: {
          list_price: values.isTrial ? 0 : null,
          published_at: values.isVisible ? new Date() : null,
          is_notify_update: values.isNotifyUpdate,
          title: values.title,
          metadata: {
            isAvailableToGoBack: values.isAvailableToGoBack,
            isAvailableToRetry: values.isAvailableToRetry,
            baseline: values.baseline || 0,
          },
        },
        body: {
          data: { questions },
        },
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    form.setFieldsValue({ isVisible: !!programContent.publishedAt })
  }, [form, programContent.publishedAt])

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        isTrial: programContent.listPrice === 0,
        isVisible: !!programContent.publishedAt,
        isAvailableToGoBack: programContent.metadata?.isAvailableToGoBack,
        isAvailableToRetry: programContent.metadata?.isAvailableToRetry,
        isNotifyUpdate: programContent.isNotifyUpdate,
        title: programContent.title,
        baseline: programContent.metadata?.baseline || 0,
      }}
      onFinish={handleSubmit}
    >
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <Form.Item name="isTrial" valuePropName="checked" noStyle>
            <Checkbox className="mr-2">{formatMessage(commonMessages.ui.trial)}</Checkbox>
          </Form.Item>
          <Form.Item name="isVisible" valuePropName="checked" noStyle>
            <Checkbox className="mr-2">{formatMessage(programMessages.label.show)}</Checkbox>
          </Form.Item>
          <Form.Item name="isAvailableToGoBack" valuePropName="checked" noStyle>
            <Checkbox className="mr-2">{formatMessage(programMessages.label.availableToGoBack)}</Checkbox>
          </Form.Item>
          <Form.Item name="isAvailableToRetry" valuePropName="checked" noStyle>
            <Checkbox className="mr-2">{formatMessage(programMessages.label.availableToRetry)}</Checkbox>
          </Form.Item>
          <Form.Item name="isNotifyUpdate" valuePropName="checked" noStyle>
            <Checkbox className="mr-2">{formatMessage(programMessages.label.notifyUpdate)}</Checkbox>
          </Form.Item>
        </div>
        <div>
          <Button
            disabled={loading}
            onClick={() => {
              onCancel?.()
              form.resetFields()
            }}
            className="mr-2"
          >
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} className="mr-2">
            {formatMessage(commonMessages.ui.save)}
          </Button>
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            overlay={
              <Menu>
                <Menu.Item
                  onClick={() =>
                    window.confirm(formatMessage(programMessages.text.deleteContentWarning)) &&
                    deleteProgramContent({
                      variables: { programContentId: programContent.id },
                    })
                      .then(() => onRefetch?.())
                      .catch(handleError)
                  }
                >
                  {formatMessage(programMessages.ui.deleteContent)}
                </Menu.Item>
              </Menu>
            }
          >
            <MoreOutlined />
          </Dropdown>
        </div>
      </div>

      <StyledTitle className="mb-3">{formatMessage(programMessages.label.exercise)}</StyledTitle>

      <Form.Item name="title" label={formatMessage(programMessages.label.exerciseTitle)}>
        <Input />
      </Form.Item>

      <div className="d-flex align-items-center">
        <Form.Item name="baseline" label={formatMessage(programMessages.label.baseline)}>
          <InputNumber min={0} max={totalPoints} />
        </Form.Item>
        <span className="ml-2 mt-3">/ {totalPoints}</span>
      </div>

      {questions.map((question, index) => (
        <QuestionInput
          key={question.id}
          index={index}
          value={question}
          onChange={value => {
            const newQuestions = clone(questions)
            newQuestions.splice(index, 1, value)
            setQuestions(newQuestions)
          }}
          onRemove={() => setQuestions(questions.filter(q => q.id !== question.id))}
        />
      ))}

      <Divider>
        <Button
          type="link"
          icon={<PlusOutlined />}
          onClick={() =>
            setQuestions([
              ...questions,
              {
                id: uuidV4(),
                points: 0,
                description: null,
                answerDescription: null,
                choices: [],
              },
            ])
          }
        >
          {formatMessage(programMessages.ui.createExerciseQuestion)}
        </Button>
      </Divider>
    </Form>
  )
}

const UPDATE_EXERCISE = gql`
  mutation UPDATE_EXERCISE(
    $programContentId: uuid!
    $content: program_content_set_input!
    $programContentBodyId: uuid!
    $body: program_content_body_set_input!
  ) {
    update_program_content(where: { id: { _eq: $programContentId } }, _set: $content) {
      affected_rows
    }
    update_program_content_body(where: { id: { _eq: $programContentBodyId } }, _set: $body) {
      affected_rows
    }
  }
`

export default ExerciseAdminModal
