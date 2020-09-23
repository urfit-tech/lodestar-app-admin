import { useMutation } from '@apollo/react-hooks'
import { Button, Form, message, Select, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { MemberAdminProps, UserRole } from '../../types/member'

const messages = defineMessages({
  roleSettings: { id: 'common.label.roleSettings', defaultMessage: '身份設定' },
})

const MemberPermissionForm: React.FC<{
  memberAdmin: MemberAdminProps | null
  onRefetch?: () => void
}> = ({ memberAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [updateMemberRole] = useMutation<types.UPDATE_MEMBER_ROLE, types.UPDATE_MEMBER_ROLEVariables>(
    UPDATE_MEMBER_ROLE,
  )
  const [selectedRole, setSelectedRole] = useState<UserRole>(memberAdmin?.role || 'general-member')
  const [loading, setLoading] = useState(false)

  if (!memberAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = () => {
    setLoading(true)
    updateMemberRole({
      variables: {
        memberId: memberAdmin.id,
        role: selectedRole,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch && onRefetch()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      colon={false}
      hideRequiredMark
      onFinish={handleSubmit}
    >
      <Form.Item label={formatMessage(messages.roleSettings)}>
        <Select onChange={(value: UserRole) => setSelectedRole(value)} value={selectedRole}>
          <Select.Option value="general-member">{formatMessage(commonMessages.term.generalMember)}</Select.Option>
          <Select.Option value="content-creator">{formatMessage(commonMessages.term.contentCreator)}</Select.Option>
          <Select.Option value="app-owner">{formatMessage(commonMessages.term.appOwner)}</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button onClick={() => form.resetFields()} className="mr-2">
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const UPDATE_MEMBER_ROLE = gql`
  mutation UPDATE_MEMBER_ROLE($memberId: String!, $role: String) {
    update_member(where: { id: { _eq: $memberId } }, _set: { role: $role }) {
      affected_rows
    }
  }
`

export default MemberPermissionForm
