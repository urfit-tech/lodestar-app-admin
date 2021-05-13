import { useMutation, useQuery } from '@apollo/react-hooks'
import { SortOrder } from 'antd/lib/table/interface'
import gql from 'graphql-tag'
import hasura from './hasura'
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
      attachments
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
  const dateRangeCondition: hasura.GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables['dateRangeCondition'] = {
    [dateRangeType]: {
      _gt: startedAt,
      _lt: endedAt,
    },
  }
  const condition: hasura.GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables['condition'] = {
    agreed_at: { _is_null: false },
    revoked_at: { _is_null: !isRevoked },
    ...dateRangeCondition,
    author_name: authorName ? { _ilike: `%${authorName}%` } : undefined,
    author_id: authorId ? { _eq: authorId } : undefined,
    status: status.length ? { _in: status } : undefined,
    _or: memberNameAndEmail
      ? [
          { member_name: { _ilike: `%${memberNameAndEmail}%` } },
          { member_email: { _ilike: `%${memberNameAndEmail}%` } },
        ]
      : undefined,
  }

  const orderBy: hasura.GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables['orderBy'] = [
    { agreed_at: (sortOrder.agreedAt === 'descend' ? 'desc' : 'asc') as hasura.order_by },
    { revoked_at: (sortOrder.revokedAt === 'descend' ? 'desc' : 'asc') as hasura.order_by },
    { started_at: (sortOrder.startedAt === 'descend' ? 'desc' : 'asc') as hasura.order_by },
  ]

  const { loading, data, error, refetch, fetchMore } = useQuery<
    hasura.GET_MEMBER_PRIVATE_TEACH_CONTRACT,
    hasura.GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables
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
    data?.xuemi_member_private_teach_contract.map(v => {
      const appointmentCouponPlanId: string | undefined = v.values?.coupons?.find(
        (coupon: any) => coupon?.coupon_code?.data?.coupon_plan?.data?.title === '學米諮詢券',
      )?.coupon_code.data.coupon_plan.data.id

      return {
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
        attachments: v.attachments,
        invoice: v.values?.invoice || null,
        projectPlanName:
          v.values?.projectPlanName || v.values?.orderProducts.map((v: { name: string }) => v.name).join('、') || null,
        price: v.values?.price || null,
        coinAmount:
          v.values?.coinAmount ||
          v.values?.coinLogs?.find((coinLog: any) => coinLog.description === '私塾課代幣')?.amount ||
          null,
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
        appointmentCouponCount: appointmentCouponPlanId
          ? (v.values.coupons?.filter(
              (coupon: any) => coupon?.coupon_code?.data?.coupon_plan_id === appointmentCouponPlanId,
            ).length || 0) + 1
          : null,
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
      }
    }) || []

  const loadMoreMemberContracts =
    (data?.xuemi_member_private_teach_contract_aggregate.aggregate?.count || 0) >= 10
      ? () => {
          const lastRecord =
            data?.xuemi_member_private_teach_contract?.[data.xuemi_member_private_teach_contract.length - 1]

          return fetchMore({
            variables: {
              orderBy,
              condition: {
                ...condition,
                id: {
                  _nin: data?.xuemi_member_private_teach_contract
                    .filter(
                      v =>
                        v.agreed_at === lastRecord?.agreed_at ||
                        v.revoked_at === lastRecord?.revoked_at ||
                        v.started_at === lastRecord?.started_at,
                    )
                    .map(v => v.id),
                },
                agreed_at:
                  sortOrder.agreedAt === 'descend'
                    ? {
                        _lte: lastRecord?.agreed_at,
                        _gt: startedAt,
                      }
                    : sortOrder.agreedAt === 'ascend'
                    ? {
                        _gte: lastRecord?.agreed_at,
                        _lt: endedAt,
                      }
                    : { _is_null: false },
                revoked_at:
                  sortOrder.revokedAt === 'descend'
                    ? {
                        _lte: lastRecord?.revoked_at,
                        _gt: startedAt,
                      }
                    : sortOrder.revokedAt === 'ascend'
                    ? {
                        _gte: lastRecord?.revoked_at,
                        _lt: endedAt,
                      }
                    : { _is_null: !isRevoked },
                started_at:
                  sortOrder.startedAt === 'descend'
                    ? {
                        _lte: lastRecord?.started_at,
                        _gt: startedAt,
                      }
                    : sortOrder.startedAt === 'ascend'
                    ? {
                        _gte: lastRecord?.started_at,
                        _lt: endedAt,
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
        }
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
  const { loading, error, data, refetch } = useQuery<hasura.GET_SALE_COLLECTION>(
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
