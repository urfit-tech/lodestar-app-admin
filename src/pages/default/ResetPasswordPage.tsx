import { LockOutlined } from '@ant-design/icons'
import { Button, Form, Input, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios from 'axios'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import DefaultLayout from '../../components/layout/DefaultLayout'
import { useAuth } from '../../contexts/AuthContext'
import { desktopViewMixin, handleError } from '../../helpers'
import { codeMessages, commonMessages, errorMessages } from '../../helpers/translation'

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
  password: string
  passwordCheck: string
}

const ResetPasswordPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const [token] = useQueryParam('token', StringParam)
  const [form] = useForm<FieldProps>()
  const { backendEndpoint } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    axios
      .post(
        `${backendEndpoint}/auth/reset-password`,
        { newPassword: values.password },
        {
          headers: { authorization: `Bearer ${token}` },
        },
      )
      .then(({ data: { code } }) => {
        if (code === 'SUCCESS') {
          history.push('/reset-password-success')
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
        <StyledTitle>{formatMessage(commonMessages.label.resetPassword)}</StyledTitle>
        <Form form={form} colon={false} hideRequiredMark onFinish={handleSubmit}>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.label.newPassword),
                }),
              },
            ]}
          >
            <Input
              type="password"
              placeholder={formatMessage(commonMessages.label.newPassword)}
              suffix={<LockOutlined />}
            />
          </Form.Item>
          <Form.Item
            name="passwordCheck"
            rules={[
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.label.confirmPassword),
                }),
              },
              {
                validator: (rule, value, callback) => {
                  if (value && value !== form.getFieldValue('password')) {
                    callback(formatMessage(errorMessages.event.checkSamePassword))
                  } else {
                    callback()
                  }
                },
              },
            ]}
          >
            <Input
              type="password"
              placeholder={formatMessage(commonMessages.text.newPasswordAgain)}
              suffix={<LockOutlined />}
            />
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

export default ResetPasswordPage
