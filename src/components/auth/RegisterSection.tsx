import { Button, Form, Icon, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useContext, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { AuthState } from '../../schemas/general'
import { AuthModalContext, StyledAction, StyledDivider, StyledTitle } from './AuthModal'
import { FacebookLoginButton, GoogleLoginButton } from './SocialLoginButton'

type RegisterSectionProps = FormComponentProps & {
  onAuthStateChange: React.Dispatch<React.SetStateAction<AuthState>>
}
const RegisterSection: React.FC<RegisterSectionProps> = ({ form, onAuthStateChange }) => {
  const { register } = useAuth()
  const { setVisible } = useContext(AuthModalContext)
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    form.validateFields((error, values) => {
      const appId = localStorage.getItem('kolable.app.id')

      if (error || !appId || !register) {
        return
      }

      setLoading(true)

      register({
        appId,
        username: values.username,
        email: values.email,
        password: values.password,
      })
        .then(() => {
          setLoading(false)
          setVisible && setVisible(false)
          form.resetFields()
        })
        .catch(error => {
          setLoading(false)
          handleError(error)
        })
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

      <Form
        onSubmit={e => {
          e.preventDefault()
          handleLogin()
        }}
      >
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
