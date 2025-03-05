import { useApolloClient } from '@apollo/client'
import { Button } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { SortOrder } from 'antd/lib/table/interface'
import gql from 'graphql-tag'
import moment from 'moment'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { downloadCSV, handleError, toCSV } from '../../helpers'
import { commonMessages, memberContractMessages } from '../../helpers/translation'
import { GET_MEMBER_PRIVATE_TEACH_CONTRACT, useAppCustom } from '../../hooks'
import { DateRangeType, MemberContractProps, StatusType } from '../../types/memberContract'

const GetSalesNamesAndGroupName = gql`
  query GetSalesNamesAndGroupName($salesIds: [String!]!) {
    member_public(where: { id: { _in: $salesIds } }) {
      id
      name
      username
      member_properties(where: { property: { name: { _eq: "組別" } } }) {
        value
      }
    }
  }
`

const ExportContractCollectionButton: React.FC<{
  visibleFields: string[]
  columns: ColumnProps<MemberContractProps>[]
  filter: {
    authorName: string | null
    memberNameAndEmail: string | null
    status: StatusType[]
    dateRangeType: DateRangeType
    startedAt: Date | null
    endedAt: Date | null
  }
  sortOrder: {
    agreedAt: SortOrder
    revokedAt: SortOrder
    startedAt: SortOrder
  }
  isRevoked: boolean
  authorId: string | null
}> = ({ visibleFields, columns, filter, sortOrder, isRevoked, authorId }) => {
  const { formatMessage } = useIntl()
  const apolloClient = useApolloClient()
  const appCustom = useAppCustom()
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)

    const condition: hasura.GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables['condition'] = {
      agreed_at: { _is_null: false },
      revoked_at: { _is_null: !isRevoked },
      author_name: { _ilike: filter.authorName && `%${filter.authorName}%` },
      author_id: authorId ? { _eq: authorId } : undefined,
      [filter.dateRangeType]: {
        _gt: filter.startedAt,
        _lte: filter.endedAt,
      },
      status: { _in: filter.status.length ? filter.status : undefined },
      _or: [
        { member_name: { _ilike: filter.memberNameAndEmail && `%${filter.memberNameAndEmail}%` } },
        { member_email: { _ilike: filter.memberNameAndEmail && `%${filter.memberNameAndEmail}%` } },
      ],
    }

    const orderBy: hasura.GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables['orderBy'] = [
      { agreed_at: (sortOrder.agreedAt === 'descend' ? 'desc' : 'asc') as hasura.order_by },
      { revoked_at: (sortOrder.revokedAt === 'descend' ? 'desc' : 'asc') as hasura.order_by },
      { started_at: (sortOrder.startedAt === 'descend' ? 'desc' : 'asc') as hasura.order_by },
    ]

    try {
      const { data } = await apolloClient.query<
        hasura.GET_MEMBER_PRIVATE_TEACH_CONTRACT,
        hasura.GET_MEMBER_PRIVATE_TEACH_CONTRACTVariables
      >({
        query: GET_MEMBER_PRIVATE_TEACH_CONTRACT,
        variables: {
          condition,
          orderBy,
        },
      })

      const memberContracts: Omit<MemberContractProps, 'authorId'>[] =
        data?.xuemi_member_private_teach_contract.map(v => {
          const appointmentCouponPlanId: string | undefined = v.values?.coupons?.find(
            (coupon: any) => coupon?.coupon_code?.data?.coupon_plan?.data?.title === appCustom.contractCoupon.title,
          )?.coupon_code.data.coupon_plan.data.id

          return {
            id: v.id,
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
              v.values?.projectPlanName ||
              v.values?.orderProducts.map((v: { name: string }) => v.name).join('、') ||
              null,
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
                memberId: v.member_id,
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
                  email: v.member.manager.email,
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
          }
        }) || []

      const salesIds = memberContracts
        .map(
          contract =>
            contract.orderExecutors?.filter(executor => executor.memberId).map(executor => executor.memberId) || [],
        )
        .flat()

      const { data: salesNamesAndGroupName } = await apolloClient.query<hasura.GetSalesNamesAndGroupName>({
        query: GetSalesNamesAndGroupName,
        variables: { salesIds },
      })

      const visibleColumns = columns.filter(column => visibleFields.includes(column.key as string))

      const csvData: string[][] = [
        visibleColumns.map(column => `${column.title}`),
        ...memberContracts.map(contract =>
          visibleColumns.map(column => {
            switch (column.key) {
              case 'agreedAt':
                return moment(contract.agreedAt).format('YYYY-MM-DD')
              case 'revokedAt':
                return moment(contract.revokedAt).format('YYYY-MM-DD')
              case 'status':
                return contract.loanCanceledAt
                  ? formatMessage(commonMessages.ui.cancel)
                  : contract.approvedAt
                  ? contract.refundAppliedAt
                    ? formatMessage(memberContractMessages.label.refundApply)
                    : formatMessage(memberContractMessages.status.approvedApproval)
                  : formatMessage(memberContractMessages.status.pendingApproval)
              case 'approvedAt':
                return contract.approvedAt ? moment(contract.approvedAt).format('YYYY-MM-DD') : ''
              case 'loanCanceledAt':
                return contract.loanCanceledAt ? moment(contract.loanCanceledAt).format('YYYY-MM-DD') : ''
              case 'refundAppliedAt':
                return contract.refundAppliedAt ? moment(contract.refundAppliedAt).format('YYYY-MM-DD') : ''
              case 'member':
                return `${contract.member.name} ${contract.member.email}`
              case 'studentCertification':
                return contract.studentCertification ? '有' : '無'
              case 'managerName':
                return contract.manager?.name || ''
              case 'contractId':
                return contract.id
              case 'startedAt':
                return moment(contract.startedAt).format('YYYY-MM-DD HH:MM')
              case 'authorName':
                return contract.authorName || ''
              case 'price':
                return `${contract.price}`
              case 'projectPlanName':
                return contract.projectPlanName || ''
              case 'note':
                return contract.note || ''
              case 'coin':
                return `${contract.coinAmount || 0}`
              case 'appointment':
                return `${contract.appointmentCouponCount || 0}`
              case 'appointmentCreator':
                return contract.appointmentCreatorName || ''
              case 'referralMember':
                return contract.referral.name || ''
              case 'recognizePerformance':
                return `${contract.orderOptions?.recognizePerformance}`
              case 'paymentMethod':
                return contract.paymentOptions?.paymentMethod || ''
              case 'installmentPlan':
                return `${contract.paymentOptions?.installmentPlan}` || ''
              case 'paymentNumber':
                return `${contract.paymentOptions?.paymentNumber}` || ''
              case 'orderExecutors':
                return (
                  contract.orderExecutors
                    ?.map(v => {
                      const member = salesNamesAndGroupName.member_public.find(member => member.id === v.memberId)
                      const groupName = member?.member_properties[0].value
                      return `${!!groupName && groupName + '-'}${
                        member?.name || member?.username || v.memberId
                      } ${Math.floor(v.ratio * 100)}%`
                    })
                    .join('\n') || ''
                )
              case 'lastActivity':
                return contract.lastActivity || ''
              case 'lastAdPackage':
                return contract.lastAdPackage || ''
              case 'lastAdMaterial':
                return contract.lastAdMaterial || ''
              case 'memberCreatedAt':
                return moment(contract.member.createdAt).format('YYYY-MM-DD HH:MM')
              case 'firstFilledAt':
                return contract.firstFilledAt || ''
              case 'lastFilledAt':
                return contract.lastFilledAt || ''
              case 'sourceUrl':
                return contract.sourceUrl || ''
              default:
                return ''
            }
          }),
        ),
      ]
      downloadCSV(
        `contracts_${moment(filter.startedAt).format('YYYYMMDD')}_${moment(filter.endedAt).format('YYYYMMDD')}.csv`,
        toCSV(csvData),
      )
    } catch (error) {
      handleError(error)
    }
    setLoading(false)
  }

  return (
    <Button type="primary" loading={loading} onClick={() => handleDownload()}>
      匯出資料
    </Button>
  )
}

export default ExportContractCollectionButton
