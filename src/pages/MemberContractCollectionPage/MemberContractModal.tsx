import Icon, { DownloadOutlined, MinusCircleOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Col, DatePicker, Form, Input, InputNumber, Row, Select } from 'antd'
import AdminModal, { AdminModalProps } from 'lodestar-app-admin/src/components/admin/AdminModal'
import FileUploader from 'lodestar-app-admin/src/components/common/FileUploader'
import { useApp } from 'lodestar-app-admin/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-admin/src/contexts/AuthContext'
import { downloadFile, getFileDownloadableLink, handleError, uploadFile } from 'lodestar-app-admin/src/helpers'
import { commonMessages, memberMessages, orderMessages } from 'lodestar-app-admin/src/helpers/translation'
import { ReactComponent as ExternalLinkIcon } from 'lodestar-app-admin/src/images/icon/external-link-square.svg'
import moment, { Moment } from 'moment'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import MemberNameLabel from '../../components/common/MemberNameLabel'
import { memberContractMessages } from '../../helpers/translation'
import { useMutateMemberContract, useXuemiSales } from '../../hooks'
import { ReactComponent as PlusIcon } from '../../images/icons/plus.svg'

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
  memberId?: string | null
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
  orderExecutors: {
    memberId: string
    ratio: number
  }[]
  studentCertification?: string | null
  onRefetch: () => void
} & AdminModalProps

const MemberContractModal: React.FC<MemberContractModalProps> = ({
  memberContractId,
  memberId,
  member,
  purchasedItem,
  isRevoked,
  status,
  paymentOptions,
  note,
  orderExecutors,
  studentCertification,
  onRefetch,
  ...props
}) => {
  const { formatMessage } = useIntl()
  const { authToken, apiHost, currentUserRole } = useAuth()
  const { id: appId } = useApp()
  const [form] = Form.useForm<{
    approvedAt: Moment | null
    loanCanceledAt: Moment | null
    refundAppliedAt: Moment | null
    paymentMethod: string
    paymentNumber: number
    installmentPlan: string
    note: string
    orderExecutors: {
      memberId: string
      ratio: number
    }[]
  }>()
  const { xuemiSales } = useXuemiSales()
  const [certification, setCertification] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [disabledInput, setDisabledInput] = useState({
    approvedAt: false,
    loanCanceledAt: false,
    refundAppliedAt: false,
  })
  const updateMemberContract = useMutateMemberContract()

  useEffect(
    () =>
      setDisabledInput({
        approvedAt: !!status.loanCanceledAt,
        loanCanceledAt: !!status.approvedAt,
        refundAppliedAt: !!status.loanCanceledAt || !status.approvedAt,
      }),
    [status.loanCanceledAt, status.approvedAt],
  )

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form
      .validateFields()
      .then(() => {
        setIsLoading(true)
        if (certification.length) {
          return uploadFile(`certification/${appId}/student_${memberId}`, certification[0], authToken, apiHost)
        }
      })
      .then(() => {
        const {
          approvedAt,
          loanCanceledAt,
          refundAppliedAt,
          paymentMethod,
          paymentNumber,
          installmentPlan,
          note,
          orderExecutors,
        } = form.getFieldsValue()

        return updateMemberContract({
          variables: {
            memberContractId,
            values: {
              paymentOptions: {
                paymentMethod,
                paymentNumber,
                installmentPlan,
              },
              orderExecutors: orderExecutors.map(v => ({
                member_id: v.memberId,
                ratio: v.ratio,
              })),
            },
            options: {
              approvedAt: approvedAt?.toDate() || null,
              loanCanceledAt: loanCanceledAt?.toDate() || null,
              refundAppliedAt: refundAppliedAt?.toDate() || null,
              note,
              studentCertification: certification[0]?.name || studentCertification,
            },
          },
        })
      })
      .then(() => {
        setCertification([])
        setVisible(false)
        onRefetch()
      })
      .catch(handleError)
      .finally(() => setIsLoading(false))
  }
  const inputEditPermissions = {
    approvedAt: true,
    loanCanceledAt: true,
    refundAppliedAt: true,
    paymentMethod: currentUserRole === 'general-member' ? false : true,
    paymentNumber: true,
    note: true,
    installmentPlan: currentUserRole === 'general-member' ? false : true,
    orderExecutors: true,
  }
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
          {orderExecutors?.map((v, index) => (
            <div key={index}>
              {v.memberId && <MemberNameLabel memberId={v.memberId} />}
              <span className="ml-2">{v.ratio}</span>
            </div>
          ))}
        </div>

        {studentCertification && (
          <>
            <StyledAreaTitle>{formatMessage(memberContractMessages.label.proofOfEnrollment)}</StyledAreaTitle>
            <Button
              icon={<DownloadOutlined />}
              onClick={async () => {
                try {
                  const link = await getFileDownloadableLink(
                    `certification/${appId}/student_${memberId}`,
                    authToken,
                    apiHost,
                  )
                  await downloadFile(link, studentCertification || '')
                } catch (error) {
                  handleError(error)
                }
              }}
            >
              {formatMessage(memberContractMessages.ui.downloadProofOfEnrollment)}
            </Button>
          </>
        )}
      </>
    )
  } else {
    sheet = (
      <>
        <Form
          form={form}
          colon={false}
          preserve={false}
          onValuesChange={(_, { approvedAt, loanCanceledAt }) => {
            setDisabledInput({
              approvedAt: !!loanCanceledAt,
              loanCanceledAt: !!approvedAt,
              refundAppliedAt: !!loanCanceledAt || !approvedAt,
            })
          }}
        >
          <StyledAreaTitle>{formatMessage(memberMessages.label.status)}</StyledAreaTitle>
          <StyledRow className="mb-3">
            <Col span={8} className="pr-3">
              <span>{formatMessage(memberContractMessages.label.approvedAt)}</span>
              <Form.Item name="approvedAt" initialValue={status.approvedAt ? moment(status.approvedAt) : null}>
                <StyledDatePicker
                  disabled={!inputEditPermissions?.['approvedAt'] || disabledInput['approvedAt']}
                  format={'YYYY-MM-DD'}
                />
              </Form.Item>
            </Col>
            <Col span={8} className="pr-3">
              <span>{formatMessage(memberContractMessages.label.loanCancelAt)}</span>
              <Form.Item
                name="loanCanceledAt"
                initialValue={status.loanCanceledAt ? moment(status.loanCanceledAt) : null}
              >
                <StyledDatePicker
                  disabled={!inputEditPermissions?.['loanCanceledAt'] || disabledInput['loanCanceledAt']}
                  format={'YYYY-MM-DD'}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <span>{formatMessage(memberContractMessages.label.refundApplyAt)}</span>
              <Form.Item
                name="refundAppliedAt"
                initialValue={status.refundAppliedAt ? moment(status.refundAppliedAt) : null}
              >
                <StyledDatePicker
                  disabled={!inputEditPermissions?.['refundAppliedAt'] || disabledInput['refundAppliedAt']}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
          </StyledRow>

          <StyledAreaTitle>{formatMessage(memberContractMessages.label.payment)}</StyledAreaTitle>
          <StyledRow className="mb-3">
            <Col span={8} className="pr-3">
              <span>{formatMessage(memberContractMessages.label.paymentMethod)}</span>
              <Form.Item
                name="paymentMethod"
                rules={[{ required: true, message: '請選擇付款方式' }]}
                initialValue={paymentOptions?.paymentMethod || null}
              >
                <StyledSelect disabled={!inputEditPermissions?.['paymentMethod']}>
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
              <Form.Item name="installmentPlan" initialValue={paymentOptions?.installmentPlan}>
                <StyledSelect disabled={!inputEditPermissions?.['installmentPlan']}>
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
              <Form.Item name="paymentNumber" initialValue={paymentOptions?.paymentNumber}>
                <Input disabled={!inputEditPermissions?.['paymentNumber']} />
              </Form.Item>
            </Col>
          </StyledRow>

          <StyledAreaTitle>{formatMessage(memberContractMessages.label.note)}</StyledAreaTitle>
          <StyledRow className="mb-3">
            <Col span={24}>
              <Form.Item name="note" initialValue={note}>
                <Input.TextArea disabled={!inputEditPermissions?.['note']}>{note}</Input.TextArea>
              </Form.Item>
            </Col>
          </StyledRow>

          <StyledAreaTitle>{formatMessage(memberContractMessages.label.revenueShare)}</StyledAreaTitle>
          {formatMessage(memberMessages.label.manager)}

          <Form.List name="orderExecutors" initialValue={orderExecutors || undefined}>
            {(orderExecutors, { add, remove }) => (
              <div>
                {orderExecutors.map(field => (
                  <div key={field.key} className="d-flex align-items-center">
                    <Form.Item
                      className="mr-3"
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
                        disabled={!inputEditPermissions?.['orderExecutors']}
                      >
                        {xuemiSales?.map(member => (
                          <Select.Option key={member.id} value={member.id} label={`${member.id} ${member.name}`}>
                            {member.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      className="mr-3"
                      {...field}
                      name={[field.name, 'ratio']}
                      fieldKey={[field.fieldKey, 'ratio']}
                    >
                      <InputNumber
                        disabled={!inputEditPermissions?.['orderExecutors']}
                        min={0.1}
                        max={1}
                        step={0.1}
                        style={{ width: '60px' }}
                      />
                    </Form.Item>

                    <MinusCircleOutlined className="mb-3" onClick={() => remove(field.name)} />
                  </div>
                ))}

                <Form.Item>
                  <StyledAddButton
                    disabled={!inputEditPermissions?.['orderExecutors']}
                    type="link"
                    onClick={() => add({ ratio: 0.1 })}
                  >
                    <Icon component={() => <PlusIcon />} className="mr-2" />
                    <span>{formatMessage(memberContractMessages.ui.join)}</span>
                  </StyledAddButton>
                </Form.Item>
              </div>
            )}
          </Form.List>
        </Form>

        {studentCertification && (
          <>
            <StyledAreaTitle>{formatMessage(memberContractMessages.label.proofOfEnrollment)}</StyledAreaTitle>

            <FileUploader
              fileList={certification}
              onChange={files => setCertification(files)}
              showUploadList
              renderTrigger={({ onClick }) => (
                <Button icon={<UploadOutlined />} onClick={onClick}>
                  {formatMessage(memberContractMessages.ui.reupload)}
                </Button>
              )}
            />

            {!certification.length && (
              <>
                <Button
                  className="ml-3"
                  icon={<DownloadOutlined />}
                  onClick={async () => {
                    const link = await getFileDownloadableLink(
                      `certification/${appId}/student_${memberId}`,
                      authToken,
                      apiHost,
                    )
                    downloadFile(link, studentCertification || '')
                  }}
                >
                  {formatMessage(memberContractMessages.ui.downloadProofOfEnrollment)}
                </Button>
                <StyledText className="py-1 px-2">{studentCertification}</StyledText>
              </>
            )}
          </>
        )}
      </>
    )
  }

  return (
    <AdminModal
      title={formatMessage(memberContractMessages.menu.memberContracts)}
      width={688}
      footer={[]}
      renderFooter={
        isRevoked
          ? undefined
          : ({ setVisible }) => {
              return (
                <div className="mt-3">
                  <Button className="mr-2" onClick={() => setVisible(false)}>
                    {formatMessage(commonMessages.ui.cancel)}
                  </Button>
                  <Button type="primary" onClick={() => handleSubmit(setVisible)} loading={isLoading}>
                    {formatMessage(commonMessages.ui.save)}
                  </Button>
                </div>
              )
            }
      }
      {...props}
    >
      <div className="row mb-4">
        <div className="col-4 row">
          <div className="col-12 mb-4">
            <StyledAreaTitle>{formatMessage(memberMessages.label.target)}</StyledAreaTitle>
            <StyledAreaTitle>
              {member?.name}
              <Link to={`/admin/members/${memberId}`} target="_blank">
                <ExternalLinkIcon className="ml-2" />
              </Link>
            </StyledAreaTitle>
            <StyledSubText className="mb-1">{member?.email}</StyledSubText>
            {member?.phone.split(',').map(v => (
              <StyledSubText key={v}>{v}</StyledSubText>
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
            {purchasedItem.referral?.name
              ? `${formatMessage(memberContractMessages.label.referralMember)}：${purchasedItem.referral?.name}(${
                  purchasedItem.referral?.email
                })`
              : null}
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
