import { FileAddOutlined, FileTextOutlined, MoreOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Dropdown, Menu, message, Skeleton } from 'antd'
import { handleError } from 'lodestar-app-element/src/helpers'
import React from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { activityMessages, commonMessages } from '../../helpers/translation'
import { ActivityAdminProps } from '../../types/activity'
import ActivityTicket from './ActivityTicket'
import ActivityTicketAdminModal from './ActivityTicketAdminModal'

const ActivityTicketsAdminBlock: React.FC<{
  activityAdmin: ActivityAdminProps | null
  onRefetch?: () => void
}> = ({ activityAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { insertActivityTicket, updateActivityTicket, archiveActivityTicket } = useMutationActivityTicket()

  if (!activityAdmin) {
    return <Skeleton active />
  }

  return (
    <>
      <ActivityTicketAdminModal
        renderTrigger={({ setVisible }) => (
          <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)} className="mb-5">
            {formatMessage(commonMessages.ui.createPlan)}
          </Button>
        )}
        icon={<FileAddOutlined />}
        activitySessions={activityAdmin.sessions.map(v => ({
          id: v.id,
          title: v.title || '',
          location: v.location || null,
          onlineLink: v.onlineLink || null,
        }))}
        onSubmit={values =>
          insertActivityTicket({
            variables: {
              activityId: activityAdmin.id,
              title: values.title || '',
              activitySessionTickets: values.sessions.map(session => ({
                activity_session_id: session.id,
                activity_session_type: session.type,
              })),
              isPublished: values.isPublished,
              startedAt: values.startedAt,
              endedAt: values.endedAt,
              currencyId: values.currencyId,
              price: values.price,
              count: values.count,
              description: values.description || '',
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
                          activitySessions={activityAdmin.sessions.map(v => ({
                            id: v.id,
                            title: v.title || '',
                            location: v.location || null,
                            onlineLink: v.onlineLink || null,
                          }))}
                          onSubmit={values =>
                            updateActivityTicket({
                              variables: {
                                activityTicketId: ticket.id,
                                title: values.title || '',
                                activitySessionTickets: values.sessions.map(session => ({
                                  activity_ticket_id: ticket.id,
                                  activity_session_id: session.id,
                                  activity_session_type: session.type,
                                })),
                                isPublished: values.isPublished,
                                startedAt: values.startedAt,
                                endedAt: values.endedAt,
                                currencyId: values.currencyId,
                                price: values.price,
                                count: values.count,
                                description: values.description || '',
                              },
                            })
                          }
                          onRefetch={onRefetch}
                        />
                      </Menu.Item>
                      <Menu.Item
                        onClick={() => {
                          window.confirm(formatMessage(activityMessages.text.deleteActivityTicketWarning)) &&
                            archiveActivityTicket({ variables: { activityTicketId: ticket.id } })
                              .then(() => {
                                message.success(formatMessage(commonMessages.event.successfullyDeleted))
                                onRefetch?.()
                              })
                              .catch(handleError)
                        }}
                      >
                        {formatMessage(commonMessages.ui.delete)}
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

const useMutationActivityTicket = () => {
  const [insertActivityTicket] = useMutation<hasura.INSERT_ACTIVITY_TICKET, hasura.INSERT_ACTIVITY_TICKETVariables>(
    gql`
      mutation INSERT_ACTIVITY_TICKET(
        $activityId: uuid!
        $title: String!
        $activitySessionTickets: [activity_session_ticket_insert_input!]!
        $isPublished: Boolean!
        $startedAt: timestamptz!
        $endedAt: timestamptz!
        $currencyId: String!
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
            currency_id: $currencyId
            price: $price
            count: $count
            description: $description
            activity_session_tickets: { data: $activitySessionTickets }
          }
        ) {
          affected_rows
        }
      }
    `,
  )
  const [updateActivityTicket] = useMutation<hasura.UPDATE_ACTIVITY_TICKET, hasura.UPDATE_ACTIVITY_TICKETVariables>(
    gql`
      mutation UPDATE_ACTIVITY_TICKET(
        $activityTicketId: uuid!
        $title: String!
        $activitySessionTickets: [activity_session_ticket_insert_input!]!
        $isPublished: Boolean!
        $startedAt: timestamptz!
        $currencyId: String!
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
            currency_id: $currencyId
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
    `,
  )

  const [archiveActivityTicket] = useMutation<
    hasura.ARCHIVE_ACTIVITY_TICKET,
    hasura.ARCHIVE_ACTIVITY_TICKETVariables
  >(gql`
    mutation ARCHIVE_ACTIVITY_TICKET($activityTicketId: uuid!) {
      delete_activity_session_ticket(where: { activity_ticket_id: { _eq: $activityTicketId } }) {
        affected_rows
      }
      update_activity_ticket(where: { id: { _eq: $activityTicketId } }, _set: { deleted_at: "now()" }) {
        affected_rows
      }
    }
  `)
  return {
    insertActivityTicket,
    updateActivityTicket,
    archiveActivityTicket,
  }
}

export default ActivityTicketsAdminBlock
