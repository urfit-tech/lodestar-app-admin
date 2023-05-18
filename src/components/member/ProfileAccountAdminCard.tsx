import { gql, useMutation } from '@apollo/client'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { CardProps } from 'antd/lib/card'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { useMember } from '../../hooks/member'
import { AdminBlockTitle } from '../admin'
import AdminCard from '../admin/AdminCard'

const messages = defineMessages({
  profileAdminTitle: { id: 'common.label.profileAdminTitle', defaultMessage: '帳號資料' },
})

type FieldProps = {
  email: string
  username: string
}

const ProfileAccountAdminCard: React.FC<
  CardProps & {
    memberId: string
  }
> = ({ memberId, ...cardProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { member } = useMember(memberId)
  const [updateMemberAccount] = useMutation<hasura.UPDATE_MEMBER_ACCOUNT, hasura.UPDATE_MEMBER_ACCOUNTVariables>(
    UPDATE_MEMBER_ACCOUNT,
  )
  const [loading, setLoading] = useState(false)

  if (!member) {
    return (
      <AdminCard {...cardProps}>
        <AdminBlockTitle className="mb-4">{formatMessage(messages.profileAdminTitle)}</AdminBlockTitle>
        <Skeleton active />
      </AdminCard>
    )
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateMemberAccount({
      variables: {
        memberId,
        email: values.email.trim().toLowerCase(),
        username: values.username.trim().toLowerCase(),
      },
    })
      .then(() => message.success(formatMessage(commonMessages.event.successfullySaved)))
      .catch(handleError)
      .finally(() => setLoading(false))
  }
  return (
    <AdminCard {...cardProps}>
      <AdminBlockTitle className="mb-4">{formatMessage(messages.profileAdminTitle)}</AdminBlockTitle>

      <Form
        form={form}
        labelAlign="left"
        labelCol={{ md: { span: 4 } }}
        wrapperCol={{ md: { span: 8 } }}
        colon={false}
        hideRequiredMark
        initialValues={{
          username: member.username,
          email: member.email,
        }}
        onFinish={handleSubmit}
      >
        <Form.Item
          label={formatMessage(commonMessages.label.account)}
          name="username"
          rules={[{ required: true, message: formatMessage(errorMessages.form.account) }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={formatMessage(commonMessages.label.email)}
          name="email"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.label.email),
              }),
            },
          ]}
        >
          <Input />
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
    </AdminCard>
  )
}

const UPDATE_MEMBER_ACCOUNT = gql`
  mutation UPDATE_MEMBER_ACCOUNT($memberId: String!, $username: String!, $email: String!) {
    update_member(where: { id: { _eq: $memberId } }, _set: { username: $username, email: $email }) {
      affected_rows
    }
  }
`

export default ProfileAccountAdminCard
