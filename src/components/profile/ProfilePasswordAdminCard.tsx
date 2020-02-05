import { Button, Form, Input, message, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import { FormComponentProps } from 'antd/lib/form'
import axios from 'axios'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import AdminCard from '../admin/AdminCard'
import { StyledForm } from '../layout'

const messages = defineMessages({
  editPassword: { id: 'common.ui.editPassword', defaultMessage: '修改密碼' },
  currentPassword: { id: 'common.label.currentPassword', defaultMessage: '目前密碼' },
  newPassword: { id: 'common.label.newPassword', defaultMessage: '新密碼' },
  confirmPassword: { id: 'common.label.confirmPassword', defaultMessage: '確認密碼' },
  checkSamePassword: { id: 'error.event.checkSamePassword', defaultMessage: '請確認密碼與新密碼相同' },
  successfullyUpdatePassword: { id: 'common.event.successfullyUpdatePassword', defaultMessage: '已更新密碼' },
})

type ProfilePasswordAdminCardProps = CardProps & FormComponentProps & { memberId: string }
const ProfilePasswordAdminCard: React.FC<ProfilePasswordAdminCardProps> = ({ form, memberId, ...cardProps }) => {
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const [loading, setLoading] = useState()

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (!error) {
        setLoading(true)
        axios
          .post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/changePassword`, {
            memberId: currentMemberId,
            password: values.password,
            newPassword: values.newPassword,
          })
          .then(() => message.success(formatMessage(messages.successfullyUpdatePassword)))
          .catch(error => handleError(error))
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
        <Form.Item label={formatMessage(messages.currentPassword)}>
          {form.getFieldDecorator('password', {
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(messages.currentPassword),
                }),
              },
            ],
          })(<Input type="password" />)}
        </Form.Item>
        <Form.Item label={formatMessage(messages.newPassword)}>
          {form.getFieldDecorator('newPassword', {
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(messages.newPassword),
                }),
              },
            ],
          })(<Input type="password" />)}
        </Form.Item>
        <Form.Item label={formatMessage(messages.confirmPassword)}>
          {form.getFieldDecorator('confirmPassword', {
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(messages.confirmPassword),
                }),
              },
              {
                validator: (rule, value, callback) => {
                  if (value && form.getFieldValue('newPassword') !== value) {
                    callback(new Error(formatMessage(messages.checkSamePassword)))
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
