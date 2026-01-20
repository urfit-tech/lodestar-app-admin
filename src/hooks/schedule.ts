import { useMemo } from 'react'
import { gql, useQuery } from '@apollo/client'
import { pipe, pathOr, map, evolve, defaultTo } from 'ramda'

import hasura from '../hasura'

export type MemberForSchedule = {
  id: string
  name: string
  email: string
}

export const useMembersForSchedule = (searchTerm?: string) => {
  const { data, loading, error, refetch } = useQuery<hasura.GetMembersForSchedule, hasura.GetMembersForScheduleVariables>(
    gql`
      query GetMembersForSchedule($searchTerm: String) {
        member(
          where: { _or: [{ name: { _ilike: $searchTerm } }, { email: { _ilike: $searchTerm } }] }
          order_by: { name: asc }
          limit: 100
        ) {
          id
          name
          email
        
        }
      }
    `,
    {
      variables: {
        searchTerm: searchTerm ? `%${searchTerm}%` : '',
      },
      skip: !searchTerm,
    },
  )

  const members = useMemo(
    () =>
      pipe(
        pathOr<MemberForSchedule[]>([], ['member']),
        map(
          evolve({
            name: defaultTo(''),
          })
        )
      )(data) as MemberForSchedule[],
    [data]
  )

  return { members, loading, error, refetch }
}