import { MailOutlined } from '@ant-design/icons'
import { Button, Form, Input, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios from 'axios'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled, { css } from 'styled-components'
import DefaultLayout from '../components/layout/DefaultLayout'
import { desktopViewMixin } from '../helpers'
import { formatAuthError, readAuthResponse } from '../helpers/authResponse'
import { commonMessages, errorMessages } from '../helpers/translation'
import { authCooldownKey, saveAuthCooldown } from '../hooks/authCooldown'

const messages = defineMessages({
  forgotPassword: { id: 'common.label.forgotPassword', defaultMessage: '忘記密碼' },
  enterRegisteredEmail: { id: 'common.text.enterRegisteredEmail', defaultMessage: '輸入你註冊的信箱' },
})

const StyledContainer = styled.div`
  padding: 4rem 1rem;
  color: #585858;

  .ant-form-explain {
    font-size: 14px;
  }

  ${desktopViewMixin(
    css`
      padding: 4rem;
    `,
  )}
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

type FieldProps = {
  email: string
}

const ForgotPasswordPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const [form] = useForm<FieldProps>()
  const app = useApp()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    axios
      .post(`${process.env.REACT_APP_API_BASE_ROOT}/auth/forgot-password`, {
        appId: app.id,
        account: values.email,
      })
      .then(({ data }) => {
        const { code } = data
        if (code === 'SUCCESS' || code === 'E_NO_MEMBER') {
          const seconds = readAuthResponse(data).retryAfter || 60
          saveAuthCooldown(authCooldownKey(app.id, 'reset', values.email), seconds)
          message.info(formatAuthError({ retryAfter: seconds }, formatMessage))
          history.push(`/check-email?email=${encodeURIComponent(values.email)}&type=forgot-password`)
        } else {
          message.error(formatAuthError(data, formatMessage))
        }
      })
      .catch(error => message.error(formatAuthError(error, formatMessage)))
      .finally(() => setLoading(false))
  }

  return (
    <DefaultLayout noFooter centeredBox>
      <StyledContainer>
        <StyledTitle>{formatMessage(messages.forgotPassword)}</StyledTitle>

        <Form form={form} colon={false} hideRequiredMark onFinish={handleSubmit}>
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.label.email),
                }),
              },
              { type: 'email', message: formatMessage(errorMessages.form.emailFormat) },
            ]}
          >
            <Input placeholder={formatMessage(messages.enterRegisteredEmail)} suffix={<MailOutlined />} />
          </Form.Item>

          <Form.Item className="m-0">
            <Button type="primary" htmlType="submit" block loading={loading}>
              {formatMessage(commonMessages.ui.confirm)}
            </Button>
          </Form.Item>
        </Form>
      </StyledContainer>
    </DefaultLayout>
  )
}

export default ForgotPasswordPage
