import Icon from '@ant-design/icons'
import { useMutation } from '@apollo/client'
import { gql } from '@apollo/client'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { AdminPageTitle } from '../components/admin'
import AppointmentPlanCollectionTabs from '../components/appointment/AppointmentPlanCollectionTabs'
import ProductCreationModal from '../components/common/ProductCreationModal'
import AdminLayout from '../components/layout/AdminLayout'
import hasura from '../hasura'
import { handleError } from '../helpers'
import { commonMessages } from '../helpers/translation'
import { ReactComponent as CalendarAltOIcon } from '../images/icon/calendar-alt-o.svg'
import ForbiddenPage from './ForbiddenPage'

const AppointmentPlanCollectionAdminPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { enabledModules } = useApp()
  const { currentMemberId, currentUserRole, permissions } = useAuth()
  const [createAppointmentPlan] = useMutation<hasura.CREATE_APPOINTMENT_PLAN, hasura.CREATE_APPOINTMENT_PLANVariables>(
    CREATE_APPOINTMENT_PLAN,
  )

  if (!enabledModules.appointment || (!permissions.APPOINTMENT_PLAN_ADMIN && !permissions.APPOINTMENT_PLAN_NORMAL)) {
    return <ForbiddenPage />
  }

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

      {currentMemberId ? (
        <AppointmentPlanCollectionTabs
          creatorId={
            permissions.APPOINTMENT_PLAN_ADMIN ? undefined : permissions.APPOINTMENT_PLAN_NORMAL ? currentMemberId : ''
          }
        />
      ) : null}
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
