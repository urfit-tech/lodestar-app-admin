import { useMemo } from 'react'
import { gql, useQuery } from '@apollo/client'
import { pipe, pathOr, map, evolve, defaultTo, fromPairs, chain, filter } from 'ramda'

import hasura from '../hasura'
import { matchesScheduleOrderProductName } from '../components/schedule/utils/orderNameFilter'

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
        const getRawProductOptions = (product: (typeof orderLog.order_products)[number]) =>
          ((product.options as any) || {}) as Record<string, any>

        const getProductOptions = (product: (typeof orderLog.order_products)[number]) =>
          (getRawProductOptions(product).options || {}) as Record<string, any>

        const getClassType = (product: (typeof orderLog.order_products)[number]) => {
          const rawOptions = getRawProductOptions(product)
          const productOptions = getProductOptions(product)
          return rawOptions.class_type || productOptions.class_type || ''
        }

        const getLanguage = (product: (typeof orderLog.order_products)[number]) => {
          const rawOptions = getRawProductOptions(product)
          const productOptions = getProductOptions(product)

          const candidates = [
            productOptions.language,
            rawOptions.language,
            productOptions.target_language,
            rawOptions.target_language,
            productOptions.language_type,
            rawOptions.language_type,
          ].filter(Boolean)

          const detailedLanguage = candidates.find(language => language !== '中文' && language !== '外文')
          return detailedLanguage || candidates[0] || ''
        }

        const materials: string[] = pipe(
          filter((product: (typeof orderLog.order_products)[number]) => getProductOptions(product)?.product === '教材'),
          map((product: (typeof orderLog.order_products)[number]) => (product.options as any)?.title || product.name),
          filter(Boolean),
        )(orderLog.order_products) as string[]

        return pipe(
          filter((product: (typeof orderLog.order_products)[number]) => {
            const options = getProductOptions(product)
            if (!options || options.product === '教材') return false
            if (getClassType(product) !== '個人班') return false

            const productName = options.title || product.name
            return matchesScheduleOrderProductName({
              productName,
              scheduleType: 'personal',
            })
          }),
          map((product: (typeof orderLog.order_products)[number]) => {
            const options = getProductOptions(product)
            const totalSessions = options?.total_sessions?.max || 0
            const totalMinutes = totalSessions * 50

            return {
              id: product.id,
              studentId: orderLog.member_id,
              productName: product.name,
              language: getLanguage(product),
              type: 'personal',
              totalMinutes,
              usedMinutes: 0, // Will be calculated from scheduled events
              availableMinutes: totalMinutes, // Will be calculated as totalMinutes - usedMinutes
              createdAt: new Date(orderLog.created_at),
              expiresAt: undefined, // 開課日 + 有效月數，預排/發布後才有值
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
