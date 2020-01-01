import { Icon } from 'antd'
import React from 'react'
import { AdminPageTitle } from '../../../components/admin'
import AppointmentPeriodCollectionTabs from '../../../components/appointment/AppointmentPeriodCollectionTabs'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import { useAppointmentEnrollmentCollection } from '../../../hooks/appointment'
import { ReactComponent as CalendarAltOIcon } from '../../../images/icon/calendar-alt-o.svg'

const AppointmentPeriodCollectionAdminPage: React.FC = () => {
  const { appointmentEnrollments } = useAppointmentEnrollmentCollection()

  return (
    <OwnerAdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <CalendarAltOIcon />} className="mr-3" />
        <span>預約紀錄</span>
      </AdminPageTitle>

      <AppointmentPeriodCollectionTabs periods={appointmentEnrollments} withSelector={true} />
    </OwnerAdminLayout>
  )
}

export default AppointmentPeriodCollectionAdminPage
