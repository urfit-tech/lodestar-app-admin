import { Icon } from 'antd'
import React from 'react'
import { AdminPageTitle } from '../../../components/admin'
import AppointmentPeriodCollectionTabs from '../../../components/appointment/AppointmentPeriodCollectionTabs'
import CreatorAdminLayout from '../../../components/layout/CreatorAdminLayout'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import { useAuth } from '../../../contexts/AuthContext'
import { useAppointmentEnrollmentCollection } from '../../../hooks/appointment'
import { ReactComponent as CalendarAltOIcon } from '../../../images/icon/calendar-alt-o.svg'

const AppointmentPeriodCollectionAdminPage: React.FC = () => {
  const { currentUserRole } = useAuth()
  const { appointmentEnrollments } = useAppointmentEnrollmentCollection()

  const AdminLayout = currentUserRole === 'app-owner' ? OwnerAdminLayout : CreatorAdminLayout

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <CalendarAltOIcon />} className="mr-3" />
        <span>預約紀錄</span>
      </AdminPageTitle>

      <AppointmentPeriodCollectionTabs
        periods={appointmentEnrollments}
        withSelector={currentUserRole === 'app-owner'}
      />
    </AdminLayout>
  )
}

export default AppointmentPeriodCollectionAdminPage
