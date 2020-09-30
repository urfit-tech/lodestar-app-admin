import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { AuthState } from '../../types/general'
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

const LoginSection: React.FC<{
  onAuthStateChange: React.Dispatch<React.SetStateAction<AuthState>>
}> = ({ onAuthStateChange }) => {
  const app = useContext(AppContext)
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const { setVisible } = useContext(AuthModalContext)
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleLogin = (values: any) => {
    if (!login) {
      return
    }
    setLoading(true)
    login({
      appId: app.id,
      account: values.account.trim().toLowerCase(),
      password: values.password,
    })
      .then(() => {
        setVisible && setVisible(false)
        form.resetFields()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <>
      <StyledTitle>{formatMessage(commonMessages.ui.login)}</StyledTitle>

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
        <StyledDivider>{formatMessage(commonMessages.ui.or)}</StyledDivider>
      )}

      <Form form={form} onFinish={handleLogin}>
        <Form.Item
          name="account"
          rules={[{ required: true, message: formatMessage(errorMessages.form.accountNameOrEmail) }]}
        >
          <Input placeholder={formatMessage(commonMessages.term.username)} suffix={<UserOutlined />} />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.term.password),
              }),
            },
          ]}
        >
          <Input type="password" placeholder={formatMessage(commonMessages.term.password)} suffix={<LockOutlined />} />
        </Form.Item>

        <ForgetPassword>
          <Link to="/forgot-password">{formatMessage(commonMessages.text.forgotPassword)}</Link>
        </ForgetPassword>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {formatMessage(commonMessages.ui.login)}
          </Button>
        </Form.Item>

        <StyledAction>
          <span>{formatMessage(commonMessages.label.notMember)}</span>
          <Button type="link" size="small" onClick={() => onAuthStateChange('register')}>
            {formatMessage(commonMessages.ui.registerNow)}
          </Button>
        </StyledAction>
      </Form>
    </>
  )
}

export default LoginSection
