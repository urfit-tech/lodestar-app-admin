import { Button, Form, Icon, Input, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import axios from 'axios'
import React, { useState } from 'react'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import { BREAK_POINT } from '../../components/common/Responsive'
import DefaultLayout from '../../components/layout/DefaultLayout'

const StyledContainer = styled.div`
  padding: 4rem 1rem;
  color: #585858;

  .ant-form-explain {
    font-size: 14px;
  }

  @media (min-width: ${BREAK_POINT}px) {
    padding: 4rem;
  }
`
const StyledTitle = styled.h1`
  margin-bottom: 2rem;
  color: #585858;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  line-height: 1.6;
  letter-spacing: 0.8px;
`

const ForgotPasswordPage: React.FC<FormComponentProps> = ({ form }) => {
  const { history } = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      axios
        .post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/forgotPassword`, {
          appId: process.env.REACT_APP_ID,
          email: values.email,
        })
        .then(({ data }) => {
          history.push(`/check-email?email=${values.email}&type=forgot-password`)
        })
        .catch(err => message.error(err.response.data.message))
        .finally(() => setLoading(false))

      setLoading(true)
    })
  }

  return (
    <DefaultLayout noFooter centeredBox>
      <StyledContainer>
        <StyledTitle>忘記密碼</StyledTitle>

        <Form onSubmit={handleSubmit}>
          <Form.Item>
            {form.getFieldDecorator('email', {
              validateTrigger: 'onSubmit',
              rules: [{ required: true, message: '請輸入信箱' }, { type: 'email', message: '請輸入信箱格式' }],
            })(<Input placeholder="輸入你註冊的信箱" suffix={<Icon type="mail" />} />)}
          </Form.Item>
          <Form.Item className="m-0">
            <Button htmlType="submit" type="primary" block loading={loading}>
              確定
            </Button>
          </Form.Item>
        </Form>
      </StyledContainer>
    </DefaultLayout>
  )
}

export default Form.create<FormComponentProps>()(ForgotPasswordPage)
