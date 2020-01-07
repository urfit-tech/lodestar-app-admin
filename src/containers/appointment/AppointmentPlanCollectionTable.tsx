import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React, { useEffect } from 'react'
import AppointmentPlanCollectionTableComponent, {
  AppointmentPlanProps,
} from '../../components/appointment/AppointmentPlanCollectionTable'
import { useAuth } from '../../contexts/AuthContext'
import types from '../../types'

const AppointmentPlanCollectionTable: React.FC = () => {
  const { currentUserRole, currentMemberId } = useAuth()
  const { loading, error, data, refetch } = useQuery<
    types.GET_APPOINTMENT_PLAN_COLLECTION_ADMIN,
    types.GET_APPOINTMENT_PLAN_COLLECTION_ADMINVariables
  >(GET_APPOINTMENT_PLAN_COLLECTION_ADMIN, {
    variables: {
      creatorId: currentUserRole === 'content-creator' ? currentMemberId : undefined,
    },
  })

  useEffect(() => {
    refetch()
  }, [refetch])

  const appointmentPlans: AppointmentPlanProps[] =
    loading || !!error || !data
      ? []
      : data.appointment_plan.map(appointmentPlan => ({
          id: appointmentPlan.id,
          avatarUrl: appointmentPlan.creator ? appointmentPlan.creator.picture_url : null,
          creatorName: appointmentPlan.creator && appointmentPlan.creator.name ? appointmentPlan.creator.name : '',
          title: appointmentPlan.title,
          duration: appointmentPlan.duration,
          listPrice: appointmentPlan.price,
          enrollments: appointmentPlan.appointment_enrollments_aggregate.aggregate
            ? appointmentPlan.appointment_enrollments_aggregate.aggregate.count || 0
            : 0,
          isPublished: !!appointmentPlan.published_at,
        }))

  return <AppointmentPlanCollectionTableComponent appointmentPlans={appointmentPlans} loading={loading} />
}

const GET_APPOINTMENT_PLAN_COLLECTION_ADMIN = gql`
  query GET_APPOINTMENT_PLAN_COLLECTION_ADMIN($creatorId: String) {
    appointment_plan(where: { creator_id: { _eq: $creatorId } }, order_by: { updated_at: desc }) {
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
      appointment_enrollments_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`

export default AppointmentPlanCollectionTable
