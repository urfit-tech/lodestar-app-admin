import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React, { createContext } from 'react'
import { AppointmentPeriodProps } from '../../components/appointment/AppointmentPeriodItem'
import types from '../../types'

type AppointmentPlanAdminProps = {
  id: string
  title: string
  description: string | null
  duration: number
  listPrice: number
  periods: AppointmentPeriodProps[]
  isPublished: boolean | null
}
const AppointmentPlanContext = createContext<{
  appointmentPlan?: AppointmentPlanAdminProps
  refetch?: () => void
}>({})

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
          periods: [],
          isPublished: null,
        }
      : {
          id: appointmentPlanId,
          title: data.appointment_plan_by_pk.title,
          description: data.appointment_plan_by_pk.description,
          duration: data.appointment_plan_by_pk.duration,
          listPrice: data.appointment_plan_by_pk.price,
          periods: data.appointment_plan_by_pk.appointment_periods.map(appointmentPeriod => ({
            id: `${appointmentPeriod.started_at}-${appointmentPeriod.ended_at}`,
            schedule: {
              id: appointmentPeriod.appointment_schedule ? appointmentPeriod.appointment_schedule.id : '',
              periodType: appointmentPeriod.appointment_schedule
                ? (appointmentPeriod.appointment_schedule.interval_type as 'D' | 'W' | 'M' | 'Y')
                : null,
            },
            startedAt: new Date(appointmentPeriod.started_at),
            isEnrolled: !!appointmentPeriod.booked,
            isExcluded: !appointmentPeriod.available,
          })),
          isPublished: !!data.appointment_plan_by_pk.published_at,
        }

  return (
    <AppointmentPlanContext.Provider
      value={{
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
      appointment_periods(order_by: { started_at: asc }) {
        appointment_schedule {
          id
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
