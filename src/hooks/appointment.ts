import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import moment from 'moment'
import { AppointmentPeriodProps } from '../components/appointment/AppointmentPeriodCard'
import { notEmpty } from '../helpers'
import types from '../types'

export const useAppointmentEnrollmentCollection = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_APPOINTMENT_ENROLLMENT_COLLECTION>(gql`
    query GET_APPOINTMENT_ENROLLMENT_COLLECTION {
      appointment_enrollment(order_by: { started_at: desc }) {
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
            created_at
            updated_at
          }
        }
        issue
        result
      }
    }
  `)

  const appointmentEnrollments: AppointmentPeriodProps[] =
    loading || !!error || !data
      ? []
      : data.appointment_enrollment
          .map<AppointmentPeriodProps | undefined>(enrollment => {
            if (!enrollment.appointment_plan || !enrollment.member || !enrollment.appointment_plan.creator) {
              return undefined
            }

            return {
              avatarUrl: enrollment.member.picture_url,
              member: {
                name: enrollment.member_name || '',
                email: enrollment.member_email,
                phone: enrollment.member_phone,
              },
              appointmentPlanTitle: enrollment.appointment_plan.title,
              startedAt: new Date(enrollment.started_at),
              endedAt: moment(enrollment.started_at).add(enrollment.appointment_plan.duration, 'minutes').toDate(),
              canceledAt: enrollment.canceled_at ? new Date(enrollment.canceled_at) : null,
              creator: {
                id: enrollment.appointment_plan.creator.id || '',
                name: enrollment.appointment_plan.creator.name || '',
              },
              orderProduct: {
                id: enrollment.order_product_id,
                options: enrollment.order_product?.options,
                orderLog: {
                  createdAt: enrollment.order_product?.order_log.created_at,
                  updatedAt: enrollment.order_product?.order_log.updated_at,
                },
              },
              appointmentIssue: enrollment.issue,
              appointmentResult: enrollment.result,
            }
          })
          .filter(notEmpty)

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
