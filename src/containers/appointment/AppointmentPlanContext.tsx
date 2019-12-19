import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { uniqBy } from 'ramda'
import React, { createContext } from 'react'
import { ScheduleIntervalType } from '../../components/appointment/AppointmentPeriodCollection'
import { AppointmentPeriodProps } from '../../components/appointment/AppointmentPeriodItem'
import types from '../../types'

type AppointmentPlanAdminProps = {
  id: string
  title: string
  description: string | null
  duration: number
  listPrice: number
  schedules: {
    id: string
    excludes: number[]
  }[]
  periods: AppointmentPeriodProps[]
  isPublished: boolean | null
}
const AppointmentPlanContext = createContext<{
  loadingAppointmentPlan: boolean
  appointmentPlan?: AppointmentPlanAdminProps
  refetch?: () => void
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
    },
  })

  const appointmentPlan: AppointmentPlanAdminProps =
    loading || !!error || !data || !data.appointment_plan_by_pk
      ? {
          id: appointmentPlanId,
          title: '',
          description: null,
          duration: 0,
          listPrice: 0,
          schedules: [],
          periods: [],
          isPublished: null,
        }
      : {
          id: appointmentPlanId,
          title: data.appointment_plan_by_pk.title,
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
          periods: uniqBy(
            appointmentPeriod => appointmentPeriod.id,
            data.appointment_plan_by_pk.appointment_periods.map(appointmentPeriod => ({
              id: `${appointmentPeriod.started_at}`,
              schedule: {
                id: appointmentPeriod.appointment_schedule ? appointmentPeriod.appointment_schedule.id : '',
                periodAmount: appointmentPeriod.appointment_schedule
                  ? appointmentPeriod.appointment_schedule.interval_amount
                  : null,
                periodType: appointmentPeriod.appointment_schedule
                  ? (appointmentPeriod.appointment_schedule.interval_type as ScheduleIntervalType)
                  : null,
              },
              startedAt: new Date(appointmentPeriod.started_at),
              isEnrolled: !!appointmentPeriod.booked,
              isExcluded: !appointmentPeriod.available,
            })),
          ),
          isPublished: !!data.appointment_plan_by_pk.published_at,
        }

  return (
    <AppointmentPlanContext.Provider
      value={{
        loadingAppointmentPlan: loading,
        appointmentPlan,
        refetch,
      }}
    >
      {children}
    </AppointmentPlanContext.Provider>
  )
}

const GET_APPOINTMENT_PLAN_ADMIN = gql`
  query GET_APPOINTMENT_PLAN_ADMIN($appointmentPlanId: uuid!) {
    appointment_plan_by_pk(id: $appointmentPlanId) {
      id
      title
      description
      duration
      price
      published_at
      appointment_schedules {
        id
        excludes
      }
      appointment_periods(order_by: { started_at: asc }) {
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
    }
  }
`

export default AppointmentPlanContext
