import AdminModal, { AdminModalProps } from 'lodestar-app-admin/src/components/admin/AdminModal'
import { commonMessages, memberMessages, orderMessages } from 'lodestar-app-admin/src/helpers/translation'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { memberContractMessages } from '../helpers/translation'

const StyledAreaTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
`

const MemberContractModal: React.FC<
  {
    memberContractId: string
    member: {
      name: string
      email: string
      phone: string
    } | null
    purchasedItem: {
      startedAt: Date
      endedAt: Date
      projectPlanName: string | null
      price: number | null
      coinAmount: number | null
      couponCount: number | null
      appointmentCreatorId: string | null
      referralMemberId: string | null
    }
    // isRevoked: boolean
    status: {
      approvedAt: Date | null
      loanCancelAt: Date | null
      refundApplyAt: Date | null
    }
    paymentOptions: {
      paymentMethod: string
      paymentNumber: string
      installmentPlan: number
    } | null
    note: string | null
    orderExecutors:
      | {
          memberId: string
          ratio: number
        }[]
      | null
  } & AdminModalProps
> = ({ ...props }) => {
  const { formatMessage } = useIntl()
  let form
  if (true) {
    form = <div></div>
  } else {
    form = <div></div>
  }
  return (
    <AdminModal title={formatMessage(memberContractMessages.menu.memberContracts)} {...props}>
      <div className="row">
        <div className="col-4 row">
          <div className="col-12">
            <StyledAreaTitle>{formatMessage(memberMessages.label.target)}</StyledAreaTitle>
          </div>
          <div className="col-12">
            <StyledAreaTitle>{formatMessage(memberContractMessages.label.memberContractId)}</StyledAreaTitle>
          </div>
        </div>
        <div className="col-8">
          <StyledAreaTitle>{formatMessage(memberContractMessages.label.purchasedItem)}</StyledAreaTitle>
          {formatMessage(memberContractMessages.label.product)}
          {formatMessage(commonMessages.label.funds)}
          {formatMessage(memberContractMessages.label.appointmentCreator)}
          {formatMessage(memberContractMessages.label.referralMember)}
          {formatMessage(memberContractMessages.label.servicePeriod)}
        </div>
      </div>
      <StyledAreaTitle>{formatMessage(memberMessages.label.status)}</StyledAreaTitle>
      <div className="row">
        <div className="col-4">{formatMessage(memberContractMessages.label.approvedAt)}</div>
        <div className="col-4">{formatMessage(memberContractMessages.label.loanCancelAt)}</div>
        <div className="col-4">{formatMessage(memberContractMessages.label.refundApplyAt)}</div>
      </div>
      <StyledAreaTitle>{formatMessage(memberContractMessages.label.payment)}</StyledAreaTitle>
      <div className="row">
        <div className="col-4">
          <StyledAreaTitle>{formatMessage(orderMessages.label.paymentLogDetails)}</StyledAreaTitle>
        </div>
        <div className="col-3">
          <StyledAreaTitle>{formatMessage(memberContractMessages.label.installmentPlan)}</StyledAreaTitle>
        </div>
        <div className="col-4">
          <StyledAreaTitle>{formatMessage(memberContractMessages.label.paymentNumber)}</StyledAreaTitle>
        </div>
      </div>
      <StyledAreaTitle>{formatMessage(memberMessages.label.note)}</StyledAreaTitle>
      <div className="row">
        <div className="col-12"></div>
      </div>
      <StyledAreaTitle>{formatMessage(memberContractMessages.label.revenueShare)}</StyledAreaTitle>
      <div className="row">
        <div className="col-4">{formatMessage(memberMessages.label.manager)}</div>
        <div className="col-3"></div>
      </div>

      {form}
    </AdminModal>
  )
}

export default MemberContractModal
