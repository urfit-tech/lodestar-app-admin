import { Button, Form, Input, message, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import { FormComponentProps } from 'antd/lib/form'
import React from 'react'
import { useMember, useUpdateMember } from '../../hooks/data'
import AdminCard from '../common/AdminCard'
import { StyledForm } from '../layout'

type ProfileAccountAdminCardProps = CardProps &
  FormComponentProps & {
    memberId: string
  }
const ProfileAccountAdminCard: React.FC<ProfileAccountAdminCardProps> = ({ form, memberId, ...cardProps }) => {
  const { member } = useMember(memberId)
  const updateMember = useUpdateMember()
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    form.validateFields((error, values) => {
      if (!error && member) {
        updateMember({
          variables: {
            memberId,
            email: values._email,
            username: values.username,
            name: member.name,
            pictureUrl: member.pictureUrl,
            description: member.description,
          },
        })
          .then(() => message.success('儲存成功'))
          .catch(err => message.error(err.message))
      }
    })
  }
  return (
    <AdminCard {...cardProps}>
      <Typography.Title className="mb-4" level={4}>
        帳號資料
      </Typography.Title>
      <StyledForm
        onSubmit={handleSubmit}
        labelCol={{ span: 24, md: { span: 4 } }}
        wrapperCol={{ span: 24, md: { span: 8 } }}
      >
        <Form.Item label="帳號">
          {form.getFieldDecorator('username', {
            initialValue: member && member.username,
            rules: [{ required: true, message: '請輸入使用者名稱' }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="信箱">
          {form.getFieldDecorator('_email', {
            initialValue: member && member.email,
            rules: [{ required: true, message: '請輸入 Email' }],
          })(<Input />)}
        </Form.Item>
        <Form.Item wrapperCol={{ md: { offset: 4 } }}>
          <Button className="mr-2" onClick={() => form.resetFields()}>
            取消
          </Button>
          <Button type="primary" htmlType="submit">
            儲存
          </Button>
        </Form.Item>
      </StyledForm>
    </AdminCard>
  )
}

export default Form.create<ProfileAccountAdminCardProps>()(ProfileAccountAdminCard)
