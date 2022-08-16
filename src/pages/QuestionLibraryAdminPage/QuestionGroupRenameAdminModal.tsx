import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import AdminModal from '../../components/admin/AdminModal'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, questionLibraryMessage } from '../../helpers/translation'
import pageMessages from '../translation'
import { UPDATE_QUESTION_GROUP_TITLE } from './QuestionLibraryAdminTable'

type RenameFieldProps = {
  title: string
}

const QuestionGroupRenameAdminModal: React.VFC<{
  questionGroupId: string
  title: string
  questionLibraryId: string
  currentMemberId: string
  onRefetch?: () => void
}> = ({ questionGroupId, title, questionLibraryId, currentMemberId, onRefetch }) => {
  const [form] = useForm<RenameFieldProps>()
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState<boolean>(false)
  const [updateQuestionGroupTitle] = useMutation<
    hasura.UPDATE_QUESTION_GROUP_TITLE,
    hasura.UPDATE_QUESTION_GROUP_TITLEVariables
  >(UPDATE_QUESTION_GROUP_TITLE)

  const handleRename = (setVisible: (visible: boolean) => void) => {
    setLoading(true)
    form
      .validateFields()
      .then(() => {
        const values = form.getFieldsValue()
        updateQuestionGroupTitle({
          variables: {
            questionGroupId: questionGroupId,
            title: values.title,
            modifierId: currentMemberId,
            questionLibraryIdForUpdate: questionLibraryId,
          },
        })
          .then(() => {
            message.success(formatMessage(pageMessages['*'].successfullySaved))
            onRefetch?.()
            setLoading(false)
          })
          .catch(handleError)
          .finally(() => {
            setVisible(false)
          })
      })
      .catch(() => {
        message.error(formatMessage(questionLibraryMessage.message.questionGroupTitleCanNotNull))
        setLoading(false)
      })
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <div onClick={() => setVisible(true)}>{formatMessage(commonMessages['ui'].rename)}</div>
      )}
      title="重新命名題組"
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages['ui'].cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleRename(setVisible)}>
            {formatMessage(commonMessages['ui'].save)}
          </Button>
        </>
      )}
    >
      <Form
        form={form}
        initialValues={{
          title: title,
        }}
      >
        <Form.Item
          name="title"
          rules={[
            {
              required: true,
              message: formatMessage(questionLibraryMessage.message.questionGroupTitleCanNotNull),
            },
          ]}
        >
          <Input value={title} />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default QuestionGroupRenameAdminModal
