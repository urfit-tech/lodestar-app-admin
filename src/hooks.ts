import { useApolloClient, useMutation, useQuery } from '@apollo/react-hooks'
import { SortOrder } from 'antd/lib/table/interface'
import { Chance } from 'chance'
import gql from 'graphql-tag'
import { product } from 'ramda'
import { useEffect, useMemo } from 'react'
import { memberPropertyFields } from './helpers'
import * as types from './types.d'
import { DateRangeType, MemberContractProps, StatusType } from './types/memberContract'

export const GET_MEMBER_PRIVATE_TEACH_CONTRACT = gql`
  fragment private_teach_contract_aggregate on query_root {
    private_teach_pending_contract: xuemi_member_private_teach_contract_aggregate(
      where: { _and: [{ status: { _eq: "pending" } }, $dateRangeCondition] }
    ) {
      aggregate {
        sum {
          price
        }
      }
    }
    private_teach_loan_canceled_contract: xuemi_member_private_teach_contract_aggregate(
      where: { _and: [{ status: { _eq: "loan-canceled" } }, $dateRangeCondition] }
    ) {
      aggregate {
        sum {
          price
        }
      }
    }
    private_teach_approved_contract: xuemi_member_private_teach_contract_aggregate(
      where: { _and: [{ status: { _eq: "approved" } }, $dateRangeCondition] }
    ) {
      aggregate {
        sum {
          price
        }
      }
    }
    private_teach_refund_applied_contract: xuemi_member_private_teach_contract_aggregate(
      where: { _and: [{ status: { _eq: "refund-applied" } }, $dateRangeCondition] }
    ) {
      aggregate {
        sum {
          price
        }
      }
    }
    private_teach_revoked_contract: xuemi_member_private_teach_contract_aggregate(
      where: { _and: [{ status: { _eq: "revoked" } }, $dateRangeCondition] }
    ) {
      aggregate {
        sum {
          price
        }
      }
    }
  }
  query GET_MEMBER_PRIVATE_TEACH_CONTRACT(
    $withAmount: Boolean!
    $condition: xuemi_member_private_teach_contract_bool_exp
    $dateRangeCondition: xuemi_member_private_teach_contract_bool_exp
    $limit: Int
    $orderBy: [xuemi_member_private_teach_contract_order_by!]
  ) {
    xuemi_member_private_teach_contract(where: $condition, limit: $limit, order_by: $orderBy) {
      id
      author_name
      member_id
      member_name
      member_picture_url
      member_email
      referral_name
      referral_email
      appointment_creator_name
      started_at
      ended_at
      agreed_at
      revoked_at
      approved_at
      loan_canceled_at
      refund_applied_at
      student_certification
      note
      values
      member {
        id
        created_at
        manager {
          id
          name
          username
        }
      }
      status
      last_marketing_activity
      last_ad_package
      last_ad_material
      first_fill_in_date
      last_fill_in_date
    }
    xuemi_member_private_teach_contract_aggregate(where: $condition) {
      aggregate {
        count
      }
    }
    ...private_teach_contract_aggregate @include(if: $withAmount)
  }
`
export const useMemberContractCollection = ({
  isRevoked,
  memberNameAndEmail,
  authorName,
  authorId,
  status,
  dateRangeType,
  startedAt,
  endedAt,
  sortOrder,
}: {
  isRevoked: boolean
  memberNameAndEmail: string | null
  status: StatusType[]
  dateRangeType: DateRangeType
  authorName: string | null
  authorId?: string | null
  startedAt: Date | null
  endedAt: Date | null
  sortOrder: {
    agreedAt: SortOrder
    revokedAt: SortOrder
    startedAt: SortOrder
  }
}) => {
  const dateRangeCondition: types.GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables['dateRangeCondition'] = {
    [dateRangeType]: {
      _gt: startedAt,
      _lte: endedAt,
    },
  }

  const condition: types.GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables['condition'] = {
    agreed_at: { _is_null: false },
    revoked_at: { _is_null: !isRevoked },
    ...dateRangeCondition,
    author_name: { _ilike: authorName && `%${authorName}%` },
    author_id: authorId ? { _eq: authorId } : undefined,
    status: { _in: status.length ? status : undefined },
    _or: [
      { member_name: { _ilike: memberNameAndEmail && `%${memberNameAndEmail}%` } },
      { member_email: { _ilike: memberNameAndEmail && `%${memberNameAndEmail}%` } },
    ],
  }

  const orderBy: types.GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables['orderBy'] = [
    { agreed_at: sortOrder.agreedAt && (sortOrder.agreedAt === 'descend' ? types.order_by.desc : types.order_by.asc) },
    {
      revoked_at: sortOrder.revokedAt && (sortOrder.revokedAt === 'descend' ? types.order_by.desc : types.order_by.asc),
    },
    {
      started_at: sortOrder.startedAt && (sortOrder.startedAt === 'descend' ? types.order_by.desc : types.order_by.asc),
    },
  ]

  const { loading, data, error, refetch, fetchMore } = useQuery<
    types.GET_MEMBER_PRIVATE_TEACH_CONTRACT,
    types.GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables
  >(GET_MEMBER_PRIVATE_TEACH_CONTRACT, {
    variables: {
      condition,
      dateRangeCondition,
      withAmount: true,
      orderBy,
      limit: 10,
    },
  })

  const memberContracts: MemberContractProps[] =
    data?.xuemi_member_private_teach_contract.map(v => ({
      id: v.id,
      authorName: v.author_name,
      member: {
        id: v.member_id,
        name: v.member_name,
        pictureUrl: v.member_picture_url,
        email: v.member_email,
        createdAt: v.member?.created_at && new Date(v.member.created_at),
      },
      startedAt: new Date(v.started_at),
      endedAt: new Date(v.ended_at),
      agreedAt: v.agreed_at ? new Date(v.agreed_at) : null,
      revokedAt: v.revoked_at ? new Date(v.revoked_at) : null,
      approvedAt: v.approved_at ? new Date(v.approved_at) : null,
      loanCanceledAt: v.loan_canceled_at ? new Date(v.loan_canceled_at) : null,
      refundAppliedAt: v.refund_applied_at ? new Date(v.refund_applied_at) : null,
      referral: {
        name: v.referral_name,
        email: v.referral_email,
      },
      appointmentCreatorName: v.appointment_creator_name,
      studentCertification: v.student_certification || null,
      invoice: v.values?.invoice || null,
      projectPlanName: v.values?.projectPlanName || null,
      price: v.values?.price || null,
      coinAmount: v.values?.coinAmount || null,
      paymentOptions: {
        paymentMethod: v.values.paymentOptions?.paymentMethod || '',
        paymentNumber: v.values.paymentOptions?.paymentNumber || '',
        installmentPlan: v.values.paymentOptions?.installmentPlan || 0,
      },
      note: v.note,
      orderExecutors:
        v.values?.orderExecutors?.map((v: any) => ({
          ratio: v.ratio,
          memberId: v.member_id || v.memberId,
        })) || [],
      couponCount: v.values?.coupons.length || null,
      manager: v.member?.manager
        ? {
            id: v.member.manager.id,
            name: v.member.manager.name || v.member.manager.username,
          }
        : null,
      status: v.status as StatusType | null,
      lastActivity: v.last_marketing_activity,
      lastAdPackage: v.last_ad_package,
      lastAdMaterial: v.last_ad_material,
      firstFilledAt: v.first_fill_in_date,
      lastFilledAt: v.last_fill_in_date,
    })) || []

  const loadMoreMemberContracts =
    (data?.xuemi_member_private_teach_contract_aggregate.aggregate?.count || 0) >= 10
      ? () =>
          fetchMore({
            variables: {
              orderBy,
              condition: {
                ...condition,
                agreed_at: sortOrder.agreedAt
                  ? {
                      [sortOrder.agreedAt === 'descend'
                        ? '_lte'
                        : '_gt']: data?.xuemi_member_private_teach_contract.slice(-1)[0]?.agreed_at,
                      [sortOrder.agreedAt === 'descend' ? '_gt' : '_lte']:
                        sortOrder.agreedAt === 'descend' ? startedAt : endedAt,
                    }
                  : { _is_null: false },
                revoked_at: sortOrder.revokedAt
                  ? {
                      [sortOrder.revokedAt === 'descend'
                        ? '_lte'
                        : '_gt']: data?.xuemi_member_private_teach_contract.slice(-1)[0]?.revoked_at,
                      [sortOrder.agreedAt === 'descend' ? '_gt' : '_lte']:
                        sortOrder.agreedAt === 'descend' ? startedAt : endedAt,
                    }
                  : { _is_null: !isRevoked },
                started_at: sortOrder.startedAt
                  ? {
                      [sortOrder.startedAt === 'descend'
                        ? '_lte'
                        : '_gt']: data?.xuemi_member_private_teach_contract.slice(-1)[0]?.started_at,
                      [sortOrder.agreedAt === 'descend' ? '_gt' : '_lte']:
                        sortOrder.agreedAt === 'descend' ? startedAt : endedAt,
                    }
                  : undefined,
              },
              limit: 10,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              return Object.assign({}, prev, {
                xuemi_member_private_teach_contract_aggregate:
                  fetchMoreResult.xuemi_member_private_teach_contract_aggregate,
                xuemi_member_private_teach_contract: [
                  ...prev.xuemi_member_private_teach_contract,
                  ...fetchMoreResult.xuemi_member_private_teach_contract,
                ],
              })
            },
          })
      : undefined

  const memberContractPriceAmount: Record<StatusType, number> = {
    pending: data?.private_teach_pending_contract.aggregate?.sum?.price || 0,
    approved: data?.private_teach_approved_contract.aggregate?.sum?.price || 0,
    'refund-applied': data?.private_teach_refund_applied_contract.aggregate?.sum?.price || 0,
    revoked: data?.private_teach_revoked_contract.aggregate?.sum?.price || 0,
    'loan-canceled': data?.private_teach_loan_canceled_contract.aggregate?.sum?.price || 0,
  }

  return {
    loadingMemberContracts: loading,
    errorMemberContracts: error,
    memberContracts,
    memberContractPriceAmount,
    refetchMemberContracts: refetch,
    loadMoreMemberContracts,
  }
}

export const useMutateMemberContract = () => {
  const [updateMemberContract] = useMutation(gql`
    mutation UPDATE_MEMBER_CONTRACT($memberContractId: uuid!, $options: jsonb!, $values: jsonb!) {
      update_member_contract_by_pk(
        pk_columns: { id: $memberContractId }
        _append: { options: $options, values: $values }
      ) {
        id
      }
    }
  `)
  return updateMemberContract
}

export const useXuemiSales = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_SALE_COLLECTION>(
    gql`
      query GET_SALE_COLLECTION {
        xuemi_sales {
          member {
            id
            name
            username
          }
        }
      }
    `,
  )

  const xuemiSales =
    data?.xuemi_sales
      ?.map(v => ({
        id: v.member?.id || '',
        name: v.member?.name || v.member?.username || '',
      }))
      .filter(v => v.id && v.name) || []

  return {
    loading,
    error,
    xuemiSales,
    refetch,
  }
}

export type SalesCallMemberProps = {
  id: string
  name: string
  email: string
  phones: string[]
  categoryNames: string[]
  lastContactAt: Date | null
  lastTaskCategoryName: string | null
  contracts: {
    projectPlanName: string
    endedAt: Date
  }[]
}

export const useSalesCallMember = ({ salesId, status }: { salesId: string; status: 'contacted' | 'transacted' }) => {
  const [hasContacted, hasTransacted] = [status === 'contacted', status === 'transacted']
  const condition: types.GET_SALES_CALL_MEMBERVariables['condition'] = hasContacted
    ? {
        manager_id: { _eq: salesId },
        member_notes: {
          author_id: { _eq: salesId },
          type: { _eq: 'outbound' },
          status: { _eq: 'answered' },
        },
        _not: {
          _or: [
            { member_notes: { rejected_at: { _is_null: false } } },
            { member_contracts: { _or: [{ agreed_at: { _is_null: false } }, { revoked_at: { _is_null: false } }] } },
          ],
        },
      }
    : hasTransacted
    ? {
        manager_id: { _eq: salesId },
        member_contracts: {
          agreed_at: { _is_null: false },
          revoked_at: { _is_null: true },
        },
      }
    : {}

  const orderBy: types.GET_SALES_CALL_MEMBERVariables['orderBy'] = hasContacted
    ? [
        {
          member_notes_aggregate: {
            max: {
              created_at: types.order_by.desc,
            },
          },
        },
      ]
    : [
        {
          member_contracts_aggregate: {
            max: {
              agreed_at: types.order_by.desc,
            },
          },
        },
      ]

  const { loading, data, error, refetch } = useQuery<types.GET_SALES_CALL_MEMBER, types.GET_SALES_CALL_MEMBERVariables>(
    gql`
      query GET_SALES_CALL_MEMBER(
        $condition: member_bool_exp!
        $orderBy: [member_order_by!]
        $hasContacted: Boolean!
        $hasTransacted: Boolean!
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
            order_by: { created_at: desc }
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
          member_tasks(limit: 1, order_by: {created_at: desc}) 
          @include(if: $hasContacted){
            id
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
        hasContacted,
        hasTransacted,
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
      lastContactAt: v.member_notes?.[0] ? new Date(v.member_notes.slice(-1)[0]?.created_at) : null,
      lastTaskCategoryName: v.member_tasks?.[0]?.category?.name || null,
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

export const useLead = (salesId: string) => {
  const apolloClient = useApolloClient()
  const { loading, error, data, refetch } = useQuery<
    types.GET_FIRST_ASSIGNED_MEMBER,
    types.GET_FIRST_ASSIGNED_MEMBERVariables
  >(
    gql`
      query GET_FIRST_ASSIGNED_MEMBER($salesId: String!, $selectedProperties: [String!]!) {
        member_by_pk(id: $salesId) {
          id
          metadata
          member_properties(where: { property: { name: { _eq: "分機號碼" } } }) {
            id
            value
          }
        }
        property(where: { name: { _in: $selectedProperties } }) {
          id
          name
          placeholder
        }
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
    { variables: { salesId, selectedProperties: memberPropertyFields.map(field => field.name) } },
  )

  const sales = useMemo(
    () =>
      data?.member_by_pk
        ? {
            id: data.member_by_pk.id,
            telephone: data.member_by_pk.member_properties[0]?.value || '',
            metadata: data.member_by_pk.metadata || {},
          }
        : null,
    [data?.member_by_pk],
  )
  const properties =
    data?.property.map(property => ({
      id: property.id,
      name: property.name,
      options: property.placeholder ? property.placeholder.replace(/^\(|\)$/g, '').split('/') : null,
    })) || []
  const currentLead = useMemo(
    () =>
      data?.member?.[0]
        ? {
            id: data.member[0].id,
            email: data.member[0].email,
            name: data.member[0].name || data.member[0].username,
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
        : null,
    [data?.member],
  )
  const withDurationInput = !sales?.telephone.startsWith('8')

  const [markUnresponsiveMember] = useMutation<types.MARK_UNRESPONSIVE_MEMBER, types.MARK_UNRESPONSIVE_MEMBERVariables>(
    MARK_UNRESPONSIVE_MEMBER,
  )
  const [updateMemberPhones] = useMutation<types.UPDATE_MEMBER_PHONE, types.UPDATE_MEMBER_PHONEVariables>(
    UPDATE_MEMBER_PHONE,
  )
  const [insertMemberNote] = useMutation<types.INSERT_MEMBER_NOTE, types.INSERT_MEMBER_NOTEVariables>(
    INSERT_MEMBER_NOTE,
  )
  const [updateMemberProperties] = useMutation<types.UPDATE_MEMBER_PROPERTIES, types.UPDATE_MEMBER_PROPERTIESVariables>(
    UPDATE_MEMBER_PROPERTIES,
  )

  useEffect(() => {
    // request new lead if there is no current lead
    if (!sales || currentLead) return
    const odds = Number(sales?.metadata?.assignment?.odds) || 10
    const requestLeads = async (odds: number) => {
      const chance = new Chance()
      const categoriesRate: { [categoryName: string]: number } = sales?.metadata?.assignment?.categories || {}
      const firstHandVariables = {
        where: { member_note_count: { _eq: 0 } },
        orderBy: { created_at: 'desc' },
      }
      const secondHandVariables = {
        where: { member_note_count: { _gt: 0 } },
        orderBy: { lead_score: 'asc' },
      }
      const { data } = await apolloClient.query<types.GET_LEADS>({
        query: gql`
          query GET_LEADS($where: xuemi_lead_bool_exp, $orderBy: [xuemi_lead_order_by!]) {
            xuemi_lead(where: $where, order_by: $orderBy) {
              member {
                id
                member_categories {
                  category {
                    name
                  }
                }
              }
            }
          }
        `,
        variables: chance.weighted([firstHandVariables, secondHandVariables], [odds, 100 - odds]),
      })
      const leads = []
      for (const lead of data.xuemi_lead) {
        if (lead.member) {
          const categoryRates =
            lead.member.member_categories.length > 0
              ? lead.member.member_categories.map(v => categoriesRate[v.category.name])
              : [categoriesRate[''] || 0]
          leads.push({
            memberId: lead.member.id,
            rate: 1 - product(categoryRates.map(rate => 1 - rate)),
          })
        }
      }
      return leads
    }
    const assignLeads = async (leads: { memberId: string; rate: number }[]) => {
      for (const lead of leads) {
        if (lead.rate >= Math.random()) {
          const { data } = await apolloClient.mutate<types.UPDATE_MEMBER_MANAGER, types.UPDATE_MEMBER_MANAGERVariables>(
            {
              mutation: gql`
                mutation UPDATE_MEMBER_MANAGER($memberId: String!, $managerId: String!, $assignedAt: timestamptz!) {
                  update_member(
                    where: { id: { _eq: $memberId }, manager_id: { _is_null: true } }
                    _set: { manager_id: $managerId, assigned_at: $assignedAt }
                  ) {
                    affected_rows
                  }
                }
              `,
              variables: {
                memberId: lead.memberId,
                managerId: salesId,
                assignedAt: new Date(),
              },
            },
          )
          if (data?.update_member?.affected_rows || 0) {
            break
          }
        }
      }
    }
    requestLeads(odds)
      .then(assignLeads)
      .then(() => refetch())
  }, [currentLead, sales, refetch, apolloClient, salesId])

  return {
    loadingCurrentLead: loading,
    errorCurrentLead: error,
    sales,
    properties,
    currentLead,
    refetchCurrentLead: refetch,
    markUnresponsive: async () => currentLead && markUnresponsiveMember({ variables: { memberId: currentLead.id } }),
    insertNote: async (memberNote: { status: string; duration: number; description: string }) =>
      currentLead &&
      insertMemberNote({
        variables: {
          data: {
            member_id: currentLead.id,
            author_id: salesId,
            type: withDurationInput ? 'outbound' : null,
            status: memberNote.status,
            duration: memberNote.duration,
            description: memberNote.description,
            rejected_at: memberNote.status === 'rejected' ? new Date() : undefined,
          },
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
const INSERT_MEMBER_NOTE = gql`
  mutation INSERT_MEMBER_NOTE($data: member_note_insert_input!) {
    insert_member_note_one(object: $data) {
      id
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
