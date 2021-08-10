import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import moment from 'moment'
import { sum } from 'ramda'
import hasura from '../hasura'
import { useMutateMemberNote } from './member'
import { CurrentLeadProps, SalesProps, SalesCallMemberProps } from '../types/sales'

export const useSales = (salesId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_SALES, hasura.GET_SALESVariables>(
    gql`
      query GET_SALES($salesId: String!, $startOfToday: timestamptz!, $startOfMonth: timestamptz!) {
        member_by_pk(id: $salesId) {
          id
          picture_url
          name
          username
          email
          metadata
          member_properties(where: { property: { name: { _eq: "分機號碼" } } }) {
            id
            value
          }
          attends(where: { ended_at: { _is_null: false } }, order_by: [{ started_at: desc }], limit: 1) {
            id
            started_at
            ended_at
          }
        }
        order_executor_sharing(where: { executor_id: { _eq: $salesId }, created_at: { _gte: $startOfMonth } }) {
          order_executor_id
          total_price
          ratio
        }
        member_note_aggregate(
          where: {
            author_id: { _eq: $salesId }
            type: { _eq: "outbound" }
            status: { _eq: "answered" }
            duration: { _gt: 0 }
            created_at: { _gte: $startOfToday }
          }
        ) {
          aggregate {
            count
            sum {
              duration
            }
          }
        }
      }
    `,
    {
      variables: {
        salesId,
        startOfToday: moment().startOf('day').toDate(),
        startOfMonth: moment().startOf('month').toDate(),
      },
    },
  )

  const sales: SalesProps | null = data?.member_by_pk
    ? {
        id: data.member_by_pk.id,
        pictureUrl: data.member_by_pk.picture_url,
        name: data.member_by_pk.name,
        email: data.member_by_pk.email,
        telephone: data.member_by_pk.member_properties[0]?.value || '',
        metadata: data.member_by_pk.metadata,
        baseOdds: parseFloat(data.member_by_pk.metadata?.assignment?.odds || '0'),
        lastAttend: data.member_by_pk.attends[0]
          ? {
              startedAt: new Date(data.member_by_pk.attends[0].started_at),
              endedAt: new Date(data.member_by_pk.attends[0].ended_at),
            }
          : null,
        sharingOfMonth: sum(
          data.order_executor_sharing.map(sharing => Math.floor(sharing.total_price * sharing.ratio)),
        ),
        sharingOrdersOfMonth: data.order_executor_sharing.length,
        totalDuration: data.member_note_aggregate.aggregate?.sum?.duration || 0,
        totalNotes: data.member_note_aggregate.aggregate?.count || 0,
      }
    : null

  return {
    loadingSales: loading,
    errorSales: error,
    sales,
    refetchSales: refetch,
  }
}

export const useSalesOddsAddition = (
  salesId: string,
  lastAttend: {
    startedAt: Date
    endedAt: Date
  } | null,
) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_SALES_ODDS_ADDITION,
    hasura.GET_SALES_ODDS_ADDITIONVariables
  >(
    gql`
      query GET_SALES_ODDS_ADDITION(
        $salesId: String!
        $startedAt: timestamptz!
        $endedAt: timestamptz!
        $startOfLastWeek: timestamptz!
      ) {
        member_note_aggregate(where: { author_id: { _eq: $salesId }, created_at: { _gt: $startedAt, _lt: $endedAt } }) {
          aggregate {
            count
          }
        }
        member_contract_aggregate(
          where: { author_id: { _eq: $salesId }, agreed_at: { _gt: $startOfLastWeek }, revoked_at: { _is_null: true } }
        ) {
          aggregate {
            count
          }
        }
      }
    `,
    {
      variables: {
        salesId,
        startedAt: lastAttend?.startedAt || moment().subtract(12, 'hours').startOf('hour'),
        endedAt: lastAttend?.endedAt || moment().startOf('hour'),
        startOfLastWeek: moment().subtract(7, 'days').startOf('day').toDate(),
      },
    },
  )

  const oddsAdditions = data
    ? ((data.member_note_aggregate.aggregate?.count || 0) > 40 ? 5 : 0) + // lastAttendMemberNotesCount
      (data.member_contract_aggregate.aggregate?.count || 0) * 5 // lastWeekAgreedContractsCount
    : null

  return {
    loadingOddsAddition: loading,
    errorOddsAddition: error,
    oddsAdditions,
    refetchOddsAddition: refetch,
  }
}

export const memberPropertyFields: {
  name: string
  required?: boolean
}[] = [
  { name: '性別', required: true },
  { name: '縣市' },
  { name: '有意願領域', required: true },
  { name: '學生程度', required: true },
  { name: '學習動機', required: true },
  { name: '每月學習預算', required: true },
  { name: '有沒有上過其他課程', required: true },
  { name: '是否有轉職意願', required: true },
  { name: '是否為相關職務', required: true },
  { name: '身分', required: true },
  { name: '職業', required: true },
]

export const useLeadProperties = () => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_LEAD_PROPERTIES, hasura.GET_LEAD_PROPERTIESVariables>(
    gql`
      query GET_LEAD_PROPERTIES($selectedProperties: [String!]!) {
        property(where: { name: { _in: $selectedProperties } }) {
          id
          name
          placeholder
        }
      }
    `,
    {
      variables: {
        selectedProperties: memberPropertyFields.map(field => field.name),
      },
    },
  )

  const properties =
    data?.property.map(property => ({
      id: property.id,
      name: property.name,
      options: property.placeholder?.replace(/^\(|\)$/g, '').split('/') || null,
    })) || []

  return {
    loadingProperties: loading,
    errorProperties: error,
    properties,
    refetchProperties: refetch,
  }
}

export const useCurrentLead = (sales: SalesProps) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_FIRST_ASSIGNED_MEMBER,
    hasura.GET_FIRST_ASSIGNED_MEMBERVariables
  >(
    gql`
      query GET_FIRST_ASSIGNED_MEMBER($salesId: String!) {
        member(
          where: {
            manager_id: { _eq: $salesId }
            assigned_at: { _is_null: false }
            _and: [
              { _not: { member_notes: { author_id: { _eq: $salesId } } } }
              { _not: { member_contracts: { author_id: { _eq: $salesId } } } }
            ]
          }
          order_by: [{ assigned_at: desc }]
          limit: 1
        ) {
          id
          email
          name
          username
          created_at
          member_phones {
            id
            phone
          }
          member_categories {
            id
            category {
              id
              name
            }
          }
          member_properties {
            id
            property {
              id
              name
            }
            value
          }
        }
      }
    `,
    {
      variables: {
        salesId: sales.id,
      },
      fetchPolicy: 'no-cache',
    },
  )

  const currentLead: CurrentLeadProps | null = data?.member[0]
    ? {
        id: data.member[0].id,
        email: data.member[0].email,
        name: data.member[0].name || data.member[0].username,
        createdAt: new Date(data.member[0].created_at),
        phones: data.member[0].member_phones.map(v => v.phone),
        categories: data.member[0].member_categories.map(v => ({
          id: v.category.id,
          name: v.category.name,
        })),
        properties: data.member[0].member_properties.map(v => ({
          id: v.property.id,
          name: v.property.name,
          value: v.value,
        })),
      }
    : null
  const withDurationInput = !sales?.telephone?.startsWith('8')

  const [markUnresponsiveMember] = useMutation<
    hasura.MARK_UNRESPONSIVE_MEMBER,
    hasura.MARK_UNRESPONSIVE_MEMBERVariables
  >(MARK_UNRESPONSIVE_MEMBER)
  const [updateMemberPhones] = useMutation<hasura.UPDATE_MEMBER_PHONE, hasura.UPDATE_MEMBER_PHONEVariables>(
    UPDATE_MEMBER_PHONE,
  )
  const { insertMemberNote } = useMutateMemberNote()
  const [updateMemberProperties] = useMutation<
    hasura.UPDATE_MEMBER_PROPERTIES,
    hasura.UPDATE_MEMBER_PROPERTIESVariables
  >(UPDATE_MEMBER_PROPERTIES)

  return {
    loadingCurrentLead: loading,
    errorCurrentLead: error,
    currentLead,
    refetchCurrentLead: refetch,
    markUnresponsive: async () => currentLead && markUnresponsiveMember({ variables: { memberId: currentLead.id } }),
    insertNote: async (memberNote: {
      status: 'not-answered' | 'rejected' | 'willing'
      duration: number
      description: string
    }) =>
      currentLead &&
      insertMemberNote({
        variables: {
          memberId: currentLead.id,
          authorId: sales.id,
          type: withDurationInput ? 'outbound' : null,
          status: memberNote.status === 'not-answered' ? 'missed' : 'answered',
          duration: memberNote.duration,
          description: memberNote.description,
          rejectedAt: memberNote.status === 'rejected' ? new Date() : undefined,
        },
      }),
    updatePhones: async (memberPhones: Array<{ phone: string; isPrimary: boolean; isValid?: boolean }>) =>
      currentLead &&
      updateMemberPhones({
        variables: {
          data: memberPhones.map(memberPhone => ({
            member_id: currentLead.id,
            phone: memberPhone.phone,
            is_primary: memberPhone.isPrimary,
            is_valid: memberPhone.isValid,
          })),
        },
      }),
    updateProperties: async (memberProperties: Array<{ propertyId: string; value: string }>) =>
      currentLead &&
      updateMemberProperties({
        variables: {
          data: memberProperties.map(memberProperty => ({
            member_id: currentLead.id,
            property_id: memberProperty.propertyId,
            value: memberProperty.value,
          })),
        },
      }),
  }
}

const UPDATE_MEMBER_PHONE = gql`
  mutation UPDATE_MEMBER_PHONE($data: [member_phone_insert_input!]!) {
    insert_member_phone(
      objects: $data
      on_conflict: { constraint: member_phone_member_id_phone_key, update_columns: [is_primary, is_valid] }
    ) {
      affected_rows
    }
  }
`
const MARK_UNRESPONSIVE_MEMBER = gql`
  mutation MARK_UNRESPONSIVE_MEMBER($memberId: String!) {
    update_member(where: { id: { _eq: $memberId } }, _set: { manager_id: null }) {
      affected_rows
    }
    update_member_phone(where: { member_id: { _eq: $memberId } }, _set: { is_valid: false }) {
      affected_rows
    }
  }
`

const UPDATE_MEMBER_PROPERTIES = gql`
  mutation UPDATE_MEMBER_PROPERTIES($data: [member_property_insert_input!]!) {
    insert_member_property(
      objects: $data
      on_conflict: { constraint: member_property_member_id_property_id_key, update_columns: [value] }
    ) {
      returning {
        id
      }
    }
  }
`

export const useSalesCallMember = (salesId: string, status: 'contacted' | 'transacted') => {
  const condition: hasura.GET_SALES_CALL_MEMBERVariables['condition'] =
    status === 'contacted'
      ? {
          manager_id: { _eq: salesId },
          member_notes: {
            author_id: { _eq: salesId },
            type: { _eq: 'outbound' },
            status: { _eq: 'answered' },
          },
          _not: {
            _or: [
              { member_notes: { rejected_at: { _is_null: false }, author_id: { _eq: salesId } } },
              { member_contracts: { _or: [{ agreed_at: { _is_null: false } }, { revoked_at: { _is_null: false } }] } },
            ],
          },
        }
      : {
          manager_id: { _eq: salesId },
          member_contracts: {
            agreed_at: { _is_null: false },
            revoked_at: { _is_null: true },
          },
        }

  const orderBy: hasura.GET_SALES_CALL_MEMBERVariables['orderBy'] =
    status === 'contacted'
      ? [
          {
            member_notes_aggregate: {
              max: {
                created_at: 'desc' as hasura.order_by,
              },
            },
          },
        ]
      : [
          {
            member_contracts_aggregate: {
              max: {
                agreed_at: 'desc' as hasura.order_by,
              },
            },
          },
        ]

  const { loading, data, error, refetch } = useQuery<
    hasura.GET_SALES_CALL_MEMBER,
    hasura.GET_SALES_CALL_MEMBERVariables
  >(
    gql`
      query GET_SALES_CALL_MEMBER(
        $condition: member_bool_exp!
        $orderBy: [member_order_by!]
        $hasContacted: Boolean!
        $hasTransacted: Boolean!
        $now: timestamptz
      ) {
        member_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
        member(where: $condition, order_by: $orderBy) {
          id
          name
          email
          member_phones {
            id
            phone
          }
          member_notes(
            where: { type: { _eq: "outbound" }, status: { _eq: "answered" }, rejected_at: { _is_null: true } }
            order_by: [{ created_at: desc }]
            limit: 1
          ) @include(if: $hasContacted) {
            id
            created_at
          }
          member_categories @include(if: $hasContacted) {
            id
            category {
              id
              name
            }
          }
          member_contracts(where: { agreed_at: { _is_null: false }, revoked_at: { _is_null: true } })
            @include(if: $hasTransacted) {
            id
            values
            ended_at
            agreed_at
          }
          member_tasks(where: { due_at: { _gt: $now } }, order_by: [{ created_at: desc }], limit: 1)
            @include(if: $hasContacted) {
            id
            due_at
            category {
              id
              name
            }
          }
        }
      }
    `,
    {
      variables: {
        condition,
        orderBy,
        hasContacted: status === 'contacted',
        hasTransacted: status === 'transacted',
        now: moment().startOf('minute').toDate(),
      },
      context: {
        important: true,
      },
    },
  )

  const members: SalesCallMemberProps[] =
    data?.member.map(v => ({
      id: v.id,
      name: v.name,
      email: v.email,
      phones: v.member_phones.map(w => w.phone),
      lastContactAt: v.member_notes?.[0] ? new Date(v.member_notes[0]?.created_at) : null,
      lastTask: v.member_tasks?.[0]
        ? {
            dueAt: v.member_tasks[0].due_at && new Date(v.member_tasks[0].due_at),
            categoryName: v.member_tasks[0].category?.name || null,
          }
        : null,
      categoryNames: v.member_categories?.map(w => w.category.name) || [],
      contracts:
        v.member_contracts?.map(w => ({
          projectPlanName: w.values.projectPlanName,
          endedAt: new Date(w.ended_at),
        })) || [],
    })) || []

  return {
    loadingMembers: loading,
    members,
    totalMembers: data?.member_aggregate.aggregate?.count || 0,
    errorMembers: error,
    refetchMembers: refetch,
  }
}
