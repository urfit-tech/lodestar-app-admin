import { Icon, Skeleton } from 'antd'
import moment from 'moment'
import React from 'react'
import styled from 'styled-components'
import { dateRangeFormatter } from '../../helpers'
import { useTicket } from '../../hooks/data'
import EmptyCover from '../../images/default/empty-cover.png'
import { BREAK_POINT } from '../common/Responsive'

const StyledWrapper = styled.div`
  padding: 1.5rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);

  @media (min-width: ${BREAK_POINT}px) {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }
`
const StyledDescription = styled.div`
  overflow: hidden;
  white-space: nowrap;

  @media (min-width: ${BREAK_POINT}px) {
    margin-right: 1rem;
  }
`
const StyledTitle = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
`
const StyledMeta = styled.div<{ active?: boolean }>`
  margin-bottom: 0.75rem;
  color: ${props => (props.active ? 'var(--gray-darker)' : 'var(--gray)')};
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: 0.2px;
  white-space: normal;

  > div:last-child {
    margin-left: 1.5rem;
  }

  @media (min-width: ${BREAK_POINT}px) {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    > div:last-child {
      margin-left: 0;
    }
  }
`
const StyledCover = styled.div<{ src: string }>`
  padding-top: ${(68 * 100) / 120}%;
  width: 100%;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;

  @media (min-width: ${BREAK_POINT}px) {
    padding-top: 68px;
    width: 120px;
  }
`
const StyledBadge = styled.span`
  color: ${props => props.theme['@primary-color']};
  font-size: 14px;
`

const ActivityTicket: React.FC<{
  ticketId: string
}> = ({ ticketId }) => {
  const { loadingTicket, errorTicket, ticket } = useTicket(ticketId)

  if (loadingTicket) {
    return (
      <StyledWrapper>
        <Skeleton active avatar />
      </StyledWrapper>
    )
  }

  if (errorTicket || !ticket) {
    return <StyledWrapper>無法載入</StyledWrapper>
  }

  const activity = ticket.activity
  const activitySessions = ticket.sessionTickets.map(sessionTicket => sessionTicket.session)

  return (
    <StyledWrapper>
      <StyledDescription className="flex-grow-1">
        <StyledTitle className="mb-3">{activity.title}</StyledTitle>

        {activitySessions.map(session => {
          const now = moment()

          return (
            <StyledMeta key={session.id} active={Date.now() < session.endedAt.getTime()}>
              <div>
                <Icon type="calendar" className="mr-2" />
                <span className="mr-2">{session.title}</span>
              </div>
              <div>
                <span className="mr-2">{dateRangeFormatter(session.startedAt, session.endedAt)}</span>

                {now.isBefore(session.startedAt) && now.diff(session.startedAt, 'days', true) > -7 && (
                  <StyledBadge>即將舉行</StyledBadge>
                )}

                {now.isBetween(session.startedAt, session.endedAt) && <StyledBadge>活動開始</StyledBadge>}
              </div>
            </StyledMeta>
          )
        })}
      </StyledDescription>

      <StyledCover className="flex-shrink-0" src={activity.coverUrl || EmptyCover} />
    </StyledWrapper>
  )
}

export default ActivityTicket
