import { Icon, Modal } from 'antd'
import moment from 'moment'
import React from 'react'
import styled from 'styled-components'

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-bottom: 2rem;
  border-left: 1px solid var(--gray);
`
const StyledTitle = styled.div`
  margin-bottom: 1.5rem;
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledItemWrapper = styled.div<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0.25rem 0 0.25rem 0.75rem;
  padding: 0 1rem;
  height: 2.5rem;
  border: solid 1px ${props => (props.disabled ? 'var(--gray)' : 'var(--gray-light)')};
  ${props => (props.disabled ? 'background-color: var(--gray-lighter);' : '')}
  color: var(--gray-darker);
  border-radius: 1.25rem;
  line-height: 1.5rem;
  letter-spacing: 0.2px;

  .anticon {
    font-size: 12px;
  }
`
const StyledPopoverWrapper = styled.div`
  padding: 1rem;
`

export type AppointmentSessionItemProps = {
  id: string
  startedAt: Date
  isEnrolled?: boolean
  onDelete?: DeleteSessionEvent
}
export type DeleteSessionEvent = (props: {
  id: string
  onSuccess?: () => void
  onError?: () => void
  onFinally?: () => void
}) => void

const AppointmentSessionItem: React.FC<AppointmentSessionItemProps> = ({ id, startedAt, onDelete, isEnrolled }) => {
  return (
    <StyledItemWrapper disabled={isEnrolled}>
      <span className="mr-2">
        {startedAt
          .getHours()
          .toString()
          .padStart(2, '0')}
        :
        {startedAt
          .getMinutes()
          .toString()
          .padStart(2, '0')}
      </span>

      {isEnrolled ? (
        <Icon type="check" />
      ) : (
        <Icon
          type="close"
          onClick={() =>
            Modal.confirm({
              title: `是否要刪除時段 ${moment(startedAt).format('YYYY-MM-DD(dd) HH:mm')}`,
              cancelText: '取消',
              okText: '確認',
              onOk: () => onDelete && onDelete({ id }),
            })
          }
        />
      )}
    </StyledItemWrapper>
  )
}

const AppointmentSessionCollection: React.FC<{
  sessions: AppointmentSessionItemProps[]
}> = ({ sessions }) => {
  return (
    <>
      <StyledTitle>{sessions.length > 0 && moment(sessions[1].startedAt).format('YYYY-MM-DD(dd)')}</StyledTitle>
      <StyledWrapper>
        {sessions.map(session => (
          <AppointmentSessionItem key={session.id} {...session} />
        ))}
      </StyledWrapper>
    </>
  )
}

export default AppointmentSessionCollection
