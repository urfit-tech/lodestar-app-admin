import { Button, Form, Icon, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { AppContext } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { AuthState } from '../../types/general'
import { AuthModalContext, StyledAction, StyledDivider, StyledTitle } from './AuthModal'
import { FacebookLoginButton, GoogleLoginButton } from './SocialLoginButton'

type RegisterSectionProps = FormComponentProps & {
  onAuthStateChange: React.Dispatch<React.SetStateAction<AuthState>>
}
const RegisterSection: React.FC<RegisterSectionProps> = ({ form, onAuthStateChange }) => {
  const { id: appId } = useContext(AppContext)
  const { formatMessage } = useIntl()
  const { register } = useAuth()
  const { setVisible } = useContext(AuthModalContext)
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    form.validateFields((error, values) => {
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

      <Form
        onSubmit={e => {
          e.preventDefault()
          handleLogin()
        }}
      >
        <Form.Item>
          {form.getFieldDecorator('username', {
            rules: [{ required: true, message: formatMessage(errorMessages.form.accountNameOrEmail) }],
          })(<Input placeholder={formatMessage(commonMessages.term.username)} suffix={<Icon type="user" />} />)}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('email', {
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.term.email),
                }),
              },
              { type: 'email', message: formatMessage(errorMessages.form.emailFormat) },
            ],
          })(<Input placeholder="Email" suffix={<Icon type="mail" />} />)}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('password', {
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.term.password),
                }),
              },
            ],
          })(
            <Input
              type="password"
              placeholder={formatMessage(commonMessages.term.password)}
              suffix={<Icon type="lock" />}
            />,
          )}
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

export default Form.create<RegisterSectionProps>()(RegisterSection)
