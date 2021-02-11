import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React from 'react'
import types from '../../types'

const MemberNameLabel: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { data } = useQuery<types.GET_MEMBER_NAME, types.GET_MEMBER_NAMEVariables>(
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
