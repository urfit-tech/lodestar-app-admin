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

type FieldProps = {
  title: string
  isNotifyUpdate: boolean
  displayMode: string
  publishedAt: Date
}

export type BasicExam = Pick<
  Exam,
  | 'id'
  | 'examinableUnit'
  | 'examinableAmount'
  | 'examinableStartedAt'
  | 'examinableEndedAt'
  | 'timeLimitAmount'
  | 'timeLimitUnit'
  | 'isAvailableToRetry'
  | 'isAvailableToGoBack'
  | 'isAvailableAnnounceScore'
>

export type QuestionExam = Pick<Exam, 'id' | 'point' | 'passingScore'> & { questionGroupIds: string[] }

const StyledTitle = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--gray-darker);
  letter-spacing: 0.2px;
`

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
  const { deleteProgramContentExerciseAndExam } = useMutateProgramContent()
  const { loading: loadingExamId, error: errorExamId, examId } = useExamId(programContent.id)

  const {
    loading: loadingBasicExam,
    error: errorBasicExam,
    basicExam,
    refetch: refetchBasicExam,
  } = useBasicExam(examId)
  const {
    loading: loadingQuestionExam,
    error: errorQuestionExam,
    questionExam,
    refetch: refetchQuestionExam,
  } = useQuestionExam(examId)

  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [activityKey, setActivityKey] = useState('basicSetting')
  const [basicExamSetting, setBasicExamSetting] = useState<BasicExam>(basicExam)
  const [questionExamSetting, setQuestionExamSetting] = useState<QuestionExam>(questionExam)

  const [updateExam] = useMutation<hasura.UPDATE_EXAM, hasura.UPDATE_EXAMVariables>(UPDATE_EXAM)
  const [updateExamQuestionLibrary] = useMutation<
    hasura.UPDATE_EXAM_QUESTION_GROUP,
    hasura.UPDATE_EXAM_QUESTION_GROUPVariables
  >(UPDATE_EXAM_QUESTION_GROUP)

  const handleSubmit = async (values: FieldProps) => {
    setLoading(true)
    if (typeof basicExamSetting.id === 'undefined' && typeof questionExamSetting.id === 'undefined') {
      message.success(formatMessage(programMessages['*'].successfullySaved))
      setLoading(false)
      setActivityKey('basicSetting')
      setVisible(false)
      return
    }
    if (typeof basicExamSetting.id !== 'undefined') {
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
          examinableUnit: basicExamSetting.examinableUnit,
          examinableAmount: basicExamSetting.examinableAmount,
          examinableStartedAt: basicExamSetting?.examinableStartedAt
            ? new Date(basicExamSetting.examinableStartedAt)
            : null,
          examinableEndedAt: basicExamSetting?.examinableEndedAt ? new Date(basicExamSetting.examinableEndedAt) : null,
          timeLimitUnit: basicExamSetting?.timeLimitUnit || null,
          timeLimitAmount: basicExamSetting?.timeLimitAmount || null,
          isAvailableToRetry: basicExamSetting.isAvailableToRetry,
          isAvailableToGoBack: basicExamSetting.isAvailableToGoBack,
          isAvailableAnnounceScore: !basicExamSetting.isAvailableAnnounceScore,
        },
      })
        .then(() => {
          onRefetch?.()
          refetchBasicExam()
          message.success(formatMessage(programMessages['*'].successfullySaved))
          setVisible(false)
          setActivityKey('basicSetting')
          setBasicExamSetting(prevState => ({ ...prevState, ...basicExam }))
        })
        .catch(error => handleError(error))
        .finally(() => {
          setLoading(false)
        })
    } else if (typeof questionExamSetting.id === 'undefined') {
      updateExamQuestionLibrary({
        variables: {
          examId,
          examQuestionGroups: (questionExamSetting.questionGroupIds === []
            ? questionExam
            : questionExamSetting
          )?.questionGroupIds.map((questionGroupId: string) => ({
            exam_id: examId,
            question_group_id: questionGroupId,
          })),
          point: questionExamSetting?.point || questionExam.point,
          passingScore: questionExamSetting?.passingScore || questionExam.passingScore,
        },
      })
        .then(() => {
          onRefetch?.()
          refetchQuestionExam()
          message.success(formatMessage(programMessages['*'].successfullySaved))
          setVisible(false)
          setActivityKey('basicSetting')
          setQuestionExamSetting(prevState => ({ ...prevState, ...questionExam }))
        })
        .catch(error => handleError(error))
        .finally(() => {
          setLoading(false)
        })
    } else {
      Promise.all([
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
            examinableUnit: basicExamSetting.examinableUnit,
            examinableAmount: basicExamSetting.examinableAmount,
            examinableStartedAt: basicExamSetting?.examinableStartedAt
              ? new Date(basicExamSetting.examinableStartedAt)
              : null,
            examinableEndedAt: basicExamSetting?.examinableEndedAt
              ? new Date(basicExamSetting.examinableEndedAt)
              : null,
            timeLimitUnit: basicExamSetting?.timeLimitUnit || null,
            timeLimitAmount: basicExamSetting?.timeLimitAmount || null,
            isAvailableToRetry: basicExamSetting.isAvailableToRetry,
            isAvailableToGoBack: basicExamSetting.isAvailableToGoBack,
            isAvailableAnnounceScore: !basicExamSetting.isAvailableAnnounceScore,
          },
        }),
        updateExamQuestionLibrary({
          variables: {
            examId,
            examQuestionGroups: (questionExamSetting.questionGroupIds === []
              ? questionExam
              : questionExamSetting
            )?.questionGroupIds.map((questionGroupId: string) => ({
              exam_id: examId,
              question_group_id: questionGroupId,
            })),
            point: questionExamSetting?.point || questionExam.point,
            passingScore: questionExamSetting?.passingScore || questionExam.passingScore,
          },
        }),
      ])
        .then(() => {
          onRefetch?.()
          refetchBasicExam()
          refetchQuestionExam()
          message.success(formatMessage(programMessages['*'].successfullySaved))
          setVisible(false)
          setActivityKey('basicSetting')
          setBasicExamSetting(prevState => ({ ...prevState, ...basicExam }))
          setQuestionExamSetting(prevState => ({ ...prevState, ...questionExam }))
        })
        .catch(error => handleError(error))
        .finally(() => {
          setLoading(false)
        })
    }
  }

  if (loadingExamId || loadingBasicExam || loadingQuestionExam) return <Skeleton active />
  if (errorExamId || errorBasicExam || errorQuestionExam) return <WarningOutlined style={{ color: 'red' }} />

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
                  setActivityKey('basicSetting')
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
                            examId: examId,
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

          <Tabs activeKey={activityKey} onChange={v => setActivityKey(v)}>
            <Tabs.TabPane key="basicSetting" tab={formatMessage(programMessages.ExerciseAdminModal.basicSetting)}>
              <ExamBasicForm basicExam={basicExam} currentBasicExam={basicExamSetting} onChange={setBasicExamSetting} />
            </Tabs.TabPane>
            <Tabs.TabPane key="questionSetting" tab={formatMessage(programMessages.ExerciseAdminModal.questionSetting)}>
              <ExamQuestionSettingForm questionExam={questionExam} onChange={setQuestionExamSetting} />
            </Tabs.TabPane>
          </Tabs>
        </Form>
      </StyledModal>
    </>
  )
}
const useExamId = (programContentId: string) => {
  const { loading, error, data } = useQuery<
    hasura.GET_EXAM_ID_BY_PROGRAM_CONTENT_ID,
    hasura.GET_EXAM_ID_BY_PROGRAM_CONTENT_IDVariables
  >(
    gql`
      query GET_EXAM_ID_BY_PROGRAM_CONTENT_ID($programContentId: uuid!) {
        program_content_body(where: { program_contents: { id: { _eq: $programContentId } } }) {
          target
        }
      }
    `,
    { variables: { programContentId } },
  )
  const examId = data?.program_content_body[0].target
  return {
    loading,
    error,
    examId,
  }
}

const useBasicExam = (examId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_BASIC_EXAM, hasura.GET_BASIC_EXAMVariables>(
    gql`
      query GET_BASIC_EXAM($examId: uuid!) {
        exam_by_pk(id: $examId) {
          id
          examinable_unit
          examinable_amount
          examinable_started_at
          examinable_ended_at
          time_limit_unit
          time_limit_amount
          is_available_to_retry
          is_available_to_go_back
          is_available_announce_score
        }
      }
    `,
    {
      variables: { examId },
      fetchPolicy: 'no-cache',
    },
  )

  const basicExam: BasicExam = {
    id: data?.exam_by_pk?.id.toString(),
    examinableUnit: data?.exam_by_pk?.examinable_unit?.toString() as ExamTimeUnit,
    examinableAmount: Number(data?.exam_by_pk?.examinable_amount),
    examinableStartedAt: data?.exam_by_pk?.examinable_started_at
      ? new Date(data?.exam_by_pk?.examinable_started_at)
      : null,
    examinableEndedAt: data?.exam_by_pk?.examinable_ended_at ? new Date(data?.exam_by_pk?.examinable_ended_at) : null,
    timeLimitUnit: data?.exam_by_pk?.time_limit_unit?.toString() as ExamTimeUnit,
    timeLimitAmount: Number(data?.exam_by_pk?.time_limit_amount),
    isAvailableToRetry: Boolean(data?.exam_by_pk?.is_available_to_retry),
    isAvailableToGoBack: Boolean(data?.exam_by_pk?.is_available_to_go_back),
    isAvailableAnnounceScore: !Boolean(data?.exam_by_pk?.is_available_announce_score),
  }

  return {
    loading,
    error,
    basicExam,
    refetch,
  }
}

const useQuestionExam = (examId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_QUESTION_EXAM, hasura.GET_QUESTION_EXAMVariables>(
    gql`
      query GET_QUESTION_EXAM($examId: uuid!) {
        exam_by_pk(id: $examId) {
          id
          point
          passing_score
          exam_question_group {
            question_group {
              id
            }
          }
        }
      }
    `,
    { variables: { examId }, fetchPolicy: 'no-cache' },
  )
  const questionExam: QuestionExam = {
    id: data?.exam_by_pk?.id.toString(),
    point: Number(data?.exam_by_pk?.point),
    passingScore: Number(data?.exam_by_pk?.passing_score),
    questionGroupIds: flatten(data?.exam_by_pk?.exam_question_group.map(v => v.question_group?.id) || []),
  }

  return { loading, error, questionExam, refetch }
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
const UPDATE_EXAM_QUESTION_GROUP = gql`
  mutation UPDATE_EXAM_QUESTION_GROUP(
    $examId: uuid!
    $point: numeric
    $passingScore: numeric
    $examQuestionGroups: [exam_question_group_insert_input!]!
  ) {
    update_exam(where: { id: { _eq: $examId } }, _set: { point: $point, passing_score: $passingScore }) {
      affected_rows
    }
    delete_exam_question_group(where: { exam_id: { _eq: $examId } }) {
      affected_rows
    }
    insert_exam_question_group(objects: $examQuestionGroups) {
      affected_rows
    }
  }
`

export default ExerciseAdminModal
