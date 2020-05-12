import { Icon } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { ReactComponent as CalendarAltOIcon } from '../../images/icon/calendar-alt-o.svg'
import { AdminPageTitle } from '../../components/admin'
import AppointmentPeriodCollectionTabs from '../../components/appointment/AppointmentPeriodCollectionTabs'
import AdminLayout from '../../components/layout/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages } from '../../helpers/translation'
import { useAppointmentEnrollmentCollection } from '../../hooks/appointment'

const AppointmentPeriodCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentUserRole } = useAuth()
  const { appointmentEnrollments } = useAppointmentEnrollmentCollection()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <CalendarAltOIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.appointments)}</span>
      </AdminPageTitle>

      <AppointmentPeriodCollectionTabs
        periods={appointmentEnrollments}
        withSelector={currentUserRole === 'app-owner'}
      />
    </AdminLayout>
  )
}

export default AppointmentPeriodCollectionAdminPage
