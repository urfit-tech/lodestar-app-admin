import { Button, Divider, Icon, Modal } from 'antd'
import moment from 'moment'
import React, { useState } from 'react'
import styled from 'styled-components'
import { dateRangeFormatter } from '../../helpers'
import { ReactComponent as CalendarAltOIcon } from '../../images/default/calendar-alt-o.svg'
import { ReactComponent as UserOIcon } from '../../images/default/user-o.svg'
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

export type AppointmentPeriodCardProps = {
  id: string
  avatarUrl?: string
  member: {
    name: string
    email?: string
    phone?: string
  }
  appointmentPlanTitle: string
  startedAt: Date
  endedAt: Date
  creatorName?: string
  link?: string
}
const AppointmentPeriodCard: React.FC<AppointmentPeriodCardProps> = ({
  avatarUrl,
  member,
  appointmentPlanTitle,
  startedAt,
  endedAt,
  creatorName,
  link,
}) => {
  const [visible, setVisible] = useState(false)

  const startedTime = moment(startedAt)
    .utc()
    .format('YYYYMMDD[T]HHmmss[Z]')
  const endedTime = moment(endedAt)
    .utc()
    .format('YYYYMMDD[T]HHmmss[Z]')

  return (
    <StyledWrapper className="d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center justify-content-start">
        <AvatarImage src={avatarUrl} size={48} className="mr-4" />
        <div>
          <StyledTitle>
            {member.name} 已預約你的「{appointmentPlanTitle}」
          </StyledTitle>
          <StyledMeta>
            <Icon component={() => <CalendarAltOIcon />} className="mr-1" />
            <span>{dateRangeFormatter(startedAt, endedAt, 'MM/DD(dd) HH:mm')}</span>
            {creatorName && (
              <>
                <Icon component={() => <UserOIcon />} className="ml-3 mr-1" />
                <span>{creatorName}</span>
              </>
            )}
          </StyledMeta>
        </div>
      </div>

      <div>
        <Button type="link" onClick={() => setVisible(true)}>
          詳情
        </Button>
        <Divider type="vertical" />
        <a
          className="ant-btn ant-btn-link"
          href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${appointmentPlanTitle}&dates=${startedTime}%2F${endedTime}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          加入行事曆
        </a>
        <Button type="primary" disabled={!link} className="ml-2">
          進入會議
        </Button>
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
            <div>信箱</div>
            <div>{member.email}</div>
          </StyledMeta>
        )}
        {member.phone && (
          <StyledMeta className="d-flex justify-content-between">
            <div>手機</div>
            <div>{member.phone}</div>
          </StyledMeta>
        )}
      </Modal>
    </StyledWrapper>
  )
}

export default AppointmentPeriodCard
