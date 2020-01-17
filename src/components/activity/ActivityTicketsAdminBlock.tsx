import { Button, Dropdown, Icon, Menu } from 'antd'
import React from 'react'
import { ActivityAdminProps } from '../../contexts/ActivityContext'
import ActivityTicket from './ActivityTicket'
import ActivityTicketAdminModal from './ActivityTicketAdminModal'

const ActivityTicketsAdminBlock: React.FC<{
  activityAdmin: ActivityAdminProps
  onInsert?: (
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    data: {
      title: string
      sessionIds: string[]
      isPublished: boolean
      startedAt: Date
      endedAt: Date
      price: number
      count: number
      description: string | null
    },
  ) => void
  onUpdate?: (
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    data: {
      activityTicketId: string
      title: string
      sessionIds: string[]
      isPublished: boolean
      startedAt: Date
      endedAt: Date
      price: number
      count: number
      description: string | null
    },
  ) => void
}> = ({ activityAdmin, onInsert, onUpdate }) => {
  return (
    <>
      <ActivityTicketAdminModal
        renderTrigger={({ setVisible }) => (
          <Button type="primary" icon="file-add" onClick={() => setVisible(true)} className="mb-5">
            建立方案
          </Button>
        )}
        activitySessions={activityAdmin.activitySessions.map(session => ({
          id: session.id,
          title: session.title,
        }))}
        onSubmit={onInsert}
      />

      <div className="row">
        {activityAdmin.activityTickets.map(ticket => (
          <div key={ticket.id} className="col-12 col-md-6 mb-4">
            <ActivityTicket
              {...ticket}
              variant="admin"
              extra={
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item>
                        <ActivityTicketAdminModal
                          renderTrigger={({ setVisible }) => <span onClick={() => setVisible(true)}>編輯</span>}
                          icon={() => <Icon type="file-edit" />}
                          onSubmit={onUpdate}
                          activityTicket={ticket}
                          activitySessions={activityAdmin.activitySessions.map(session => ({
                            id: session.id,
                            title: session.title,
                          }))}
                        />
                      </Menu.Item>
                    </Menu>
                  }
                  trigger={['click']}
                >
                  <Icon type="more" />
                </Dropdown>
              }
            />
          </div>
        ))}
      </div>
    </>
  )
}

export default ActivityTicketsAdminBlock
