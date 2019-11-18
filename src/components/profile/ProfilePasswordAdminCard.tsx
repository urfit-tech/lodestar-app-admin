import { Button, Form, Input, message, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import { FormComponentProps } from 'antd/lib/form'
import axios from 'axios'
import React, { FormEvent, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import AdminCard from '../common/AdminCard'
import { StyledForm } from '../layout'

type ProfilePasswordAdminCardProps = CardProps & FormComponentProps & { memberId: string }
const ProfilePasswordAdminCard: React.FC<ProfilePasswordAdminCardProps> = ({ form, memberId, ...cardProps }) => {
  const { currentMemberId } = useAuth()
  const [loading, setLoading] = useState()
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    form.validateFields((error, values) => {
      if (!error) {
        setLoading(true)
        axios
          .post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/changePassword`, {
            memberId: currentMemberId,
            password: values.password,
            newPassword: values.newPassword,
          })
          .then(() => message.success('已更新密碼'))
          .catch(err => message.error(err.response.data.message))
          .finally(() => setLoading(false))
      }
    })
  }
  return (
    <AdminCard {...cardProps}>
      <Typography.Title className="mb-4" level={4}>
        修改密碼
      </Typography.Title>
      <StyledForm
        labelCol={{ span: 24, md: { span: 4 } }}
        wrapperCol={{ span: 24, md: { span: 8 } }}
        onSubmit={handleSubmit}
      >
        <Form.Item label="目前密碼">
          {form.getFieldDecorator('password', {
            rules: [{ required: true, message: '請輸入目前密碼' }],
          })(<Input type="password" />)}
        </Form.Item>
        <Form.Item label="新密碼">
          {form.getFieldDecorator('newPassword', {
            rules: [{ required: true, message: '請輸入新密碼' }],
          })(<Input type="password" />)}
        </Form.Item>
        <Form.Item label="確認密碼">
          {form.getFieldDecorator('confirmPassword', {
            rules: [
              { required: true, message: '請確認新密碼' },
              {
                validator: (rule, value, callback) => {
                  if (value && form.getFieldValue('newPassword') !== value) {
                    callback(new Error('確認密碼與新密碼相同'))
                  }
                  callback()
                },
              },
            ],
          })(<Input type="password" />)}
        </Form.Item>
        <Form.Item wrapperCol={{ md: { offset: 4 } }}>
          <Button className="mr-2" onClick={() => form.resetFields()}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            儲存
          </Button>
        </Form.Item>
      </StyledForm>
    </AdminCard>
  )
}

export default Form.create<ProfilePasswordAdminCardProps>()(ProfilePasswordAdminCard)
