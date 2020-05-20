import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { object } from 'yup'
import { activitySchema, activityTicketSchema } from '../schemas/activity'
import types from '../types'

export const useActivityTicket = (ticketId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_TICKET, types.GET_TICKETVariables>(
    gql`
      query GET_TICKET($ticketId: uuid!) {
        activity_ticket_by_pk(id: $ticketId) {
          id
          title
          description
          is_published
          started_at
          ended_at
          count
          price

          activity_session_tickets(order_by: { activity_session: { started_at: asc } }) {
            activity_session {
              id
              title
              description
              location
              started_at
              ended_at
              threshold
            }
          }

          activity {
            id
            title
            is_participants_visible
            cover_url
            published_at
            activity_categories {
              category {
                id
                name
              }
              position
            }
          }
        }
      }
    `,
    {
      variables: { ticketId },
    },
  )

  const castData = object({
    activity_ticket_by_pk: activityTicketSchema
      .concat(
        object({
          activity: activitySchema,
        }).camelCase(),
      )
      .nullable()
      .camelCase(),
  }).cast(data)

  return {
    loadingTicket: loading,
    errorTicket: error,
    refetchTicket: refetch,
    ticket: castData.activity_ticket_by_pk,
  }
}
