import { Button, Form, Icon, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import axios from 'axios'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import { BREAK_POINT } from '../../components/common/Responsive'
import DefaultLayout from '../../components/layout/DefaultLayout'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { codeMessages, commonMessages, errorMessages } from '../../helpers/translation'

const StyledContainer = styled.div`
  padding: 4rem 1rem;
  color: #585858;

  .ant-form-explain {
    font-size: 14px;
  }

  @media (min-width: ${BREAK_POINT}px) {
    padding: 4rem;
  }
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

const messages = defineMessages({
  forgotPassword: { id: 'common.label.forgotPassword', defaultMessage: '忘記密碼' },
  enterRegisteredEmail: { id: 'common.text.enterRegisteredEmail', defaultMessage: '輸入你註冊的信箱' },
})

const ForgotPasswordPage: React.FC<FormComponentProps> = ({ form }) => {
  const app = useContext(AppContext)
  const { formatMessage } = useIntl()
  const { history } = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      axios
        .post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/auth/forgotPassword`, {
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

      setLoading(true)
    })
  }

  return (
    <DefaultLayout noFooter centeredBox>
      <StyledContainer>
        <StyledTitle>{formatMessage(messages.forgotPassword)}</StyledTitle>

        <Form onSubmit={handleSubmit}>
          <Form.Item>
            {form.getFieldDecorator('email', {
              validateTrigger: 'onSubmit',
              rules: [
                {
                  required: true,
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(commonMessages.term.email),
                  }),
                },
                { type: 'email', message: formatMessage(errorMessages.form.emailFormat) },
              ],
            })(<Input placeholder={formatMessage(messages.enterRegisteredEmail)} suffix={<Icon type="mail" />} />)}
          </Form.Item>
          <Form.Item className="m-0">
            <Button htmlType="submit" type="primary" block loading={loading}>
              {formatMessage(commonMessages.ui.confirm)}
            </Button>
          </Form.Item>
        </Form>
      </StyledContainer>
    </DefaultLayout>
  )
}

export default Form.create<FormComponentProps>()(ForgotPasswordPage)
