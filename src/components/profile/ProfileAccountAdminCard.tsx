import { Button, Form, Input, message, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import { FormComponentProps } from 'antd/lib/form'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { useMember, useUpdateMemberAccount } from '../../hooks/member'
import AdminCard from '../admin/AdminCard'
import { StyledForm } from '../layout'

const messages = defineMessages({
  profileAdminTitle: { id: 'common.label.profileAdminTitle', defaultMessage: '帳號資料' },
})

type ProfileAccountAdminCardProps = CardProps &
  FormComponentProps & {
    memberId: string
  }
const ProfileAccountAdminCard: React.FC<ProfileAccountAdminCardProps> = ({ form, memberId, ...cardProps }) => {
  const { formatMessage } = useIntl()
  const { member } = useMember(memberId)
  const updateMemberAccount = useUpdateMemberAccount()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    form.validateFields((error, values) => {
      if (!error && member) {
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
          .catch(error => handleError(error))
      }
    })
  }
  return (
    <AdminCard {...cardProps}>
      <Typography.Title className="mb-4" level={4}>
        {formatMessage(messages.profileAdminTitle)}
      </Typography.Title>
      <StyledForm
        onSubmit={handleSubmit}
        labelCol={{ span: 24, md: { span: 4 } }}
        wrapperCol={{ span: 24, md: { span: 8 } }}
      >
        <Form.Item label={formatMessage(commonMessages.term.account)}>
          {form.getFieldDecorator('username', {
            initialValue: member && member.username,
            rules: [{ required: true, message: formatMessage(errorMessages.form.account) }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(commonMessages.term.email)}>
          {form.getFieldDecorator('_email', {
            initialValue: member && member.email,
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.term.email),
                }),
              },
            ],
          })(<Input />)}
        </Form.Item>
        <Form.Item wrapperCol={{ md: { offset: 4 } }}>
          <Button className="mr-2" onClick={() => form.resetFields()}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" htmlType="submit">
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </Form.Item>
      </StyledForm>
    </AdminCard>
  )
}

export default Form.create<ProfileAccountAdminCardProps>()(ProfileAccountAdminCard)
