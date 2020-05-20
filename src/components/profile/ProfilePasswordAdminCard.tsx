import { Button, Form, Input, message, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import { FormComponentProps } from 'antd/lib/form'
import axios from 'axios'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { codeMessages, commonMessages, errorMessages } from '../../helpers/translation'
import AdminCard from '../admin/AdminCard'
import { StyledForm } from '../layout'

const messages = defineMessages({
  editPassword: { id: 'common.ui.editPassword', defaultMessage: '修改密碼' },
  successfullyUpdatePassword: { id: 'common.event.successfullyUpdatePassword', defaultMessage: '已更新密碼' },
})

type ProfilePasswordAdminCardProps = CardProps & FormComponentProps & { memberId: string }
const ProfilePasswordAdminCard: React.FC<ProfilePasswordAdminCardProps> = ({ form, memberId, ...cardProps }) => {
  const { formatMessage } = useIntl()
  const { authToken } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (!error) {
        setLoading(true)
        axios
          .post(
            `${process.env.REACT_APP_BACKEND_ENDPOINT}/auth/change-password`,
            {
              password: values.password,
              newPassword: values.newPassword,
            },
            {
              headers: { authorization: `Bearer ${authToken}` },
            },
          )
          .then(({ data: { code } }) => {
            if (code === 'SUCCESS') {
              message.success(formatMessage(messages.successfullyUpdatePassword))
            } else {
              message.error(formatMessage(codeMessages[code as keyof typeof codeMessages]))
            }
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      }
    })
  }

  return (
    <AdminCard {...cardProps}>
      <Typography.Title className="mb-4" level={4}>
        {formatMessage(messages.editPassword)}
      </Typography.Title>
      <StyledForm
        labelCol={{ span: 24, md: { span: 4 } }}
        wrapperCol={{ span: 24, md: { span: 8 } }}
        onSubmit={e => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <Form.Item label={formatMessage(commonMessages.label.currentPassword)}>
          {form.getFieldDecorator('password', {
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.label.currentPassword),
                }),
              },
            ],
          })(<Input type="password" />)}
        </Form.Item>
        <Form.Item label={formatMessage(commonMessages.label.newPassword)}>
          {form.getFieldDecorator('newPassword', {
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.label.newPassword),
                }),
              },
            ],
          })(<Input type="password" />)}
        </Form.Item>
        <Form.Item label={formatMessage(commonMessages.label.confirmPassword)}>
          {form.getFieldDecorator('confirmPassword', {
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.label.confirmPassword),
                }),
              },
              {
                validator: (rule, value, callback) => {
                  if (value && form.getFieldValue('newPassword') !== value) {
                    callback(new Error(formatMessage(errorMessages.event.checkSamePassword)))
                  } else {
                    callback()
                  }
                },
              },
            ],
          })(<Input type="password" />)}
        </Form.Item>
        <Form.Item wrapperCol={{ md: { offset: 4 } }}>
          <Button className="mr-2" onClick={() => form.resetFields()}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </Form.Item>
      </StyledForm>
    </AdminCard>
  )
}

export default Form.create<ProfilePasswordAdminCardProps>()(ProfilePasswordAdminCard)
