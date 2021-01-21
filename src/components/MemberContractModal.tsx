import Icon, { DownloadOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { Button, Col, DatePicker, Form, Input, InputNumber, Row, Select } from 'antd'
import AdminModal, { AdminModalProps } from 'lodestar-app-admin/src/components/admin/AdminModal'
import { commonMessages, memberMessages, orderMessages } from 'lodestar-app-admin/src/helpers/translation'
import moment from 'moment'
import React from 'react'
import { useIntl } from 'react-intl'
import styled, { css } from 'styled-components'
import { memberContractMessages } from '../helpers/translation'
import { useXuemiSales } from '../hooks'
import { ReactComponent as PlusIcon } from '../images/icons/plus.svg'
import MemberName from './MemberName'

const StyledAreaTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
  font-family: NotoSansCJKtc;
`
const StyledText = styled.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.57;
  letter-spacing: 0.18px;
  color: var(--gray-darker);
  font-family: NotoSansCJKtc;
`
const StyledSubText = styled.div`
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  color: var(--gray-dark);
  font-family: NotoSansCJKtc;
`
const FullWidthMixin = css`
  width: 100%;
`
const StyledDatePicker = styled(DatePicker)`
  ${FullWidthMixin}
`
const StyledRow = styled(Row)`
  ${FullWidthMixin}
`
const StyledSelect = styled(Select)`
  ${FullWidthMixin}
`
const StyledAddButton = styled(Button)`
  padding: 0;
  color: ${props => props.theme['@primary-color']};
`

type MemberContractModalProps = {
  isRevoked: boolean
  memberContractId?: string
  member?: {
    name: string
    email: string
    phone: string
  } | null
  purchasedItem: {
    startedAt?: Date
    endedAt?: Date
    projectPlanName?: string | null
    price?: number | null
    coinAmount?: number | null
    couponCount?: number | null
    appointmentCreatorName?: string | null
    referral?: {
      name: string | null
      email: string | null
    }
  }
  status: {
    approvedAt?: Date | null
    loanCanceledAt?: Date | null
    refundAppliedAt?: Date | null
  }
  paymentOptions?: {
    paymentMethod: string
    paymentNumber: string
    installmentPlan: number
  } | null
  note?: string | null
  orderExecutors?:
    | {
        memberId: string
        ratio: number
      }[]
    | null
  studentCertification?: string | null
} & AdminModalProps

const MemberContractModal: React.FC<MemberContractModalProps> = ({
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
  const [form] = Form.useForm()
  const { xuemiSales } = useXuemiSales()

  let sheet
  if (isRevoked) {
    sheet = (
      <>
        <StyledAreaTitle>{formatMessage(memberMessages.label.status)}</StyledAreaTitle>
        <div className="row mb-4">
          <div className="col-12">
            {formatMessage(memberContractMessages.label.approvedAt)}：
            {status.approvedAt ? moment(status.approvedAt).format('YYYY-MM-DD') : undefined}
          </div>
          <div className="col-12">
            {formatMessage(memberContractMessages.label.loanCancelAt)}：
            {status.loanCanceledAt ? moment(status.loanCanceledAt).format('YYYY-MM-DD') : undefined}
          </div>
          <div className="col-12">
            {formatMessage(memberContractMessages.label.refundApplyAt)}：
            {status.refundAppliedAt ? moment(status.refundAppliedAt).format('YYYY-MM-DD') : undefined}
          </div>
        </div>

        <StyledAreaTitle>{formatMessage(memberContractMessages.label.payment)}</StyledAreaTitle>
        <div className="row mb-4">
          <div className="col-3">
            {formatMessage(orderMessages.label.paymentLogDetails)}：{paymentOptions?.paymentMethod}
          </div>
          <div className="col-2">
            {formatMessage(memberContractMessages.label.installmentPlan)}：{paymentOptions?.installmentPlan}
          </div>
          <div className="col-3">
            {formatMessage(memberContractMessages.label.paymentNumber)}：{paymentOptions?.paymentNumber}
          </div>
        </div>
        <StyledAreaTitle>{formatMessage(memberContractMessages.label.note)}</StyledAreaTitle>
        <div className="row mb-4">
          <div className="col-12">{note}</div>
        </div>
        <StyledAreaTitle>{formatMessage(memberContractMessages.label.revenueShare)}</StyledAreaTitle>
        <div className="mb-4">
          {orderExecutors?.map(v => (
            <div>
              <MemberName memberId={v.memberId} />
              <span className="ml-2">{v.ratio}</span>
            </div>
          ))}
        </div>
        <StyledAreaTitle>{formatMessage(memberContractMessages.label.proofOfEnrollment)}</StyledAreaTitle>
        {studentCertification}
      </>
    )
  } else {
    sheet = (
      <>
        <Form
          form={form}
          colon={false}
          initialValues={{
            approvedAt: status.approvedAt ? moment(status.approvedAt) : null,
            loanCanceledAt: status.loanCanceledAt ? moment(status.loanCanceledAt) : null,
            refundAppliedAt: status.refundAppliedAt ? moment(status.refundAppliedAt) : null,
            note,
            paymentMethod: paymentOptions?.paymentMethod,
            installmentPlan: paymentOptions?.installmentPlan,
            paymentNumber: paymentOptions?.paymentNumber,
            orderExecutors,
          }}
        >
          <StyledAreaTitle>{formatMessage(memberMessages.label.status)}</StyledAreaTitle>
          <StyledRow className="mb-3">
            <Col span={8} className="pr-3">
              <span>{formatMessage(memberContractMessages.label.approvedAt)}</span>
              <Form.Item name="approvedAt">
                <StyledDatePicker format={'YYYY-MM-DD'} />
              </Form.Item>
            </Col>
            <Col span={8} className="pr-3">
              <span>{formatMessage(memberContractMessages.label.loanCancelAt)}</span>
              <Form.Item name="loanCanceledAt">
                <StyledDatePicker format={'YYYY-MM-DD'} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <span>{formatMessage(memberContractMessages.label.refundApplyAt)}</span>
              <Form.Item name="refundAppliedAt">
                <StyledDatePicker format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </StyledRow>

          <StyledAreaTitle>{formatMessage(memberContractMessages.label.payment)}</StyledAreaTitle>
          <StyledRow className="mb-3">
            <Col span={8} className="pr-3">
              <span>{formatMessage(memberContractMessages.label.paymentMethod)}</span>
              <Form.Item name="paymentMethod" rules={[{ required: true, message: '請選擇付款方式' }]}>
                <StyledSelect>
                  {['藍新', '歐付寶', '富比世', '新仲信', '舊仲信', '匯款', '現金', '裕富'].map((payment: string) => (
                    <Select.Option key={payment} value={payment}>
                      {payment}
                    </Select.Option>
                  ))}
                </StyledSelect>
              </Form.Item>
            </Col>
            <Col span={5} className="pr-3">
              <span>{formatMessage(memberContractMessages.label.installmentPlan)}</span>
              <Form.Item name="installmentPlan">
                <StyledSelect>
                  {[1, 3, 6, 8, 9, 12, 18, 24, 30].map((installmentPlan: number) => (
                    <Select.Option key={installmentPlan} value={installmentPlan}>
                      {installmentPlan}
                    </Select.Option>
                  ))}
                </StyledSelect>
              </Form.Item>
            </Col>
            <Col span={8}>
              <span>{formatMessage(memberContractMessages.label.paymentNumber)}</span>
              <Form.Item name="paymentNumber">
                <Input />
              </Form.Item>
            </Col>
          </StyledRow>

          <StyledAreaTitle>{formatMessage(memberContractMessages.label.note)}</StyledAreaTitle>
          <StyledRow className="mb-3">
            <Col span={24}>
              <Form.Item name="note">
                <Input.TextArea>{note}</Input.TextArea>
              </Form.Item>
            </Col>
          </StyledRow>

          <StyledAreaTitle>{formatMessage(memberContractMessages.label.revenueShare)}</StyledAreaTitle>
          {formatMessage(memberMessages.label.manager)}

          <Form.List name="orderExecutors">
            {(orderExecutors, { add, remove }) => (
              <div>
                {orderExecutors.map(field => (
                  <div key={field.key} className="d-flex align-items-center mb-3">
                    <Form.Item
                      className="mb-0 mr-3"
                      {...field}
                      name={[field.name, 'memberId']}
                      fieldKey={[field.fieldKey, 'memberId']}
                      rules={[{ required: true, message: '請填寫承辦人' }]}
                    >
                      <Select<string>
                        showSearch
                        placeholder="承辦人"
                        style={{ width: '150px' }}
                        optionFilterProp="label"
                      >
                        {xuemiSales?.map(member => (
                          <Select.Option key={member.id} value={member.id} label={`${member.id} ${member.name}`}>
                            {member.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      className="mb-0 mr-3"
                      {...field}
                      name={[field.name, 'ratio']}
                      fieldKey={[field.fieldKey, 'ratio']}
                    >
                      <InputNumber min={0.1} max={1} step={0.1} style={{ width: '60px' }} />
                    </Form.Item>

                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </div>
                ))}

                <Form.Item>
                  <StyledAddButton type="link" onClick={() => add({ ratio: 0.1 })}>
                    <Icon component={() => <PlusIcon />} className="mr-2" />
                    <span>{formatMessage(memberContractMessages.ui.join)}</span>
                  </StyledAddButton>
                </Form.Item>
              </div>
            )}
          </Form.List>
        </Form>

        <StyledAreaTitle>{formatMessage(memberContractMessages.label.proofOfEnrollment)}</StyledAreaTitle>
        <Button icon={<DownloadOutlined />}>
          {formatMessage(memberContractMessages.ui.downloadProofOfEnrollment)}
        </Button>
      </>
    )
  }

  return (
    <AdminModal
      title={formatMessage(memberContractMessages.menu.memberContracts)}
      width={688}
      {...props}
      onOk={
        !isRevoked
          ? () => {
              form.validateFields()
              console.log(form.getFieldValue([]))
            }
          : undefined
      }
    >
      <div className="row mb-4">
        <div className="col-4 row">
          <div className="col-12 mb-4">
            <StyledAreaTitle>{formatMessage(memberMessages.label.target)}</StyledAreaTitle>
            <StyledAreaTitle>{member?.name}</StyledAreaTitle>
            <StyledSubText className="mb-1">{member?.email}</StyledSubText>
            {member?.phone.split(',').map(v => (
              <StyledSubText>{v}</StyledSubText>
            ))}
          </div>
          <div className="col-12">
            <StyledAreaTitle>{formatMessage(memberContractMessages.label.memberContractId)}</StyledAreaTitle>
            <StyledAreaTitle>{memberContractId?.split('-')[0]}</StyledAreaTitle>
          </div>
        </div>
        <div className="col-8">
          <StyledAreaTitle>{formatMessage(memberContractMessages.label.purchasedItem)}</StyledAreaTitle>
          <StyledText className="mb-2">
            {formatMessage(memberContractMessages.label.product)}：{purchasedItem.projectPlanName}
          </StyledText>
          <StyledText className="mb-2">
            <span className="mr-3">
              {formatMessage(commonMessages.label.funds)}：{purchasedItem.price}
            </span>
            <span className="mr-3">
              {formatMessage(memberContractMessages.label.coins)} ：{purchasedItem.coinAmount}
            </span>
            <span>
              {formatMessage(memberContractMessages.label.appointment)}：{purchasedItem.couponCount}
            </span>
          </StyledText>
          {purchasedItem.appointmentCreatorName && (
            <StyledText className="mb-2">
              {formatMessage(memberContractMessages.label.appointmentCreator)}：{purchasedItem.appointmentCreatorName}
            </StyledText>
          )}
          <StyledText className="mb-2">
            {formatMessage(memberContractMessages.label.referralMember)}：{purchasedItem.referral?.name}(
            {purchasedItem.referral?.email})
          </StyledText>
          <StyledText className="mb-2">
            {formatMessage(memberContractMessages.label.servicePeriod)}：
            {`${moment(purchasedItem.startedAt).format('YYYY-MM-DD HH:MM')} ~ ${moment(purchasedItem.endedAt).format(
              'YYYY-MM-DD HH:MM',
            )}`}
          </StyledText>
        </div>
      </div>
      {sheet}
    </AdminModal>
  )
}

export default MemberContractModal
