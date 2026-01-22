import { useMemo } from 'react'
import { gql, useQuery } from '@apollo/client'
import { pipe, pathOr, map, evolve, defaultTo, fromPairs, chain, filter } from 'ramda'

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

export const useMemberForSchedule = (
  memberId: string | undefined,
) => {
  const { data, loading, error, refetch } = useQuery<hasura.GetMemberForSchedule, hasura.GetMemberForScheduleVariables>(
    gql`
      query GetMemberForSchedule($memberId: String!) {
        member_by_pk(id: $memberId) {
          id
          name
          email
          member_properties(where: { property: { name: { _in: ["內部備註", "希望安排的老師", "不希望安排的老師"] } } }) {
            id
            value
            property {
              id
              name
            }
          }
        }
        order_log(
          where: {
            member_id: { _eq: $memberId }
            status: { _eq: "SUCCESS" }
          },
          order_by: { created_at: desc }
        ) {
          id
          status
          member_id
          created_at
          updated_at
          order_products{
            id
            name
            price
            options
            started_at
            ended_at
          }
        }
      }
    `,
    {
      variables: {
        memberId: memberId || '',
      },
      skip: !memberId,
    },
  )

  const member = useMemo(() => {
    if (!data || !data.member_by_pk) {
      return null
    }
    
    const {
      member_properties: memberProperties,
      ...rest
    } = data.member_by_pk

    const memberPropertiesMap = pipe(
      map(
        (prop: (typeof memberProperties)[number]): [string, string] => [
          prop.property?.name ?? '',
          prop.value,
        ]
      ),
      fromPairs,
    )(memberProperties)

    return {
      ...rest,
      member_properties: memberPropertiesMap,
    }
  }, [data])

  const orders = useMemo(() => {
    if (!data?.order_log) return []

    return pipe(
      chain((orderLog: (typeof data.order_log)[number]) => {
        const materials: string[] = pipe(
          filter((p: (typeof orderLog.order_products)[number]) => p.options?.options?.product === '教材'),
          map((p: (typeof orderLog.order_products)[number]) => p.options?.title || p.name),
          filter(Boolean),
        )(orderLog.order_products) as string[]

        return pipe(
          filter((product: (typeof orderLog.order_products)[number]) => {
            const options = product.options?.options
            return options && options.product !== '教材'
          }),
          map((product: (typeof orderLog.order_products)[number]) => {
            const options = product.options?.options
            const totalSessions = options?.total_sessions?.max || 0
            const totalMinutes = totalSessions * 50

            return {
              id: product.id,
              studentId: orderLog.member_id,
              productName: product.name,
              language: options?.language || '',
              type: options?.class_type || '',
              totalMinutes,
              usedMinutes: 0, // Will be calculated from scheduled events
              availableMinutes: totalMinutes, // Will be calculated as totalMinutes - usedMinutes
              createdAt: new Date(orderLog.created_at),
              expiresAt: undefined, // 開課日 + 有效天數，預排/發布後才有值
              status: orderLog.status,
              materials,
            }
          }),
        )(orderLog.order_products)
      }),
    )(data.order_log)
  }, [data])

  return { member, orders, loading, error, refetch }
}