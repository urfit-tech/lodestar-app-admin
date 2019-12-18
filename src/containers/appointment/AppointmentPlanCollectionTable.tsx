import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React, { useEffect } from 'react'
import AppointmentPlanCollectionTableComponent, {
  AppointmentPlanProps,
} from '../../components/appointment/AppointmentPlanCollectionTable'
import types from '../../types'

const AppointmentPlanCollectionTable: React.FC = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_APPOINTMENT_PLAN_COLLECTION_ADMIN>(
    GET_APPOINTMENT_PLAN_COLLECTION_ADMIN,
  )

  useEffect(() => {
    refetch()
  }, [])

  const appointmentPlans: AppointmentPlanProps[] =
    loading || !!error || !data
      ? []
      : data.appointment_plan.map(appointmentPlan => ({
          id: appointmentPlan.id,
          avatarUrl: appointmentPlan.creator.picture_url,
          creatorName: appointmentPlan.creator.name || appointmentPlan.creator.username,
          title: appointmentPlan.title,
          duration: appointmentPlan.duration,
          listPrice: appointmentPlan.price,
          enrollment: 0,
          isPublished: !!appointmentPlan.published_at,
        }))

  return <AppointmentPlanCollectionTableComponent appointmentPlans={appointmentPlans} loading={loading} />
}

const GET_APPOINTMENT_PLAN_COLLECTION_ADMIN = gql`
  query GET_APPOINTMENT_PLAN_COLLECTION_ADMIN {
    appointment_plan(order_by: { updated_at: desc }) {
      id
      creator {
        id
        picture_url
        name
        username
      }
      title
      duration
      price
      published_at
    }
  }
`

export default AppointmentPlanCollectionTable
