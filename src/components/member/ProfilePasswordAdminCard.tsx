import { Button, Form, Input, message, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import { useForm } from 'antd/lib/form/Form'
import axios from 'axios'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { codeMessages, commonMessages, errorMessages } from '../../helpers/translation'
import AdminCard from '../admin/AdminCard'

const messages = defineMessages({
  editPassword: { id: 'common.ui.editPassword', defaultMessage: '修改密碼' },
  successfullyUpdatePassword: { id: 'common.event.successfullyUpdatePassword', defaultMessage: '已更新密碼' },
})

type FieldProps = {
  password: string
  newPassword: string
}

const ProfilePasswordAdminCard: React.FC<
  CardProps & {
    memberId: string
  }
> = ({ memberId, ...cardProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { authToken } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    axios
      .post(
        `${process.env.REACT_APP_API_BASE_ROOT}/auth/change-password`,
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

  return (
    <AdminCard {...cardProps}>
      <Typography.Title className="mb-4" level={4}>
        {formatMessage(messages.editPassword)}
      </Typography.Title>
      <Form
        form={form}
        labelAlign="left"
        labelCol={{ md: { span: 4 } }}
        wrapperCol={{ md: { span: 8 } }}
        colon={false}
        hideRequiredMark
        onFinish={handleSubmit}
      >
        <Form.Item
          label={formatMessage(commonMessages.label.currentPassword)}
          name="password"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.label.currentPassword),
              }),
            },
          ]}
        >
          <Input type="password" />
        </Form.Item>
        <Form.Item
          label={formatMessage(commonMessages.label.newPassword)}
          name="newPassword"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.label.newPassword),
              }),
            },
          ]}
        >
          <Input type="password" />
        </Form.Item>
        <Form.Item
          label={formatMessage(commonMessages.label.confirmPassword)}
          name="confirmPassword"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.label.confirmPassword),
              }),
            },
            {
              validator: (rule, value, callback) => {
                if (value && form.getFieldValue('newPassword') !== value) {
                  callback(formatMessage(errorMessages.event.checkSamePassword))
                } else {
                  callback()
                }
              },
            },
          ]}
        >
          <Input type="password" />
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

export default ProfilePasswordAdminCard
