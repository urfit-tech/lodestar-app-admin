import { Button, Dropdown, Icon, Menu } from 'antd'
import { sum } from 'ramda'
import React from 'react'
import styled from 'styled-components'
import { dateRangeFormatter } from '../../helpers'
import { ReactComponent as CalendarOIcon } from '../../images/icon/calendar-alt-o.svg'
import { ReactComponent as MapOIcon } from '../../images/icon/map-o.svg'
import { ReactComponent as TicketOIcon } from '../../images/icon/ticket-o.svg'
import { ReactComponent as UserOIcon } from '../../images/icon/user-o.svg'
import { AdminPaneTitle } from '../admin'
import { ActivityAdminProps } from './ActivityAdminBlock'
import ActivitySessionAdminModal from './ActivitySessionAdminModal'

const StyledWrapper = styled.div`
  margin-bottom: 1.25rem;
  padding: 1.5rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
`
const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledDescription = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: 0.2px;

  &:not(:last-child) {
    margin-bottom: 0.75rem;
  }
`
const StyledLinkText = styled.span`
  color: ${props => props.theme['@primary-color']};
`

export type ActivitySessionProps = {
  id: string
  title: string
  description: string | null
  location: string
  threshold: number | null
  startedAt: Date
  endedAt: Date
  participants: number
}
const ActivitySessionsAdminBlock: React.FC<{
  activityAdmin: ActivityAdminProps
  onInsert?: (
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    data: {
      title: string
      startedAt: Date
      endedAt: Date
      location: string
      description: string | null
      threshold: number | null
    },
  ) => void
  onUpdate?: (
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    data: {
      activitySessionId: string
      title: string
      startedAt: Date
      endedAt: Date
      location: string
      description: string | null
      threshold: number | null
    },
  ) => void
  onChangeTab?: () => void
}> = ({ activityAdmin, onInsert, onUpdate, onChangeTab }) => {
  return (
    <div className="container py-5">
      <AdminPaneTitle>場次管理</AdminPaneTitle>

      <ActivitySessionAdminModal
        renderTrigger={({ setVisible }) => (
          <Button type="primary" icon="file-add" onClick={() => setVisible(true)} className="mb-5">
            建立場次
          </Button>
        )}
        icon={() => <Icon type="file-add" />}
        onSubmit={onInsert}
      />

      {activityAdmin.activitySessions.map(session => {
        const tickets = activityAdmin.activityTickets.filter(ticket =>
          ticket.activitySessionTickets.some(sessionTicket => sessionTicket.activitySession.id === session.id),
        )

        return (
          <StyledWrapper key={session.id}>
            <StyledTitle className="mb-3">{session.title}</StyledTitle>
            <StyledDescription>
              <Icon component={() => <CalendarOIcon />} className="mr-2" />
              <span>{dateRangeFormatter(session.startedAt, session.endedAt)}</span>
            </StyledDescription>
            <StyledDescription>
              <Icon component={() => <MapOIcon />} className="mr-2" />
              <span>{session.location}</span>
            </StyledDescription>
            <StyledDescription>
              <Icon component={() => <TicketOIcon />} className="mr-2" />
              <span>
                {tickets.length ? (
                  tickets.map(ticket => ticket.title).join('、')
                ) : (
                  <StyledLinkText className="cursor-pointer" onClick={() => onChangeTab && onChangeTab()}>
                    加入票券方案
                  </StyledLinkText>
                )}
              </span>
            </StyledDescription>
            <StyledDescription className="d-flex align-items-center justify-content-between">
              <div>
                <Icon component={() => <UserOIcon />} className="mr-2" />
                <span className="mr-3">
                  {session.participants} / {sum(tickets.map(ticket => ticket.count))}
                </span>
                {session.threshold && <span>最少 {session.threshold}</span>}
              </div>
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item>
                      <ActivitySessionAdminModal
                        renderTrigger={({ setVisible }) => <span onClick={() => setVisible(true)}>編輯</span>}
                        icon={() => <Icon type="file-edit" />}
                        onSubmit={onUpdate}
                        activitySession={session}
                      />
                    </Menu.Item>
                  </Menu>
                }
                trigger={['click']}
              >
                <Icon type="more" />
              </Dropdown>
            </StyledDescription>
          </StyledWrapper>
        )
      })}
    </div>
  )
}

export default ActivitySessionsAdminBlock
