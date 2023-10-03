import { CheckCircleTwoTone } from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { Divider, SkeletonText } from '@chakra-ui/react'
import { Button } from 'antd'
import axios from 'axios'
import { CommonTitleMixin, MultiLineTruncationMixin } from 'lodestar-app-element/src/components/common'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { dateRangeFormatter } from '../../helpers'
import { useAppointmentPlanAdmin, useUpdateOrderProductOptions } from '../../hooks/appointment'
import { useService } from '../../hooks/service'
import DefaultAvatar from '../../images/default/avatar.svg'
import { AppointmentPeriodPlanProps } from '../../types/appointment'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import { CustomRatioImage } from '../common/Image'
import { BREAK_POINT } from '../common/Responsive'
import AppointmentPeriodItem from './AppointmentPeriodItem'
import appointmentMessages from './translation'

const StyledModalTitle = styled.div`
  ${CommonTitleMixin}
`

const StyledInfo = styled.div<{ withMask?: boolean }>`
  margin-bottom: 32px;
  ${props => (props.withMask ? 'opacity: 0.2;' : '')}

  @media (min-width: ${BREAK_POINT}px) {
    margin-bottom: 0;
  }
`

const StyledScheduleTitle = styled.h3`
  margin-bottom: 1.25rem;
  display: block;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
`

const StyledMeta = styled.div`
  color: var(--gray-dark);
  font-size: 12px;
`

const StyledTitle = styled.h3`
  ${MultiLineTruncationMixin}
  margin-bottom: 0.75rem;
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
`

export const useOrderProduct = (orderProductId: string) => {
  const { loading, data, refetch } = useQuery<hasura.GetOrderProduct, hasura.GetOrderProductVariables>(
    gql`
      query GetOrderProduct($orderProductId: uuid!) {
        order_product_by_pk(id: $orderProductId) {
          id
          started_at
          ended_at
          deliverables
          options
        }
      }
    `,
    { variables: { orderProductId } },
  )

  const orderProduct: {
    id: string
    startedAt: Date | null
    endedAt: Date | null
    canceledAt: Date | null
    appointmentUrl: string
    appointmentIssue: string | null
    options: any
  } = {
    id: data?.order_product_by_pk?.id,
    startedAt: data?.order_product_by_pk?.started_at ? new Date(data?.order_product_by_pk.started_at) : null,
    endedAt: data?.order_product_by_pk?.ended_at ? new Date(data?.order_product_by_pk.ended_at) : null,
    options: data?.order_product_by_pk?.options,
    canceledAt: data?.order_product_by_pk?.options?.['appointmentCanceledAt']
      ? new Date(data?.order_product_by_pk?.options['appointmentCanceledAt'])
      : null,
    appointmentUrl: data?.order_product_by_pk?.deliverables?.['join_url']
      ? data?.order_product_by_pk?.deliverables['join_url']
      : null,
    appointmentIssue: data?.order_product_by_pk?.options?.['appointmentIssue']
      ? data?.order_product_by_pk?.options['appointmentIssue']
      : null,
  }

  return {
    loading,
    orderProduct,
    refetchOrderProduct: refetch,
  }
}

const AppointmentRescheduleModal: React.VFC<
  AdminModalProps & {
    orderProductId: string
    onRefetch?: () => void
    creator: { id: string; name: string; avatarUrl: string | null }
    appointmentPlan: AppointmentPeriodPlanProps
    memberId: string
    onRescheduleModalVisible: (status: boolean) => void
  }
> = ({ orderProductId, onRefetch, creator, appointmentPlan, memberId, onRescheduleModalVisible, ...props }) => {
  const { formatMessage } = useIntl()
  const { authToken, currentMemberId } = useAuth()
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const { loading: loadingServices, services } = useService()
  const { loadingAppointmentPlanAdmin, appointmentPlanAdmin, refetchAppointmentPlanAdmin } = useAppointmentPlanAdmin(
    appointmentPlan.id,
    memberId,
  )
  const { orderProduct, refetchOrderProduct } = useOrderProduct(orderProductId)
  const updateOrderProductOptions = useUpdateOrderProductOptions(orderProductId, orderProduct.options)
  const [rescheduleAppointment, setRescheduleAppointment] = useState<{
    rescheduleAppointment: boolean
    periodStartedAt: Date | null
    periodEndedAt: Date | null
    appointmentPlanId: string
  }>()

  const handleReschedule = async () => {
    setLoading(true)
    try {
      if (rescheduleAppointment) {
        await updateOrderProductOptions(
          rescheduleAppointment.periodStartedAt,
          rescheduleAppointment.periodEndedAt,
          orderProduct.startedAt,
          currentMemberId || '',
        )
        onRefetch && onRefetch()
        await refetchAppointmentPlanAdmin()
        onRescheduleModalVisible(false)
        handleCancel()
        await refetchOrderProduct()
        setConfirm(true)
        setLoading(false)
        await axios.post(
          `${process.env.REACT_APP_API_BASE_ROOT}/product/${orderProductId}/reschedule`,
          {},
          {
            headers: { authorization: `Bearer ${authToken}` },
          },
        )
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleCancel = () => {
    setRescheduleAppointment({
      rescheduleAppointment: false,
      periodStartedAt: null,
      periodEndedAt: null,
      appointmentPlanId: '',
    })
    onRescheduleModalVisible(true)
  }

  return (
    <>
      <AdminModal width={384} centered footer={null} {...props}>
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
            <StyledMeta>
              {formatMessage(appointmentMessages.AppointmentPeriodCard.periodDurationAtMost, {
                duration: appointmentPlan.duration,
              })}
            </StyledMeta>
          </div>
        </div>
        {!loadingAppointmentPlanAdmin && (
          <StyledModalTitle className="mb-4">
            {formatMessage(appointmentMessages.AppointmentPeriodCard.rescheduleAppointmentPlanTitle, {
              title: appointmentPlan.title,
            })}
          </StyledModalTitle>
        )}
        <Divider margin="24px 0px" />
        {loadingAppointmentPlanAdmin ? (
          <SkeletonText noOfLines={1} spacing="4" w="90px" />
        ) : appointmentPlanAdmin?.periods.length === 0 ? (
          <StyledInfo>
            {formatMessage(appointmentMessages.AppointmentPeriodCard.notRescheduleAppointmentPeriod)}
          </StyledInfo>
        ) : (
          <>
            {appointmentPlanAdmin?.periods.map((period, index) => (
              <div key={`${period.appointmentPlanId}-${index}`}>
                <StyledScheduleTitle>{moment(period.startedAt).format('YYYY-MM-DD(dd)')}</StyledScheduleTitle>
                <AppointmentPeriodItem
                  creatorId={appointmentPlanAdmin.creatorId}
                  appointmentPlan={{
                    id: appointmentPlanAdmin.id,
                    capacity: appointmentPlanAdmin.capacity,
                    defaultMeetGateway: appointmentPlanAdmin.defaultMeetGateway,
                  }}
                  period={{
                    startedAt: period.startedAt,
                    endedAt: period.endedAt,
                  }}
                  services={services}
                  loadingServices={loadingServices}
                  isPeriodExcluded={period.isExcluded}
                  isEnrolled={period.targetMemberBooked}
                  onClick={() => {
                    if (!period.isBookedReachLimit && !period.targetMemberBooked && !period.isExcluded) {
                      setRescheduleAppointment({
                        rescheduleAppointment: true,
                        periodStartedAt: period.startedAt,
                        periodEndedAt: period.endedAt,
                        appointmentPlanId: appointmentPlan.id,
                      })
                      onRescheduleModalVisible(false)
                    }
                  }}
                />
              </div>
            ))}
          </>
        )}
      </AdminModal>

      {/* rescheduleConfirm modal  */}
      <AdminModal
        width={384}
        centered
        footer={null}
        onCancel={handleCancel}
        visible={rescheduleAppointment?.rescheduleAppointment}
        renderFooter={() => (
          <>
            <Button className="mr-2" onClick={handleCancel} block>
              {formatMessage(appointmentMessages.AppointmentPeriodCard.rescheduleCancel)}
            </Button>
            <Button type="primary" loading={loading} onClick={handleReschedule} block className="mt-3">
              {!loading && formatMessage(appointmentMessages.AppointmentPeriodCard.rescheduleConfirm)}
            </Button>
          </>
        )}
      >
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
            <StyledMeta>
              {formatMessage(appointmentMessages.AppointmentPeriodCard.periodDurationAtMost, {
                duration: appointmentPlan.duration,
              })}
            </StyledMeta>
          </div>
        </div>
        {!loadingAppointmentPlanAdmin && (
          <StyledModalTitle className="mb-4">
            {formatMessage(appointmentMessages.AppointmentPeriodCard.rescheduleAppointmentPlanTitle, {
              title: appointmentPlan.title,
            })}
          </StyledModalTitle>
        )}
        <Divider margin="24px 0px" />
        <StyledInfo>{formatMessage(appointmentMessages.AppointmentPeriodCard.rescheduleOriginScheduled)}</StyledInfo>
        <StyledScheduleTitle>
          {orderProduct.startedAt && orderProduct.endedAt ? (
            <span>
              {dateRangeFormatter({
                startedAt: orderProduct.startedAt,
                endedAt: orderProduct.endedAt,
                dateFormat: 'MM/DD(dd)',
              })}
            </span>
          ) : null}
        </StyledScheduleTitle>
        <StyledInfo>{formatMessage(appointmentMessages.AppointmentPeriodCard.rescheduled)}</StyledInfo>
        <StyledScheduleTitle>
          {rescheduleAppointment?.periodStartedAt && rescheduleAppointment?.periodEndedAt ? (
            <span>
              {dateRangeFormatter({
                startedAt: rescheduleAppointment.periodStartedAt,
                endedAt: rescheduleAppointment.periodEndedAt,
                dateFormat: 'MM/DD(dd)',
              })}
            </span>
          ) : null}
        </StyledScheduleTitle>
      </AdminModal>

      <AdminModal
        width={384}
        centered
        visible={confirm}
        bodyStyle={{ textAlign: 'center' }}
        footer={null}
        renderFooter={() => (
          <>
            <Button type="primary" onClick={() => setConfirm(false)} block>
              {formatMessage(appointmentMessages.AppointmentPeriodCard.confirm)}
            </Button>
          </>
        )}
        cancelButtonProps={{ style: { display: 'none' } }}
        onCancel={() => setConfirm(false)}
      >
        <CheckCircleTwoTone className="mb-5" twoToneColor="#4ed1b3" style={{ fontSize: '4rem' }} />
        <StyledModalTitle className="mb-4">
          {formatMessage(appointmentMessages.AppointmentPeriodCard.rescheduleSuccess)}
        </StyledModalTitle>
        <StyledInfo>
          {formatMessage(appointmentMessages.AppointmentPeriodCard.rescheduleSuccessAppointmentPlanTitle, {
            title: appointmentPlan.title,
          })}
        </StyledInfo>
        <StyledScheduleTitle>
          {orderProduct.startedAt && orderProduct.endedAt ? (
            <span>
              {dateRangeFormatter({
                startedAt: orderProduct.startedAt,
                endedAt: orderProduct.endedAt,
                dateFormat: 'MM/DD(dd)',
              })}
            </span>
          ) : null}
        </StyledScheduleTitle>
      </AdminModal>
    </>
  )
}

export default AppointmentRescheduleModal
