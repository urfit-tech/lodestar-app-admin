import { Button, Form, Input, message, Skeleton } from 'antd'
import { CardProps } from 'antd/lib/card'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { useMember, useUpdateMemberAccount } from '../../hooks/member'
import { AdminBlockTitle } from '../admin'
import AdminCard from '../admin/AdminCard'
import { StyledForm } from '../layout'

const messages = defineMessages({
  profileAdminTitle: { id: 'common.label.profileAdminTitle', defaultMessage: '帳號資料' },
})

const ProfileAccountAdminCard: React.FC<
  CardProps & {
    memberId: string
  }
> = ({ memberId, ...cardProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const { member } = useMember(memberId)
  const updateMemberAccount = useUpdateMemberAccount()
  const [loading, setLoading] = useState(false)

  if (!member) {
    return (
      <AdminCard {...cardProps}>
        <AdminBlockTitle className="mb-4">{formatMessage(messages.profileAdminTitle)}</AdminBlockTitle>
        <Skeleton active />
      </AdminCard>
    )
  }

  const handleSubmit = () => {
    form
      .validateFields()
      .then(values => {
        if (!member.id) {
          return
        }
        setLoading(true)
        updateMemberAccount({
          variables: {
            memberId,
            email: values._email,
            username: values.username,
            name: member.name,
            pictureUrl: member.pictureUrl,
            description: member.description,
          },
        })
          .then(() => message.success(formatMessage(commonMessages.event.successfullySaved)))
          .catch(handleError)
          .finally(() => setLoading(false))
      })
      .catch(() => {})
  }
  return (
    <AdminCard {...cardProps}>
      <AdminBlockTitle className="mb-4">{formatMessage(messages.profileAdminTitle)}</AdminBlockTitle>

      <StyledForm
        form={form}
        hideRequiredMark
        colon={false}
        labelAlign="left"
        labelCol={{ md: { span: 4 } }}
        wrapperCol={{ md: { span: 8 } }}
        initialValues={{
          username: member.username,
          _email: member.email,
        }}
      >
        <Form.Item
          label={formatMessage(commonMessages.term.account)}
          name="username"
          rules={[{ required: true, message: formatMessage(errorMessages.form.account) }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={formatMessage(commonMessages.term.email)}
          name="_email"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.term.email),
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
          <Button type="primary" loading={loading} onClick={() => handleSubmit()}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </Form.Item>
      </StyledForm>
    </AdminCard>
  )
}

export default ProfileAccountAdminCard
