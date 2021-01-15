import { DatePicker, Input, InputNumber, Select } from 'antd'
import AdminModal, { AdminModalProps } from 'lodestar-app-admin/src/components/admin/AdminModal'
import { commonMessages, memberMessages, orderMessages } from 'lodestar-app-admin/src/helpers/translation'
import moment from 'moment'
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
    isRevoked: boolean
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
    studentCertification: string | null
  } & AdminModalProps
> = ({
  memberContractId,
  member,
  purchasedItem,
  isRevoked,
  status,
  paymentOptions,
  note,
  orderExecutors,
  studentCertification,
  ...props
}) => {
  const { formatMessage } = useIntl()

  let form
  if (isRevoked) {
    form = (
      <>
        <StyledAreaTitle>{formatMessage(memberMessages.label.status)}</StyledAreaTitle>
        <div className="row">
          <div className="col-4">
            {formatMessage(memberContractMessages.label.approvedAt)}：{status.approvedAt}
          </div>

          <div className="col-4">
            {formatMessage(memberContractMessages.label.loanCancelAt)}：{status.loanCancelAt}
          </div>

          <div className="col-4">
            {formatMessage(memberContractMessages.label.refundApplyAt)}：{status.refundApplyAt}
          </div>
        </div>
        <StyledAreaTitle>{formatMessage(memberContractMessages.label.payment)}</StyledAreaTitle>
        <div className="row">
          <div className="col-4">
            {formatMessage(orderMessages.label.paymentLogDetails)}：{paymentOptions?.paymentMethod}
          </div>
          <div className="col-3">
            {formatMessage(memberContractMessages.label.installmentPlan)}：{paymentOptions?.installmentPlan}
          </div>
          <div className="col-4">
            {formatMessage(memberContractMessages.label.paymentNumber)}：{paymentOptions?.paymentNumber}
          </div>
        </div>
        <StyledAreaTitle>{formatMessage(memberMessages.label.note)}</StyledAreaTitle>
        <div className="row">
          <div className="col-12">{note}</div>
        </div>
        <StyledAreaTitle>{formatMessage(memberContractMessages.label.revenueShare)}</StyledAreaTitle>
        {orderExecutors?.map(v => (
          <div>
            <span>{v.memberId}</span>
            <span>{v.ratio}</span>
          </div>
        ))}
        <div className="row">
          <div className="col-4">{formatMessage(memberMessages.label.manager)}</div>
          <div className="col-3"></div>
        </div>
        <StyledAreaTitle>{formatMessage(memberContractMessages.label.proofOfEnrollment)}</StyledAreaTitle>
        {studentCertification}
      </>
    )
  } else {
    form = (
      <>
        <StyledAreaTitle>{formatMessage(memberMessages.label.status)}</StyledAreaTitle>
        <div className="row">
          <div className="col-4">
            {formatMessage(memberContractMessages.label.approvedAt)}
            <DatePicker
              defaultValue={status.approvedAt ? moment(status.approvedAt, 'YYYY-MM-DD') : undefined}
              format={'YYYY-MM-DD'}
            />
          </div>

          <div className="col-4">
            {formatMessage(memberContractMessages.label.loanCancelAt)}：{status.loanCancelAt}
            <DatePicker
              defaultValue={status.loanCancelAt ? moment(status.loanCancelAt, 'YYYY-MM-DD') : undefined}
              format={'YYYY-MM-DD'}
            />
          </div>

          <div className="col-4">
            {formatMessage(memberContractMessages.label.refundApplyAt)}：{status.refundApplyAt}
            <DatePicker
              defaultValue={status.refundApplyAt ? moment(status.refundApplyAt, 'YYYY-MM-DD') : undefined}
              format={'YYYY-MM-DD'}
            />
          </div>
        </div>
        <StyledAreaTitle>{formatMessage(memberContractMessages.label.payment)}</StyledAreaTitle>
        <div className="row">
          {/* <div className="col-4">{paymentOptions?.paymentMethod}</div> */}
          <div className="col-3">
            {formatMessage(memberContractMessages.label.installmentPlan)}
            {/* <InputNumber>{paymentOptions?.installmentPlan}</InputNumber> */}
          </div>
          <div className="col-4">
            {formatMessage(memberContractMessages.label.paymentNumber)}
            {/* <Input>{paymentOptions?.paymentNumber || ''}</Input> */}
          </div>
        </div>
        <StyledAreaTitle>{formatMessage(memberMessages.label.note)}</StyledAreaTitle>
        <div className="row">
          <div className="col-12">
            <Input.TextArea>{note}</Input.TextArea>
          </div>
        </div>
        <StyledAreaTitle>{formatMessage(memberContractMessages.label.revenueShare)}</StyledAreaTitle>
        {formatMessage(memberMessages.label.manager)}
        {orderExecutors?.map(v => (
          <div className="row">
            <div className="col-4">
              <Select defaultValue={v.memberId}></Select>
            </div>
            <div className="col-3">
              <InputNumber defaultValue={v.ratio}>{v.ratio}</InputNumber>
            </div>
          </div>
        ))}

        <StyledAreaTitle>{formatMessage(memberContractMessages.label.proofOfEnrollment)}</StyledAreaTitle>
        {studentCertification}
      </>
    )
  }

  return (
    <AdminModal title={formatMessage(memberContractMessages.menu.memberContracts)} {...props}>
      <div className="row">
        <div className="col-4 row">
          <div className="col-12">
            <StyledAreaTitle>{formatMessage(memberMessages.label.target)}</StyledAreaTitle>
            {member?.name}
            {member?.email}
            {member?.phone}
          </div>
          <div className="col-12">
            <StyledAreaTitle>{formatMessage(memberContractMessages.label.memberContractId)}</StyledAreaTitle>
            {memberContractId}
          </div>
        </div>
        <div className="col-8">
          <StyledAreaTitle>{formatMessage(memberContractMessages.label.purchasedItem)}</StyledAreaTitle>
          <div>
            {formatMessage(memberContractMessages.label.product)}：{purchasedItem.projectPlanName}
          </div>
          <div>
            <span>
              {formatMessage(commonMessages.label.funds)}：{purchasedItem.price}
            </span>
            <span>
              {/* {formatMessage(promotionMessages.term.coins)}  */}：{purchasedItem.coinAmount}
            </span>
            <span>
              {formatMessage(memberContractMessages.label.appointment)}：{purchasedItem.couponCount}
            </span>
          </div>
          <div>
            {formatMessage(memberContractMessages.label.appointmentCreator)}：{purchasedItem.appointmentCreatorId}
          </div>
          <div>
            {formatMessage(memberContractMessages.label.referralMember)}：{purchasedItem.appointmentCreatorId}
          </div>
          <div>
            {formatMessage(memberContractMessages.label.servicePeriod)}：
            {`${moment(purchasedItem.startedAt).format('YYYY-MM-DD HH:MM')} ~
            ${moment(purchasedItem.endedAt).format('YYYY-MM-DD HH:MM')}
          `}
          </div>
        </div>
      </div>

      {form}
    </AdminModal>
  )
}

export default MemberContractModal
