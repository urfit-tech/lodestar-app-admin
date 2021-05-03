import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { AuthState } from '../../types/general'
import { AuthModalContext, StyledAction, StyledTitle } from './AuthModal'

const ForgetPassword = styled.div`
  margin-bottom: 1.5rem;
  font-size: 14px;
  text-align: right;

  a {
    color: #9b9b9b;
  }
`

type FieldProps = {
  account: string
  password: string
}

const LoginSection: React.FC<{
  noTitle?: boolean
  onAuthStateChange?: React.Dispatch<React.SetStateAction<AuthState>>
}> = ({ noTitle, onAuthStateChange }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { login } = useAuth()
  const { setVisible } = useContext(AuthModalContext)
  const [loading, setLoading] = useState(false)

  const handleLogin = (values: FieldProps) => {
    if (!login) {
      return
    }
    setLoading(true)
    login({
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
      {!noTitle && <StyledTitle>{formatMessage(commonMessages.ui.login)}</StyledTitle>}

      <Form form={form} onFinish={handleLogin}>
        <Form.Item
          name="account"
          rules={[{ required: true, message: formatMessage(errorMessages.form.accountNameOrEmail) }]}
        >
          <Input placeholder={formatMessage(commonMessages.label.username)} suffix={<UserOutlined />} />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.label.password),
              }),
            },
          ]}
        >
          <Input type="password" placeholder={formatMessage(commonMessages.label.password)} suffix={<LockOutlined />} />
        </Form.Item>

        <ForgetPassword>
          <Link to="/forgot-password">{formatMessage(commonMessages.text.forgotPassword)}</Link>
        </ForgetPassword>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {formatMessage(commonMessages.ui.login)}
          </Button>
        </Form.Item>

        {onAuthStateChange && (
          <StyledAction>
            <span>{formatMessage(commonMessages.text.notMember)}</span>
            <Button type="link" size="small" onClick={() => onAuthStateChange('register')}>
              {formatMessage(commonMessages.ui.registerNow)}
            </Button>
          </StyledAction>
        )}
      </Form>
    </>
  )
}

export default LoginSection
