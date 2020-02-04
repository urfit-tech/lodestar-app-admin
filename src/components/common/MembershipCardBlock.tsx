import { Icon } from 'antd'
import moment from 'moment'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import MembershipCard from './MembershipCard'
import { BraftContent } from './StyledBraftEditor'

const StyledCardContainer = styled.div`
  min-width: 100px;
  margin-bottom: 2rem;
`
const StyledTitle = styled.h1`
  margin-bottom: 0.75rem;
  overflow: hidden;
  color: #585858;
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
  white-space: nowrap;
  text-overflow: ellipsis;
`
const StyledSubTitle = styled.div`
  margin-bottom: 1rem;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
  letter-spacing: 0.18px;
`

const messages = defineMessages({
  endedAt: { id: 'membershipCard.label.endedAt', defaultMessage: '{date} 止' },
  noLimit: { id: 'membershipCard.label.noLimit', defaultMessage: '無使用期限' },
})

const MembershipCardBlock: React.FC<{
  template: string
  templateVars?: any
  title: string
  expiredAt?: Date
  description?: string
  variant?: string
}> = ({ template, templateVars, title, expiredAt, description, variant }) => {
  const { formatMessage } = useIntl()

  if (variant === 'list-item') {
    return (
      <div className="d-flex justify-content-between">
        <div className="flex-grow-1">
          <StyledTitle>{title}</StyledTitle>
          {description && <BraftContent>{description}</BraftContent>}
        </div>
        <StyledCardContainer className="m-0 ml-5">
          <MembershipCard template={template} templateVars={templateVars} />
        </StyledCardContainer>
      </div>
    )
  }

  return (
    <div>
      <StyledCardContainer>
        <MembershipCard template={template} templateVars={templateVars} />
      </StyledCardContainer>

      <StyledTitle>{title}</StyledTitle>

      <StyledSubTitle>
        <Icon type="calendar" className="mr-2" />
        {expiredAt
          ? formatMessage(messages.endedAt, { date: moment(expiredAt).format('YYYY/MM/DD') })
          : formatMessage(messages.noLimit)}
      </StyledSubTitle>

      {description && <BraftContent>{description}</BraftContent>}
    </div>
  )
}

export default MembershipCardBlock
