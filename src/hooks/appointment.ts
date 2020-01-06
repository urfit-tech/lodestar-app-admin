import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import moment from 'moment'
import { AppointmentPeriodCardProps } from '../components/appointment/AppointmentPeriodCard'
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
        order_product {
          id
          deliverables
          order_log {
            id
            invoice
          }
        }
      }
    }
  `)

  const appointmentEnrollments: AppointmentPeriodCardProps[] =
    loading || !!error || !data
      ? []
      : (data.appointment_enrollment
          .map(enrollment => {
            if (
              !enrollment.appointment_plan ||
              !enrollment.member ||
              !enrollment.order_product ||
              !enrollment.appointment_plan.creator
            ) {
              return undefined
            }

            return {
              id: enrollment.order_product.id || '',
              avatarUrl: enrollment.member.picture_url,
              member: {
                name: enrollment.order_product.order_log.invoice.name,
                email: enrollment.order_product.order_log.invoice.email,
                phone: enrollment.order_product.order_log.invoice.phone,
              },
              appointmentPlanTitle: enrollment.appointment_plan.title,
              startedAt: new Date(enrollment.started_at),
              endedAt: moment(enrollment.started_at)
                .add(enrollment.appointment_plan.duration, 'minutes')
                .toDate(),
              creator: {
                id: enrollment.appointment_plan.creator.id || '',
                name: enrollment.appointment_plan.creator.name || '',
              },
              link: enrollment.order_product.deliverables?.start_url || null,
            }
          })
          .filter(v => v) as AppointmentPeriodCardProps[])

  return {
    loadingAppointmentEnrollments: loading,
    errorAppointmentEnrollments: error,
    appointmentEnrollments,
    refetchAppointmentEnrollments: refetch,
  }
}
