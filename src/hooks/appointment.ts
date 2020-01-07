import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import moment from 'moment'
import { AppointmentPeriodCardProps } from '../components/appointment/AppointmentPeriodCard'
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
        start_url
        member_name
        member_email
        member_phone
      }
    }
  `)

  const appointmentEnrollments: AppointmentPeriodCardProps[] =
    loading || !!error || !data
      ? []
      : data.appointment_enrollment
          .map<AppointmentPeriodCardProps | undefined>(enrollment => {
            if (!enrollment.appointment_plan || !enrollment.member || !enrollment.appointment_plan.creator) {
              return undefined
            }

            return {
              id: `${enrollment.appointment_plan.id}_${enrollment.started_at}`,
              avatarUrl: enrollment.member.picture_url,
              member: {
                name: enrollment.member_name || '',
                email: enrollment.member_email,
                phone: enrollment.member_phone,
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
              link: enrollment.start_url,
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
