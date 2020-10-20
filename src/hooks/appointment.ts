import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import moment from 'moment'
import { AppointmentPeriodCardProps } from '../components/appointment/AppointmentPeriodCard'
import types from '../types'
import { AppointmentPlanAdminProps, ScheduleIntervalType } from '../types/appointment'

export const useAppointmentPlanAdmin = (appointmentPlanId: string) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_APPOINTMENT_PLAN_ADMIN,
    types.GET_APPOINTMENT_PLAN_ADMINVariables
  >(
    gql`
      query GET_APPOINTMENT_PLAN_ADMIN($appointmentPlanId: uuid!, $now: timestamptz) {
        appointment_plan_by_pk(id: $appointmentPlanId) {
          id
          title
          phone
          description
          duration
          price
          published_at
          support_locales
          currency_id
          appointment_schedules {
            id
            excludes
          }
          appointment_periods(where: { started_at: { _gt: $now } }, order_by: { started_at: asc }) {
            appointment_schedule {
              id
              interval_amount
              interval_type
            }
            started_at
            ended_at
            booked
            available
          }
          appointment_enrollments_aggregate {
            aggregate {
              count
            }
          }
        }
      }
    `,
    {
      variables: {
        appointmentPlanId,
        now: moment().startOf('hour').toDate(),
      },
    },
  )

  const appointmentPlanAdmin: AppointmentPlanAdminProps | null =
    loading || !!error || !data || !data.appointment_plan_by_pk
      ? null
      : {
          id: appointmentPlanId,
          title: data.appointment_plan_by_pk.title,
          phone: data.appointment_plan_by_pk.phone || '',
          description: data.appointment_plan_by_pk.description,
          duration: data.appointment_plan_by_pk.duration,
          listPrice: data.appointment_plan_by_pk.price,
          schedules: data.appointment_plan_by_pk.appointment_schedules.map(appointmentSchedule => {
            const excludedPeriods = appointmentSchedule.excludes as string[]

            return {
              id: appointmentSchedule.id,
              excludes: excludedPeriods.map(period => new Date(period).getTime()),
            }
          }),
          periods: data.appointment_plan_by_pk.appointment_periods.map(appointmentPeriod => ({
            id: `${appointmentPeriod.appointment_schedule?.id || ''}-${appointmentPeriod.started_at}`,
            schedule: {
              id: appointmentPeriod.appointment_schedule?.id || '',
              periodAmount: appointmentPeriod.appointment_schedule?.interval_amount || null,
              periodType: (appointmentPeriod.appointment_schedule?.interval_type as ScheduleIntervalType) || null,
            },
            startedAt: new Date(appointmentPeriod.started_at),
            isEnrolled: !!appointmentPeriod.booked,
            isExcluded: !appointmentPeriod.available,
          })),
          enrollments: data.appointment_plan_by_pk.appointment_enrollments_aggregate.aggregate
            ? data.appointment_plan_by_pk.appointment_enrollments_aggregate.aggregate.count || 0
            : 0,
          isPublished: !!data.appointment_plan_by_pk.published_at,
          supportLocales: data?.appointment_plan_by_pk.support_locales || [],
          currencyId: data?.appointment_plan_by_pk.currency_id || 'TWD',
        }

  return {
    loadingAppointmentPlanAdmin: loading,
    errorAppointmentPlanAdmin: error,
    appointmentPlanAdmin,
    refetchAppointmentPlanAdmin: refetch,
  }
}

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

  const appointmentEnrollments: AppointmentPeriodCardProps[] =
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
