import { Button, Form, Icon, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { AuthState } from '../../schemas/general'
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
  const { formatMessage } = useIntl()
  const { login } = useAuth()
  const { setVisible } = useContext(AuthModalContext)
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    form.validateFields((error, values) => {
      if (error || !login) {
        return
      }

      setLoading(true)

      login({
        appId: localStorage.getItem('kolable.app.id') || '',
        account: values.account,
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

      <Form
        onSubmit={e => {
          e.preventDefault()
          handleLogin()
        }}
      >
        <Form.Item>
          {form.getFieldDecorator('account', {
            rules: [{ required: true, message: formatMessage(errorMessages.form.account) }],
          })(<Input placeholder={formatMessage(commonMessages.label.account)} suffix={<Icon type="user" />} />)}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('password', {
            rules: [{ required: true, message: formatMessage(errorMessages.form.password) }],
          })(
            <Input
              type="password"
              placeholder={formatMessage(commonMessages.label.password)}
              suffix={<Icon type="lock" />}
            />,
          )}
        </Form.Item>
        <ForgetPassword>
          <Link to="/forgot-password">{formatMessage(commonMessages.label.forgotPassword)}</Link>
        </ForgetPassword>
        <Form.Item>
          <Button block loading={loading} type="primary" htmlType="submit">
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

export default Form.create<LoginSectionProps>()(LoginSection)
