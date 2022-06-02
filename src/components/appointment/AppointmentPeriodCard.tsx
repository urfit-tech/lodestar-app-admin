import Icon from '@ant-design/icons'
import { Button, Divider } from 'antd'
import moment from 'moment'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { dateRangeFormatter } from '../../helpers'
import { ReactComponent as CalendarAltOIcon } from '../../images/icon/calendar-alt-o.svg'
import { ReactComponent as UserOIcon } from '../../images/icon/user-o.svg'
import { AvatarImage } from '../common/Image'
import AppointMentDetailModal from './AppointMentDetailModal'
import AppointmentIssueAndResultModal from './AppointmentIssueAndResultModal'
import appointmentMessages from './translation'

const StyledWrapper = styled.div`
  margin-bottom: 0.75rem;
  padding: 2rem;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
`
const StyledInfo = styled.div<{ withMask?: boolean }>`
  ${props => (props.withMask ? 'opacity: 0.2;' : '')}
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
const StyledCanceledText = styled.span`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
`

export type AppointmentPeriodCardProps = {
  id: string
  avatarUrl: string | null
  member: {
    name: string
    email: string | null
    phone: string | null
  }
  appointmentPlanTitle: string
  startedAt: Date
  endedAt: Date
  canceledAt: Date | null
  creator: {
    id: string
    name: string
  }
  orderProductId: string
}

const AppointmentPeriodCard: React.FC<
  AppointmentPeriodCardProps & {
    onRefetch?: () => void
  }
> = ({
  id,
  avatarUrl,
  member,
  appointmentPlanTitle,
  startedAt,
  endedAt,
  canceledAt,
  creator,
  orderProductId,
  onRefetch,
}) => {
  const { formatMessage } = useIntl()

  const startedTime = moment(startedAt).utc().format('YYYYMMDD[T]HHmmss[Z]')
  const endedTime = moment(endedAt).utc().format('YYYYMMDD[T]HHmmss[Z]')
  const isFinished = endedAt.getTime() < Date.now()

  return (
    <StyledWrapper className="d-flex align-items-center justify-content-between">
      <StyledInfo className="d-flex align-items-center justify-content-start" withMask={!!canceledAt}>
        <AvatarImage size="48px" src={avatarUrl} className="mr-4" />
        <div>
          <StyledTitle>
            {formatMessage(appointmentMessages.AppointmentPeriodCard.appointmentText, {
              name: member.name,
              title: appointmentPlanTitle,
            })}
          </StyledTitle>
          <StyledMeta>
            <Icon component={() => <CalendarAltOIcon />} className="mr-1" />
            <span>{dateRangeFormatter({ startedAt, endedAt, dateFormat: 'MM/DD(dd)' })}</span>
            {creator.name && (
              <>
                <Icon component={() => <UserOIcon />} className="ml-3 mr-1" />
                <span>{creator.name}</span>
              </>
            )}
          </StyledMeta>
        </div>
      </StyledInfo>

      <div>
        <AppointmentIssueAndResultModal
          renderTrigger={({ setVisible }) => (
            <Button type="link" size="small" onClick={() => setVisible(true)}>
              {formatMessage(appointmentMessages['*'].appointmentIssueAndResult)}
            </Button>
          )}
          appointmentEnrollmentId={id}
          startedAt={startedAt}
          endedAt={endedAt}
          onRefetch={onRefetch}
        />
        <Divider type="vertical" />
        <AppointMentDetailModal
          renderTrigger={({ setVisible }) => (
            <Button type="link" size="small" onClick={() => setVisible(true)}>
              {formatMessage(appointmentMessages['*'].detail)}
            </Button>
          )}
          appointmentEnrollmentId={id}
          member={member}
          avatarUrl={avatarUrl}
          startedAt={startedAt}
          endedAt={endedAt}
        />
        <Divider type="vertical" />

        {canceledAt ? (
          <StyledCanceledText className="ml-2">
            {formatMessage(appointmentMessages.AppointmentPeriodCard.appointmentCanceledAt, {
              time: moment(canceledAt).format('MM/DD(dd) HH:mm'),
            })}
          </StyledCanceledText>
        ) : isFinished ? (
          <StyledButton type="link" size="small" disabled>
            {formatMessage(appointmentMessages.AppointmentPeriodCard.finished)}
          </StyledButton>
        ) : (
          <>
            <a
              href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${appointmentPlanTitle}&dates=${startedTime}%2F${endedTime}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button type="link" size="small">
                {formatMessage(appointmentMessages.AppointmentPeriodCard.addToCalendar)}
              </Button>
            </a>
            <a
              href={`https://meet.jit.si/${orderProductId}#config.startWithVideoMuted=true&userInfo.displayName="${creator.name}"`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <StyledButton type="primary" className="ml-2" disabled={!orderProductId}>
                {formatMessage(appointmentMessages.AppointmentPeriodCard.joinMeeting)}
              </StyledButton>
            </a>
          </>
        )}
      </div>
    </StyledWrapper>
  )
}

export default AppointmentPeriodCard
