import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import moment from 'moment'
import { useMemo } from 'react'
import { AppointmentPeriodCardProps } from '../components/appointment/AppointmentPeriodCard'
import hasura from '../hasura'
import { AppointmentPlanAdminProps, ReservationType } from '../types/appointment'
import { PeriodType } from '../types/general'

export const useAppointmentPlanAdmin = (appointmentPlanId: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_APPOINTMENT_PLAN_ADMIN,
    hasura.GET_APPOINTMENT_PLAN_ADMINVariables
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
          creator_id
          is_private
          reservation_amount
          reservation_type
          appointment_schedules(where: { _not: { interval_type: { _is_null: true }, started_at: { _lt: $now } } }) {
            id
            started_at
            interval_amount
            interval_type
            excludes
          }
          appointment_periods(where: { started_at: { _gt: $now } }, order_by: [{ started_at: asc }]) {
            appointment_schedule_id
            started_at
            ended_at
            booked
            available
          }
          # appointment_enrollments_aggregate {
          #   aggregate {
          #     count
          #   }
          # }
        }
      }
    `,
    {
      variables: {
        appointmentPlanId,
        now: moment().startOf('minute').toDate(),
      },
    },
  )

  const appointmentPlanAdmin = useMemo<AppointmentPlanAdminProps | null>(() => {
    if (!data?.appointment_plan_by_pk) {
      return null
    }

    return {
      id: appointmentPlanId,
      title: data.appointment_plan_by_pk.title,
      phone: data.appointment_plan_by_pk.phone || '',
      description: data.appointment_plan_by_pk.description,
      duration: data.appointment_plan_by_pk.duration,
      listPrice: data.appointment_plan_by_pk.price,
      reservationAmount: data.appointment_plan_by_pk.reservation_amount,
      reservationType: (data.appointment_plan_by_pk.reservation_type as ReservationType) || null,
      schedules: data.appointment_plan_by_pk.appointment_schedules.map(s => ({
        id: s.id,
        startedAt: new Date(s.started_at),
        intervalAmount: s.interval_amount,
        intervalType: s.interval_type as PeriodType,
        excludes: s.excludes.map((e: string) => new Date(e)),
      })),
      periods: data.appointment_plan_by_pk.appointment_periods.map(period => ({
        id: `${period.appointment_schedule_id || ''}-${period.started_at}`,
        scheduleId: period.appointment_schedule_id,
        startedAt: new Date(period.started_at),
        endedAt: new Date(period.ended_at),
        isEnrolled: !!period.booked,
        isExcluded: !period.available,
      })),
      // enrollments: data.appointment_plan_by_pk.appointment_enrollments_aggregate.aggregate
      //   ? data.appointment_plan_by_pk.appointment_enrollments_aggregate.aggregate.count || 0
      //   : 0,
      isPublished: !!data.appointment_plan_by_pk.published_at,
      supportLocales: data?.appointment_plan_by_pk.support_locales || [],
      currencyId: data?.appointment_plan_by_pk.currency_id || 'TWD',
      creatorId: data?.appointment_plan_by_pk.creator_id,
      isPrivate: data?.appointment_plan_by_pk.is_private,
    }
  }, [appointmentPlanId, data])

  return {
    loadingAppointmentPlanAdmin: loading,
    errorAppointmentPlanAdmin: error,
    appointmentPlanAdmin,
    refetchAppointmentPlanAdmin: refetch,
  }
}

export const useAppointmentEnrollmentCreator = () => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_APPOINTMENT_ENROLLMENT_CREATOR>(
    gql`
      query GET_APPOINTMENT_ENROLLMENT_CREATOR {
        member(
          where: { appointment_plans: { appointment_enrollments: { appointment_plan_id: { _is_null: false } } } }
        ) {
          id
          name
        }
      }
    `,
  )

  const appointmentCreators: { id: string; name: string }[] =
    loading || error || !data
      ? []
      : data.member.map(v => ({
          id: v.id,
          name: v.name,
        }))

  return {
    loading,
    error,
    appointmentCreators,
    refetch,
  }
}

export const useAppointmentEnrollmentCollection = (
  selectedCreatorId: string,
  startedAt: Date | null,
  endedAt: Date | null,
  isCanceled: boolean,
  isFinished?: boolean,
) => {
  const condition: hasura.GET_APPOINTMENT_ENROLLMENTSVariables['condition'] = {
    appointment_plan: {
      creator_id: { _eq: selectedCreatorId || undefined },
    },
    started_at: { _gte: startedAt },
    canceled_at: { _is_null: !isCanceled },
    ended_at: isCanceled
      ? {
          _lte: endedAt,
        }
      : isFinished
      ? {
          _lte: endedAt || moment().startOf('minute').toDate(),
        }
      : {
          _lte: endedAt,
          _gte: moment().startOf('minute').toDate(),
        },
  }

  const sort: hasura.GET_APPOINTMENT_ENROLLMENTSVariables['sort'] = [
    !isCanceled && !isFinished
      ? {
          started_at: 'asc' as hasura.order_by,
        }
      : {
          ended_at: 'desc' as hasura.order_by,
        },
  ]

  const { loading, error, data, refetch, fetchMore } = useQuery<
    hasura.GET_APPOINTMENT_ENROLLMENTS,
    hasura.GET_APPOINTMENT_ENROLLMENTSVariables
  >(
    gql`
      query GET_APPOINTMENT_ENROLLMENTS(
        $condition: appointment_enrollment_bool_exp
        $sort: [appointment_enrollment_order_by!]
      ) {
        appointment_enrollment_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
        appointment_enrollment(where: $condition, limit: 10, order_by: $sort) {
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
          ended_at
          created_at
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
    {
      variables: {
        condition,
        sort,
      },
    },
  )

  const cursor =
    !isFinished && !isCanceled
      ? {
          started_at: {
            _gt: data?.appointment_enrollment.slice(-1)[0]?.started_at,
          } as hasura.timestamptz_comparison_exp,
        }
      : {
          ended_at: {
            _lt: data?.appointment_enrollment.slice(-1)[0]?.ended_at,
          } as hasura.timestamptz_comparison_exp,
        }

  const loadMoreAppointmentEnrollments =
    (data?.appointment_enrollment_aggregate.aggregate?.count || 0) > 10
      ? () =>
          fetchMore({
            variables: {
              condition: {
                ...condition,
                ...cursor,
              },
              sort,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              return Object.assign({}, prev, {
                appointment_enrollment_aggregate: fetchMoreResult.appointment_enrollment_aggregate,
                appointment_enrollment: [...prev.appointment_enrollment, ...fetchMoreResult.appointment_enrollment],
              })
            },
          })
      : undefined

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
          endedAt: new Date(enrollment.ended_at),
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
    loadMoreAppointmentEnrollments,
  }
}

export const INSERT_APPOINTMENT_SCHEDULES = gql`
  mutation INSERT_APPOINTMENT_SCHEDULES($data: [appointment_schedule_insert_input!]!) {
    insert_appointment_schedule(objects: $data) {
      affected_rows
    }
  }
`
