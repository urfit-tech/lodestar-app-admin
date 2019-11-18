import { Button, Form, Input, message } from 'antd'
import { CardProps } from 'antd/lib/card'
import { FormComponentProps } from 'antd/lib/form'
import axios from 'axios'
import React, { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import AdminCard from '../common/AdminCard'

type CouponInsertionCardProps = CardProps &
  FormComponentProps & {
    onInsert?: () => void
  }
const CouponInsertionCard: React.FC<CouponInsertionCardProps> = ({ form, onInsert, ...cardProps }) => {
  const [loading, setLoading] = useState()
  const { currentMemberId } = useAuth()
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    form.validateFields((error, values) => {
      if (!error) {
        setLoading(true)
        currentMemberId &&
          insertCouponCode(currentMemberId, values.code)
            .then(({ data }) => {
              message.success(data.message)
              onInsert && onInsert()
            })
            .catch(error => {
              try {
                message.error(error.response.data.message)
              } catch (error) {
                message.error(`無法加入折價券`)
              }
            })
            .finally(() => setLoading(false))
      }
    })
  }
  return (
    <AdminCard {...cardProps}>
      <Form layout="inline" onSubmit={handleSubmit}>
        <Form.Item label="新增折價券">
          {form.getFieldDecorator('code', { rules: [{ required: true }] })(<Input />)}
        </Form.Item>
        <Form.Item>
          <Button loading={loading} type="primary" htmlType="submit" disabled={!form.getFieldValue('code')}>
            新增
          </Button>
        </Form.Item>
      </Form>
    </AdminCard>
  )
}
export const insertCouponCode = (memberId: string, code: string) =>
  axios.post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/insertCouponCode`, {
    appId: process.env.REACT_APP_ID,
    memberId,
    code,
  })
export default Form.create<CouponInsertionCardProps>()(CouponInsertionCard)
