import { EditOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Checkbox, Divider, Dropdown, Form, InputNumber, Menu, message, Modal } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { clone, sum } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { v4 as uuidV4 } from 'uuid'
import { handleError } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import { useMutateProgramContent } from '../../hooks/program'
import types from '../../types'
import { ProgramContentProps, ProgramProps } from '../../types/program'
import { AdminPageTitle } from '../admin'
import QuestionInput, { QuestionProps } from '../form/QuestionInput'

type FieldProps = {
  isTrial: boolean
  isVisible: boolean
  isAvailableToGoBack: boolean
  isAvailableToRetry: boolean
  isNotifyUpdate: boolean
  baseline: number
}

type ExerciseProps = {
  id: string
  listPrice: number | null
  publishedAt: Date | null
  isNotifyUpdate: boolean
  metadata: any
}

const ExerciseAdminModal: React.FC<{
  program: ProgramProps
  programContent: ProgramContentProps
  onRefetch?: () => void
}> = ({ programContent, onRefetch }) => {
  const { loadingExercise, errorExercise, exercise, refetchExercise } = useExercise(programContent.id)
  const [visible, setVisible] = useState(false)

  if (loadingExercise || errorExercise || !exercise) {
    return null
  }

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
          programContentId={programContent.id}
          exercise={exercise}
          onCancel={() => setVisible(false)}
          onRefetch={() => refetchExercise()}
        />
      </Modal>
    </>
  )
}

const ExerciseAdminForm: React.FC<{
  programContentId: string
  exercise: ExerciseProps
  onCancel?: () => void
  onRefetch?: () => void
}> = ({ programContentId, exercise, onCancel, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { deleteProgramContent } = useMutateProgramContent()
  const [updateExercise] = useMutation<types.UPDATE_EXERCISE, types.UPDATE_EXERCISEVariables>(UPDATE_EXERCISE)

  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<QuestionProps[]>(exercise?.metadata?.questions || [])

  const totalPoints = sum(questions.map(question => question.points))
  const handleSubmit = async (values: FieldProps) => {
    setLoading(true)
    updateExercise({
      variables: {
        programContentId,
        data: {
          list_price: values.isTrial ? 0 : null,
          published_at: values.isVisible ? new Date() : null,
          is_notify_update: values.isNotifyUpdate,
          metadata: {
            isAvailableToGoBack: values.isAvailableToGoBack,
            isAvailableToRetry: values.isAvailableToRetry,
            baseline: values.baseline || 0,
            questions,
          },
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

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        isTrial: exercise.listPrice === 0,
        isVisible: !!exercise.publishedAt,
        isAvailableToGoBack: exercise.metadata?.isAvailableToGoBack,
        isAvailableToRetry: exercise.metadata?.isAvailableToRetry,
        isNotifyUpdate: exercise.isNotifyUpdate,
        baseline: exercise.metadata?.baseline || 0,
      }}
      onFinish={handleSubmit}
      onValuesChange={(_, values) => {
        console.log(values)
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <Checkbox className="mr-2">{formatMessage(commonMessages.ui.trial)}</Checkbox>
          <Checkbox className="mr-2">{formatMessage(programMessages.label.show)}</Checkbox>
          <Checkbox className="mr-2">{formatMessage(programMessages.label.availableToGoBack)}</Checkbox>
          <Checkbox className="mr-2">{formatMessage(programMessages.label.availableToRetry)}</Checkbox>
          <Checkbox className="mr-2">{formatMessage(programMessages.label.notifyUpdate)}</Checkbox>
        </div>
        <div>
          <Button disabled={loading} onClick={() => onCancel?.()} className="mr-2">
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
                      variables: { programContentId: programContentId },
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

      <AdminPageTitle className="mb-4">{formatMessage(programMessages.label.exercise)}</AdminPageTitle>

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

const useExercise = (programContentId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_EXERCISE, types.GET_EXERCISEVariables>(
    gql`
      query GET_EXERCISE($programContentId: uuid!) {
        program_content_by_pk(id: $programContentId) {
          id
          list_price
          published_at
          is_notify_update
          metadata
        }
      }
    `,
    { variables: { programContentId } },
  )

  const exercise: ExerciseProps | null = data?.program_content_by_pk
    ? {
        id: data.program_content_by_pk.id,
        listPrice: data.program_content_by_pk.list_price,
        publishedAt: data.program_content_by_pk.published_at,
        isNotifyUpdate: data.program_content_by_pk.is_notify_update,
        metadata: data.program_content_by_pk.metadata,
      }
    : null

  return {
    loadingExercise: loading,
    errorExercise: error,
    exercise,
    refetchExercise: refetch,
  }
}

const UPDATE_EXERCISE = gql`
  mutation UPDATE_EXERCISE($programContentId: uuid!, $data: program_content_set_input!) {
    update_program_content(where: { id: { _eq: $programContentId } }, _set: $data) {
      affected_rows
    }
  }
`

export default ExerciseAdminModal
