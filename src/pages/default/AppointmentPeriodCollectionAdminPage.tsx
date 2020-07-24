import { Icon, Skeleton } from 'antd'
import React, { useEffect } from 'react'
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

  useEffect(() => {
    refetchAppointmentEnrollments && refetchAppointmentEnrollments()
  }, [refetchAppointmentEnrollments])

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <CalendarAltOIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.appointments)}</span>
      </AdminPageTitle>

      {loadingAppointmentEnrollments ? (
        <Skeleton active />
      ) : (
        <AppointmentPeriodCollectionTabs
          periods={appointmentEnrollments}
          withSelector={currentUserRole === 'app-owner'}
          onRefetch={refetchAppointmentEnrollments}
        />
      )}
    </AdminLayout>
  )
}

export default AppointmentPeriodCollectionAdminPage
