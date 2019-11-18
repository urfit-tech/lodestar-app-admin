import { Button, message } from 'antd'
import axios from 'axios'
import React, { useState } from 'react'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import DefaultLayout from '../../components/layout/DefaultLayout'
import { ReactComponent as CheckEmailIcon } from '../../images/default/check-email.svg'

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

const CheckEmailPage = () => {
  const [loading, setLoading] = useState(false)
  const [email] = useQueryParam('email', StringParam)
  const [type] = useQueryParam('type', StringParam)

  const handleResendEmail = () => {
    setLoading(true)
    if (!email) {
      setTimeout(() => {
        setLoading(false)
      }, 3000)
      return
    }
    axios
      .post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/forgotPassword`, {
        appId: process.env.REACT_APP_ID,
        email: email,
      })
      .then(({ data }) => {
        message.success('已寄送重設密碼信')
      })
      .catch(err => message.error(err.response.data.message))
      .finally(() => setLoading(false))
  }

  return (
    <DefaultLayout noFooter centeredBox>
      <StyledContainer>
        <StyledIcon>
          <CheckEmailIcon />
        </StyledIcon>

        <p>{type === 'reset-password' ? '為了安全考量，請至信箱收信更換密碼' : '請至信箱收信更換密碼'}</p>

        <p>{email}</p>

        <StyledAction>
          <span>收不到信？</span>
          <Button type="link" size="small" onClick={handleResendEmail} loading={loading}>
            再寄一次
          </Button>
        </StyledAction>
      </StyledContainer>
    </DefaultLayout>
  )
}

export default CheckEmailPage
