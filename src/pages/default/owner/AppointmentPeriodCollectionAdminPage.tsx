import { Icon } from 'antd'
import React from 'react'
import { AdminPageTitle } from '../../../components/admin'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import { ReactComponent as CalendarAltOIcon } from '../../../images/default/calendar-alt-o.svg'

const AppointmentPeriodCollectionAdminPage: React.FC = () => {
  return (
    <OwnerAdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <CalendarAltOIcon />} className="mr-3" />
        <span>預約紀錄</span>
      </AdminPageTitle>
    </OwnerAdminLayout>
  )
}

export default AppointmentPeriodCollectionAdminPage
