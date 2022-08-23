import { useMutation, useQuery } from '@apollo/react-hooks'
import hasura from '../hasura'
import gql from 'graphql-tag'

export const useGetAttend = (memberId: string) => {
  const { loading, data, error, refetch } = useQuery<hasura.GET_ATTEND, hasura.GET_ATTENDVariables>(
    gql`
      query GET_ATTEND($memberId: String!) {
        attend(where: { _and: [{ member_id: { _eq: $memberId } }, { ended_at: { _is_null: true } }] }) {
          id
          ended_at
        }
      }
    `,
    { variables: { memberId }, fetchPolicy: 'no-cache' },
  )
  const attend: { id: string; ended_at: Date }[] =
    data?.attend.map(v => ({
      id: v.id,
      ended_at: new Date(v.ended_at),
    })) || []

  return {
    loadingAttend: loading,
    errorAttend: error,
    attend,
    refetchAttend: refetch,
  }
}

export const useAttend = () => {
  const [insertAttend] = useMutation<hasura.INSERT_ATTEND, hasura.INSERT_ATTENDVariables>(gql`
    mutation INSERT_ATTEND($memberId: String!) {
      insert_attend_one(object: { member_id: $memberId }) {
        id
      }
    }
  `)

  const [updateAttend] = useMutation<hasura.UPDATE_ATTEND, hasura.UPDATE_ATTENDVariables>(
    gql`
      mutation UPDATE_ATTEND($memberId: String!, $endedAt: timestamptz) {
        update_attend(
          where: { _and: [{ member_id: { _eq: $memberId } }, { ended_at: { _is_null: true } }] }
          _set: { ended_at: $endedAt }
        ) {
          affected_rows
        }
      }
    `,
  )

  return {
    insertAttend,
    updateAttend,
  }
}
