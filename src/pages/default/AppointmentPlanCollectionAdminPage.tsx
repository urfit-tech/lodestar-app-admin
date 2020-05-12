import { Icon } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { ReactComponent as CalendarAltOIcon } from '../../images/icon/calendar-alt-o.svg'
import { AdminPageBlock, AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import AppointmentPlanCollectionTable from '../../containers/appointment/AppointmentPlanCollectionTable'
import AppointmentPlanCreationModal from '../../containers/appointment/AppointmentPlanCreationModal'
import { commonMessages } from '../../helpers/translation'

const AppointmentPlanCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()

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
