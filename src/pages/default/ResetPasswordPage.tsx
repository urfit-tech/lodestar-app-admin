import { Button, Form, Icon, Input, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import useRouter from 'use-react-router'
import { useAuth } from '../../components/auth/AuthContext'
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

const ResetPasswordPage: React.FC<FormComponentProps> = ({ form }) => {
  const { history } = useRouter()
  const { setAuthToken } = useAuth()
  const [token] = useQueryParam('token', StringParam)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    form.validateFields((error, values) => {
      if (!error) {
        setLoading(true)
        axios
          .post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/resetPassword`, {
            token,
            newPassword: values.password,
          })
          .then(() => {
            history.push('/reset-password-success')
          })
          .catch(err => message.error(err.response.data.message))
          .finally(() => setLoading(false))
      }
    })
  }

  useEffect(() => {
    try {
      localStorage.removeItem(`${localStorage.getItem('kolable.app.id')}.auth.token`)
    } catch (error) {}
    setAuthToken && setAuthToken(null)
  }, [setAuthToken])

  return (
    <DefaultLayout noFooter centeredBox>
      <StyledContainer>
        <StyledTitle>重設密碼</StyledTitle>
        <Form onSubmit={handleSubmit}>
          <Form.Item>
            {form.getFieldDecorator('password', {
              rules: [{ required: true, message: '請輸入密碼' }],
            })(<Input type="password" placeholder="輸入新密碼" suffix={<Icon type="lock" />} />)}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('passwordCheck', {
              validateTrigger: 'onSubmit',
              rules: [
                { required: true, message: '請輸入確認密碼' },
                {
                  validator: (rule, value, callback) => {
                    if (value && value !== form.getFieldValue('password')) {
                      callback('請輸入相同密碼')
                    } else {
                      callback()
                    }
                  },
                },
              ],
            })(<Input type="password" placeholder="再次輸入新密碼" suffix={<Icon type="lock" />} />)}
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

export default Form.create<FormComponentProps>()(ResetPasswordPage)
