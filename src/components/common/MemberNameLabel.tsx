import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React from 'react'
import hasura from '../../hasura'

const MemberNameLabel: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { data } = useQuery<hasura.GET_MEMBER_NAME, hasura.GET_MEMBER_NAMEVariables>(
    gql`
      query GET_MEMBER_NAME($memberId: String!) {
        member_by_pk(id: $memberId) {
          id
          name
        }
      }
    `,
    { variables: { memberId } },
  )

  return <span>{data?.member_by_pk?.name}</span>
}

export default MemberNameLabel
