import { Button, Form, Icon, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import axios from 'axios'
import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import { handleError } from '../../helpers'
import { AuthState } from '../../schemas/general'
import { useAuth } from './AuthContext'
import { AuthModalContext, StyledAction, StyledDivider, StyledTitle } from './AuthModal'
import { FacebookLoginButton, GoogleLoginButton } from './SocialLoginButton'

const ForgetPassword = styled.div`
  margin-bottom: 1.5rem;
  font-size: 14px;
  text-align: right;

  a {
    color: #9b9b9b;
  }
`

type LoginSectionProps = FormComponentProps & {
  onAuthStateChange: React.Dispatch<React.SetStateAction<AuthState>>
}
const LoginSection: React.FC<LoginSectionProps> = ({ form, onAuthStateChange }) => {
  const { history } = useRouter()
  const [loading, setLoading] = useState()
  const { setAuthToken } = useAuth()
  const { setVisible } = useContext(AuthModalContext)

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    form.validateFields((error, values) => {
      if (!error) {
        setLoading(true)
        axios
          .post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/generalLogin`, {
            appId: localStorage.getItem('kolable.app.id'),
            account: values.account,
            password: values.password,
          })
          .then(({ data }) => {
            setVisible && setVisible(false)
            const authToken = data.token
            form.resetFields()
            if (!authToken) {
              history.push(`/check-email?email=${values.account}&type=reset-password`)
            } else {
              try {
                localStorage.setItem(`${localStorage.getItem('kolable.app.id')}.auth.token`, authToken)
              } catch (error) {}
              setAuthToken && setAuthToken(authToken)
            }
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      }
    })
  }

  return (
    <>
      <StyledTitle>登入</StyledTitle>

      {!!process.env.REACT_APP_FACEBOOK_APP_ID && (
        <div className="mb-3">
          <FacebookLoginButton />
        </div>
      )}
      {!!process.env.REACT_APP_GOOGLE_CLIENT_ID && (
        <div className="mb-3">
          <GoogleLoginButton />
        </div>
      )}
      {(!!process.env.REACT_APP_FACEBOOK_APP_ID || !!process.env.REACT_APP_GOOGLE_CLIENT_ID) && (
        <StyledDivider>或</StyledDivider>
      )}

      <Form onSubmit={handleLogin}>
        <Form.Item>
          {form.getFieldDecorator('account', {
            rules: [{ required: true, message: '請輸入使用者名稱或 Email' }],
          })(<Input placeholder="使用者名稱或 Email" suffix={<Icon type="user" />} />)}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('password', {
            rules: [{ required: true, message: '請輸入密碼' }],
          })(<Input type="password" placeholder="密碼" suffix={<Icon type="lock" />} />)}
        </Form.Item>
        <ForgetPassword>
          <Link to="/forgot-password">忘記密碼？</Link>
        </ForgetPassword>
        <Form.Item>
          <Button block loading={loading} type="primary" htmlType="submit">
            登入
          </Button>
        </Form.Item>

        <StyledAction>
          <span>還不是會員嗎？</span>
          <Button type="link" size="small" onClick={() => onAuthStateChange('register')}>
            立即註冊
          </Button>
        </StyledAction>
      </Form>
    </>
  )
}

export default Form.create<LoginSectionProps>()(LoginSection)
