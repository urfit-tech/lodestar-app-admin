import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import moment from 'moment'
import { AppointmentPeriodProps } from '../components/appointment/AppointmentPeriodCard'
import types from '../types'

export const useAppointmentEnrollmentCollection = (startedAt: Date | null, endedAt: Date | null) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_APPOINTMENT_ENROLLMENT_COLLECTION,
    types.GET_APPOINTMENT_ENROLLMENT_COLLECTIONVariables
  >(
    gql`
      query GET_APPOINTMENT_ENROLLMENT_COLLECTION($startedAt: timestamptz, $endedAt: timestamptz) {
        appointment_enrollment(
          where: { started_at: { _gte: $startedAt, _lte: $endedAt } }
          order_by: { started_at: desc }
        ) {
          id
          appointment_plan {
            id
            title
            duration
            creator {
              id
              name
            }
          }
          member {
            id
            picture_url
          }
          started_at
          canceled_at
          member_name
          member_email
          member_phone
          order_product_id
          order_product {
            id
            options
            order_log {
              id
              created_at
              updated_at
            }
          }
          issue
          result
        }
      }
    `,
    { variables: { startedAt, endedAt } },
  )

  const appointmentEnrollments: AppointmentPeriodProps[] =
    loading || error || !data
      ? []
      : data.appointment_enrollment.map(enrollment => ({
          id: enrollment.id,
          avatarUrl: enrollment.member?.picture_url || null,
          member: {
            name: enrollment.member_name || '',
            email: enrollment.member_email,
            phone: enrollment.member_phone,
          },
          appointmentPlanTitle: enrollment.appointment_plan?.title || '',
          startedAt: new Date(enrollment.started_at),
          endedAt: moment(enrollment.started_at)
            .add(enrollment.appointment_plan?.duration || 0, 'minutes')
            .toDate(),
          canceledAt: enrollment.canceled_at ? new Date(enrollment.canceled_at) : null,
          creator: {
            id: enrollment.appointment_plan?.creator?.id || '',
            name: enrollment.appointment_plan?.creator?.name || '',
          },
          orderProduct: {
            id: enrollment.order_product_id || '',
            options: enrollment.order_product?.options,
            orderLog: {
              createdAt: enrollment.order_product?.order_log.created_at,
              updatedAt: enrollment.order_product?.order_log.updated_at,
            },
          },
          appointmentIssue: enrollment.issue,
          appointmentResult: enrollment.result,
        }))

  return {
    loadingAppointmentEnrollments: loading,
    errorAppointmentEnrollments: error,
    appointmentEnrollments,
    refetchAppointmentEnrollments: refetch,
  }
}

export const useUpdateAppointmentResult = (orderProductId: string, options: any) => {
  const [updateAppointmentResult] = useMutation<
    types.UPDATE_APPOINTMENT_Result,
    types.UPDATE_APPOINTMENT_ResultVariables
  >(gql`
    mutation UPDATE_APPOINTMENT_Result($orderProductId: uuid!, $data: jsonb) {
      update_order_product(where: { id: { _eq: $orderProductId } }, _set: { options: $data }) {
        affected_rows
      }
    }
  `)

  return (appointmentResult: string) =>
    updateAppointmentResult({
      variables: {
        orderProductId,
        data: {
          ...options,
          appointmentResult,
        },
      },
    })
}
