import { useMutation, useQuery } from '@apollo/react-hooks'
import { SortOrder } from 'antd/lib/table/interface'
import gql from 'graphql-tag'
import {
  GET_MEMBER_PRIVATE_TEACH_CONTRACT,
  GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables,
  GET_SALE_COLLECTION,
  GET_SALES_CALL_MEMBER,
  GET_SALES_CALL_MEMBERVariables,
  order_by,
} from './types.d'
import { DateRangeType, MemberContractProps, StatusType } from './types/memberContract'

export const useMemberContract = ({
  isRevoked,
  memberNameAndEmail,
  authorName,
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
    loading || error || !data
      ? []
      : data.xuemi_member_private_teach_contract.map(v => ({
        id: v.id,
        authorName: v.author_name,
        member: {
          id: v.member_id,
          name: v.member_name,
          pictureUrl: v.member_picture_url,
          email: v.member_email,
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
      }))

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

export const useSalesCallMember = ({ salesId, status }: {
  salesId: string
  status: 'contacted' | 'transacted'
}) => {

  const [hasContacted, hasTransacted] = [status === 'contacted', status === 'transacted']

  const condition = hasContacted ? {
    manager_id: { _eq: salesId },
    member_notes: {
      author_id: { _eq: salesId },
      type: { _eq: 'outbound' },
      status: { _eq: "answered" },
      rejected_at: { _is_null: true },
    },
    _not: {
      member_contracts: {
        _or: [{ agreed_at: { _is_null: false } }, { revoked_at: { _is_null: false } }]
      }
    }
  } : hasTransacted ? {
    manager_id: { _eq: salesId },
    member_contracts: {
      agreed_at: { _is_null: false },
      revoked_at: { _is_null: true }
    }
  } : {}

  const { loading, data, error, refetch } = useQuery<GET_SALES_CALL_MEMBER, GET_SALES_CALL_MEMBERVariables>(gql`
    query GET_SALES_CALL_MEMBER($condition: member_bool_exp!, $hasContacted: Boolean!, $hasTransacted: Boolean!) {
      member(where: $condition) {
        id
        name
        email
        member_phones {
          id
          phone
        }
        member_notes(limit: 1, order_by: {created_at: desc}) @include(if: $hasContacted) {
          id
          created_at
        }
        member_categories @include(if: $hasContacted) {
          id
          category {
            name
          }
        }
        member_contracts @include(if: $hasTransacted) {
          id
          values
          ended_at
        }
      }
    }
  `, {
    variables: {
      condition,
      hasContacted,
      hasTransacted
    }
  })

  const members: {
    id: string
    name: string
    email: string
    phones: string[]
    categoryNames?: string[]
    lastContactAt?: Date
    contracts?: {
      projectPlanName: string
      endedAt: Date
    }[]
  }[] = loading || error || !data ? [] : data.member.map(v => (
    {
      id: v.id,
      name: v.name,
      email: v.email,
      phones: v.member_phones.map(w => w.phone),
      categoryNames: v.member_categories?.map(w => w.category.name),
      lastContactAt: v.member_notes?.[0]?.created_at,
      contracts: v.member_contracts?.map(w => ({
        projectPlanName: w.values.projectPlanName,
        endedAt: new Date(w.ended_at)
      }))
    }
  ))

  return {
    loadingMembers: loading,
    members,
    errorMembers: error,
    refetchMembers: refetch
  }
}
