import { useMutation, useQuery } from '@apollo/react-hooks'
import { SortOrder } from 'antd/lib/table/interface'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useMemo } from 'react'
import { v4 } from 'uuid'
import hasura from './hasura'
import { DateRangeType, MemberContractProps, StatusType } from './types/memberContract'
import { Manager } from './types/sales'

export const GET_MEMBER_PRIVATE_TEACH_CONTRACT = gql`
  query GET_MEMBER_PRIVATE_TEACH_CONTRACT(
    $condition: xuemi_member_private_teach_contract_bool_exp
    $limit: Int
    $orderBy: [xuemi_member_private_teach_contract_order_by!]
  ) {
    xuemi_member_private_teach_contract(where: $condition, limit: $limit, order_by: $orderBy) {
      id
      author_id
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
          email
          picture_url
        }
      }
      status
      last_marketing_activity
      last_ad_package
      last_ad_material
      first_fill_in_date
      last_fill_in_date
      source_url
    }
    xuemi_member_private_teach_contract_aggregate(where: $condition) {
      aggregate {
        count
      }
    }
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
  const appCustom = useAppCustom()
  const condition: hasura.GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables['condition'] = {
    agreed_at: { _is_null: false },
    revoked_at: { _is_null: !isRevoked },
    [dateRangeType]: {
      _gt: startedAt,
      _lt: endedAt,
    },
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

  const {
    loading,
    data,
    error,
    refetch,
    //  fetchMore
  } = useQuery<hasura.GET_MEMBER_PRIVATE_TEACH_CONTRACT, hasura.GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables>(
    GET_MEMBER_PRIVATE_TEACH_CONTRACT,
    {
      variables: {
        condition,
        orderBy,
      },
    },
  )

  const memberContracts: MemberContractProps[] =
    data?.xuemi_member_private_teach_contract.map(v => {
      const appointmentCouponPlanId: string | undefined = v.values?.coupons?.find(
        (coupon: any) => coupon?.coupon_code?.data?.coupon_plan?.data?.title === appCustom.contractCoupon.title,
      )?.coupon_code.data.coupon_plan.data.id

      const rebateGift: string | undefined =
        v.values?.orderDiscounts?.find((v: any) => v.name && v.name.includes('滿額學習工具'))?.name || null

      return {
        id: v.id,
        authorId: v.author_id,
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
          v.values?.projectPlanName || v.values?.orderProducts?.map((v: { name: string }) => v.name).join('、') || null,
        price: v.values?.price || null,
        coinAmount:
          v.values?.coinAmount ||
          v.values?.coinLogs?.find((coinLog: any) => coinLog.description === '私塾課代幣')?.amount ||
          null,
        orderOptions: { recognizePerformance: v.values.orderOptions?.recognizePerformance },
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
          ? v.values.coupons?.filter(
              (coupon: any) =>
                coupon?.coupon_code?.data?.coupon_plan_id === appointmentCouponPlanId ||
                coupon?.coupon_code?.data?.coupon_plan?.data?.title === appCustom.contractCoupon.title,
            ).length || null
          : null,
        manager: v.member?.manager
          ? {
              id: v.member.manager.id,
              name: v.member.manager.name,
              username: v.member.manager.username,
              email: v.member.manager.name,
              avatarUrl: v.member.manager.picture_url,
            }
          : null,
        status: v.status as StatusType | null,
        lastActivity: v.last_marketing_activity,
        lastAdPackage: v.last_ad_package,
        lastAdMaterial: v.last_ad_material,
        firstFilledAt: v.first_fill_in_date,
        lastFilledAt: v.last_fill_in_date,
        sourceUrl: v.source_url,
        rebateGift: rebateGift,
      }
    }) || []

  return {
    loadingMemberContracts: loading,
    errorMemberContracts: error,
    memberContracts,
    refetchMemberContracts: refetch,
  }
}
export const useMemberContractPriceAmount = ({
  dateRangeType,
  startedAt,
  endedAt,
}: {
  dateRangeType: DateRangeType
  startedAt: Date | null
  endedAt: Date | null
}) => {
  const GET_MEMBER_CONTRACT_PRICE_AMOUNT = gql`
    query GET_MEMBER_CONTRACT_PRICE_AMOUNT($dateRangeCondition: xuemi_member_private_teach_contract_bool_exp!) {
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
  `
  const dateRangeCondition: hasura.GET_MEMBER_CONTRACT_PRICE_AMOUNTVariables['dateRangeCondition'] =
    {
      [dateRangeType]: {
        _gt: startedAt,
        _lt: endedAt,
      },
    } || {}
  const { loading, data, error, refetch } = useQuery<
    hasura.GET_MEMBER_CONTRACT_PRICE_AMOUNT,
    hasura.GET_MEMBER_CONTRACT_PRICE_AMOUNTVariables
  >(GET_MEMBER_CONTRACT_PRICE_AMOUNT, {
    variables: {
      dateRangeCondition,
    },
  })

  const memberContractPriceAmount: Record<StatusType, number> = {
    pending: data?.private_teach_pending_contract.aggregate?.sum?.price || 0,
    approved: data?.private_teach_approved_contract.aggregate?.sum?.price || 0,
    'refund-applied': data?.private_teach_refund_applied_contract.aggregate?.sum?.price || 0,
    revoked: data?.private_teach_revoked_contract.aggregate?.sum?.price || 0,
    'loan-canceled': data?.private_teach_loan_canceled_contract.aggregate?.sum?.price || 0,
  }

  return { loading, memberContractPriceAmount, error, refetch }
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

export const useManagers = () => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_MANAGER_COLLECTION>(
    gql`
      query GET_MANAGER_COLLECTION {
        member_property(where: { property: { name: { _eq: "分機號碼" } } }) {
          id
          value
          member {
            id
            name
            picture_url
            username
            email
          }
        }
      }
    `,
  )

  const managers: Manager[] = useMemo(
    () =>
      data?.member_property
        .filter(v => v.value)
        .map(v => ({
          id: v.member.id,
          name: v.member.name,
          username: v.member.username,
          avatarUrl: v.member.picture_url,
          email: v.member.email,
          telephone: v.value,
        })) || [],
    [data],
  )

  return {
    loading,
    error,
    managers,
    refetch,
  }
}
export const useAppCustom = () => {
  const { settings } = useApp()
  const defaultCustomSettingCondition = {
    contractCard: null,
    contractProjectPlan: { id: v4(), title: '', periodAmount: 1, periodType: 'y' as const },
    contractProduct: null,
    contractCoupon: {
      title: '學米諮詢券',
    },
    serviceExtend: [
      { threshold: 250000, periodAmount: 24, periodType: 'M' as const },
      { threshold: 200000, periodAmount: 18, periodType: 'M' as const },
      { threshold: 150000, periodAmount: 12, periodType: 'M' as const },
      { threshold: 90000, periodAmount: 6, periodType: 'M' as const },
    ],
    paymentMethods: [
      {
        method: '學米仲信202208',
        feeWithInstallmentPlans: [
          { installmentPlan: 3, fee: 0.03 },
          { installmentPlan: 6, fee: 0.0225 },
          { installmentPlan: 12, fee: 0.0405 },
          { installmentPlan: 18, fee: 0.0455 },
          { installmentPlan: 24, fee: 0.0575 },
          { installmentPlan: 30, fee: 0.0675 },
          { installmentPlan: 36, fee: 0.0975 },
        ],
      },
      {
        method: '綠界科技',
        feeWithInstallmentPlans: [
          { installmentPlan: 1, fee: 0.0245 },
          { installmentPlan: 3, fee: 0.025 },
          { installmentPlan: 6, fee: 0.04 },
          { installmentPlan: 12, fee: 0.07 },
          { installmentPlan: 18, fee: 0.095 },
          { installmentPlan: 24, fee: 0.11 },
        ],
      },
      {
        method: '藍新',
        feeWithInstallmentPlans: [
          { installmentPlan: 1, fee: 0.028 },
          { installmentPlan: 3, fee: 0.03 },
          { installmentPlan: 6, fee: 0.035 },
          { installmentPlan: 12, fee: 0.07 },
          { installmentPlan: 18, fee: 0.09 },
          { installmentPlan: 24, fee: 0.12 },
          { installmentPlan: 30, fee: 0.15 },
        ],
      },

      { method: '富比世', feeWithInstallmentPlans: [] },
      { method: '匯款', feeWithInstallmentPlans: [] },
      { method: '現金', feeWithInstallmentPlans: [] },
      {
        method: '裕富',
        feeWithInstallmentPlans: [
          { installmentPlan: 6, fee: 0.035 },
          { installmentPlan: 12, fee: 0.06 },
          { installmentPlan: 18, fee: 0.09 },
          { installmentPlan: 24, fee: 0.0975 },
          { installmentPlan: 30, fee: 0.12 },
          { installmentPlan: 36, fee: 0.14 },
        ],
      },
      {
        method: '遠信',
        feeWithInstallmentPlans: [
          { installmentPlan: 6, fee: 0.035 },
          { installmentPlan: 12, fee: 0.043 },
          { installmentPlan: 18, fee: 0.06 },
          { installmentPlan: 24, fee: 0.075 },
          { installmentPlan: 30, fee: 0.09 },
          { installmentPlan: 36, fee: 0.1 },
        ],
      },
      {
        method: '萬事達',
        feeWithInstallmentPlans: [
          { installmentPlan: 1, fee: 0.028 },
          { installmentPlan: 3, fee: 0.03 },
          { installmentPlan: 6, fee: 0.04 },
          { installmentPlan: 12, fee: 0.065 },
        ],
      },
      // old used
      {
        method: '舊遠信',
        hidden: true,
        feeWithInstallmentPlans: [
          { installmentPlan: 6, fee: 0.045 },
          { installmentPlan: 12, fee: 0.045 },
          { installmentPlan: 18, fee: 0.065 },
          { installmentPlan: 24, fee: 0.085 },
          { installmentPlan: 30, fee: 0.1 },
          { installmentPlan: 36, fee: 0.14 },
        ],
      },
      {
        method: '新仲信',
        hidden: true,
        feeWithInstallmentPlans: [
          { installmentPlan: 3, fee: 0.03 },
          { installmentPlan: 6, fee: 0.03 },
          { installmentPlan: 12, fee: 0.05 },
          { installmentPlan: 18, fee: 0.07 },
          { installmentPlan: 24, fee: 0.09 },
          { installmentPlan: 30, fee: 0.1 },
          { installmentPlan: 36, fee: 0.13 },
        ],
      },
      {
        method: '舊仲信',
        hidden: true,
        feeWithInstallmentPlans: [
          { installmentPlan: 3, fee: 0.03 },
          { installmentPlan: 6, fee: 0.04 },
          { installmentPlan: 12, fee: 0.06 },
          { installmentPlan: 18, fee: 0.09 },
          { installmentPlan: 24, fee: 0.11 },
          { installmentPlan: 30, fee: 0.13 },
          { installmentPlan: 36, fee: 0.15 },
        ],
      },
      {
        method: '舊學米仲信',
        hidden: true,
        feeWithInstallmentPlans: [
          { installmentPlan: 3, fee: 0.03 },
          { installmentPlan: 6, fee: 0.03 },
          { installmentPlan: 12, fee: 0.05 },
          { installmentPlan: 18, fee: 0.055 },
          { installmentPlan: 24, fee: 0.07 },
          { installmentPlan: 30, fee: 0.085 },
          { installmentPlan: 36, fee: 0.11 },
        ],
      },
      {
        method: '舊匠說仲信',
        hidden: true,
        feeWithInstallmentPlans: [
          { installmentPlan: 3, fee: 0.03 },
          { installmentPlan: 6, fee: 0.03 },
          { installmentPlan: 12, fee: 0.05 },
          { installmentPlan: 18, fee: 0.07 },
          { installmentPlan: 24, fee: 0.09 },
          { installmentPlan: 30, fee: 0.1 },
          { installmentPlan: 36, fee: 0.13 },
        ],
      },
      // no longer cooperate
      {
        method: '歐付寶',
        hidden: true,
        feeWithInstallmentPlans: [
          { installmentPlan: 1, fee: 0.0245 },
          { installmentPlan: 3, fee: 0.025 },
          { installmentPlan: 6, fee: 0.04 },
          { installmentPlan: 12, fee: 0.07 },
          { installmentPlan: 18, fee: 0.095 },
          { installmentPlan: 24, fee: 0.11 },
        ],
      },
    ],
  }

  let customSettingCondition: typeof defaultCustomSettingCondition
  try {
    customSettingCondition = JSON.parse(settings.custom)
  } catch (error) {
    customSettingCondition = defaultCustomSettingCondition
  }
  customSettingCondition = { ...defaultCustomSettingCondition, ...customSettingCondition }
  return customSettingCondition
}
