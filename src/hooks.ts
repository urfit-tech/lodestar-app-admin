import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { DateRangeType, MemberContractProps, StatusType } from './types'
import types from './types.d'

export const useMemberContract = ({
  isRevoked,
  memberNameAndEmail,
  authorName,
  status,
  dateRangeType,
  startedAt,
  endedAt,
}: {
  isRevoked: boolean
  memberNameAndEmail: string | null
  status: StatusType
  dateRangeType: DateRangeType
  authorName: string | null
  startedAt: Date | null
  endedAt: Date | null
}) => {
  const condition: types.GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables['condition'] = {
    // agreed_at: { _is_null: false },
    // revoked_at: { _is_null: !isRevoked },
    // author: { name: { _ilike: authorName && `%${authorName}%` } },
    // _and:
    //   status === 'pending-approval'
    //     ? [{ _not: { options: { _has_keys_any: ['approvedAt', 'refundAppliedAt', 'loanCanceledAt'] } } }]
    //     : status === 'approved-approval'
    //     ? [{ options: { _has_key: 'approvedAt' } }, { _not: { options: { _has_key: 'refundAppliedAt' } } }]
    //     : status === 'applied-refund'
    //     ? [{ options: { _has_keys_all: ['approvedAt', 'refundAppliedAt'] } }]
    //     : status === 'canceled-loan'
    //     ? [{ options: { _has_key: 'loanCanceledAt' } }]
    //     : null,
    // [dateRangeType]: {
    //   _gt: startedAt,
    //   _lte: endedAt,
    // },
    // member: {
    //   _or: [
    //     { name: { _ilike: memberNameAndEmail && `%${memberNameAndEmail}%` } },
    //     { email: { _ilike: memberNameAndEmail && `%${memberNameAndEmail}%` } },
    //   ],
    // },
  }
  const { loading, data, error, refetch, fetchMore } = useQuery<
    types.GET_MEMBER_PRIVATE_TEACH_CONTRACT,
    types.GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables
  >(
    gql`
      query GET_MEMBER_PRIVATE_TEACH_CONTRACT($condition: xuemi_member_private_teach_contract_bool_exp, $limit: Int) {
        xuemi_member_private_teach_contract(where: $condition, limit: $limit) {
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
    (data?.xuemi_member_private_teach_contract_aggregate.aggregate?.count || 0) >= memberContracts.length
      ? () =>
          fetchMore({
            variables: {
              condition: {
                ...condition,
                started_at: { _lt: data?.xuemi_member_private_teach_contract.slice(-1)[0]?.started_at },
              },
              limit: 10,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              return Object.assign({}, prev, {
                member_contract: [
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
