import Icon from '@ant-design/icons'
import { useQuery } from '@apollo/client'
import { Skeleton } from 'antd'
import { gql } from '@apollo/client'
import moment from 'moment'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { dateRangeFormatter } from '../../helpers'
import { ReactComponent as CalendarAltOIcon } from '../../images/icon/calendar-alt-o.svg'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import { AvatarImage } from '../common/Image'
import appointmentMessages from './translation'

const StyledModalMetaBlock = styled.div`
  padding: 0.75rem;
  background-color: var(--gray-lighter);
  font-size: 14px;
  border-radius: 4px;
`
const StyledModalMetaTitle = styled.div`
  margin-bottom: 0.75rem;
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.4px;
`
const StyledTitle = styled.div`
  margin-bottom: 0.75rem;
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledMeta = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  letter-spacing: 0.4px;
`

const AppointmentDetailModal: React.VFC<
  AdminModalProps & {
    avatarUrl: string | null
    appointmentEnrollmentId: string
    member: { name: string; email: string | null; phone: string | null }
    startedAt: Date
    endedAt: Date
  }
> = ({ avatarUrl, member, startedAt, endedAt, appointmentEnrollmentId, ...props }) => {
  const { formatMessage } = useIntl()
  const { loading, error, appointmentEnrollmentDetail } = useAppointmentEnrollmentDetail(appointmentEnrollmentId)

  return (
    <>
      <AdminModal footer={null} width={312} destroyOnClose centered {...props}>
        <div className="text-center mb-4">
          <AvatarImage size="72px" src={avatarUrl} className="mx-auto mb-3" />
          <StyledTitle>{member.name}</StyledTitle>
          <StyledMeta>
            <Icon component={() => <CalendarAltOIcon />} className="mr-1" />
            <span>{dateRangeFormatter({ startedAt, endedAt, dateFormat: 'MM/DD(dd)' })}</span>
          </StyledMeta>
        </div>
        {loading ? (
          <Skeleton active />
        ) : error ? (
          <div className="d-flex justify-content-center">{formatMessage(appointmentMessages['*'].fetchDataError)}</div>
        ) : (
          <>
            {member.email && (
              <StyledMeta className="d-flex justify-content-between mb-3">
                <div>{formatMessage(appointmentMessages.AppointmentDetailModal.email)}</div>
                <div>{member.email}</div>
              </StyledMeta>
            )}
            {member.phone && (
              <StyledMeta className="d-flex justify-content-between mb-3">
                <div>{formatMessage(appointmentMessages.AppointmentDetailModal.phone)}</div>
                <div>{member.phone}</div>
              </StyledMeta>
            )}
            {appointmentEnrollmentDetail.orderLog?.createdAt && (
              <StyledMeta className="d-flex justify-content-between mb-3">
                <div>{formatMessage(appointmentMessages.AppointmentDetailModal.orderUpdatedTime)}</div>
                <div>
                  {moment(
                    appointmentEnrollmentDetail.orderLog?.updatedAt || appointmentEnrollmentDetail.orderLog?.createdAt,
                  ).format('YYYY-MM-DD HH:mm')}
                </div>
              </StyledMeta>
            )}
            {appointmentEnrollmentDetail.options?.appointmentCanceledReason && (
              <StyledModalMetaBlock>
                <StyledModalMetaTitle>
                  {formatMessage(appointmentMessages.AppointmentDetailModal.canceledReason)}
                </StyledModalMetaTitle>
                {appointmentEnrollmentDetail.options.appointmentCanceledReason}
              </StyledModalMetaBlock>
            )}
          </>
        )}
      </AdminModal>
    </>
  )
}

const useAppointmentEnrollmentDetail = (id: string) => {
  const { loading, data, error } = useQuery<
    hasura.GET_APPOINTMENT_ENROLLMENT_DETAIL,
    hasura.GET_APPOINTMENT_ENROLLMENT_DETAILVariables
  >(
    gql`
      query GET_APPOINTMENT_ENROLLMENT_DETAIL($id: uuid!) {
        appointment_enrollment(where: { id: { _eq: $id } }) {
          id
          order_product {
            id
            options
            order_log {
              id
              created_at
              updated_at
            }
          }
        }
      }
    `,
    { variables: { id } },
  )
  const appointmentEnrollmentDetail: {
    id: string
    options: any
    orderLog?: {
      createdAt: Date | null
      updatedAt: Date | null
    }
  } = {
    id: data?.appointment_enrollment[0] ? data?.appointment_enrollment[0].id : null,
    options: data?.appointment_enrollment[0] ? data?.appointment_enrollment[0].order_product?.options : null,
    orderLog: {
      createdAt: data?.appointment_enrollment[0]
        ? data?.appointment_enrollment[0].order_product?.order_log.created_at
        : null,
      updatedAt: data?.appointment_enrollment[0]
        ? data?.appointment_enrollment[0].order_product?.order_log.updated_at
        : null,
    },
  }

  return {
    loading,
    error,
    appointmentEnrollmentDetail,
  }
}
export default AppointmentDetailModal