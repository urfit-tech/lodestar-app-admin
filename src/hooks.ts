import { useQuery } from '@apollo/react-hooks'
import { SortOrder } from 'antd/lib/table/interface'
import gql from 'graphql-tag'
import { DateRangeType, MemberContractProps, StatusType } from './types/memberContract'
import { GET_MEMBER_PRIVATE_TEACH_CONTRACT, GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables, order_by } from './types.d'

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

  const orderBy: GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables['orderBy'] = {
    agreed_at: sortOrder.agreedAt && (sortOrder.agreedAt === 'descend' ? order_by.desc : order_by.asc),
    revoked_at: sortOrder.revokedAt && (sortOrder.revokedAt === 'descend' ? order_by.desc : order_by.asc),
    started_at: sortOrder.startedAt && (sortOrder.startedAt === 'descend' ? order_by.desc : order_by.asc),
  }

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
            v.values?.orderExecutors?.map((v: { ratio: number; member_id: string }) => ({
              ratio: v.ratio,
              memberId: v.member_id,
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
                agreed_at: orderBy.agreed_at
                  ? {
                      [orderBy.agreed_at === 'desc' ? '_lt' : '_gt']: data?.xuemi_member_private_teach_contract.slice(
                        -1,
                      )[0]?.agreed_at,
                    }
                  : { _is_null: false },
                revoked_at: orderBy.revoked_at
                  ? {
                      [orderBy.revoked_at === 'desc' ? '_lt' : '_gt']: data?.xuemi_member_private_teach_contract.slice(
                        -1,
                      )[0]?.revoked_at,
                    }
                  : { _is_null: !isRevoked },
                started_at: orderBy.started_at
                  ? {
                      [orderBy.started_at === 'desc' ? '_lt' : '_gt']: data?.xuemi_member_private_teach_contract.slice(
                        -1,
                      )[0]?.started_at,
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
