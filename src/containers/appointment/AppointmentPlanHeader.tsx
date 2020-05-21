import { Button, Icon } from 'antd'
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AdminHeader, AdminHeaderTitle } from '../../components/admin'
import AppointmentPlanContext from '../../contexts/AppointmentPlanContext'

const AppointmentPlanHeader: React.FC<{
  appointmentPlanId: string
}> = ({ appointmentPlanId }) => {
  const { appointmentPlan } = useContext(AppointmentPlanContext)

  return (
    <AdminHeader>
      <Link to="/appointment-plans">
        <Button type="link" className="mr-3">
          <Icon type="arrow-left" />
        </Button>
      </Link>

      <AdminHeaderTitle>{appointmentPlan ? appointmentPlan.title : appointmentPlanId}</AdminHeaderTitle>
    </AdminHeader>
  )
}

export default AppointmentPlanHeader
