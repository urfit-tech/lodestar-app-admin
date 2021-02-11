import { useMutation, useQuery } from '@apollo/react-hooks'
import { SortOrder } from 'antd/lib/table/interface'
import gql from 'graphql-tag'
import { memberPropertyFields } from './helpers'
import {
  GET_FIRST_ASSIGNED_MEMBER,
  GET_FIRST_ASSIGNED_MEMBERVariables,
  GET_MEMBER_PRIVATE_TEACH_CONTRACT,
  GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables,
  GET_SALES_CALL_MEMBER,
  GET_SALES_CALL_MEMBERVariables,
  GET_SALE_COLLECTION,
  order_by,
} from './types.d'
import { DateRangeType, MemberContractProps, StatusType } from './types/memberContract'

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
  const condition: GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables['condition'] = {
    agreed_at: { _is_null: false },
    revoked_at: { _is_null: !isRevoked },
    author_name: { _ilike: authorName && `%${authorName}%` },
    author_id: authorId ? { _eq: authorId } : undefined,
    [dateRangeType]: {
      _gt: startedAt,
      _lte: endedAt,
    },
    status: { _in: status.length ? status : undefined },
    _or: [
      { member_name: { _ilike: memberNameAndEmail && `%${memberNameAndEmail}%` } },
      { member_email: { _ilike: memberNameAndEmail && `%${memberNameAndEmail}%` } },
    ],
  }

  const orderBy: GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables['orderBy'] = [
    { agreed_at: sortOrder.agreedAt && (sortOrder.agreedAt === 'descend' ? order_by.desc : order_by.asc) },
    { revoked_at: sortOrder.revokedAt && (sortOrder.revokedAt === 'descend' ? order_by.desc : order_by.asc) },
    { started_at: sortOrder.startedAt && (sortOrder.startedAt === 'descend' ? order_by.desc : order_by.asc) },
  ]

  const { loading, data, error, refetch, fetchMore } = useQuery<
    GET_MEMBER_PRIVATE_TEACH_CONTRACT,
    GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables
  >(
    gql`
      query GET_MEMBER_PRIVATE_TEACH_CONTRACT(
        $condition: xuemi_member_private_teach_contract_bool_exp
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
      }
    `,
    {
      variables: {
        condition,
        orderBy,
        limit: 10,
      },
    },
  )

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
        v.values?.orderExecutors?.map((v: { ratio: number; memberId: string }) => ({
          ratio: v.ratio,
          memberId: v.memberId,
        })) || [],
      couponCount: v.values?.coupons.length || null,
      manager: v.member?.manager
        ? {
            id: v.member.manager.id,
            name: v.member.manager.name || v.member.manager.username,
          }
        : null,
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
                        ? '_lt'
                        : '_gt']: data?.xuemi_member_private_teach_contract.slice(-1)[0]?.agreed_at,
                    }
                  : { _is_null: false },
                revoked_at: sortOrder.revokedAt
                  ? {
                      [sortOrder.revokedAt === 'descend'
                        ? '_lt'
                        : '_gt']: data?.xuemi_member_private_teach_contract.slice(-1)[0]?.revoked_at,
                    }
                  : { _is_null: !isRevoked },
                started_at: sortOrder.startedAt
                  ? {
                      [sortOrder.startedAt === 'descend'
                        ? '_lt'
                        : '_gt']: data?.xuemi_member_private_teach_contract.slice(-1)[0]?.started_at,
                    }
                  : undefined,
              },
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

  return {
    loadingMemberContracts: loading,
    errorMemberContracts: error,
    memberContracts,
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
  const { loading, error, data, refetch } = useQuery<GET_SALE_COLLECTION>(
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
  categoryNames?: string[]
  firstContactAt: Date | null
  lastContactAt: Date | null
  contracts?: {
    projectPlanName: string
    endedAt: Date
  }[]
}

export const useSalesCallMember = ({ salesId, status }: { salesId: string; status: 'contacted' | 'transacted' }) => {
  const [hasContacted, hasTransacted] = [status === 'contacted', status === 'transacted']

  const condition = hasContacted
    ? {
        manager_id: { _eq: salesId },
        member_notes: {
          author_id: { _eq: salesId },
          type: { _eq: 'outbound' },
          status: { _eq: 'answered' },
        },
        _not: {
          _or: [
            {
              member_notes: { rejected_at: { _is_null: false } },
            },
            {
              member_contracts: {
                _or: [{ agreed_at: { _is_null: false } }, { revoked_at: { _is_null: false } }],
              },
            },
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

  const orderBy = hasTransacted
    ? [
        {
          member_contracts_aggregate: {
            max: {
              agreed_at: order_by.desc,
            },
          },
        },
      ]
    : []

  const { loading, data, error, refetch } = useQuery<GET_SALES_CALL_MEMBER, GET_SALES_CALL_MEMBERVariables>(
    gql`
      query GET_SALES_CALL_MEMBER(
        $condition: member_bool_exp!
        $orderBy: [member_order_by!]
        $hasContacted: Boolean!
        $hasTransacted: Boolean!
      ) {
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
              name
            }
          }
          member_contracts(where: { agreed_at: { _is_null: false }, revoked_at: { _is_null: true } })
            @include(if: $hasTransacted) {
            id
            values
            ended_at
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
    },
  )

  const members: SalesCallMemberProps[] =
    loading || error || !data
      ? []
      : data.member.map(v => ({
          id: v.id,
          name: v.name,
          email: v.email,
          phones: v.member_phones.map(w => w.phone),
          categoryNames: v.member_categories?.map(w => w.category.name),
          firstContactAt: v.member_notes?.slice(-1)[0]?.created_at
            ? new Date(v.member_notes?.slice(-1)[0]?.created_at)
            : null,
          lastContactAt: v.member_notes?.[0]?.created_at ? new Date(v.member_notes?.slice(-1)[0]?.created_at) : null,
          contracts: v.member_contracts?.map(w => ({
            projectPlanName: w.values.projectPlanName,
            endedAt: new Date(w.ended_at),
          })),
        }))

  return {
    loadingMembers: loading,
    members,
    errorMembers: error,
    refetchMembers: refetch,
  }
}

export const useFirstAssignedMember = (salesId: string) => {
  const { loading, error, data, refetch } = useQuery<GET_FIRST_ASSIGNED_MEMBER, GET_FIRST_ASSIGNED_MEMBERVariables>(
    gql`
      query GET_FIRST_ASSIGNED_MEMBER($salesId: String!, $selectedProperties: [String!]!) {
        member_by_pk(id: $salesId) {
          id
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
            _not: { member_notes: { author_id: { _eq: $salesId } } }
          }
          order_by: [{ assigned_at: asc }]
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

  const sales = data?.member_by_pk
    ? {
        id: data.member_by_pk.id,
        telephone: data.member_by_pk.member_properties[0]?.value || '',
      }
    : null
  const properties =
    data?.property.map(property => ({
      id: property.id,
      name: property.name,
      options: property.placeholder ? property.placeholder.replace(/^\(|\)$/g, '').split('/') : null,
    })) || []
  const assignedMember = data?.member?.[0]
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
    : null

  return {
    loadingAssignedMember: loading,
    errorAssignedMember: error,
    sales,
    properties,
    assignedMember,
    refetchAssignedMember: refetch,
  }
}
