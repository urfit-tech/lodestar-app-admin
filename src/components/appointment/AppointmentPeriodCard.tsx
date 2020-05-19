import { Button, Divider, Icon, Modal } from 'antd'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { dateRangeFormatter } from '../../helpers'
import { appointmentMessages, commonMessages } from '../../helpers/translation'
import { ReactComponent as CalendarAltOIcon } from '../../images/icon/calendar-alt-o.svg'
import { ReactComponent as UserOIcon } from '../../images/icon/user-o.svg'
import { AvatarImage } from '../common/Image'

const StyledWrapper = styled.div`
  margin-bottom: 0.75rem;
  padding: 2rem;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
`
const StyledTitle = styled.div`
  margin-bottom: 0.75rem;
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledMeta = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  letter-spacing: 0.4px;
`
const StyledButton = styled(Button)`
  line-height: normal;
  padding: 0 1.25rem;
`

const messages = defineMessages({
  appointmentText: { id: 'appointment.ui.appointmentText', defaultMessage: '{name} 已預約你的「{title}」' },
  addToCalendar: { id: 'appointment.ui.addToCalendar', defaultMessage: '加入行事曆' },
  joinMeeting: { id: 'appointment.ui.joinMeeting', defaultMessage: '進入會議' },
})

export type AppointmentPeriodCardProps = {
  id: string
  avatarUrl?: string | null
  member: {
    name: string
    email?: string | null
    phone?: string | null
  }
  appointmentPlanTitle: string
  startedAt: Date
  endedAt: Date
  creator: {
    id: string
    name: string
  }
  orderProductId: string | null
}

const AppointmentPeriodCard: React.FC<AppointmentPeriodCardProps> = ({
  avatarUrl,
  member,
  appointmentPlanTitle,
  startedAt,
  endedAt,
  creator,
  orderProductId,
}) => {
  const { formatMessage } = useIntl()
  const [visible, setVisible] = useState(false)

  const startedTime = moment(startedAt).utc().format('YYYYMMDD[T]HHmmss[Z]')
  const endedTime = moment(endedAt).utc().format('YYYYMMDD[T]HHmmss[Z]')
  const isFinished = endedAt.getTime() < Date.now()

  return (
    <StyledWrapper className="d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center justify-content-start">
        <AvatarImage src={avatarUrl} size={48} className="mr-4" />
        <div>
          <StyledTitle>
            {formatMessage(messages.appointmentText, { name: member.name, title: appointmentPlanTitle })}
          </StyledTitle>
          <StyledMeta>
            <Icon component={() => <CalendarAltOIcon />} className="mr-1" />
            <span>{dateRangeFormatter(startedAt, endedAt, 'MM/DD(dd) HH:mm')}</span>
            {creator.name && (
              <>
                <Icon component={() => <UserOIcon />} className="ml-3 mr-1" />
                <span>{creator.name}</span>
              </>
            )}
          </StyledMeta>
        </div>
      </div>

      <div>
        <Button type="link" size="small" onClick={() => setVisible(true)}>
          {formatMessage(commonMessages.ui.detail)}
        </Button>
        <Divider type="vertical" />
        <a
          href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${appointmentPlanTitle}&dates=${startedTime}%2F${endedTime}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button type="link" size="small">
            {formatMessage(messages.addToCalendar)}
          </Button>
        </a>
        {isFinished ? (
          <StyledButton type="link" size="small" disabled={true} className="ml-2">
            {formatMessage(appointmentMessages.status.finished)}
          </StyledButton>
        ) : (
          <a
            href={`https://meet.jit.si/${orderProductId}#config.startWithVideoMuted=true&userInfo.displayName="${creator.name}"`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <StyledButton type="primary" className="ml-2" disabled={!orderProductId}>
              {formatMessage(messages.joinMeeting)}
            </StyledButton>
          </a>
        )}
      </div>

      <Modal footer={null} width={312} destroyOnClose centered visible={visible} onCancel={() => setVisible(false)}>
        <div className="text-center mb-4">
          <AvatarImage src={avatarUrl} size={72} className="mx-auto mb-3" />
          <StyledTitle>{member.name}</StyledTitle>
          <StyledMeta>
            <Icon component={() => <CalendarAltOIcon />} className="mr-1" />
            <span>{dateRangeFormatter(startedAt, endedAt, 'MM/DD(dd) HH:mm')}</span>
          </StyledMeta>
        </div>

        {member.email && (
          <StyledMeta className="d-flex justify-content-between mb-3">
            <div>{formatMessage(commonMessages.term.email)}</div>
            <div>{member.email}</div>
          </StyledMeta>
        )}
        {member.phone && (
          <StyledMeta className="d-flex justify-content-between">
            <div>{formatMessage(commonMessages.term.phone)}</div>
            <div>{member.phone}</div>
          </StyledMeta>
        )}
      </Modal>
    </StyledWrapper>
  )
}

export default AppointmentPeriodCard
