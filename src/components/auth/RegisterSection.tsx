import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { AuthState } from '../../types/general'
import { AuthModalContext, StyledAction, StyledDivider, StyledTitle } from './AuthModal'
import { FacebookLoginButton, GoogleLoginButton } from './SocialLoginButton'

type FieldProps = {
  username: string
  email: string
  password: string
}

const RegisterSection: React.FC<{
  onAuthStateChange: React.Dispatch<React.SetStateAction<AuthState>>
}> = ({ onAuthStateChange }) => {
  const app = useApp()
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { setVisible } = useContext(AuthModalContext)
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleRegister = (values: FieldProps) => {
    if (!register) {
      return
    }
    setLoading(true)
    register({
      appId: app.id,
      username: values.username.trim().toLowerCase(),
      email: values.email.trim().toLowerCase(),
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
      <StyledTitle>{formatMessage(commonMessages.ui.register)}</StyledTitle>

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

      <Form form={form} onFinish={handleRegister}>
        <Form.Item
          name="username"
          rules={[{ required: true, message: formatMessage(errorMessages.form.accountNameOrEmail) }]}
        >
          <Input placeholder={formatMessage(commonMessages.term.username)} suffix={<UserOutlined />} />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.term.email),
              }),
            },
            { type: 'email', message: formatMessage(errorMessages.form.emailFormat) },
          ]}
        >
          <Input placeholder="Email" suffix={<MailOutlined />} />
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

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {formatMessage(commonMessages.ui.register)}
          </Button>
        </Form.Item>
      </Form>

      <StyledAction>
        <span>{formatMessage(commonMessages.label.alreadyMember)}</span>
        <Button type="link" size="small" onClick={() => onAuthStateChange('login')}>
          {formatMessage(commonMessages.label.goToLogin)}
        </Button>
      </StyledAction>
    </>
  )
}

export default RegisterSection
