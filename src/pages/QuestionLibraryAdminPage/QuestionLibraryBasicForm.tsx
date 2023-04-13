import { gql, useMutation } from '@apollo/client'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { questionLibraryMessage } from '../../helpers/translation'
import { QuestionLibrary } from '../../types/questionLibrary'
import pageMessages from '../translation'

type FieldProps = Pick<QuestionLibrary, 'id' | 'title' | 'abstract'>

const QuestionLibraryBasicForm: React.FC<{
  questionLibrary: FieldProps
  currentMemberId: string | null
  onRefetch?: () => void
}> = ({ questionLibrary, currentMemberId, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [updateQuestionLibraryBasic] = useMutation<
    hasura.UPDATE_QUESTION_LIBRARY_BASIC,
    hasura.UPDATE_QUESTION_LIBRARY_BASICVariables
  >(UPDATE_QUESTION_LIBRARY_BASIC)
  const [loading, setLoading] = useState(false)

  if (!questionLibrary) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    if (!currentMemberId) {
      message.error(formatMessage(pageMessages['QuestionLibraryAdminPage'].noMemberId))
      setLoading(false)
      return
    }
    form
      .validateFields()
      .then(() => {
        updateQuestionLibraryBasic({
          variables: {
            questionLibraryId: questionLibrary.id,
            title: values.title || '',
            abstract: values.abstract || '',
            modifierId: currentMemberId,
          },
        })
          .then(() => {
            message.success(formatMessage(pageMessages['*'].successfullySaved))
            onRefetch?.()
          })
          .catch(handleError)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Form
      form={form}
      colon={false}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      initialValues={{
        title: questionLibrary.title || '',
        abstract: questionLibrary.abstract || '',
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        label={formatMessage(questionLibraryMessage.label.basicFormTitle)}
        name="title"
        rules={[
          {
            required: true,
            message: formatMessage(questionLibraryMessage.message.questionLibraryTitleCanNotNull),
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item label={formatMessage(questionLibraryMessage.label.basicFormAbstract)} name="abstract">
        <Input.TextArea />
      </Form.Item>
      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button className="mr-2" onClick={() => form.resetFields()}>
          {formatMessage(pageMessages['*'].cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(pageMessages['*'].save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

export default QuestionLibraryBasicForm

const UPDATE_QUESTION_LIBRARY_BASIC = gql`
  mutation UPDATE_QUESTION_LIBRARY_BASIC(
    $questionLibraryId: uuid!
    $title: String!
    $abstract: String
    $modifierId: String!
  ) {
    update_question_library(
      _set: { title: $title, abstract: $abstract, modifier_id: $modifierId }
      where: { id: { _eq: $questionLibraryId } }
    ) {
      affected_rows
    }
  }
`
