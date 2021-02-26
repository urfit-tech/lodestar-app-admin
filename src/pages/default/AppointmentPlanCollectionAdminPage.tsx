import Icon from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { AdminPageTitle } from '../../components/admin'
import AppointmentPlanCollectionTabs from '../../components/appointment/AppointmentPlanCollectionTabs'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import AdminLayout from '../../components/layout/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as CalendarAltOIcon } from '../../images/icon/calendar-alt-o.svg'
import types from '../../types'

const AppointmentPlanCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { currentUserRole, currentMemberId } = useAuth()
  const [createAppointmentPlan] = useMutation<types.CREATE_APPOINTMENT_PLAN, types.CREATE_APPOINTMENT_PLANVariables>(
    CREATE_APPOINTMENT_PLAN,
  )

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <CalendarAltOIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.appointmentPlans)}</span>
      </AdminPageTitle>

      <div className="mb-5">
        <ProductCreationModal
          withCreatorSelector={currentUserRole === 'app-owner'}
          onCreate={({ title, creatorId }) =>
            createAppointmentPlan({
              variables: {
                title,
                creatorId: creatorId || currentMemberId || '',
              },
            })
              .then(({ data }) => {
                const appointmentPlanId = data?.insert_appointment_plan?.returning[0].id
                appointmentPlanId && history.push(`/appointment-plans/${appointmentPlanId}`)
              })
              .catch(handleError)
          }
        />
      </div>

      <AppointmentPlanCollectionTabs />
    </AdminLayout>
  )
}

const CREATE_APPOINTMENT_PLAN = gql`
  mutation CREATE_APPOINTMENT_PLAN($title: String!, $creatorId: String!) {
    insert_appointment_plan(objects: { title: $title, creator_id: $creatorId, duration: 0 }) {
      affected_rows
      returning {
        id
      }
    }
  }
`

export default AppointmentPlanCollectionAdminPage
