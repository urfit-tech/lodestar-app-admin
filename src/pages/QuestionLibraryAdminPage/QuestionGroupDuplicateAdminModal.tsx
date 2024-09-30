import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, message } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { v4 as uuid } from 'uuid'
import AdminModal from '../../components/admin/AdminModal'
import hasura from '../../hasura'
import { commonMessages, questionLibraryMessage } from '../../helpers/translation'
import { Question } from '../../types/questionLibrary'
import pageMessages from '../translation'

type QuestionGroupData = Pick<Question, 'id' | 'title' | 'modifierId'>
type QuestionsData = Pick<Question, 'type' | 'subject' | 'position' | 'layout' | 'font' | 'explanation' | 'options'>[]

const QuestionGroupDuplicateAdminModal: React.VFC<{
  questionGroupId: string
  questionLibraryId: string
  currentMemberId: string
  onRefetch?: () => void
}> = ({ questionGroupId, questionLibraryId, currentMemberId, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState<boolean>(false)

  const handleDuplicate = (
    questionGroupData: QuestionGroupData,
    questionsData: QuestionsData,
    setVisible: (visible: boolean) => void,
  ) => {
    setLoading(true)
    insertDuplicateQuestionGroup({
      variables: {
        duplicateQuestionGroupData: [
          {
            id: questionGroupData.id,
            title: questionGroupData.title || '',
            modifier_id: questionGroupData.modifierId,
            question_library_id: questionLibraryId,
          },
        ],
        duplicateQuestionsData: questionsData.map(question => {
          const duplicateQuestionId = uuid()
          return {
            id: duplicateQuestionId,
            question_group_id: questionGroupData.id,
            type: question.type,
            subject: question.subject,
            font: question.font,
            layout: question.layout,
            explanation: question.explanation,
            position: question.position,
            question_options: {
              data:
                question.options?.map(option => ({
                  value: option.value,
                  is_answer: option.isAnswer,
                  position: option.position,
                })) || [],
            },
          }
        }),
        questionLibraryIdForDuplicate: questionLibraryId,
      },
    })
      .then(data => {
        onRefetch?.()
        setVisible(false)
        message.success(formatMessage(questionLibraryMessage.message.successDuplicateQuestionGroup), 3)
      })
      .catch(err => {
        message.error(formatMessage(questionLibraryMessage.message.failDuplicateQuestionGroup), 3)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const {
    duplicateQuestionGroupDataLoading,
    duplicateQuestionGroupDataError,
    duplicateQuestionGroupData,
    duplicateQuestionsData,
  } = useQuestionGroupData(questionGroupId, currentMemberId)
  const [insertDuplicateQuestionGroup] = useMutation<
    hasura.INSERT_DUPLICATE_QUESTION_GROUP,
    hasura.INSERT_DUPLICATE_QUESTION_GROUPVariables
  >(INSERT_DUPLICATE_QUESTION_GROUP)

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <div onClick={() => setVisible(true)}>{formatMessage(commonMessages['ui'].duplicate)}</div>
      )}
      title={formatMessage(questionLibraryMessage.label.confirmDuplicateQuestionGroup)}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages['ui'].cancel)}
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={() => handleDuplicate(duplicateQuestionGroupData, duplicateQuestionsData, setVisible)}
          >
            {formatMessage(commonMessages['ui'].confirm)}
          </Button>
        </>
      )}
    />
  )
}

export default QuestionGroupDuplicateAdminModal

const useQuestionGroupData = (questionGroupId: string, currentMemberId: string) => {
  const { formatMessage } = useIntl()
  const { loading, error, data } = useQuery<hasura.GET_QUESTION_GROUP_DATA, hasura.GET_QUESTION_GROUP_DATAVariables>(
    GET_QUESTION_GROUP_DATA,
    {
      variables: {
        questionGroupId,
      },
    },
  )

  const duplicateQuestionGroupData: QuestionGroupData = {
    id: uuid(),
    title:
      formatMessage(pageMessages.QuestionGroupDuplicateAdminModal.copy, { title: data?.question_group_by_pk?.title }) ||
      formatMessage(pageMessages.QuestionGroupDuplicateAdminModal.copyQuestionBank),
    modifierId: currentMemberId,
  }

  const duplicateQuestionsData: QuestionsData =
    data?.question_group_by_pk?.questions.map(question => ({
      ...question,
      explanation: question.explanation || '',
      options: question.question_options.map(option => ({
        ...option,
        isAnswer: option.is_answer || false,
      })),
    })) || []

  return {
    duplicateQuestionGroupDataLoading: loading,
    duplicateQuestionGroupDataError: error,
    duplicateQuestionGroupData: duplicateQuestionGroupData,
    duplicateQuestionsData: duplicateQuestionsData,
  }
}

const GET_QUESTION_GROUP_DATA = gql`
  query GET_QUESTION_GROUP_DATA($questionGroupId: uuid!) {
    question_group_by_pk(id: $questionGroupId) {
      title
      questions {
        type
        subject
        position
        layout
        font
        explanation
        question_options {
          id
          value
          is_answer
          position
        }
      }
    }
  }
`

const INSERT_DUPLICATE_QUESTION_GROUP = gql`
  mutation INSERT_DUPLICATE_QUESTION_GROUP(
    $duplicateQuestionGroupData: [question_group_insert_input!]!
    $duplicateQuestionsData: [question_insert_input!]!
    $questionLibraryIdForDuplicate: uuid!
  ) {
    insert_question_group(objects: $duplicateQuestionGroupData) {
      affected_rows
    }
    insert_question(objects: $duplicateQuestionsData) {
      affected_rows
    }
    update_question_library(where: { id: { _eq: $questionLibraryIdForDuplicate } }, _set: { updated_at: "now()" }) {
      affected_rows
    }
  }
`
