import Icon from '@ant-design/icons'
import { Divider, Tag } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { dateRangeFormatter } from '../../helpers'
import { activityMessages, commonMessages } from '../../helpers/translation'
import { useCurrency } from '../../hooks/currency'
import { ReactComponent as UserOIcon } from '../../images/icon/user-o.svg'
import { ActivityTicketProps, ActivityTicketSessionProps } from '../../types/activity'
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

const ActivityTicket: React.FC<
  ActivityTicketProps & {
    sessions: ActivityTicketSessionProps[]
    extra?: React.ReactNode
  }
> = ({
  title,
  description,
  currencyId,
  price,
  count,
  startedAt,
  endedAt,
  isPublished,
  sessions,
  enrollmentsCount,
  extra,
}) => {
  const { enabledModules } = useApp()
  const { formatMessage } = useIntl()
  const { formatCurrency } = useCurrency(currencyId)

  const status =
    !isPublished || Date.now() < startedAt.getTime()
      ? formatMessage(commonMessages.status.notSold)
      : (enrollmentsCount || 0) >= count
      ? formatMessage(commonMessages.status.soldOut)
      : Date.now() > endedAt.getTime()
      ? formatMessage(activityMessages.status.expired)
      : formatMessage(commonMessages.status.selling)

  return (
    <StyledWrapper>
      <StyledTitle className="d-flex align-items-start justify-content-between mb-3">
        <span>{title}</span>
        <StyledLabel active={status === formatMessage(commonMessages.status.selling)}>{status}</StyledLabel>
      </StyledTitle>

      <StyledPrice>{formatCurrency(price)}</StyledPrice>

      <Divider />

      <StyledSubTitle>{formatMessage(activityMessages.label.includingSessions)}</StyledSubTitle>
      {sessions.map(session => (
        <StyledTag key={session.id} color="#585858" className="mb-2">
          {enabledModules.activity_online
            ? `${session.title} - ${
                {
                  online: formatMessage(activityMessages.label.online),
                  offline: formatMessage(activityMessages.label.offline),
                }[session.type]
              }`
            : session.title}
        </StyledTag>
      ))}

      {!!description && (
        <StyledDescription>
          <StyledSubTitle>{formatMessage(activityMessages.label.description)}</StyledSubTitle>
          <BraftContent>{description}</BraftContent>
        </StyledDescription>
      )}

      <StyledSubTitle>{formatMessage(activityMessages.label.sellingTime)}</StyledSubTitle>
      <StyledMeta>{dateRangeFormatter({ startedAt, endedAt, dateFormat: 'YYYY-MM-DD(dd)' })}</StyledMeta>

      <StyledExtraAdmin className="d-flex align-items-center justify-content-between">
        <div>
          <Icon component={() => <UserOIcon />} className="mr-2" />
          <span>
            {enrollmentsCount} / {count}
          </span>
        </div>
        {extra}
      </StyledExtraAdmin>
    </StyledWrapper>
  )
}

export default ActivityTicket
