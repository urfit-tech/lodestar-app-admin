import { Button, Form, Icon, Input, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import axios from 'axios'
import React, { useContext, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { AuthState } from '../../schemas/general'
import { AuthModalContext, StyledAction, StyledDivider, StyledTitle } from './AuthModal'
import { FacebookLoginButton, GoogleLoginButton } from './SocialLoginButton'

type RegisterSectionProps = FormComponentProps & {
  onAuthStateChange: React.Dispatch<React.SetStateAction<AuthState>>
}
const RegisterSection: React.FC<RegisterSectionProps> = ({ form, onAuthStateChange }) => {
  const [loading, setLoading] = useState()
  const { setAuthToken } = useAuth()
  const { setVisible } = useContext(AuthModalContext)

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    form.validateFields((error, values) => {
      if (!error) {
        setLoading(true)
        axios
          .post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/register`, {
            appId: localStorage.getItem('kolable.app.id'),
            username: values.username,
            email: values.email,
            password: values.password,
          })
          .then(({ data }) => {
            const authToken = data.token
            try {
              localStorage.setItem(`kolable.auth.token`, authToken)
            } catch (error) {}
            setAuthToken && setAuthToken(authToken)
            setVisible && setVisible(false)
            form.resetFields()
          })
          .catch(err => message.error(err.response.data.message))
          .finally(() => setLoading(false))
      }
    })
  }

  return (
    <>
      <StyledTitle>註冊</StyledTitle>

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
          {form.getFieldDecorator('username', {
            rules: [{ required: true, message: '請輸入使用者名稱' }],
          })(<Input placeholder="使用者名稱" suffix={<Icon type="user" />} />)}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('email', {
            rules: [
              { required: true, message: '請輸入 Email' },
              { type: 'email', message: 'Email 格式錯誤' },
            ],
          })(<Input placeholder="Email" suffix={<Icon type="mail" />} />)}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('password', {
            rules: [{ required: true, message: '請輸入密碼' }],
          })(<Input type="password" placeholder="密碼" suffix={<Icon type="lock" />} />)}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            註冊
          </Button>
        </Form.Item>
      </Form>

      <StyledAction>
        <span>已經是是會員嗎？</span>
        <Button type="link" size="small" onClick={() => onAuthStateChange('login')}>
          前往登入
        </Button>
      </StyledAction>
    </>
  )
}

export default Form.create<RegisterSectionProps>()(RegisterSection)
