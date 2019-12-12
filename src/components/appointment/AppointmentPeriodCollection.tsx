import { Button, Icon } from 'antd'
import moment from 'moment'
import React from 'react'
import styled, { css } from 'styled-components'
import AdminModal from '../admin/AdminModal'

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-bottom: 2rem;
`
const StyledTitle = styled.div`
  margin-bottom: 1.5rem;
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledItemWrapper = styled.div<{ variant?: 'default' | 'excluded' | 'disabled' }>`
  position: relative;
  margin-bottom: 0.5rem;
  margin-right: 0.5rem;
  padding: 0.75rem;
  width: 6rem;
  overflow: hidden;
  border: solid 1px ${props => (props.variant === 'disabled' ? 'var(--gray-light)' : 'var(--gray-dark)')};
  color: ${props => (props.variant === 'disabled' ? 'var(--gray-dark)' : 'var(--gray-darker)')};
  border-radius: 4px;

  ${props =>
    props.variant === 'excluded'
      ? css`
          ::before {
            display: block;
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            content: ' ';
            background-image: linear-gradient(
              90deg,
              transparent 0px,
              transparent 5.5px,
              var(--gray) 5.5px,
              var(--gray) 6px
            );
            background-size: 6px 100%;
            background-repeat: repeat;
            transform: rotate(30deg) scale(2);
          }
        `
      : ''}

  .anticon {
    font-size: 12px;
  }
`
const StyledItemTitle = styled.div`
  position: relative;
  margin-bottom: 0.25rem;
  letter-spacing: 0.2px;
`
const StyledItemMeta = styled.div`
  position: relative;
  font-size: 12px;
  letter-spacing: 0.34px;
`
const DangerText = styled.div`
  color: var(--error);
  font-size: 14px;
  letter-spacing: 0.4px;
`
export const EmptyBlock = styled.div`
  padding: 2.5rem 0;
  color: var(--gray-dark);
  font-size: 14px;
  text-align: center;
  letter-spacing: 0.4px;
`

export type DeleteSessionEvent = (props: {
  id: string
  onSuccess?: () => void
  onError?: () => void
  onFinally?: () => void
}) => void
export type AppointmentPeriodItemProps = {
  id: string
  startedAt: Date
  isEnrolled?: boolean
  isExcluded?: boolean
  onDelete?: DeleteSessionEvent
}
const AppointmentPeriodItem: React.FC<AppointmentPeriodItemProps> = ({
  id,
  startedAt,
  isEnrolled,
  isExcluded,
  onDelete,
}) => {
  return (
    <StyledItemWrapper variant={isEnrolled ? 'disabled' : isExcluded ? 'excluded' : 'default'}>
      <StyledItemTitle>
        {startedAt
          .getHours()
          .toString()
          .padStart(2, '0')}
        :
        {startedAt
          .getMinutes()
          .toString()
          .padStart(2, '0')}
      </StyledItemTitle>
      <StyledItemMeta>{isEnrolled ? '已預約' : isExcluded ? '已關閉' : '可預約'}</StyledItemMeta>
    </StyledItemWrapper>
  )
}

const AppointmentSessionCollection: React.FC<{
  periods: AppointmentPeriodItemProps[]
}> = ({ periods }) => {
  return (
    <>
      <StyledTitle>{periods.length > 0 && moment(periods[1].startedAt).format('YYYY-MM-DD(dd)')}</StyledTitle>
      <StyledWrapper>
        {periods.map(period => (
          <AppointmentPeriodItem key={period.id} {...period} />
        ))}
      </StyledWrapper>
    </>
  )
}

export default AppointmentSessionCollection
