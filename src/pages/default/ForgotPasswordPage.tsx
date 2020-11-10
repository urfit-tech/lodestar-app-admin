import { MailOutlined } from '@ant-design/icons'
import { Button, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios from 'axios'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled, { css } from 'styled-components'
import DefaultLayout from '../../components/layout/DefaultLayout'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { desktopViewMixin, handleError } from '../../helpers'
import { codeMessages, commonMessages, errorMessages } from '../../helpers/translation'

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
  const { backendEndpoint } = useAuth()
  const app = useContext(AppContext)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    axios
      .post(`${backendEndpoint}/auth/forgot-password`, {
        appId: app.id,
        account: values.email,
      })
      .then(({ data: { code, message, result } }) => {
        if (code === 'SUCCESS') {
          history.push(`/check-email?email=${values.email}&type=forgot-password`)
        } else {
          message.error(formatMessage(codeMessages[code as keyof typeof codeMessages]))
        }
      })
      .catch(handleError)
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
                  field: formatMessage(commonMessages.term.email),
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
