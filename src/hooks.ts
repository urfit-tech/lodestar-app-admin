import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { MemberContractProps } from './types'
import types from './types.d'

export const useMemberContract = ({}) => {
  const condition: types.GET_MEMBER_CONTRACTVariables['condition'] = {}
  const { loading, data, error, refetch, fetchMore } = useQuery<
    types.GET_MEMBER_CONTRACT,
    types.GET_MEMBER_CONTRACTVariables
  >(
    gql`
      query GET_MEMBER_CONTRACT($condition: member_contract_bool_exp, $limit: Int) {
        member_contract(where: $condition, limit: $limit) {
          id
          author_id
          member {
            id
            name
            picture_url
            email
          }
          started_at
          ended_at
          agreed_at
          revoked_at
          values
          options
        }
        member_contract_aggregate(where: $condition) {
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
      : data.member_contract.map(v => ({
          id: v.id,
          authorId: v.author_id,
          member: {
            id: v.member.id,
            name: v.member.name,
            pictureUrl: v.member.picture_url,
            email: v.member.email,
          },
          startedAt: new Date(v.started_at),
          endedAt: new Date(v.ended_at),
          agreedAt: v.agreed_at ? new Date(v.agreed_at) : null,
          revokedAt: v.revoked_at ? new Date(v.revoked_at) : null,
          approvedAt: v.options.approvedAt ? new Date(v.options.approvedAt) : null,
          loanCanceledAt: v.options.loanCanceledAt ? new Date(v.options.loanCanceledAt) : null,
          refundAppliedAt: v.options.refundAppliedAt ? new Date(v.options.refundAppliedAt) : null,
          referralMemberId: v.options?.referralMemberId || null,
          appointmentCreatorId: v.options?.appointmentCreatorId || null,
          studentCertification: v.options?.studentCertification || null,
          invoice: v.values?.invoice || null,
          projectPlanName: v.values?.projectPlanName || null,
          price: v.values?.price || null,
          coinAmount: v.values?.coinAmount || null,
          paymentOptions: {
            paymentMethod: v.values.paymentOptions?.paymentMethod || '',
            paymentNumber: v.values.paymentOptions?.paymentNumber || '',
            installmentPlan: v.values.paymentOptions?.installmentPlan || 0,
          },
          note: v.options?.note || null,
          orderExecutors:
            v.values?.orderExecutors?.map((v: { ratio: number; member_id: string }) => ({
              ratio: v.ratio,
              memberId: v.member_id,
            })) || [],
          couponCount: v.values?.coupons.length || null,
        }))

  const loadMoreMemberContracts =
    (data?.member_contract_aggregate.aggregate?.count || 0) >= memberContracts.length
      ? () =>
          fetchMore({
            variables: {
              condition: { ...condition, started_at: { _lt: data?.member_contract.slice(-1)[0]?.started_at } },
              limit: 10,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              return Object.assign({}, prev, {
                member_contract: [...prev.member_contract, ...fetchMoreResult.member_contract],
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
