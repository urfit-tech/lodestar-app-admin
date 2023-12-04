import { CheckCircleTwoTone } from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { Divider, Flex, SkeletonText } from '@chakra-ui/react'
import { Button, message } from 'antd'
import axios from 'axios'
import dayjs from 'dayjs'
import { CommonTitleMixin, MultiLineTruncationMixin } from 'lodestar-app-element/src/components/common'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import { groupBy } from 'ramda'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { dateRangeFormatter } from '../../helpers'
import { useAppointmentPlanAdmin } from '../../hooks/appointment'
import { useService } from '../../hooks/service'
import DefaultAvatar from '../../images/default/avatar.svg'
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
    appointmentPlanId: string
    memberId: string
    creator: { id: string; name: string; avatarUrl: string | null }
    onRescheduleModalVisible: (status: boolean) => void
    onRefetch?: () => void
  }
> = ({
  orderProductId,
  onRefetch,
  creator,
  appointmentPlanId,
  memberId,
  onRescheduleModalVisible,
  visible: rescheduleModalVisible,
}) => {
  const { formatMessage } = useIntl()
  const { authToken } = useAuth()
  const { loading: loadingServices, services } = useService()
  const {
    loadingAppointmentPlanAdmin: loadingAppointmentPlan,
    appointmentPlanAdmin: appointmentPlan,
    refetchAppointmentPlanAdmin: refetchAppointmentPlan,
  } = useAppointmentPlanAdmin(appointmentPlanId, memberId)
  const { orderProduct, refetchOrderProduct } = useOrderProduct(orderProductId)
  const [loading, setLoading] = useState(false)
  const [rescheduleAppointment, setRescheduleAppointment] = useState<{
    status: 'period' | 'confirm' | 'result'
    periodStartedAt: Date | null
    periodEndedAt: Date | null
  }>({
    status: 'period',
    periodStartedAt: null,
    periodEndedAt: null,
  })

  const handleReschedule = async () => {
    setLoading(true)

    await axios
      .post(
        `${process.env.REACT_APP_API_BASE_ROOT}/product/${orderProductId}/reschedule`,
        {
          meetId: orderProduct.options?.['meetId'],
          memberId,
          appointmentPlanId,
          startedAt: rescheduleAppointment.periodStartedAt,
          endedAt: rescheduleAppointment.periodEndedAt,
        },
        {
          headers: { authorization: `Bearer ${authToken}` },
        },
      )
      .then(() => {
        setRescheduleAppointment({
          status: 'result',
          periodStartedAt: null,
          periodEndedAt: null,
        })
        onRefetch?.()
        refetchAppointmentPlan()
        refetchOrderProduct()
      })
      .catch(error => {
        message.error(`更換時段失敗 ,${error}`)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleCancel = () => {
    setRescheduleAppointment({
      status: 'period',
      periodStartedAt: null,
      periodEndedAt: null,
    })
    onRescheduleModalVisible(false)
  }

  const periodCollections = appointmentPlan
    ? groupBy(
        period => dayjs(period.startedAt).format('YYYYMMDD'),
        appointmentPlan?.periods.filter(v =>
          appointmentPlan?.reservationType &&
          appointmentPlan?.reservationAmount &&
          appointmentPlan?.reservationAmount !== 0
            ? dayjs(v.startedAt)
                .subtract(appointmentPlan?.reservationAmount, appointmentPlan?.reservationType)
                .toDate() > dayjs().toDate()
            : v,
        ),
      )
    : []

  return (
    <>
      <AdminModal
        width={384}
        centered
        footer={null}
        visible={rescheduleModalVisible && rescheduleAppointment.status === 'period'}
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
            {!loadingAppointmentPlan && appointmentPlan ? (
              <StyledMeta>
                {formatMessage(appointmentMessages.AppointmentPeriodCard.periodDurationAtMost, {
                  duration: appointmentPlan.duration,
                })}
              </StyledMeta>
            ) : null}
          </div>
        </div>
        {!loadingAppointmentPlan && appointmentPlan ? (
          <StyledModalTitle className="mb-4">
            {formatMessage(appointmentMessages.AppointmentPeriodCard.rescheduleAppointmentPlanTitle, {
              title: appointmentPlan.title,
            })}
          </StyledModalTitle>
        ) : null}
        <Divider margin="24px 0px" />
        {loadingAppointmentPlan && !appointmentPlan ? (
          <SkeletonText noOfLines={1} spacing="4" w="90px" />
        ) : !appointmentPlan || periodCollections.length === 0 ? (
          <StyledInfo>
            {formatMessage(appointmentMessages.AppointmentPeriodCard.notRescheduleAppointmentPeriod)}
          </StyledInfo>
        ) : (
          <>
            {Object.values(periodCollections).map(periods => {
              return (
                <>
                  <StyledScheduleTitle>{moment(periods[0].startedAt).format('YYYY-MM-DD(dd)')}</StyledScheduleTitle>
                  <Flex alignItems="center" justifyContent="flex-start" flexWrap="wrap" mb="2rem">
                    {Object.values(groupBy(period => dayjs(period.startedAt).format('YYYY-MM-DDTHH:mm:00Z'), periods))
                      .map(periods =>
                        periods.sort(
                          (a, b) => a.appointmentScheduleCreatedAt.getTime() - b.appointmentScheduleCreatedAt.getTime(),
                        ),
                      )
                      .map(periods => periods[0])
                      .map((period, index) => (
                        <div key={`${period.appointmentPlanId}-${index}`}>
                          <AppointmentPeriodItem
                            creatorId={appointmentPlan.creatorId}
                            appointmentPlan={{
                              id: appointmentPlan.id,
                              capacity: appointmentPlan.capacity,
                              defaultMeetGateway: appointmentPlan.defaultMeetGateway,
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
                                  status: 'confirm',
                                  periodStartedAt: period.startedAt,
                                  periodEndedAt: period.endedAt,
                                })
                              }
                            }}
                          />
                        </div>
                      ))}
                  </Flex>
                </>
              )
            })}
          </>
        )}
      </AdminModal>

      <AdminModal
        width={384}
        centered
        footer={null}
        onCancel={handleCancel}
        visible={rescheduleModalVisible && rescheduleAppointment.status === 'confirm'}
        renderFooter={() => (
          <>
            <Button
              className="mr-2"
              block
              onClick={() =>
                setRescheduleAppointment({
                  status: 'period',
                  periodEndedAt: null,
                  periodStartedAt: null,
                })
              }
            >
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
            {!loadingAppointmentPlan && appointmentPlan ? (
              <StyledMeta>
                {formatMessage(appointmentMessages.AppointmentPeriodCard.periodDurationAtMost, {
                  duration: appointmentPlan.duration,
                })}
              </StyledMeta>
            ) : null}
          </div>
        </div>
        {!loadingAppointmentPlan && appointmentPlan ? (
          <StyledModalTitle className="mb-4">
            {formatMessage(appointmentMessages.AppointmentPeriodCard.rescheduleAppointmentPlanTitle, {
              title: appointmentPlan.title,
            })}
          </StyledModalTitle>
        ) : null}
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
        visible={rescheduleModalVisible && rescheduleAppointment.status === 'result'}
        bodyStyle={{ textAlign: 'center' }}
        footer={null}
        renderFooter={() => (
          <>
            <Button
              type="primary"
              onClick={() => {
                setRescheduleAppointment({
                  status: 'period',
                  periodStartedAt: null,
                  periodEndedAt: null,
                })
                onRescheduleModalVisible(false)
              }}
              block
            >
              {formatMessage(appointmentMessages.AppointmentPeriodCard.confirm)}
            </Button>
          </>
        )}
        cancelButtonProps={{ style: { display: 'none' } }}
        onCancel={handleCancel}
      >
        <CheckCircleTwoTone className="mb-5" twoToneColor="#4ed1b3" style={{ fontSize: '4rem' }} />
        <StyledModalTitle className="mb-4">
          {formatMessage(appointmentMessages.AppointmentPeriodCard.rescheduleSuccess)}
        </StyledModalTitle>
        {!loadingAppointmentPlan && appointmentPlan ? (
          <StyledInfo>
            {formatMessage(appointmentMessages.AppointmentPeriodCard.rescheduleSuccessAppointmentPlanTitle, {
              title: appointmentPlan.title,
            })}
          </StyledInfo>
        ) : null}
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
