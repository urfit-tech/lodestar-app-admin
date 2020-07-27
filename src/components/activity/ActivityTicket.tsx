import Icon from '@ant-design/icons'
import { Divider, Tag } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { currencyFormatter, dateRangeFormatter } from '../../helpers'
import { activityMessages, commonMessages } from '../../helpers/translation'
import { ReactComponent as UserOIcon } from '../../images/icon/user-o.svg'
import { BraftContent } from '../common/StyledBraftEditor'

const StyledWrapper = styled.div`
  padding: 1.5rem;
  background-color: white;
  color: var(--gray-darker);
  border-radius: 4px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
`
const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledLabel = styled.div<{ active?: boolean }>`
  position: relative;
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;

  &::before {
    display: block;
    position: absolute;
    top: 5px;
    left: -18px;
    width: 10px;
    height: 10px;
    background-color: ${props => (props.active ? 'var(--success)' : 'var(--gray)')};
    content: '';
    border-radius: 50%;
  }
`
const StyledPrice = styled.div`
  color: var(--gray-darker);
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledSubTitle = styled.div`
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--gray-darker);
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 0.4px;
`
const StyledTag = styled(Tag)`
  && {
    padding: 0.25rem 0.75rem;
  }
`
const StyledDescription = styled.div`
  font-size: 14px;
`
const StyledMeta = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  letter-spacing: 0px;
`
const StyledExtraAdmin = styled.div`
  margin-top: 1.25rem;
  color: var(--gray-darker);
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: 0.2px;
`

const messages = defineMessages({
  expired: { id: 'activity.status.expired', defaultMessage: '已截止' },
})

export type ActivityTicketProps = {
  id: string
  title: string
  description: string | null
  price: number
  count: number
  startedAt: Date
  endedAt: Date
  isPublished: boolean
  activitySessionTickets: {
    id: string
    activitySession: {
      id: string
      title: string
    }
  }[]
  participants: number
  variant?: 'admin'
  extra?: React.ReactNode
}
const ActivityTicket: React.FC<ActivityTicketProps> = ({
  title,
  description,
  price,
  count,
  startedAt,
  endedAt,
  isPublished,
  activitySessionTickets,
  participants,
  variant,
  extra,
}) => {
  const { formatMessage } = useIntl()

  const status =
    !isPublished || Date.now() < startedAt.getTime()
      ? formatMessage(commonMessages.status.notPublished)
      : participants >= count
      ? formatMessage(commonMessages.status.soldOut)
      : Date.now() > endedAt.getTime()
      ? formatMessage(messages.expired)
      : formatMessage(commonMessages.status.selling)

  return (
    <StyledWrapper>
      <StyledTitle className="d-flex align-items-start justify-content-between mb-3">
        <span>{title}</span>
        {variant === 'admin' && (
          <StyledLabel active={status === formatMessage(commonMessages.status.selling)}>{status}</StyledLabel>
        )}
      </StyledTitle>
      <StyledPrice>{currencyFormatter(price)}</StyledPrice>

      <Divider />

      <StyledSubTitle>{formatMessage(activityMessages.term.includingSessions)}</StyledSubTitle>
      {activitySessionTickets.map(sessionTicket => (
        <StyledTag key={sessionTicket.id} color="#585858" className="mb-2">
          {sessionTicket.activitySession.title}
        </StyledTag>
      ))}

      {!!description && (
        <StyledDescription>
          <StyledSubTitle>{formatMessage(activityMessages.term.description)}</StyledSubTitle>
          <BraftContent>{description}</BraftContent>
        </StyledDescription>
      )}

      <StyledSubTitle>{formatMessage(activityMessages.term.sellingTime)}</StyledSubTitle>
      <StyledMeta>{dateRangeFormatter({ startedAt, endedAt })}</StyledMeta>

      {variant === 'admin' && (
        <StyledExtraAdmin className="d-flex align-items-center justify-content-between">
          <div>
            <Icon component={() => <UserOIcon />} className="mr-2" />
            <span>{`${participants} / ${count}`}</span>
          </div>
          {extra}
        </StyledExtraAdmin>
      )}
      {typeof variant === 'undefined' && extra && <div className="mt-3">{extra}</div>}
    </StyledWrapper>
  )
}

export default ActivityTicket
