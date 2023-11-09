import Icon, { MinusCircleOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Col, DatePicker, Form, Input, InputNumber, Row, Select } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment, { Moment } from 'moment'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import AdminModal, { AdminModalProps } from '../../components/admin/AdminModal'
import FileItem from '../../components/common/FileItem'
import FileUploader from '../../components/common/FileUploader'
import MemberNameLabel from '../../components/common/MemberNameLabel'
import { installmentPlans } from '../../constants'
import { downloadFile, getFileDownloadableLink, handleError, uploadFile } from '../../helpers'
import { commonMessages, memberContractMessages, memberMessages, orderMessages } from '../../helpers/translation'
import { useAppCustom, useManagers, useMutateMemberContract } from '../../hooks'
import { useMutateAttachment, useUploadAttachments } from '../../hooks/data'
import { ReactComponent as ExternalLinkIcon } from '../../images/icon/external-link-square.svg'
import { ReactComponent as PlusIcon } from '../../images/icon/plus.svg'

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
    appointmentCouponCount?: number | null
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
  orderOptions?: {
    recognizePerformance?: number
  }
  orderExecutors: {
    memberId: string
    ratio: number
  }[]
  studentAttachments?: { id: string; data: any; options: any }[] | null
  studentCertification?: string | null
  rebateGift?: string | null
  dealer?: string | null
  onSuccess?: () => void
} & AdminModalProps

const MemberContractModal: React.FC<MemberContractModalProps> = ({
  memberContractId,
  memberId,
  member,
  purchasedItem,
  isRevoked,
  status,
  orderOptions,
  paymentOptions,
  note,
  orderExecutors,
  studentCertification,
  studentAttachments,
  rebateGift,
  dealer,
  onSuccess,
  ...props
}) => {
  const appCustom = useAppCustom()
  const { formatMessage } = useIntl()
  const { authToken, permissions } = useAuth()
  const { id: appId, settings } = useApp()
  const [form] = Form.useForm<{
    approvedAt: Moment | null
    loanCanceledAt: Moment | null
    refundAppliedAt: Moment | null
    paymentMethod: string
    recognizePerformance?: number
    paymentNumber: number
    installmentPlan: typeof installmentPlans[number]
    note: string
    dealer?: string | null
    orderExecutors: {
      memberId: string
      ratio: number
    }[]
  }>()
  const { managers } = useManagers()
  const [certification, setCertification] = useState<File[]>([])
  const [attachments, setAttachments] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [disabledInput, setDisabledInput] = useState({
    approvedAt: false,
    loanCanceledAt: false,
    refundAppliedAt: false,
  })
  const contractDealerOptions: string[] =
    (settings['contract.dealer.options'] && JSON.parse(settings['contract.dealer.options'])) || []

  const uploadAttachments = useUploadAttachments()
  const { deleteAttachments } = useMutateAttachment()
  const updateMemberContract = useMutateMemberContract()
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number
  }>({})

  useEffect(
    () =>
      setDisabledInput({
        approvedAt: !!status.loanCanceledAt,
        loanCanceledAt: !!status.approvedAt,
        refundAppliedAt: !!status.loanCanceledAt || !status.approvedAt,
      }),
    [status.loanCanceledAt, status.approvedAt],
  )

  useEffect(() => {
    setAttachments(studentAttachments?.map(attachment => attachment.data) || [])
  }, [studentAttachments])

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    setUploadProgress({})
    form
      .validateFields()
      .then(() => {
        setIsLoading(true)
        if (certification.length) {
          return uploadFile(`certification/${appId}/student_${memberId}`, certification[0], authToken, {
            onUploadProgress: ({ loaded, total }) => {
              setUploadProgress(prev => ({ ...prev, [certification[0].name]: Math.floor((loaded / total) * 100) }))
            },
          })
        }
      })
      .then(async () => {
        if (!memberContractId) return
        const deletedAttachmentIds =
          studentAttachments
            ?.filter(v =>
              attachments.every(
                attachment => attachment.name !== v.data.name && attachment.lastModified !== v.data.lastModified,
              ),
            )
            .map(v => v.id) || []
        const newAttachments = studentAttachments
          ? attachments.filter(attachment =>
              studentAttachments.every(
                studentAttachment =>
                  attachment.name !== studentAttachment.data?.name &&
                  attachment.lastModified !== studentAttachment.data?.lastModified,
              ),
            )
          : attachments
        if (newAttachments.length || deletedAttachmentIds.length) {
          await deleteAttachments({ variables: { attachmentIds: deletedAttachmentIds } })
          await uploadAttachments('MemberContract', memberContractId, newAttachments, file => ({
            onUploadProgress: ({ loaded, total }) => {
              setUploadProgress(prev => ({ ...prev, [file.name]: Math.floor((loaded / total) * 100) }))
            },
          }))
        }
      })
      .then(() => {
        const {
          approvedAt,
          loanCanceledAt,
          refundAppliedAt,
          recognizePerformance,
          paymentMethod,
          paymentNumber,
          installmentPlan,
          dealer,
          note,
          orderExecutors,
        } = form.getFieldsValue()

        return updateMemberContract({
          variables: {
            memberContractId,
            values: {
              ...(Number(recognizePerformance) >= 0
                ? {
                    orderOptions: {
                      recognizePerformance: Number(recognizePerformance),
                    },
                  }
                : {}),
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
            dealer,
          },
        })
      })
      .then(() => {
        setCertification([])
        setUploadProgress({})
        setVisible(false)
        onSuccess?.()
      })
      .catch(handleError)
      .finally(() => setIsLoading(false))
  }

  const handleDownload = async (fileName: string, downloadableLink: string) => {
    const link = await getFileDownloadableLink(`${downloadableLink}`, authToken)
    return downloadFile(fileName, {
      url: link,
    })
  }

  const calculateRecognizePerformance = () => {
    if (!purchasedItem.price) {
      return null
    }
    const { paymentMethod, installmentPlan } = form.getFieldsValue()

    return (
      purchasedItem.price -
      Math.round(
        purchasedItem.price *
          (appCustom.paymentMethods
            .find(payment => payment.method === paymentMethod)
            ?.feeWithInstallmentPlans.find(
              feeWithInstallmentPlan => feeWithInstallmentPlan.installmentPlan === installmentPlan,
            )?.fee || 0),
      )
    )
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
          <div className="mb-4">
            <StyledAreaTitle>{formatMessage(memberContractMessages.label.proofOfEnrollment)}</StyledAreaTitle>
            <FileItem
              fileName={studentCertification}
              onDownload={() => handleDownload(studentCertification, `certification/${appId}/student_${memberId}`)}
            />
          </div>
        )}
        {studentAttachments?.length && (
          <>
            <StyledAreaTitle>附加檔案</StyledAreaTitle>
            {studentAttachments.map(v => (
              <FileItem fileName={v.data.name} onDownload={() => handleDownload(v.data.name, `attachments/${v.id}`)} />
            ))}
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
                  disabled={!permissions.CONTRACT_APPROVED_AT_EDIT || disabledInput['approvedAt']}
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
                  disabled={!permissions.CONTRACT_CANCELED_AT_EDIT || disabledInput['loanCanceledAt']}
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
                  disabled={!permissions.CONTRACT_REFUND_AT_EDIT || disabledInput['refundAppliedAt']}
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
                <StyledSelect
                  disabled={!permissions.CONTRACT_PAYMENT_METHOD_EDIT}
                  onSelect={() => {
                    const calculatedRecognize = calculateRecognizePerformance()
                    calculatedRecognize && form.setFieldsValue({ recognizePerformance: calculatedRecognize })
                  }}
                >
                  {appCustom.paymentMethods.map(paymentMethod => (
                    <Select.Option key={paymentMethod.method} value={paymentMethod.method}>
                      {paymentMethod.method}
                    </Select.Option>
                  ))}
                </StyledSelect>
              </Form.Item>
            </Col>
            <Col span={5} className="pr-3">
              <span>{formatMessage(memberContractMessages.label.installmentPlan)}</span>
              <Form.Item name="installmentPlan" initialValue={paymentOptions?.installmentPlan}>
                <StyledSelect
                  disabled={!permissions.CONTRACT_INSTALLMENT_PLAN_EDIT}
                  onSelect={() => {
                    const calculatedRecognize = calculateRecognizePerformance()
                    calculatedRecognize && form.setFieldsValue({ recognizePerformance: calculatedRecognize })
                  }}
                >
                  {installmentPlans.map((installmentPlan: number) => (
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
                <Input disabled={!permissions.CONTRACT_PAYMENT_NUMBER_EDIT} />
              </Form.Item>
            </Col>
            {contractDealerOptions.length > 0 && (
              <Col span={12}>
                <span>經銷單位</span>
                <Form.Item name="dealer" initialValue={dealer || null}>
                  <StyledSelect>
                    {contractDealerOptions.map((v, index) => (
                      <Select.Option key={index} value={v}>
                        {v}
                      </Select.Option>
                    ))}
                  </StyledSelect>
                </Form.Item>
              </Col>
            )}
          </StyledRow>
          <StyledAreaTitle>{formatMessage(memberContractMessages.label.note)}</StyledAreaTitle>
          <StyledRow className="mb-3">
            <Col span={24}>
              <Form.Item name="note" initialValue={note}>
                <Input.TextArea disabled={!permissions.CONTRACT_NOTE_EDIT}>{note}</Input.TextArea>
              </Form.Item>
            </Col>
          </StyledRow>
          <StyledAreaTitle className="mb-3">{formatMessage(memberContractMessages.label.revenueShare)}</StyledAreaTitle>
          {formatMessage(memberContractMessages.label.recognizePerformance)}
          <Form.Item name="recognizePerformance" initialValue={orderOptions?.recognizePerformance}>
            <InputNumber
              style={{ width: '150px' }}
              min={0}
              disabled={!orderOptions?.recognizePerformance || !permissions.CONTRACT_RECOGNIZE_PERFORMANCE_EDIT}
              formatter={value => `NT$ ${value}`}
              parser={value => value?.replace(/\D/g, '') || ''}
            />
          </Form.Item>
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
                        disabled={!permissions.CONTRACT_REVENUE_SHARING_EDIT}
                      >
                        {managers?.map(manager => (
                          <Select.Option key={manager.id} value={manager.id} label={`${manager.id} ${manager.name}`}>
                            {manager.name}
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
                        disabled={!permissions.CONTRACT_REVENUE_SHARING_EDIT}
                        min={0.1}
                        max={1}
                        step={0.1}
                        style={{ width: '60px' }}
                      />
                    </Form.Item>

                    {!!permissions.CONTRACT_REVENUE_SHARING_EDIT && (
                      <MinusCircleOutlined className="mb-3" onClick={() => remove(field.name)} />
                    )}
                  </div>
                ))}

                <Form.Item>
                  <StyledAddButton
                    disabled={!permissions.CONTRACT_REVENUE_SHARING_EDIT}
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
          <div className="mb-2">
            <StyledAreaTitle>{formatMessage(memberContractMessages.label.proofOfEnrollment)}</StyledAreaTitle>

            {permissions.CONTRACT_ATTACHMENT_EDIT && (
              <FileUploader
                showUploadList
                fileList={certification}
                onChange={files => setCertification(files)}
                uploadProgress={uploadProgress}
                renderTrigger={({ onClick }) => (
                  <Button icon={<UploadOutlined />} onClick={onClick}>
                    {formatMessage(memberContractMessages.ui.reupload)}
                  </Button>
                )}
              />
            )}

            {!certification.length && (
              <FileItem
                fileName={studentCertification}
                onDownload={() => handleDownload(studentCertification, `certification/${appId}/student_${memberId}`)}
              />
            )}
          </div>
        )}
        <StyledAreaTitle>附加檔案</StyledAreaTitle>
        {permissions.CONTRACT_ATTACHMENT_EDIT ? (
          <FileUploader
            multiple
            showUploadList
            fileList={attachments}
            onChange={files => setAttachments(files)}
            uploadProgress={uploadProgress}
            downloadableLink={file => {
              const attachmentId = studentAttachments?.find(v => v.data.name === file.name && v.data.lastModified)?.id
              return `attachments/${attachmentId}`
            }}
            renderTrigger={({ onClick }) => (
              <Button icon={<UploadOutlined />} onClick={onClick}>
                {formatMessage(commonMessages.ui.uploadFile)}
              </Button>
            )}
          />
        ) : (
          <>
            {studentAttachments?.map(attachment => (
              <FileItem
                fileName={attachment.data.name}
                onDownload={() => handleDownload(attachment.data.name, `attachments/${attachment.id}`)}
              />
            ))}
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
              <Link to={`/members/${memberId}`} target="_blank">
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
              {formatMessage(memberContractMessages.label.appointment)}：{purchasedItem.appointmentCouponCount}
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
          {rebateGift && (
            <StyledText className="mb-2">
              {formatMessage(memberContractMessages.label.rebateGift)}： {rebateGift?.split('-').slice(1).join('-')}
            </StyledText>
          )}
        </div>
      </div>
      {sheet}
    </AdminModal>
  )
}

export default MemberContractModal
