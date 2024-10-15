import { useMutation, useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import dayjs from 'dayjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import moment from 'moment'
import { useMemo } from 'react'
import hasura from '../hasura'
import {
  AppointmentPlanAdmin,
  MeetGenerationMethod,
  ReservationType,
  AppointmentPeriodCardProps,
  AppointmentPeriodPlanProps,
  MeetGateway,
} from '../types/appointment'
import { PeriodType } from '../types/general'

export const useAppointmentPlanAdmin = (appointmentPlanId: string, targetMemberId?: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GetAppointmentPlanAdmin,
    hasura.GetAppointmentPlanAdminVariables
  >(
    gql`
      query GetAppointmentPlanAdmin($appointmentPlanId: uuid!, $now: timestamptz, $targetMemberId: String) {
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
          capacity
          reschedule_amount
          reschedule_type
          meet_generation_method
          default_meet_gateway
          meeting_link_url
          appointment_schedules(where: { _not: { interval_type: { _is_null: true }, started_at: { _lt: $now } } }) {
            id
            started_at
            interval_amount
            interval_type
            excludes
            created_at
          }
          appointment_enrollments(where: { member_id: { _eq: $targetMemberId } }) {
            member_id
            appointment_plan_id
            started_at
            canceled_at
          }
          appointment_periods(where: { started_at: { _gt: $now } }, order_by: [{ started_at: asc }]) {
            appointment_schedule_id
            started_at
            ended_at
            booked
            available
          }
        }
      }
    `,
    {
      variables: {
        appointmentPlanId,
        targetMemberId,
        now: moment().startOf('minute').toDate(),
      },
    },
  )

  const appointmentPlanAdmin = useMemo<AppointmentPlanAdmin | null>(() => {
    return data?.appointment_plan_by_pk
      ? {
          id: appointmentPlanId,
          title: data.appointment_plan_by_pk.title || '',
          phone: data.appointment_plan_by_pk.phone || '',
          description: data.appointment_plan_by_pk.description || '',
          duration: data.appointment_plan_by_pk.duration,
          price: data.appointment_plan_by_pk.price,
          reservationAmount: data.appointment_plan_by_pk.reservation_amount,
          reservationType: (data.appointment_plan_by_pk.reservation_type as ReservationType) || null,
          capacity: data.appointment_plan_by_pk.capacity,
          rescheduleAmount: data.appointment_plan_by_pk.reschedule_amount,
          rescheduleType: (data.appointment_plan_by_pk.reschedule_type as ReservationType) || null,
          meetGenerationMethod: data.appointment_plan_by_pk.meet_generation_method as MeetGenerationMethod,
          meetingLinkUrl: data.appointment_plan_by_pk.meeting_link_url || null,
          defaultMeetGateway: data.appointment_plan_by_pk.default_meet_gateway as MeetGateway,
          schedules: data.appointment_plan_by_pk.appointment_schedules.map(appointmentSchedule => ({
            id: appointmentSchedule.id,
            startedAt: new Date(appointmentSchedule.started_at),
            intervalAmount: appointmentSchedule.interval_amount || null,
            intervalType: appointmentSchedule.interval_type as PeriodType,
            excludes: appointmentSchedule.excludes.map((e: string) => new Date(e)),
          })),
          periods: data.appointment_plan_by_pk.appointment_periods.map(period => ({
            id: `${period.appointment_schedule_id || ''}-${period.started_at}`,
            appointmentPlanId,
            appointmentScheduleId: period.appointment_schedule_id,
            appointmentScheduleCreatedAt: new Date(
              data.appointment_plan_by_pk?.appointment_schedules.filter(
                v => v.id === period.appointment_schedule_id,
              )[0]?.created_at,
            ),
            startedAt: new Date(period.started_at),
            endedAt: new Date(period.ended_at),
            isEnrolled: period.booked > 0,
            isExcluded: !period.available,
            isBookedReachLimit: data?.appointment_plan_by_pk?.capacity
              ? data.appointment_plan_by_pk.capacity !== -1 && period.booked >= data.appointment_plan_by_pk.capacity
              : false,
            booked: period.booked,
            targetMemberBooked: data.appointment_plan_by_pk?.appointment_enrollments.some(
              enrollment =>
                enrollment.member_id === targetMemberId &&
                enrollment.appointment_plan_id === data.appointment_plan_by_pk?.id &&
                enrollment.started_at === period.started_at &&
                !enrollment.canceled_at,
            ),
          })),
          publishedAt: data.appointment_plan_by_pk?.published_at
            ? new Date(data.appointment_plan_by_pk.published_at)
            : null,
          supportLocales: data?.appointment_plan_by_pk.support_locales || [],
          currencyId: data?.appointment_plan_by_pk.currency_id || 'TWD',
          creatorId: data?.appointment_plan_by_pk.creator_id || '',
          isPrivate: data?.appointment_plan_by_pk.is_private,
        }
      : null
  }, [appointmentPlanId, data?.appointment_plan_by_pk, targetMemberId])

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
    data?.member.map(v => ({
      id: v.id,
      name: v.name,
    })) || []

  return {
    loading,
    error,
    appointmentCreators,
    refetch,
  }
}

export const useAppointmentEnrollmentCollection = (
  tabKey: 'scheduled' | 'canceled' | 'finished',
  selectedCreatorId: string,
  startedAt: Date | null,
  endedAt: Date | null,
) => {
  const limit = 10

  const condition: hasura.GetAppointmentEnrollmentsVariables['condition'] =
    tabKey === 'scheduled'
      ? {
          appointment_plan: {
            creator_id: { _eq: selectedCreatorId || undefined },
          },
          started_at: { _gte: startedAt },
          canceled_at: { _is_null: true },
          ended_at: {
            _lte: endedAt,
            _gte: moment().startOf('minute').toDate(),
          },
        }
      : tabKey === 'canceled'
      ? {
          appointment_plan: {
            creator_id: { _eq: selectedCreatorId || undefined },
          },
          started_at: { _gte: startedAt },
          canceled_at: { _is_null: false },
          ended_at: { _lte: endedAt },
        }
      : tabKey === 'finished'
      ? {
          appointment_plan: {
            creator_id: { _eq: selectedCreatorId || undefined },
          },
          started_at: { _gte: startedAt },
          canceled_at: { _is_null: true },
          ended_at: {
            _lte: dayjs().isBefore(dayjs(endedAt)) ? moment().startOf('minute').toDate() : endedAt,
          },
        }
      : {}

  const sort: hasura.GetAppointmentEnrollmentsVariables['sort'] = [
    tabKey === 'scheduled'
      ? {
          started_at: 'asc' as hasura.order_by,
        }
      : tabKey === 'canceled'
      ? {
          ended_at: 'desc' as hasura.order_by,
        }
      : tabKey === 'finished'
      ? { ended_at: 'desc' as hasura.order_by }
      : {},
  ]

  const { loading, error, data, refetch, fetchMore } = useQuery<
    hasura.GetAppointmentEnrollments,
    hasura.GetAppointmentEnrollmentsVariables
  >(
    gql`
      query GetAppointmentEnrollments(
        $condition: appointment_enrollment_bool_exp
        $sort: [appointment_enrollment_order_by!]
        $limit: Int!
      ) {
        appointment_enrollment(where: $condition, limit: $limit, order_by: $sort) {
          id
          order_product {
            options
          }
          appointment_plan {
            id
            title
            duration
            meet_generation_method
            default_meet_gateway
            creator {
              id
              name
              picture_url
            }
            reschedule_amount
            reschedule_type
            meeting_link_url
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
        }
      }
    `,
    {
      variables: {
        condition,
        sort,
        limit,
      },
    },
  )

  const { data: enrollmentData } = useQuery<
    hasura.GET_APPOINTMENT_ENROLLMENT_AGGREGATE,
    hasura.GET_APPOINTMENT_ENROLLMENT_AGGREGATEVariables
  >(
    gql`
      query GET_APPOINTMENT_ENROLLMENT_AGGREGATE($condition: appointment_enrollment_bool_exp) {
        appointment_enrollment_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
      }
    `,
    { variables: { condition } },
  )

  const appointmentEnrollments: AppointmentPeriodCardProps[] =
    data?.appointment_enrollment.map(v => ({
      id: v.id,
      member: {
        id: v.member?.id || '',
        name: v.member_name || '',
        email: v.member_email || null,
        phone: v.member_phone || null,
        avatarUrl: v.member?.picture_url || null,
      },
      appointmentPlanId: v.appointment_plan?.id || '',
      appointmentPlanTitle: v.appointment_plan?.title || '',
      appointmentPlan: {
        id: v.appointment_plan?.id,
        title: v.appointment_plan?.title,
        duration: v.appointment_plan?.duration,
        rescheduleAmount: v.appointment_plan?.reschedule_amount,
        rescheduleType: v.appointment_plan?.reschedule_type,
        defaultMeetGateway: v.appointment_plan?.default_meet_gateway as MeetGateway,
        meetingLinkUrl: v.appointment_plan?.meeting_link_url || null,
      } as AppointmentPeriodPlanProps,
      startedAt: new Date(v.started_at),
      endedAt: new Date(v.ended_at),
      canceledAt: v.canceled_at ? new Date(v.canceled_at) : null,
      creator: {
        id: v.appointment_plan?.creator?.id || '',
        name: v.appointment_plan?.creator?.name || '',
        avatarUrl: v.appointment_plan?.creator?.picture_url || '',
      },
      orderProduct: { id: v.order_product_id, options: v.order_product?.options },
      meetGenerationMethod: (v.appointment_plan?.meet_generation_method as MeetGenerationMethod) || 'auto',
      meetingLinkUrl: v.appointment_plan?.meeting_link_url || null,
    })) || []

  const loadMoreAppointmentEnrollments =
    (data?.appointment_enrollment.length || 0) <
    (enrollmentData?.appointment_enrollment_aggregate.aggregate?.count || 0)
      ? () =>
          fetchMore({
            variables: {
              condition: {
                ...condition,
                ...(tabKey === 'scheduled'
                  ? {
                      started_at: {
                        _gt: data?.appointment_enrollment.slice(-1)[0]?.started_at,
                      },
                    }
                  : tabKey === 'canceled'
                  ? {
                      ended_at: {
                        _lt: data?.appointment_enrollment.slice(-1)[0]?.ended_at,
                      },
                    }
                  : tabKey === 'finished'
                  ? {
                      ended_at: {
                        _lt: data?.appointment_enrollment.slice(-1)[0]?.ended_at,
                      },
                    }
                  : {}),
              },
              limit,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              return Object.assign({}, prev, {
                appointment_enrollment: [...prev.appointment_enrollment, ...fetchMoreResult.appointment_enrollment],
              })
            },
          })
      : undefined

  return {
    loading,
    error,
    appointmentEnrollments,
    refetch,
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

export const useCancelAppointment = () => {
  const [cancelAppointment] = useMutation<hasura.CANCEL_APPOINTMENT, hasura.CANCEL_APPOINTMENTVariables>(gql`
    mutation CANCEL_APPOINTMENT($orderProductId: uuid!, $data: jsonb) {
      update_order_product(where: { id: { _eq: $orderProductId } }, _append: { options: $data }) {
        affected_rows
      }
    }
  `)

  return {
    cancelAppointment,
  }
}

export const useMeetByAppointmentPlanIdAndPeriod = (
  appointmentPlanId: string,
  startedAt: Date | null,
  endedAt: Date | null,
) => {
  const { id: appId } = useApp()
  const { loading, data, error } = useQuery<
    hasura.GetMeetByAppointmentPlanIdAndPeriod,
    hasura.GetMeetByAppointmentPlanIdAndPeriodVariables
  >(
    gql`
      query GetMeetByAppointmentPlanIdAndPeriod(
        $target: uuid!
        $startedAt: timestamptz!
        $endedAt: timestamptz!
        $appId: String!
      ) {
        meet(
          where: {
            target: { _eq: $target }
            started_at: { _eq: $startedAt }
            ended_at: { _eq: $endedAt }
            app_id: { _eq: $appId }
            deleted_at: { _is_null: true }
            meet_members: { deleted_at: { _is_null: true } }
          }
        ) {
          id
          host_member_id
          options
          recording_url
          recording_type
          meet_members {
            id
            member_id
          }
        }
      }
    `,
    {
      variables: {
        target: appointmentPlanId,
        startedAt: startedAt?.toISOString(),
        endedAt: endedAt?.toISOString(),
        appId,
      },
    },
  )
  const meet: {
    id: string
    hostMemberId: string
    recording_url: string | null
    recording_type: string | null
    options: any
    meetMembers: { id: string; memberId: string }[]
  } | null = data?.meet?.[0]
    ? {
        id: data.meet[0].id,
        hostMemberId: data.meet[0].host_member_id,
        recording_url: data.meet[0].recording_url || null,
        recording_type: data.meet[0].recording_type || null,
        options: data.meet[0].options,
        meetMembers: data.meet[0].meet_members.map(v => ({
          id: v.id,
          memberId: v.member_id,
        })),
      }
    : null

  return {
    loading,
    meet,
    error,
  }
}

export const GET_APPOINTMENT_PERIOD = gql`
  query GET_APPOINTMENT_PERIOD($appointmentPlanId: uuid!, $startedAt: timestamptz!, $endedAt: timestamptz!) {
    appointment_period(
      where: {
        appointment_plan_id: { _eq: $appointmentPlanId }
        started_at: { _eq: $startedAt }
        ended_at: { _eq: $endedAt }
      }
    ) {
      appointment_plan_id
    }
  }
`
