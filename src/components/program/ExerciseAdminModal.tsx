import { EditOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Checkbox, Divider, Dropdown, Form, InputNumber, Menu, message, Modal } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { clone, sum } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
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
  maxQuestionPosition: number
  questions: QuestionProps[]
}

const ExerciseAdminModal: React.FC<{
  program: ProgramProps
  programContent: ProgramContentProps
  onRefetch?: () => void
}> = ({ programContent, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { deleteProgramContent } = useMutateProgramContent()
  const { loadingExercise, errorExercise, exercise, refetchExercise } = useExercise(programContent.id)
  const [updateExercise] = useMutation<types.UPDATE_EXERCISE, types.UPDATE_EXERCISEVariables>(UPDATE_EXERCISE)

  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<QuestionProps[]>(exercise?.questions || [])

  if (loadingExercise || errorExercise || !exercise) {
    return null
  }

  const totalPoints = sum(questions.map(question => question.points))
  const handleSubmit = async (values: FieldProps) => {
    setLoading(true)
    updateExercise({
      variables: {
        programContentId: programContent.id,
        programContent: {
          id: programContent.id,
          list_price: values.isTrial ? 0 : null,
          published_at: values.isVisible ? new Date() : null,
          metadata: {
            ...exercise.metadata,
            isAvailableToGoBack: values.isAvailableToGoBack,
            isAvailableToRetry: values.isAvailableToRetry,
          },
          is_notify_update: values.isNotifyUpdate,
        },
        questions: questions.map((question, index) => ({
          description: question.description,
          points: question.points,
          answer_description: question.answerDescription,
          position: index,
          exercise_question_choices: {
            data: question.choices.map((choice, index) => ({
              description: choice.description,
              is_correct: choice.isCorrect,
              position: index,
            })),
          },
        })),
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        refetchExercise()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
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
              <Button disabled={loading} onClick={() => setVisible(false)} className="mr-2">
                {formatMessage(commonMessages.ui.cancel)}
              </Button>
              <Button type="primary" loading={loading} className="mr-2">
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

          <AdminPageTitle className="mb-4">{formatMessage(programMessages.label.exercise)}</AdminPageTitle>

          <div className="d-flex align-items-center justify-content-between">
            <Form.Item name="baseline" label={formatMessage(programMessages.label.baseline)}>
              <InputNumber min={0} max={totalPoints} /> / {totalPoints}
            </Form.Item>
          </div>

          {questions.map((question, index) => (
            <QuestionInput
              key={question.id || index}
              index={index}
              value={question}
              onChange={value => {
                const newQuestions = clone(questions)
                newQuestions.splice(index, 1, value)
                setQuestions(newQuestions)
              }}
              onRemove={() => setQuestions(questions.filter((_, i) => i !== index))}
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
                    points: 0,
                    description: null,
                    answerDescription: null,
                    maxChoicePosition: 0,
                    choices: [],
                  },
                ])
              }
            >
              {formatMessage(programMessages.ui.createExerciseQuestion)}
            </Button>
          </Divider>
        </Form>
      </Modal>
    </>
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
          exercise_questions_aggregate {
            aggregate {
              max {
                position
              }
            }
          }
          exercise_questions(where: { program_content_id: { _eq: $programContentId } }, order_by: [{ position: asc }]) {
            id
            points
            description
            answer_description
            exercise_question_choices_aggregate {
              aggregate {
                max {
                  position
                }
              }
            }
            exercise_question_choices(order_by: [{ position: asc }]) {
              id
              description
              is_correct
            }
          }
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
        maxQuestionPosition: data.program_content_by_pk.exercise_questions_aggregate.aggregate?.max?.position || 0,
        questions: data.program_content_by_pk.exercise_questions.map(v => ({
          id: v.id,
          points: v.points,
          description: v.description,
          answerDescription: v.answer_description,
          maxChoicePosition: v.exercise_question_choices_aggregate.aggregate?.max?.position || 0,
          choices: v.exercise_question_choices.map(u => ({
            id: u.id,
            description: u.description,
            isCorrect: u.is_correct,
          })),
        })),
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
  mutation UPDATE_EXERCISE(
    $programContentId: uuid!
    $programContent: program_content_insert_input!
    $questions: [exercise_question_insert_input!]!
  ) {
    insert_program_content_one(
      object: $programContent
      on_conflict: {
        constraint: program_content_pkey
        update_columns: [list_price, published_at, is_notify_update, metadata]
      }
    ) {
      id
    }
    delete_exercise_question_choice(where: { exercise_question: { program_content_id: { _eq: $programContentId } } }) {
      affected_rows
    }
    delete_exercise_question(where: { program_content_id: { _eq: $programContentId } }) {
      affected_rows
    }
    insert_exercise_question(
      objects: $questions
      on_conflict: {
        constraint: exercise_problem_pkey
        update_columns: [id, points, description, answer_description, position]
      }
    ) {
      affected_rows
    }
  }
`

export default ExerciseAdminModal
