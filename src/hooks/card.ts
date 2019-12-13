import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { array, date, object, string } from 'yup'
import types from '../types'

export const useEnrolledMembershipCardIds = (memberId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_ENROLLED_CARD_IDS, types.GET_ENROLLED_CARD_IDSVariables>(
    gql`
      query GET_ENROLLED_CARD_IDS($memberId: String!) {
        card_enrollment(where: { member_id: { _eq: $memberId } }) {
          card_id
        }
      }
    `,
    {
      variables: { memberId },
    },
  )

  const castData = object({
    cardEnrollment: array(
      object({
        cardId: string(),
      }).camelCase(),
    ).default([]),
  })
    .camelCase()
    .cast(data)

  return {
    loadingMembershipCardIds: loading,
    errorMembershipCardIds: error,
    enrolledMembershipCardIds: loading || error ? [] : castData.cardEnrollment.map(value => value.cardId),
    refetchMembershipCardIds: refetch,
  }
}

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

export const useEnrolledMembershipCardCollection = (memberId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_ENROLLED_CARDS, types.GET_ENROLLED_CARDSVariables>(
    gql`
      query GET_ENROLLED_CARDS($memberId: String!) {
        card_enrollment(where: { member_id: { _eq: $memberId } }) {
          card {
            id
            title
            description
            template
          }
          updated_at
        }
      }
    `,
    {
      variables: { memberId },
    },
  )

  const castData = object({
    cardEnrollment: array(
      object({
        card: object({
          id: string(),
          title: string(),
          description: string(),
          template: string(),
        }).camelCase(),
        updatedAt: date().nullable(),
      }).camelCase(),
    ).default([]),
  })
    .camelCase()
    .cast(data)

  return {
    loadingMembershipCardCollection: loading,
    errorMembershipCardCollection: error,
    enrolledMembershipCardCollection: loading || error ? [] : castData.cardEnrollment,
    refetchMembershipCardCollection: refetch,
  }
}
