import { gql, useMutation } from '@apollo/client'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import AdminBraftEditor from '../../components/form/AdminBraftEditor'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { MemberAdminProps } from '../../types/member'

type FieldProps = {
  title?: string
  abstract?: string
  description?: EditorState
}

const MemberProfileAbstractForm: React.FC<{
  memberAdmin: MemberAdminProps | null
  onRefetch?: () => void
}> = ({ memberAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [updateMemberBasic] = useMutation<hasura.UPDATE_MEMBER_ABSTRACT, hasura.UPDATE_MEMBER_ABSTRACTVariables>(
    UPDATE_MEMBER_ABSTRACT,
  )
  const [loading, setLoading] = useState(false)

  if (!memberAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateMemberBasic({
      variables: {
        memberId: memberAdmin.id,
        title: values.title || '',
        abstract: values.abstract || '',
        description: values.description?.getCurrentContent().hasText() ? values.description.toRAW() : null,
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
      colon={false}
      hideRequiredMark
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 12 } }}
      initialValues={{
        title: memberAdmin.title || '',
        abstract: memberAdmin.abstract || '',
        description: BraftEditor.createEditorState(memberAdmin.description),
      }}
      onFinish={handleSubmit}
    >
      <Form.Item label={formatMessage(commonMessages.label.creatorTitle)} name="title">
        <Input />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.label.introduction)} name="abstract">
        <Input.TextArea rows={5} />
      </Form.Item>
      <Form.Item
        label={formatMessage(commonMessages.label.shortDescription)}
        name="description"
        wrapperCol={{ md: { span: 20 } }}
      >
        <AdminBraftEditor />
      </Form.Item>
      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button className="mr-2" onClick={() => form.resetFields()}>
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const UPDATE_MEMBER_ABSTRACT = gql`
  mutation UPDATE_MEMBER_ABSTRACT($memberId: String!, $description: String, $title: String, $abstract: String) {
    update_member(
      where: { id: { _eq: $memberId } }
      _set: { description: $description, title: $title, abstract: $abstract }
    ) {
      affected_rows
    }
  }
`

export default MemberProfileAbstractForm
