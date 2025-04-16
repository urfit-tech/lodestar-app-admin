import { useMutation, useQuery } from '@apollo/client'
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
      dealer
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
        authorId: v.author_id || null,
        authorName: v.author_name || null,
        member: {
          id: v.member_id || null,
          name: v.member_name || null,
          pictureUrl: v.member_picture_url || null,
          email: v.member_email || null,
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
          name: v.referral_name || null,
          email: v.referral_email || null,
        },
        appointmentCreatorName: v.appointment_creator_name || null,
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
        note: v.note || null,
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
              avatarUrl: v.member.manager.picture_url || null,
            }
          : null,
        status: v.status as StatusType | null,
        lastActivity: v.last_marketing_activity || null,
        lastAdPackage: v.last_ad_package || null,
        lastAdMaterial: v.last_ad_material || null,
        firstFilledAt: v.first_fill_in_date || null,
        lastFilledAt: v.last_fill_in_date || null,
        sourceUrl: v.source_url,
        rebateGift: rebateGift,
        dealer: v.dealer,
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
  memberId,
}: {
  dateRangeType: DateRangeType
  startedAt: Date | null
  endedAt: Date | null
  memberId: string | null
}) => {
  const { data: userPermissionGroupMembersData } = useQuery<
    hasura.GetUserPermissionGroupMembers,
    hasura.GetUserPermissionGroupMembersVariables
  >(
    gql`
      query GetUserPermissionGroupMembers($memberId: String!) {
        member_permission_group(where: { member_id: { _eq: $memberId } }) {
          permission_group_id
          permission_group {
            name
            permission_group_members {
              member_id
            }
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

  const permissionGroupsMemberIds =
    userPermissionGroupMembersData?.member_permission_group.flatMap(v =>
      v.permission_group.permission_group_members.map(w => w.member_id),
    ) || []

  const isReadGroupContractAllCondition =
    permissionGroupsMemberIds.length > 0 && !!memberId ? { author_id: { _in: permissionGroupsMemberIds } } : {}

  const GET_MEMBER_CONTRACT_PRICE_AMOUNT = gql`
    query GET_MEMBER_CONTRACT_PRICE_AMOUNT(
      $dateRangeCondition: xuemi_member_private_teach_contract_bool_exp!,
            $isReadGroupContractAllCondition: xuemi_member_private_teach_contract_bool_exp!
    ) {
      private_teach_pending_contract: xuemi_member_private_teach_contract_aggregate(
        where: { _and: [{ status: { _eq: "pending" } }, $dateRangeCondition, $isReadGroupContractAllCondition] }
      ) {
        aggregate {
          sum {
            price
          }
        }
      }
      private_teach_loan_canceled_contract: xuemi_member_private_teach_contract_aggregate(
        where: { _and: [{ status: { _eq: "loan-canceled" } }, $dateRangeCondition, $isReadGroupContractAllCondition] }
      ) {
        aggregate {
          sum {
            price
          }
        }
      }
      private_teach_approved_contract: xuemi_member_private_teach_contract_aggregate(
        where: { _and: [{ status: { _eq: "approved" } }, $dateRangeCondition, $isReadGroupContractAllCondition] }
      ) {
        aggregate {
          sum {
            price
          }
        }
      }
      private_teach_refund_applied_contract: xuemi_member_private_teach_contract_aggregate(
        where: { _and: [{ status: { _eq: "refund-applied" } }, $dateRangeCondition, $isReadGroupContractAllCondition] }
      ) {
        aggregate {
          sum {
            price
          }
        }
      }
      private_teach_revoked_contract: xuemi_member_private_teach_contract_aggregate(
        where: { _and: [{ status: { _eq: "revoked" } }, $dateRangeCondition, $isReadGroupContractAllCondition] }
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
      isReadGroupContractAllCondition,
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
    mutation UPDATE_MEMBER_CONTRACT($memberContractId: uuid!, $options: jsonb!, $values: jsonb!, $dealer: String) {
      update_member_contract_by_pk(
        pk_columns: { id: $memberContractId }
        _append: { options: $options, values: $values }
        _set: { dealer: $dealer }
      ) {
        id
      }
    }
  `)
  return updateMemberContract
}

export const useManagers = () => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_MANAGER_COLLECTION_BY_MEMBER_PROPERTY>(
    gql`
      query GET_MANAGER_COLLECTION_BY_MEMBER_PROPERTY {
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
          id: v.member?.id || '',
          name: v.member?.name || '',
          username: v.member?.username || '',
          avatarUrl: v.member?.picture_url || null,
          email: v.member?.email || '',
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

type CustomSettingCondition = {
  paymentMethods: {
    method: string
    hidden: boolean
    feeWithInstallmentPlans: { installmentPlan: number; fee: number }[]
  }[]
  serviceExtend: { threshold: number; periodAmount: number; periodType: 'y' | 'M' | 'd' }[]
  contractProjectPlan: {
    id: string
    title: string
    periodAmount: number
    periodType: 'y' | 'M' | 'd'
  }
  contractProduct: {
    periodAmount: number
    periodType: 'y' | 'M' | 'd'
  }
  contractCoupon: {
    title: string
  }
  bonusExtendedServiceCoupon: {
    title: string
  }
  coachCoursePlanStarList: { [key: string]: any }
  bonusExtendedServiceCoupons: { [key: string]: number }
  contractCard: { id: string; title: string } | null
}
export const useAppCustom = () => {
  const { settings } = useApp()
  const defaultCustomSettingCondition: CustomSettingCondition = {
    contractCard: null,
    contractProjectPlan: {
      id: v4(),
      title: '未知專案方案',
      periodAmount: 1,
      periodType: 'y' as const,
    },
    contractProduct: {
      periodAmount: 14,
      periodType: 'd' as const,
    },
    contractCoupon: {
      title: '未知折價券',
    },
    bonusExtendedServiceCoupon: {
      title: '未知折價券',
    },
    serviceExtend: [],
    paymentMethods: [],
    coachCoursePlanStarList: {},
    bonusExtendedServiceCoupons: {},
  }

  const customSettingCondition: typeof defaultCustomSettingCondition = useMemo(() => {
    let custom
    try {
      custom = JSON.parse(settings.custom)
    } catch (error) {
      custom = defaultCustomSettingCondition
    }
    return { ...defaultCustomSettingCondition, ...custom }
  }, [settings])
  return customSettingCondition
}
