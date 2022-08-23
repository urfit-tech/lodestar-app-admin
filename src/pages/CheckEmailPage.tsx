import { Button, message } from 'antd'
import axios from 'axios'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import DefaultLayout from '../components/layout/DefaultLayout'
import { handleError } from '../helpers'
import { codeMessages } from '../helpers/translation'
import { ReactComponent as CheckEmailIcon } from '../images/default/check-email.svg'

const StyledContainer = styled.div`
  padding: 4rem 1rem;
  color: #585858;
  text-align: center;
`
const StyledIcon = styled.div`
  margin-bottom: 2rem;
`
const StyledAction = styled.div`
  padding-top: 1.5rem;
  color: #9b9b9b;
  font-size: 14px;
`

const messages = defineMessages({
  sentResetPasswordMail: { id: 'common.text.sentResetPasswordMail', defaultMessage: '已寄送重設密碼信' },
  resetPasswordNotation: {
    id: 'common.text.resetPasswordNotation',
    defaultMessage: '為了安全考量，請至信箱收信更換密碼',
  },
  checkEmailNotation: { id: 'common.text.checkEmailNotation', defaultMessage: '請至信箱收信更換密碼' },
  emailNotReceived: { id: 'common.text.emailNotReceived', defaultMessage: '收不到信？' },
  sendEmailAgain: { id: 'common.ui.sendEmailAgain', defaultMessage: '再寄一次' },
})

const CheckEmailPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const [email] = useQueryParam('email', StringParam)
  const [type] = useQueryParam('type', StringParam)
  const app = useApp()
  const [loading, setLoading] = useState(false)

  const handleResendEmail = () => {
    setLoading(true)
    if (!email) {
      setTimeout(() => {
        setLoading(false)
      }, 3000)
      return
    }
    axios
      .post(`${process.env.REACT_APP_API_BASE_ROOT}/auth/forgot-password`, {
        appId: app.id,
        account: email,
      })
      .then(({ data: { code } }) => {
        if (code === 'SUCCESS') {
          message.success(formatMessage(messages.sentResetPasswordMail))
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
        <StyledIcon>
          <CheckEmailIcon />
        </StyledIcon>

        <p>
          {type === 'reset-password'
            ? formatMessage(messages.resetPasswordNotation)
            : formatMessage(messages.checkEmailNotation)}
        </p>

        <p>{email}</p>

        <StyledAction>
          <span>{formatMessage(messages.emailNotReceived)}</span>
          <Button type="link" size="small" onClick={handleResendEmail} loading={loading}>
            {formatMessage(messages.sendEmailAgain)}
          </Button>
        </StyledAction>
      </StyledContainer>
    </DefaultLayout>
  )
}

export default CheckEmailPage
