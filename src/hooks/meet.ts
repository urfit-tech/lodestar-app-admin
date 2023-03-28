import gql from 'graphql-tag'

export const GET_MEMBER_MEET = gql`
  query GET_MEMBER_MEET($name: String!) {
    meet(
      where: { name: { _eq: $name }, started_at: { _lte: "NOW" }, ended_at: { _gte: "NOW" } }
      order_by: { ended_at: desc_nulls_last }
      limit: 1
    ) {
      id
      options
    }
  }
`
