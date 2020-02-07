import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import DefaultLayout from '../../components/layout/DefaultLayout'
import { commonMessages } from '../../helpers/translation'

const StyledContainer = styled.div`
  padding: 4rem 1rem;
  color: #585858;
  text-align: center;
`

const messages = defineMessages({
  successfullyResetPasswordNotation: {
    id: 'common.text.successfullyResetPasswordNotation',
    defaultMessage: '已重設您的密碼，請回首頁並重新登入。',
  },
})

const ResetPasswordSuccessPage: React.FC = () => {
  const { formatMessage } = useIntl()

  return (
    <DefaultLayout noFooter centeredBox>
      <StyledContainer>
        <p>{formatMessage(messages.successfullyResetPasswordNotation)}</p>
        <div>
          <Link to="/">{formatMessage(commonMessages.ui.backToHompage)}</Link>
        </div>
      </StyledContainer>
    </DefaultLayout>
  )
}

export default ResetPasswordSuccessPage
