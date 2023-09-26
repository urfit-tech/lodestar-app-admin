import Icon, { MoreOutlined } from '@ant-design/icons'
import { useApolloClient } from '@apollo/client'
import { Button, Divider, Dropdown, Menu } from 'antd'
import axios from 'axios'
import dayjs from 'dayjs'
import { DESKTOP_BREAK_POINT } from 'lodestar-app-element/src/components/common/Responsive'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { dateRangeFormatter, handleError } from '../../helpers'
import { GetMeetByTargetAndPeriod } from '../../hooks/meet'
import { ReactComponent as CalendarAltOIcon } from '../../images/icon/calendar-alt-o.svg'
import { ReactComponent as UserOIcon } from '../../images/icon/user-o.svg'
import { AppointmentPeriodCardProps } from '../../types/appointment'
import { AvatarImage } from '../common/Image'
import AppointmentCancelModal from './AppointmentCancelModal'
import AppointmentConfigureMeetingRoomModal from './AppointmentConfigureMeetingRoomModal'
import AppointMentDetailModal from './AppointMentDetailModal'
import AppointmentIssueAndResultModal from './AppointmentIssueAndResultModal'
import AppointmentRescheduleModal from './AppointmentRescheduleModal'
import appointmentMessages from './translation'

const StyledCard = styled.div`
  margin-bottom: 0.75rem;
  padding: 2rem;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);

  @media (min-width: ${DESKTOP_BREAK_POINT}px) {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
`
const StyledInfo = styled.div<{ withMask?: boolean }>`
  margin-bottom: 32px;
  ${props => (props.withMask ? 'opacity: 0.2;' : '')}

  @media (min-width: ${DESKTOP_BREAK_POINT}px) {
    margin-bottom: 0px;
  }
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
  min-width: 105px;
  text-align: center;
`

const StyledDot = styled.div`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: var(--error);
  position: absolute;
  right: -5px;
  top: 0;
`

export type MeetGenerationMethod = 'auto' | 'manual'

const AppointmentPeriodCard: React.FC<
  AppointmentPeriodCardProps & {
    onRefetch?: () => void
  }
> = ({
  id,
  member,
  appointmentPlan,
  startedAt,
  endedAt,
  canceledAt,
  creator,
  orderProduct,
  onRefetch,
  meetGenerationMethod,
}) => {
  const { formatMessage } = useIntl()
  const { id: appId, enabledModules } = useApp()
  const { authToken, currentMemberId } = useAuth()
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false)
  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const apolloClient = useApolloClient()
  const [loading, setLoading] = useState(false)
  const startedTime = moment(startedAt).utc().format('YYYYMMDD[T]HHmmss[Z]')
  const endedTime = moment(endedAt).utc().format('YYYYMMDD[T]HHmmss[Z]')
  const isFinished = endedAt.getTime() < Date.now()
  const isCanceled = !!canceledAt

  const handleJoin = async () => {
    setLoading(true)
    let startUrl
    if (!currentMemberId) return
    const { data } = await apolloClient.query<
      hasura.GetMeetByTargetAndPeriod,
      hasura.GetMeetByTargetAndPeriodVariables
    >({
      query: GetMeetByTargetAndPeriod,
      variables: {
        appId,
        target: appointmentPlan.id,
        startedAt: startedAt,
        endedAt: endedAt,
        memberId: currentMemberId,
      },
    })
    if (data.meet.length !== 0 && data.meet[0].options?.startUrl) {
      startUrl = data.meet[0].options.startUrl
    } else if (enabledModules.meet_service && appointmentPlan.defaultMeetGateway === 'zoom') {
      // create zoom meeting than get startUrl
      try {
        const { data: createMeetData } = await axios.post(
          `${process.env.REACT_APP_KOLABLE_SERVER_ENDPOINT}/kolable/meets`,
          {
            hostMemberId: creator.id,
            memberId: currentMemberId,
            type: 'appointmentPlan',
            target: appointmentPlan.id,
            startedAt: startedAt,
            endedAt: endedAt,
            autoRecording: true,
            service: 'zoom',
            nbfAt: startedAt,
            expAt: endedAt,
          },
          {
            headers: {
              authorization: `Bearer ${authToken}`,
            },
          },
        )
        startUrl = createMeetData.data?.options?.startUrl
      } catch (error) {
        handleError(error)
      }
    }
    // default jitsi
    if (!startUrl) {
      startUrl = `https://meet.jit.si/${orderProduct.id}#config.startWithVideoMuted=true&userInfo.displayName="${creator.name}"`
    }
    if (startUrl) window.open(startUrl)
    setLoading(false)
  }

  return (
    <StyledCard>
      <StyledInfo className="d-flex align-items-center" withMask={isCanceled}>
        <div>
          <AvatarImage size="48px" src={member.avatarUrl} className="mr-4" />
        </div>
        <div>
          <StyledTitle>
            {formatMessage(appointmentMessages.AppointmentPeriodCard.appointmentText, {
              name: member.name,
              title: appointmentPlan.title,
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

      <div className="d-flex align-items-center justify-content-end">
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
          avatarUrl={member.avatarUrl}
          startedAt={startedAt}
          endedAt={endedAt}
        />
        <Divider type="vertical" />

        <AppointmentConfigureMeetingRoomModal
          renderTrigger={({ setVisible }) => (
            <Button type="link" size="small" onClick={() => setVisible(true)} className="position-relative">
              {formatMessage(appointmentMessages['*'].appointmentConfigureMeetingRoom)}
              {meetGenerationMethod === 'manual' && !orderProduct.options?.joinUrl && <StyledDot></StyledDot>}
            </Button>
          )}
          appointmentEnrollmentId={id}
          onRefetch={onRefetch}
          orderProduct={orderProduct}
        />

        <Divider type="vertical" />

        {isCanceled ? (
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
              href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${appointmentPlan.title}&dates=${startedTime}%2F${endedTime}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button type="link" size="small">
                {formatMessage(appointmentMessages.AppointmentPeriodCard.addToCalendar)}
              </Button>
            </a>
            {meetGenerationMethod === 'manual' && !orderProduct.options?.joinUrl ? (
              <StyledCanceledText className="ml-2">
                {formatMessage(appointmentMessages.AppointmentPeriodCard.notYetConfigured)}
              </StyledCanceledText>
            ) : (
              <StyledButton
                loading={loading}
                type="primary"
                className="ml-2"
                disabled={!orderProduct.id}
                onClick={() => handleJoin()}
              >
                {formatMessage(appointmentMessages.AppointmentPeriodCard.joinMeeting)}
              </StyledButton>
            )}
            <AppointmentCancelModal
              orderProductId={orderProduct.id}
              onRefetch={onRefetch}
              visible={cancelModalVisible}
              onCancel={() => setCancelModalVisible(false)}
            />

            <AppointmentRescheduleModal
              orderProductId={orderProduct.id}
              onRefetch={onRefetch}
              visible={rescheduleModalVisible}
              creator={creator}
              memberId={member.id}
              onCancel={() => setRescheduleModalVisible(false)}
              appointmentPlan={appointmentPlan}
              onRescheduleModalVisible={status => setRescheduleModalVisible(status)}
            />
            <Dropdown
              overlay={
                <Menu>
                  {appointmentPlan.rescheduleAmount !== -1 &&
                    appointmentPlan.rescheduleType &&
                    dayjs(startedAt)
                      .subtract(appointmentPlan.rescheduleAmount, appointmentPlan.rescheduleType)
                      .isAfter(new Date()) && (
                      <Menu.Item onClick={() => setRescheduleModalVisible(true)}>
                        {formatMessage(appointmentMessages.AppointmentPeriodCard.rescheduleAppointment)}
                      </Menu.Item>
                    )}
                  <Menu.Item onClick={() => setCancelModalVisible(true)}>
                    {formatMessage(appointmentMessages.AppointmentPeriodCard.cancelAppointment)}
                  </Menu.Item>
                </Menu>
              }
              trigger={['click']}
            >
              <MoreOutlined className="ml-3" />
            </Dropdown>
          </>
        )}
      </div>
    </StyledCard>
  )
}

export default AppointmentPeriodCard
