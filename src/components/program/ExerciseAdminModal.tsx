import { EditOutlined, MoreOutlined, WarningOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Checkbox, Dropdown, Form, Menu, message, Modal, Skeleton, Tabs } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import moment from 'moment'
import { flatten } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled, { css } from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { useMutateProgramContent } from '../../hooks/program'
import { Exam, ExamTimeUnit, ProgramContentProps } from '../../types/program'
import DisplayModeSelector from './DisplayModeSelector'
import ExamBasicForm from './ExamBasicForm'
import ExamQuestionSettingForm from './ExamQuestionSettingForm'
import programMessages from './translation'

const StyledTitle = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--gray-darker);
  letter-spacing: 0.2px;
`

export type FieldProps = {
  title: string
  isNotifyUpdate: boolean
  displayMode: string
  publishedAt: Date
  expiredAt: [Date, Date]
  examinableUnit: string
  examinableAmount: number
  timeLimitUnit: string
  timeLimitAmount: number
  point: number
  passingScore: number
  isAvailableAnnounceScore: boolean
  isAvailableToGoBack: boolean
  isAvailableToRetry: boolean
  questionTarget: string[]
}

const StyledModal = styled(Modal)<{ isFullWidth?: boolean }>`
  && {
    ${props =>
      props.isFullWidth &&
      css`
        &.ant-modal {
          top: 0;
          width: 100%;
          max-width: 100%;
          padding-bottom: 0;
        }
        > .ant-modal-content > .ant-modal-body {
          max-width: 960px;
          min-height: 100vh;
          margin: 0 auto;
        }
      `}
  }
`

const ExerciseAdminModal: React.FC<{
  programContent: ProgramContentProps
  onRefetch?: () => void
}> = ({ programContent, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [activityKey, setActivityKey] = useState()

  const { loading: loadingGetExamId, error: errorGetExamId, examId } = useExamId(programContent.id)
  const { deleteProgramContentExerciseAndExam } = useMutateProgramContent()
  const { loading: loadingExam, error: errorExam, exam } = useExam(examId)
  const [updateExam] = useMutation<hasura.UPDATE_EXAM, hasura.UPDATE_EXAMVariables>(UPDATE_EXAM)
  const [updateExamQuestionLibrary] = useMutation<
    hasura.UPDATE_EXAM_QUESTION_LIBRARY,
    hasura.UPDATE_EXAM_QUESTION_LIBRARYVariables
  >(UPDATE_EXAM_QUESTION_LIBRARY)

  const handleSubmit = async (values: FieldProps) => {
    setLoading(true)
    console.log(values)
    // if (values.questionSetting[0] !== undefined) {
    //   updateExamQuestionLibrary({
    //     variables: {
    //       examId,
    //       examQuestionLibraries: values.questionSetting.map((questionLibraryId: string) => ({
    //         exam_id: examId,
    //         question_library_id: questionLibraryId,
    //       })),
    //     },
    //   })
    //     .then(() => {})
    //     .catch(error => handleError(error))
    // }
    updateExam({
      variables: {
        programContentId: programContent.id,
        title: values.title,
        publishedAt: values.publishedAt
          ? new Date(values.publishedAt)
          : values.displayMode !== 'conceal'
          ? new Date()
          : null,
        isNotifyUpdate: values.isNotifyUpdate,
        notifiedAt: values.isNotifyUpdate ? new Date() : null,
        displayMode: values.displayMode,
        examId: examId,
        point: values.point,
        passingScore: values.passingScore,
        examinableUnit: values.examinableUnit,
        examinableAmount: values.examinableAmount,
        examinableStartedAt: values.expiredAt ? new Date(values.expiredAt[0]) : null,
        examinableEndedAt: values.expiredAt ? new Date(values.expiredAt[1]) : null,
        timeLimitUnit: values.timeLimitUnit,
        timeLimitAmount: values.timeLimitAmount,
        isAvailableToRetry: values.isAvailableToRetry,
        isAvailableToGoBack: values.isAvailableToGoBack,
        isAvailableAnnounceScore: values.isAvailableAnnounceScore,
      },
    })
      .then(() => {
        message.success(formatMessage(programMessages['*'].successfullySaved))
        onRefetch?.()
        setVisible(false)
        form.resetFields()
      })
      .catch(error => handleError(error))
    setLoading(false)
  }

  if (loadingGetExamId || loadingExam) return <Skeleton active />

  if (errorGetExamId || errorExam) return <WarningOutlined style={{ color: 'red' }} />
  console.log(exam.point)

  return (
    <>
      <EditOutlined onClick={() => setVisible(true)} />

      <StyledModal
        isFullWidth
        width="100vw"
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
            title: programContent.title,
            publishedAt: programContent.publishedAt ? moment(programContent.publishedAt) : moment().startOf('minute'),
            displayMode: programContent.displayMode,
            isNotifyUpdate: programContent.isNotifyUpdate,
            examinable:
              exam.examinableAmount && exam.examinableUnit
                ? 'bought'
                : exam.examinableStartedAt && exam.examinableEndedAt
                ? 'bought'
                : 'unlimited',
            examinableAmount: exam.examinableAmount,
            examinableUnit: exam.examinableUnit,
            timeLimit: exam.timeLimitAmount && exam.timeLimitUnit ? 'limited' : 'unlimited',
            timeLimitAmount: exam.timeLimitAmount || 60,
            timeLimitUnit: exam.timeLimitUnit || 'minute',
            isAvailableAnnounceScore: exam.isAvailableAnnounceScore,
            isAvailableToGoBack: exam.isAvailableToGoBack,
            isAvailableToRetry: exam.isAvailableToRetry,
            questionTarget: flatten(
              exam.questionLibraries.map(questionLibrary =>
                questionLibrary.questionGroups?.map(questionGroup => questionGroup.id),
              ),
            ),
            // point: exam.point,
            // passingScore: exam.passingScore,
          }}
          onFinish={handleSubmit}
        >
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
              {programContent.displayMode && (
                <DisplayModeSelector contentType="exam" displayMode={programContent.displayMode} />
              )}
              <Form.Item name="isNotifyUpdate" valuePropName="checked" className="mb-0">
                <Checkbox className="mr-2">{formatMessage(programMessages['*'].notifyUpdate)}</Checkbox>
              </Form.Item>
            </div>
            <div>
              <Button
                disabled={loading}
                onClick={() => {
                  form.resetFields()
                  setVisible(false)
                }}
                className="mr-2"
              >
                {formatMessage(programMessages['*'].cancel)}
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} className="mr-2">
                {formatMessage(programMessages['*'].save)}
              </Button>
              <Dropdown
                trigger={['click']}
                placement="bottomRight"
                overlay={
                  <Menu>
                    <Menu.Item
                      onClick={() =>
                        window.confirm(formatMessage(programMessages.ExerciseAdminModal.deleteExerciseWarning)) &&
                        deleteProgramContentExerciseAndExam({
                          variables: {
                            programContentId: programContent.id,
                            examId,
                            metadata: { ...programContent.metadata, examId: undefined },
                          },
                        })
                          .then(() => onRefetch?.())
                          .catch(handleError)
                      }
                    >
                      {formatMessage(programMessages['*'].deleteContent)}
                    </Menu.Item>
                  </Menu>
                }
              >
                <MoreOutlined />
              </Dropdown>
            </div>
          </div>

          <StyledTitle className="mb-3">
            {formatMessage(programMessages.ExerciseAdminModal.exerciseSetting)}
          </StyledTitle>

          <Tabs defaultActiveKey={'basicSetting'}>
            <Tabs.TabPane key="basicSetting" tab={formatMessage(programMessages.ExerciseAdminModal.basicSetting)}>
              <ExamBasicForm
                examId={examId}
                examinable={
                  exam.examinableAmount && exam.examinableUnit
                    ? 'bought'
                    : exam.examinableStartedAt && exam.examinableEndedAt
                    ? 'bought'
                    : 'unlimited'
                }
                timeLimit={exam.timeLimitAmount && exam.timeLimitUnit ? 'limited' : 'unlimited'}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              key="questionSetting"
              tab={formatMessage(programMessages.ExerciseAdminModal.questionSetting)}
              forceRender={true}
            >
              <ExamQuestionSettingForm form={form} />
            </Tabs.TabPane>
          </Tabs>
        </Form>
      </StyledModal>
    </>
  )
}

const useExamId = (programContentId: string) => {
  const { loading, error, data } = useQuery<hasura.GET_EXAM_ID, hasura.GET_EXAM_IDVariables>(
    gql`
      query GET_EXAM_ID($programContentId: uuid!) {
        program_content_exam(where: { program_content_id: { _eq: $programContentId } }) {
          exam_id
        }
      }
    `,
    { variables: { programContentId } },
  )
  const examId = data?.program_content_exam.map(v => v.exam_id)[0]
  return { loading, error, examId }
}

const useExam = (examId: string) => {
  const { loading, error, data } = useQuery<hasura.GET_BASIC_EXAM, hasura.GET_BASIC_EXAMVariables>(
    gql`
      query GET_BASIC_EXAM($examId: uuid!) {
        exam_by_pk(id: $examId) {
          id
          point
          passing_score
          examinable_unit
          examinable_amount
          examinable_started_at
          examinable_ended_at
          time_limit_unit
          time_limit_amount
          is_available_to_retry
          is_available_to_go_back
          is_available_announce_score
          exam_question_library {
            question_library {
              id
              title
              question_groups {
                id
                title
                questions_aggregate {
                  aggregate {
                    count
                  }
                }
              }
            }
          }
        }
      }
    `,
    {
      variables: { examId },
    },
  )

  const exam: Exam = {
    id: data?.exam_by_pk?.id,
    point: data?.exam_by_pk?.point,
    passingScore: data?.exam_by_pk?.passing_score,
    examinableUnit: data?.exam_by_pk?.examinable_unit as ExamTimeUnit,
    examinableAmount: data?.exam_by_pk?.examinable_amount,
    examinableStartedAt: data?.exam_by_pk?.examinable_started_at
      ? new Date(data?.exam_by_pk?.examinable_started_at)
      : null,
    examinableEndedAt: data?.exam_by_pk?.examinable_ended_at ? new Date(data?.exam_by_pk?.examinable_ended_at) : null,
    timeLimitUnit: data?.exam_by_pk?.time_limit_unit as ExamTimeUnit,
    timeLimitAmount: data?.exam_by_pk?.time_limit_amount,
    isAvailableToRetry: Boolean(data?.exam_by_pk?.is_available_to_retry),
    isAvailableToGoBack: Boolean(data?.exam_by_pk?.is_available_to_go_back),
    isAvailableAnnounceScore: Boolean(data?.exam_by_pk?.is_available_announce_score),
    questionLibraries:
      data?.exam_by_pk?.exam_question_library.map(v => ({
        id: v.question_library?.id,
        title: v.question_library?.title,
        questionGroups: v.question_library?.question_groups.map(w => ({
          id: w.id,
          title: w.title,
          amount: w.questions_aggregate.aggregate?.count || 0,
        })),
      })) || [],
  }

  return {
    loading,
    error,
    exam,
  }
}

const UPDATE_EXAM = gql`
  mutation UPDATE_EXAM(
    $programContentId: uuid!
    $title: String
    $publishedAt: timestamptz
    $isNotifyUpdate: Boolean
    $notifiedAt: timestamptz
    $displayMode: String
    $examId: uuid!
    $point: numeric
    $passingScore: numeric
    $examinableUnit: String
    $examinableAmount: numeric
    $examinableStartedAt: timestamptz
    $examinableEndedAt: timestamptz
    $timeLimitUnit: String
    $timeLimitAmount: numeric
    $isAvailableToRetry: Boolean
    $isAvailableToGoBack: Boolean
    $isAvailableAnnounceScore: Boolean
  ) {
    update_program_content(
      where: { id: { _eq: $programContentId } }
      _set: {
        title: $title
        published_at: $publishedAt
        is_notify_update: $isNotifyUpdate
        notified_at: $notifiedAt
        display_mode: $displayMode
      }
    ) {
      affected_rows
    }
    update_exam(
      where: { id: { _eq: $examId } }
      _set: {
        point: $point
        passing_score: $passingScore
        examinable_unit: $examinableUnit
        examinable_amount: $examinableAmount
        examinable_started_at: $examinableStartedAt
        examinable_ended_at: $examinableEndedAt
        time_limit_unit: $timeLimitUnit
        time_limit_amount: $timeLimitAmount
        is_available_to_retry: $isAvailableToRetry
        is_available_to_go_back: $isAvailableToGoBack
        is_available_announce_score: $isAvailableAnnounceScore
      }
    ) {
      affected_rows
    }
  }
`
const UPDATE_EXAM_QUESTION_LIBRARY = gql`
  mutation UPDATE_EXAM_QUESTION_LIBRARY(
    $examId: uuid!
    $examQuestionLibraries: [exam_question_library_insert_input!]!
  ) {
    delete_exam_question_library(where: { exam_id: { _eq: $examId } }) {
      affected_rows
    }
    insert_exam_question_library(objects: $examQuestionLibraries) {
      affected_rows
    }
  }
`

export default ExerciseAdminModal
