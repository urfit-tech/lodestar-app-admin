import React from 'react'
import styled, { css } from 'styled-components'

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
  cursor: ${props => (props.variant === 'disabled' ? 'not-allowed' : 'pointer')};

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
            background-image: linear-gradient(90deg, transparent 5.5px, var(--gray) 5.5px);
            background-size: 6px 100%;
            background-repeat: repeat;
            transform: rotate(30deg) scale(2);
          }
        `
      : ''}
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

export type AppointmentPeriodProps = {
  id: string
  schedule?: {
    id: string
    periodType: 'D' | 'W' | 'M' | 'Y' | null
  } | null
  startedAt: Date
  isEnrolled?: boolean
  isExcluded?: boolean
}
const AppointmentPeriodItem: React.FC<AppointmentPeriodProps> = ({ id, startedAt, isEnrolled, isExcluded }) => {
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

export default AppointmentPeriodItem
