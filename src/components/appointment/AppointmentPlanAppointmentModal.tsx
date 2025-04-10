import { Button, Divider, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios from 'axios'
import PriceLabel from 'lodestar-app-element/src/components/labels/PriceLabel'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import dayjs from 'dayjs'
import { groupBy, sum } from 'ramda'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { dateRangeFormatter, handleError } from '../../helpers'
import { appointmentMessages, commonMessages, errorMessages } from '../../helpers/translation'
import { useAppointmentPlanAdmin } from '../../hooks/appointment'
import { useCheck } from '../../hooks/checkout'
import { useService } from '../../hooks/service'
import DefaultAvatar from '../../images/default/avatar.svg'
import { ReactComponent as StatusAlertIcon } from '../../images/default/status-alert.svg'
import { ReactComponent as StatusSuccessIcon } from '../../images/default/status-success.svg'
import { AppointmentPeriod, AppointmentPlanAdmin } from '../../types/appointment'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import DiscountSelectionCard from '../checkout/DiscountSelectionCard'
import { CustomRatioImage } from '../common/Image'
import { AllMemberSelector } from '../form/MemberSelector'
import AppointmentPeriodItem from './AppointmentPeriodItem'

const messages = defineMessages({
  periodDurationAtMost: { id: 'appointment.text.periodDurationAtMost', defaultMessage: '諮詢一次 {duration} 分鐘為限' },
  makeAppointment: { id: 'appointment.ui.makeAppointment', defaultMessage: '預約諮詢' },
  phonePlaceholder: { id: 'appointment.text.phonePlaceholder', defaultMessage: '填寫手機以便發送簡訊通知' },
  selectDiscount: { id: 'appointment.label.selectDiscount', defaultMessage: '使用折扣' },
  contactInformation: { id: 'appointment.label.contactInformation', defaultMessage: '聯絡資訊' },
  reschedule: { id: 'appointment.text.reschedule', defaultMessage: '請再重新預約一次' },
  appointmentSuccessfully: { id: 'appointment.event.appointmentSuccessfully', defaultMessage: '預約成功' },
  checkMemberPage: { id: 'appointment.ui.checkMemberPage', defaultMessage: '查看學員主頁' },
  selectMember: { id: 'appointment.label.selectMember', defaultMessage: '選擇學生' },
  appointmentFailed: { id: 'appointment.event.appointmentFailed', defaultMessage: '預約失敗' },
})

const StyledButton = styled(Button)`
  width: 100%;
`
const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-bottom: 2rem;
`
const StyledTitle = styled.div`
  margin-bottom: 1.5rem;
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledSubTitle = styled.div<{ isCenter?: boolean }>`
  color: var(--gray-darker);
  font-weight: bold;
  text-align: ${props => (props.isCenter ? 'center' : 'left')};
`
const StyledPlanTitle = styled.div`
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
`
const StyledPeriodTitle = styled.div`
  margin-bottom: 1.5rem;
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledPeriod = styled.div<{ variant?: 'editable' }>`
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.theme['@primary-color']};
  margin-bottom: 25px;
  span {
    ${props => props.variant === 'editable' && 'cursor: pointer;'}
  }
`
const StyledMeta = styled.div`
  color: var(--gray-dark);
  font-size: 12px;
`
const StyledStatusBlock = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`
const StyledAppointmentInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`

type FieldProps = {
  phone: string
  memberId: string
}

const AppointmentPlanPeriodStepBlock: React.VFC<{
  periods: (Pick<AppointmentPeriod, 'appointmentPlanId' | 'appointmentScheduleId' | 'startedAt' | 'endedAt'> & {
    isEnrolled?: boolean
    isExcluded?: boolean
    targetMemberBooked?: boolean
    appointmentScheduleCreatedAt: Date
  })[]
  appointmentPlanAdmin: AppointmentPlanAdmin
  services: { id: string; gateway: string }[]
  loadingServices: boolean
  handlePeriodSubmit: (startedAt: Date, endedAt: Date) => void
}> = ({ periods, appointmentPlanAdmin, services, loadingServices, handlePeriodSubmit }) => {
  return (
    <div key={moment(periods[0].startedAt).format('YYYY-MM-DD(dd)')}>
      <StyledPeriodTitle>
        {periods.length > 0 && moment(periods[0].startedAt).format('YYYY-MM-DD(dd)')}
      </StyledPeriodTitle>
      <StyledWrapper>
        {Object.values(groupBy(period => dayjs(period.startedAt).format('YYYY-MM-DDTHH:mm:00Z'), periods))
          .map(periods =>
            periods?.sort(
              (a, b) => a.appointmentScheduleCreatedAt.getTime() - b.appointmentScheduleCreatedAt.getTime(),
            ),
          )
          .map(periods => periods?.[0] || null)
          .map((period, index) => (
            <AppointmentPeriodItem
              key={`${period?.appointmentPlanId}-${index}`}
              creatorId={appointmentPlanAdmin.creatorId}
              appointmentPlan={{
                id: appointmentPlanAdmin.id,
                capacity: appointmentPlanAdmin.capacity,
                defaultMeetGateway: appointmentPlanAdmin.defaultMeetGateway,
              }}
              period={{
                startedAt: period?.startedAt || null,
                endedAt: period?.endedAt || null,
              }}
              services={services}
              loadingServices={loadingServices}
              isPeriodExcluded={period?.isExcluded}
              isEnrolled={period?.targetMemberBooked}
              onClick={() =>
                !period?.targetMemberBooked && period?.startedAt && period?.endedAt
                  ? handlePeriodSubmit(period.startedAt, period.endedAt)
                  : null
              }
            />
          ))}
      </StyledWrapper>
    </div>
  )
}

const AppointmentPlanAppointmentModal: React.FC<
  AdminModalProps & {
    appointmentPlanId: string
    creator: {
      id: string
      name: string
      abstract: string | null
      avatarUrl?: string | null
    }
    onSuccess?: () => void
    setModalVisible: React.Dispatch<React.SetStateAction<boolean>>
  }
> = ({ appointmentPlanId, creator, onSuccess, setModalVisible, ...props }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { host, settings } = useApp()
  const { authToken } = useAuth()

  const [appointmentStep, setAppointmentStep] = useState<'period' | 'member' | 'discount' | 'success' | 'failed'>(
    'period',
  )
  const [appointmentValues, setAppointmentValues] = useState<{
    member: {
      id: string | null
      name: string | null
      email: string | null
    } | null
    period: { startedAt: Date | null; endedAt: Date | null }
    discountId: string | null
  }>({
    period: { startedAt: null, endedAt: null },
    member: null,
    discountId: null,
  })
  const [loading, setLoading] = useState(false)
  const [successTimestamp, setSuccessTimestamp] = useState<Date | null>(null)

  const { loading: loadingServices, services } = useService()
  const { orderChecking, check, orderPlacing } = useCheck(
    [`AppointmentPlan_${appointmentPlanId}`],
    appointmentValues.discountId && appointmentValues.discountId.split('_')[1] ? appointmentValues.discountId : 'Coin',
    appointmentValues.member?.id || null,
    null,
    {
      [`AppointmentPlan_${appointmentPlanId}`]: { startedAt: appointmentValues.period.startedAt },
    },
  )
  const { loadingAppointmentPlanAdmin, appointmentPlanAdmin } = useAppointmentPlanAdmin(
    appointmentPlanId,
    appointmentValues.member?.id || undefined,
  )

  const isPaymentAvailable =
    !orderChecking &&
    sum(check.orderProducts.map(orderProduct => orderProduct.price)) ===
      sum(check.orderDiscounts.map(orderDiscount => orderDiscount.price))

  const resetModal = () => {
    form.resetFields()
    setAppointmentStep('period')
    setAppointmentValues({
      period: { startedAt: null, endedAt: null },
      member: null,
      discountId: null,
    })
  }

  const handleMemberSubmit = () => {
    if (!appointmentValues.member || !appointmentValues.member.id) {
      return
    }
    setAppointmentStep('discount')
  }
  const handlePeriodSubmit = (startedAt: Date, endedAt: Date) => {
    setAppointmentValues(values => ({ ...values, period: { startedAt, endedAt } }))
    setAppointmentStep('member')
  }
  const handleAppointmentSubmit = async () => {
    const values = await form.validateFields(['phone']).catch(() => {})
    if (!values) {
      return
    }
    setLoading(true)
    await axios
      .post(
        `${process.env.REACT_APP_API_BASE_ROOT}/order/create`,
        {
          paymentModel: { type: 'perpetual' },
          discountId:
            appointmentValues.discountId && appointmentValues.discountId.split('_')[1]
              ? appointmentValues.discountId
              : 'Coin',
          productIds: [`AppointmentPlan_${appointmentPlanId}`],
          invoice: {
            name: appointmentValues.member?.name || '',
            phone: values.phone,
            email: appointmentValues.member?.email || '',
          },
          memberId: appointmentValues.member?.id,
          options: {
            [`AppointmentPlan_${appointmentPlanId}`]: { startedAt: appointmentValues.period.startedAt },
          },
        },
        {
          headers: { authorization: `Bearer ${authToken}` },
        },
      )
      .then(res => {
        if (res.data.code.split('_')[0] === 'E') {
          message.error('預約失敗')
        } else {
          message.success('預約成功')
          onSuccess?.()
          setAppointmentStep('success')
          setSuccessTimestamp(new Date())
        }
      })
      .catch(error => {
        handleError(error)
        setAppointmentStep('failed')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const periodCollections = groupBy(
    period => moment(period.startedAt).format('YYYYMMDD'),
    appointmentPlanAdmin?.periods || [],
  )

  return (
    <AdminModal
      footer={null}
      onCancel={() => {
        setModalVisible(false)
        resetModal()
      }}
      {...props}
    >
      {loadingAppointmentPlanAdmin || !appointmentPlanAdmin ? (
        <Skeleton active />
      ) : (
        <Form form={form} layout="vertical" colon={false}>
          {appointmentStep === 'member' && (
            <>
              <StyledTitle>{formatMessage(commonMessages.product.appointmentPlan)}</StyledTitle>
              <Form.Item label={formatMessage(messages.selectMember)} name="memberId" required>
                <AllMemberSelector
                  onSelect={(value, option) => {
                    setAppointmentValues(values => ({
                      ...values,
                      member: {
                        id: value,
                        name: option?.title || null,
                        email: option?.['data-email'] || null,
                      },
                    }))
                  }}
                />
              </Form.Item>
              <div className="text-right">
                <div>
                  <Button className="mr-2" onClick={() => resetModal()}>
                    {formatMessage(commonMessages.ui.previousStep)}
                  </Button>
                  <Button type="primary" onClick={handleMemberSubmit}>
                    {formatMessage(commonMessages.ui.nextStep)}
                  </Button>
                </div>
              </div>
            </>
          )}
          {(appointmentStep === 'period' || appointmentStep === 'discount') && (
            <>
              <div className="d-flex align-self-start mb-4">
                <div className="flex-shrink-0">
                  <CustomRatioImage
                    width="5rem"
                    ratio={1}
                    src={creator.avatarUrl || DefaultAvatar}
                    shape="circle"
                    className="mr-3"
                  />
                </div>
                <div className="flex-grow-1">
                  <StyledTitle className="mb-1">{creator.name}</StyledTitle>
                  <div className="mb-1">{creator.abstract}</div>
                  <StyledMeta>
                    {formatMessage(messages.periodDurationAtMost, { duration: appointmentPlanAdmin.duration })}
                  </StyledMeta>
                </div>
              </div>
              <StyledPlanTitle className="d-flex align-items-center justify-content-between">
                <div>{appointmentPlanAdmin.title}</div>
                <PriceLabel
                  listPrice={appointmentPlanAdmin.price}
                  currencyId={appointmentPlanAdmin.currencyId}
                  coinUnit={settings['coin_unit']}
                />
              </StyledPlanTitle>
              <Divider className="my-3" />
              {appointmentStep === 'period' &&
                Object.values(periodCollections).map(periods =>
                  periods ? (
                    <AppointmentPlanPeriodStepBlock
                      periods={periods}
                      appointmentPlanAdmin={appointmentPlanAdmin}
                      services={services}
                      loadingServices={loadingServices}
                      handlePeriodSubmit={handlePeriodSubmit}
                    />
                  ) : null,
                )}
              {appointmentStep === 'discount' && (
                <>
                  <StyledPeriod variant="editable">
                    <span onClick={() => resetModal()}>
                      {appointmentValues.period.startedAt &&
                        appointmentValues.period.endedAt &&
                        dateRangeFormatter({
                          startedAt: appointmentValues.period.startedAt,
                          endedAt: appointmentValues.period.endedAt,
                        })}
                    </span>
                  </StyledPeriod>
                  <div className="mb-3">
                    <StyledSubTitle>{formatMessage(messages.selectDiscount)}</StyledSubTitle>
                    <DiscountSelectionCard
                      memberId={appointmentValues.member?.id}
                      check={check}
                      value={appointmentValues.discountId}
                      onChange={discountId => {
                        setAppointmentValues(values => ({ ...values, discountId }))
                      }}
                      withAddDiscount={false}
                    />
                  </div>
                  <StyledSubTitle className="mb-3">{formatMessage(messages.contactInformation)}</StyledSubTitle>
                  <Form.Item
                    name="phone"
                    label={formatMessage(commonMessages.label.phone)}
                    rules={[
                      {
                        required: true,
                        message: formatMessage(errorMessages.form.isRequired, {
                          field: formatMessage(commonMessages.label.phone),
                        }),
                      },
                    ]}
                    className="mb-3"
                  >
                    <Input placeholder={formatMessage(messages.phonePlaceholder)} />
                  </Form.Item>
                  <StyledButton
                    type="primary"
                    onClick={handleAppointmentSubmit}
                    disabled={orderChecking || !isPaymentAvailable}
                    loading={orderChecking || orderPlacing || loading}
                  >
                    {formatMessage(messages.makeAppointment)}
                  </StyledButton>
                </>
              )}
            </>
          )}
          {appointmentStep === 'success' && (
            <div>
              <StyledStatusBlock>
                <StatusSuccessIcon />
                <StyledTitle className="mb-1">{formatMessage(messages.appointmentSuccessfully)}</StyledTitle>
              </StyledStatusBlock>
              <Divider className="my-3" />
              <div>
                <StyledSubTitle isCenter>{appointmentPlanAdmin.title}</StyledSubTitle>
                <StyledPeriod>
                  {appointmentValues.period.startedAt &&
                    appointmentValues.period.endedAt &&
                    dateRangeFormatter({
                      startedAt: appointmentValues.period.startedAt,
                      endedAt: appointmentValues.period.endedAt,
                    })}
                </StyledPeriod>
                <StyledAppointmentInfo>
                  <div>{formatMessage(appointmentMessages.label.creator)}</div>
                  <div>{creator.name}</div>
                </StyledAppointmentInfo>
                <StyledAppointmentInfo>
                  <div>{formatMessage(appointmentMessages.label.member)}</div>
                  <div>{appointmentValues.member?.name}</div>
                </StyledAppointmentInfo>
                <StyledAppointmentInfo>
                  <div>
                    {formatMessage(appointmentMessages.label.member)}
                    {formatMessage(commonMessages.label.email)}
                  </div>
                  <div>{appointmentValues.member?.email}</div>
                </StyledAppointmentInfo>
                <StyledAppointmentInfo>
                  <div>
                    {formatMessage(appointmentMessages.label.member)}
                    {formatMessage(commonMessages.label.phone)}
                  </div>
                  <div>{form.getFieldValue('phone')}</div>
                </StyledAppointmentInfo>
                <StyledAppointmentInfo>
                  <div>{formatMessage(commonMessages.label.orderLogPaymentDate)}</div>
                  <div>{moment(successTimestamp).format('YYYY-MM-DD HH:mm:ss')}</div>
                </StyledAppointmentInfo>
              </div>
              <StyledButton
                type="primary"
                onClick={() => {
                  window.open(`//${host}/members/${appointmentValues.member?.id}`)
                }}
              >
                {formatMessage(messages.checkMemberPage)}
              </StyledButton>
            </div>
          )}
          {appointmentStep === 'failed' && (
            <StyledStatusBlock>
              <div className="d-flex justify-content-center mb-2">
                <StatusAlertIcon />
              </div>
              <StyledTitle className="mb-1">{formatMessage(messages.appointmentFailed)}</StyledTitle>
              <div>{formatMessage(messages.reschedule)}</div>
            </StyledStatusBlock>
          )}
        </Form>
      )}
    </AdminModal>
  )
}

export default AppointmentPlanAppointmentModal
