import { Button, Icon } from 'antd'
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AdminHeader, AdminHeaderTitle } from '../../components/admin'
import AppointmentPlanContext from './AppointmentPlanContext'

const AppointmentHeader: React.FC<{
  appointmentPlanId: string
}> = ({ appointmentPlanId }) => {
  const { appointmentPlan } = useContext(AppointmentPlanContext)

  return (
    <AdminHeader>
      <Link to="/admin/podcast-programs/" className="mr-3">
        <Icon type="arrow-left" />
      </Link>

      <AdminHeaderTitle>{appointmentPlan ? appointmentPlan.title : appointmentPlanId}</AdminHeaderTitle>

      <a href={`#${appointmentPlanId}`} target="_blank" rel="noopener noreferrer">
        <Button>預覽</Button>
      </a>
    </AdminHeader>
  )
}

export default AppointmentHeader
