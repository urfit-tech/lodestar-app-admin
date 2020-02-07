import { Icon } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageBlock, AdminPageTitle } from '../../../components/admin'
import CreatorAdminLayout from '../../../components/layout/CreatorAdminLayout'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import AppointmentPlanCollectionTable from '../../../containers/appointment/AppointmentPlanCollectionTable'
import AppointmentPlanCreationModal from '../../../containers/appointment/AppointmentPlanCreationModal'
import { useAuth } from '../../../contexts/AuthContext'
import { commonMessages } from '../../../helpers/translation'
import { ReactComponent as CalendarAltOIcon } from '../../../images/icon/calendar-alt-o.svg'

const AppointmentPlanCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentUserRole } = useAuth()

  const AdminLayout = currentUserRole === 'app-owner' ? OwnerAdminLayout : CreatorAdminLayout

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <CalendarAltOIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.appointmentPlans)}</span>
      </AdminPageTitle>

      <div className="mb-5">
        <AppointmentPlanCreationModal />
      </div>

      <AdminPageBlock>
        <AppointmentPlanCollectionTable />
      </AdminPageBlock>
    </AdminLayout>
  )
}

export default AppointmentPlanCollectionAdminPage
