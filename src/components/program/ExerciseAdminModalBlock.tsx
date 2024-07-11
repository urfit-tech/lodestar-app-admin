import { MoreOutlined, WarningOutlined } from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Flex } from '@chakra-ui/react'
import { Button, Checkbox, Dropdown, Form, Menu, message, Modal, Skeleton, Tabs } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import moment from 'moment'
import { flatten } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { useMutateProgramContent, useProgramContentActions } from '../../hooks/program'
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
  planIds: string[]
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
    isAvailableAnnounceScore: Boolean(data?.exam_by_pk?.is_available_announce_score),
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
    {
      variables: { examId },
      fetchPolicy: 'no-cache',
    },
  )
  const questionExam: QuestionExam = {
    id: data?.exam_by_pk?.id.toString(),
    point: Number(data?.exam_by_pk?.point),
    passingScore: Number(data?.exam_by_pk?.passing_score),
    questionGroupIds: flatten(
      data?.exam_by_pk?.exam_question_group.map(v => v.question_group?.id).filter(v => v === null) || [],
    ),
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
const UPDATE_EXAM_PROGRAM_CONTENT = gql`
  mutation UPDATE_EXAM_PROGRAM_CONTENT(
    $programContentId: uuid!
    $title: String
    $isNotifyUpdate: Boolean
    $notifiedAt: timestamptz
    $displayMode: String
    $publishedAt: timestamptz
  ) {
    update_program_content(
      where: { id: { _eq: $programContentId } }
      _set: {
        title: $title
        is_notify_update: $isNotifyUpdate
        notified_at: $notifiedAt
        display_mode: $displayMode
        published_at: $publishedAt
      }
    ) {
      affected_rows
    }
  }
`

const ExerciseAdminModalBlock: React.FC<{
  programId: string
  programContent: ProgramContentProps
  onRefetch?: () => void
  onClose: () => void
}> = ({ programId, programContent, onRefetch, onClose }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { deleteProgramContentExerciseAndExam } = useMutateProgramContent()
  const { loading: loadingExamId, error: errorExamId, examId } = useExamId(programContent.id)
  const [updateExam] = useMutation<hasura.UPDATE_EXAM, hasura.UPDATE_EXAMVariables>(UPDATE_EXAM)
  const [updateExamQuestionLibrary] = useMutation<
    hasura.UPDATE_EXAM_QUESTION_GROUP,
    hasura.UPDATE_EXAM_QUESTION_GROUPVariables
  >(UPDATE_EXAM_QUESTION_GROUP)
  const [updateExamProgramContent] = useMutation<
    hasura.UPDATE_EXAM_PROGRAM_CONTENT,
    hasura.UPDATE_EXAM_PROGRAM_CONTENTVariables
  >(UPDATE_EXAM_PROGRAM_CONTENT)

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
  const [activityKey, setActivityKey] = useState('basicSetting')
  const [currentBasicExam, setCurrentBasicExam] = useState<BasicExam>(basicExam)
  const [currentQuestionExam, setCurrentQuestionExam] = useState<QuestionExam>(questionExam)
  const { updatePlans } = useProgramContentActions(programContent.id)

  const handleInitialCurrentState = () => {
    setCurrentBasicExam({
      id: null,
      examinableAmount: NaN,
      examinableEndedAt: null,
      examinableStartedAt: null,
      examinableUnit: null,
      isAvailableAnnounceScore: false,
      isAvailableToGoBack: false,
      isAvailableToRetry: false,
      timeLimitAmount: NaN,
      timeLimitUnit: null,
    })
    setCurrentQuestionExam({
      id: null,
      passingScore: NaN,
      point: NaN,
      questionGroupIds: [],
    })
  }

  const handleSubmit = async (values: FieldProps) => {
    setLoading(true)
    if (
      typeof currentBasicExam?.id !== 'undefined' &&
      currentBasicExam?.id !== null &&
      typeof currentQuestionExam?.id !== 'undefined' &&
      currentQuestionExam?.id !== null
    ) {
      // adjust all form
      Promise.all([
        updatePlans(values.planIds || []),
        updateExam({
          variables: {
            programContentId: programContent.id,
            title: values.title || '',
            publishedAt: values.publishedAt
              ? new Date(values.publishedAt)
              : values.displayMode !== 'conceal'
              ? new Date()
              : null,
            isNotifyUpdate: values.isNotifyUpdate,
            notifiedAt: values.isNotifyUpdate ? new Date() : null,
            displayMode: values.displayMode,
            examId: examId,
            examinableUnit: currentBasicExam.examinableUnit,
            examinableAmount: currentBasicExam.examinableAmount,
            examinableStartedAt: currentBasicExam?.examinableStartedAt
              ? new Date(currentBasicExam.examinableStartedAt)
              : null,
            examinableEndedAt: currentBasicExam?.examinableEndedAt
              ? new Date(currentBasicExam.examinableEndedAt)
              : null,
            timeLimitUnit: currentBasicExam?.timeLimitUnit || null,
            timeLimitAmount: currentBasicExam?.timeLimitAmount || null,
            isAvailableToRetry: currentBasicExam.isAvailableToRetry,
            isAvailableToGoBack: currentBasicExam.isAvailableToGoBack,
            isAvailableAnnounceScore: currentBasicExam.isAvailableAnnounceScore,
          },
        }),
        updateExamQuestionLibrary({
          variables: {
            examId,
            examQuestionGroups: currentQuestionExam?.questionGroupIds.map((questionGroupId: string) => ({
              exam_id: examId,
              question_group_id: questionGroupId,
            })),
            point: currentQuestionExam?.point,
            passingScore: currentQuestionExam?.passingScore,
          },
        }),
        updateExamProgramContent({
          variables: {
            programContentId: programContent.id,
            title: values.title || '',
            isNotifyUpdate: values.isNotifyUpdate,
            notifiedAt: values.isNotifyUpdate ? new Date() : programContent?.notifiedAt,
            displayMode: values.displayMode,
            publishedAt: values.publishedAt
              ? new Date(values.publishedAt)
              : values.displayMode !== 'conceal'
              ? new Date()
              : null,
          },
        }),
      ])
        .then(() => {
          onRefetch?.()
          refetchBasicExam()
          refetchQuestionExam()
          message.success(formatMessage(programMessages['*'].successfullySaved))
          onClose()
          setActivityKey('basicSetting')
          setCurrentBasicExam(prevState => ({ ...prevState, ...basicExam }))
          setCurrentQuestionExam(prevState => ({ ...prevState, ...questionExam }))
        })
        .catch(error => handleError(error))
        .finally(() => {
          setLoading(false)
          handleInitialCurrentState()
        })
    } else if (
      typeof currentBasicExam?.id !== 'undefined' &&
      currentBasicExam?.id !== null &&
      (typeof currentQuestionExam?.id === 'undefined' || currentQuestionExam?.id === null)
    ) {
      // only adjust basic form
      Promise.all([
        updatePlans(values.planIds || []),
        updateExam({
          variables: {
            programContentId: programContent.id,
            title: values.title || '',
            publishedAt: values.publishedAt
              ? new Date(values.publishedAt)
              : values.displayMode !== 'conceal'
              ? new Date()
              : null,
            isNotifyUpdate: values.isNotifyUpdate,
            notifiedAt: values.isNotifyUpdate ? new Date() : null,
            displayMode: values.displayMode,
            examId: examId,
            examinableUnit: currentBasicExam.examinableUnit,
            examinableAmount: currentBasicExam.examinableAmount,
            examinableStartedAt: currentBasicExam?.examinableStartedAt
              ? new Date(currentBasicExam.examinableStartedAt)
              : null,
            examinableEndedAt: currentBasicExam?.examinableEndedAt
              ? new Date(currentBasicExam.examinableEndedAt)
              : null,
            timeLimitUnit: currentBasicExam?.timeLimitUnit || null,
            timeLimitAmount: currentBasicExam?.timeLimitAmount || null,
            isAvailableToRetry: currentBasicExam.isAvailableToRetry,
            isAvailableToGoBack: currentBasicExam.isAvailableToGoBack,
            isAvailableAnnounceScore: currentBasicExam.isAvailableAnnounceScore,
          },
        }),
        updateExamProgramContent({
          variables: {
            programContentId: programContent.id,
            title: values.title || '',
            isNotifyUpdate: values.isNotifyUpdate,
            notifiedAt: values.isNotifyUpdate ? new Date() : programContent?.notifiedAt,
            displayMode: values.displayMode,
            publishedAt: values.publishedAt
              ? new Date(values.publishedAt)
              : values.displayMode !== 'conceal'
              ? new Date()
              : null,
          },
        }),
      ])
        .then(() => {
          onRefetch?.()
          refetchBasicExam()
          message.success(formatMessage(programMessages['*'].successfullySaved))
          onClose()
          setActivityKey('basicSetting')
          setCurrentBasicExam(prevState => ({ ...prevState, ...basicExam }))
        })
        .catch(error => handleError(error))
        .finally(() => {
          setLoading(false)
          handleInitialCurrentState()
        })
    } else if (
      (typeof currentBasicExam?.id === 'undefined' || currentBasicExam?.id === null) &&
      typeof currentQuestionExam?.id !== 'undefined' &&
      currentQuestionExam?.id !== null
    ) {
      // only adjust question form
      Promise.all([
        updateExamQuestionLibrary({
          variables: {
            examId,
            examQuestionGroups: currentQuestionExam?.questionGroupIds.map((questionGroupId: string) => ({
              exam_id: examId,
              question_group_id: questionGroupId,
            })),
            point: currentQuestionExam?.point,
            passingScore: currentQuestionExam?.passingScore,
          },
        }),
        updateExamProgramContent({
          variables: {
            programContentId: programContent.id,
            title: values.title || '',
            isNotifyUpdate: values.isNotifyUpdate,
            notifiedAt: values.isNotifyUpdate ? new Date() : programContent?.notifiedAt,
            displayMode: values.displayMode,
            publishedAt: values.publishedAt
              ? new Date(values.publishedAt)
              : values.displayMode !== 'conceal'
              ? new Date()
              : null,
          },
        }),
      ])
        .then(() => {
          onRefetch?.()
          refetchQuestionExam()
          message.success(formatMessage(programMessages['*'].successfullySaved))
          onClose()
          setActivityKey('basicSetting')
          setCurrentQuestionExam(prevState => ({ ...prevState, ...questionExam }))
        })
        .catch(error => handleError(error))
        .finally(() => {
          setLoading(false)
          handleInitialCurrentState()
        })
    } else {
      // only adjust program content
      Promise.all([
        updatePlans(values.planIds || []),
        updateExamProgramContent({
          variables: {
            programContentId: programContent.id,
            title: values.title || '',
            isNotifyUpdate: values.isNotifyUpdate,
            notifiedAt: values.isNotifyUpdate ? new Date() : programContent?.notifiedAt,
            displayMode: values.displayMode,
            publishedAt: values.publishedAt
              ? new Date(values.publishedAt)
              : values.displayMode !== 'conceal'
              ? new Date()
              : null,
          },
        }),
      ])
        .then(() => {
          message.success(formatMessage(programMessages['*'].successfullySaved))
          onRefetch?.()
          setActivityKey('basicSetting')
          onClose()
        })
        .catch(error => handleError(error))
        .finally(() => {
          setLoading(false)
          handleInitialCurrentState()
        })
    }
  }

  if (loadingExamId || loadingBasicExam || loadingQuestionExam) return <Skeleton active />
  if (errorExamId || errorBasicExam || errorQuestionExam) return <WarningOutlined style={{ color: 'red' }} />
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        title: programContent.title || '',
        planIds: programContent.programPlans?.map(programPlan => programPlan.id) || [],
        publishedAt: programContent.publishedAt ? moment(programContent.publishedAt) : moment().startOf('minute'),
        displayMode: programContent.displayMode,
        isNotifyUpdate: programContent.isNotifyUpdate,
      }}
      onFinish={handleSubmit}
    >
      <Flex
        alignItems={{ base: 'flex-end', md: 'center' }}
        justifyContent="space-between"
        marginBottom="16px"
        flexDirection={{ base: 'column-reverse', md: 'row' }}
      >
        <Flex flexWrap="wrap">
          {programContent.displayMode && (
            <DisplayModeSelector contentType="exam" displayMode={programContent.displayMode} />
          )}
          <Form.Item name="isNotifyUpdate" valuePropName="checked" className="mb-0">
            <Checkbox className="mr-2">{formatMessage(programMessages['*'].notifyUpdate)}</Checkbox>
          </Form.Item>
        </Flex>
        <Flex alignItems="center" marginBottom={{ base: '12px', md: '0' }}>
          <Button
            disabled={loading}
            onClick={() => {
              form.resetFields()
              handleInitialCurrentState()
              setActivityKey('basicSetting')
              onClose()
              Modal.destroyAll()
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
        </Flex>
      </Flex>

      <StyledTitle className="mb-3">{formatMessage(programMessages.ExerciseAdminModal.exerciseSetting)}</StyledTitle>

      <Tabs activeKey={activityKey} onChange={v => setActivityKey(v)}>
        <Tabs.TabPane key="basicSetting" tab={formatMessage(programMessages.ExerciseAdminModal.basicSetting)}>
          <ExamBasicForm
            programId={programId}
            basicExam={basicExam}
            currentBasicExam={currentBasicExam}
            onChange={setCurrentBasicExam}
          />
        </Tabs.TabPane>
        <Tabs.TabPane key="questionSetting" tab={formatMessage(programMessages.ExerciseAdminModal.questionSetting)}>
          <ExamQuestionSettingForm
            questionExam={questionExam}
            currentQuestionExam={currentQuestionExam}
            onChange={setCurrentQuestionExam}
          />
        </Tabs.TabPane>
      </Tabs>
    </Form>
  )
}

export default ExerciseAdminModalBlock
