import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { object, string } from 'yup'
import types from '../types'

export const useMembershipCard = (cardId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_ENROLLED_CARD, types.GET_ENROLLED_CARDVariables>(
    gql`
      query GET_ENROLLED_CARD($cardId: uuid!) {
        card_by_pk(id: $cardId) {
          id
          title
          description
          template
          app_id
        }
      }
    `,
    { variables: { cardId } },
  )

  const castData = object({
    card_by_pk: object({
      id: string(),
      title: string(),
      description: string(),
      template: string(),
    }).camelCase(),
  }).cast(data).card_by_pk

  return {
    loadingMembershipCard: loading,
    errorMembershipCard: error,
    membershipCard: castData,
    refetchMembershipCard: refetch,
  }
}
