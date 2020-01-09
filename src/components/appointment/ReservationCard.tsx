import React from 'react'
import styled from 'styled-components'
import { dateRangeFormatter } from '../../helpers'
import DefaultAvatar from '../../images/default/avatar.svg'
import { ReactComponent as CalendarOIcon } from '../../images/default/calendar-alt-o.svg'
import { BREAK_POINT } from '../common/Responsive'

const StyledCard = styled.div`
  border-radius: 4px;
  width: 100%;
  background-color: white;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
`
const StyledWrapper = styled.div`
  display: block;
  width: 100%;
  padding: 30px 32px;

  @media (min-width: ${BREAK_POINT}px) {
    display: flex;
    justify-content: space-between;
  }
`
const StyledInfo = styled.div`
  margin-bottom: 32px;

  @media (min-width: ${BREAK_POINT}px) {
    margin-bottom: initial;
  }
`
const StyledCreatorAvatar = styled.img`
  margin-right: 32px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
`
const StyledReservationInfo = styled.div``
const StyledTitle = styled.h3`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledReservationPeriod = styled.div`
  letter-spacing: 0.4px;
  color: var(--gray-darker);
  font-size: 14px;
  font-weight: 500;
`
const StyledCalendarIcon = styled(CalendarOIcon)`
  margin-top: 4px;
  margin-right: 4px;
`
const StyledStatusBar = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;

  @media (min-width: ${BREAK_POINT}px) {
    justify-content: space-between;
    width: initial;
  }
`
const StyledButton = styled.button<{ variant: 'primary' | 'link' }>`
  outline: none;
  border: 0;
  border-radius: 4px;
  padding: ${props => props.variant === 'link' && 0};
  width: ${props => props.variant === 'primary' && '105px'};
  height: 44px;
  background-color: ${props => (props.variant === 'primary' ? props.theme['@primary-color'] : 'white')};
  color: ${props => (props.variant === 'link' ? props.theme['@primary-color'] : 'white')};

  &:not(:last-child) {
    margin-right: 20px;
  }
`
const StyledBadge = styled.span`
  letter-spacing: 0.2px;
  font-size: 16px;
  font-weight: 500;
  color: var(--gray);
`

type ReservationCardProps = {
  avatarUrl: string
  title: string
  startedAt: Date
  endedAt: Date
}
const ReservationCard: React.FC<ReservationCardProps> = ({ avatarUrl, title, startedAt, endedAt }) => {
  const now = new Date()
  return (
    <StyledCard>
      <StyledWrapper>
        <StyledInfo className="d-flex justify-content-start align-items-center">
          <StyledCreatorAvatar src={avatarUrl || DefaultAvatar} />
          <StyledReservationInfo className="d-flex flex-column justify-content-between">
            <StyledTitle>{title}</StyledTitle>
            <StyledReservationPeriod className="d-flex align-items-start">
              <StyledCalendarIcon />
              <span>{dateRangeFormatter(startedAt, endedAt)}</span>
            </StyledReservationPeriod>
          </StyledReservationInfo>
        </StyledInfo>
        <StyledStatusBar className="d-flex align-items-center">
          {now < endedAt ? (
            <>
              <StyledButton variant="link">加入行事曆</StyledButton>
              <StyledButton variant="primary">進入會議</StyledButton>
            </>
          ) : (
            <StyledBadge>已結束</StyledBadge>
          )}
        </StyledStatusBar>
      </StyledWrapper>
    </StyledCard>
  )
}

export default ReservationCard
