import { Icon } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AppointmentPeriodCollectionTabs from '../../components/appointment/AppointmentPeriodCollectionTabs'
import AdminLayout from '../../components/layout/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages } from '../../helpers/translation'
import { useAppointmentEnrollmentCollection } from '../../hooks/appointment'
import { ReactComponent as CalendarAltOIcon } from '../../images/icon/calendar-alt-o.svg'

const AppointmentPeriodCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentUserRole } = useAuth()
  const {
    loadingAppointmentEnrollments,
    appointmentEnrollments,
    refetchAppointmentEnrollments,
  } = useAppointmentEnrollmentCollection()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <CalendarAltOIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.appointments)}</span>
      </AdminPageTitle>

      <AppointmentPeriodCollectionTabs
        loading={loadingAppointmentEnrollments}
        periods={appointmentEnrollments}
        withSelector={currentUserRole === 'app-owner'}
        onRefetch={refetchAppointmentEnrollments}
      />
    </AdminLayout>
  )
}

export default AppointmentPeriodCollectionAdminPage
