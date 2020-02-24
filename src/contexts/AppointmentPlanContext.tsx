import { useQuery } from '@apollo/react-hooks'
import { ApolloError } from 'apollo-client'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { createContext } from 'react'
import { ScheduleIntervalType } from '../components/appointment/AppointmentPeriodCollection'
import { AppointmentPeriodProps } from '../components/appointment/AppointmentPeriodItem'
import types from '../types'

type AppointmentPlanAdminProps = {
  id: string
  title: string
  phone: string
  description: string | null
  duration: number
  listPrice: number
  schedules: {
    id: string
    excludes: number[]
  }[]
  periods: AppointmentPeriodProps[]
  enrollments: number
  isPublished: boolean | null
}
const AppointmentPlanContext = createContext<{
  loadingAppointmentPlan: boolean
  errorAppointmentPlan?: ApolloError
  appointmentPlan?: AppointmentPlanAdminProps
  refetchAppointmentPlan?: () => void
}>({
  loadingAppointmentPlan: true,
})

export const AppointmentPlanProvider: React.FC<{
  appointmentPlanId: string
}> = ({ appointmentPlanId, children }) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_APPOINTMENT_PLAN_ADMIN,
    types.GET_APPOINTMENT_PLAN_ADMINVariables
  >(GET_APPOINTMENT_PLAN_ADMIN, {
    variables: {
      appointmentPlanId,
      now: moment()
        .startOf('hour')
        .toDate(),
    },
  })

  const appointmentPlan: AppointmentPlanAdminProps =
    loading || !!error || !data || !data.appointment_plan_by_pk
      ? {
          id: appointmentPlanId,
          title: '',
          phone: '',
          description: null,
          duration: 0,
          listPrice: 0,
          schedules: [],
          periods: [],
          enrollments: 0,
          isPublished: null,
        }
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
        }

  return (
    <AppointmentPlanContext.Provider
      value={{
        loadingAppointmentPlan: loading,
        errorAppointmentPlan: error,
        appointmentPlan,
        refetchAppointmentPlan: refetch,
      }}
    >
      {children}
    </AppointmentPlanContext.Provider>
  )
}

const GET_APPOINTMENT_PLAN_ADMIN = gql`
  query GET_APPOINTMENT_PLAN_ADMIN($appointmentPlanId: uuid!, $now: timestamptz) {
    appointment_plan_by_pk(id: $appointmentPlanId) {
      id
      title
      phone
      description
      duration
      price
      published_at
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
`

export default AppointmentPlanContext
