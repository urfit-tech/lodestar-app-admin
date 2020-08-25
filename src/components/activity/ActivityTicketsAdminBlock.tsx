import { FileAddOutlined, FileTextOutlined, MoreOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Dropdown, Menu, Skeleton } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { useIntl } from 'react-intl'
import { activityMessages, commonMessages } from '../../helpers/translation'
import types from '../../types'
import { ActivityAdminProps } from '../../types/activity'
import ActivityTicket from './ActivityTicket'
import ActivityTicketAdminModal from './ActivityTicketAdminModal'

const ActivityTicketsAdminBlock: React.FC<{
  activityAdmin: ActivityAdminProps | null
  onRefetch?: () => void
}> = ({ activityAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [insertActivityTicket] = useMutation<types.INSERT_ACTIVITY_TICKET, types.INSERT_ACTIVITY_TICKETVariables>(
    INSERT_ACTIVITY_TICKET,
  )
  const [updateActivityTicket] = useMutation<types.UPDATE_ACTIVITY_TICKET, types.UPDATE_ACTIVITY_TICKETVariables>(
    UPDATE_ACTIVITY_TICKET,
  )

  if (!activityAdmin) {
    return <Skeleton active />
  }

  const activitySessions = activityAdmin.sessions.map(session => ({
    id: session.id,
    title: session.title,
  }))

  return (
    <>
      <ActivityTicketAdminModal
        renderTrigger={({ setVisible }) => (
          <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)} className="mb-5">
            {formatMessage(activityMessages.ui.createTicketPlan)}
          </Button>
        )}
        icon={<FileAddOutlined />}
        activitySessions={activitySessions}
        onSubmit={values =>
          insertActivityTicket({
            variables: {
              activityId: activityAdmin.id,
              title: values.title,
              activitySessionTickets: values.sessionIds.map(sessionId => ({
                activity_session_id: sessionId,
              })),
              isPublished: values.isPublished,
              startedAt: values.startedAt,
              endedAt: values.endedAt,
              price: values.price,
              count: values.count,
              description: values.description,
            },
          })
        }
        onRefetch={onRefetch}
      />

      <div className="row">
        {activityAdmin.tickets.map(ticket => (
          <div key={ticket.id} className="col-12 col-md-6 mb-4">
            <ActivityTicket
              {...ticket}
              extra={
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item>
                        <ActivityTicketAdminModal
                          renderTrigger={({ setVisible }) => (
                            <span onClick={() => setVisible(true)}>{formatMessage(commonMessages.ui.edit)}</span>
                          )}
                          icon={<FileTextOutlined />}
                          activityTicket={ticket}
                          activitySessions={activitySessions}
                          onSubmit={values =>
                            updateActivityTicket({
                              variables: {
                                activityTicketId: ticket.id,
                                title: values.title,
                                activitySessionTickets: values.sessionIds.map(sessionId => ({
                                  activity_ticket_id: ticket.id,
                                  activity_session_id: sessionId,
                                })),
                                isPublished: values.isPublished,
                                startedAt: values.startedAt,
                                endedAt: values.endedAt,
                                price: values.price,
                                count: values.count,
                                description: values.description,
                              },
                            })
                          }
                          onRefetch={onRefetch}
                        />
                      </Menu.Item>
                    </Menu>
                  }
                  trigger={['click']}
                >
                  <MoreOutlined />
                </Dropdown>
              }
            />
          </div>
        ))}
      </div>
    </>
  )
}

const INSERT_ACTIVITY_TICKET = gql`
  mutation INSERT_ACTIVITY_TICKET(
    $activityId: uuid!
    $title: String!
    $activitySessionTickets: [activity_session_ticket_insert_input!]!
    $isPublished: Boolean!
    $startedAt: timestamptz!
    $endedAt: timestamptz!
    $price: numeric!
    $count: Int
    $description: String
  ) {
    insert_activity_ticket(
      objects: {
        activity_id: $activityId
        title: $title
        is_published: $isPublished
        started_at: $startedAt
        ended_at: $endedAt
        price: $price
        count: $count
        description: $description
        activity_session_tickets: { data: $activitySessionTickets }
      }
    ) {
      affected_rows
    }
  }
`
const UPDATE_ACTIVITY_TICKET = gql`
  mutation UPDATE_ACTIVITY_TICKET(
    $activityTicketId: uuid!
    $title: String!
    $activitySessionTickets: [activity_session_ticket_insert_input!]!
    $isPublished: Boolean!
    $startedAt: timestamptz!
    $endedAt: timestamptz!
    $price: numeric!
    $count: Int
    $description: String
  ) {
    update_activity_ticket(
      where: { id: { _eq: $activityTicketId } }
      _set: {
        title: $title
        is_published: $isPublished
        started_at: $startedAt
        ended_at: $endedAt
        price: $price
        count: $count
        description: $description
      }
    ) {
      affected_rows
    }
    delete_activity_session_ticket(where: { activity_ticket_id: { _eq: $activityTicketId } }) {
      affected_rows
    }
    insert_activity_session_ticket(objects: $activitySessionTickets) {
      affected_rows
    }
  }
`

export default ActivityTicketsAdminBlock
