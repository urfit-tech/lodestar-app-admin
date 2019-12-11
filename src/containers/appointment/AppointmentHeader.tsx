import { Button, Icon } from 'antd'
import React from 'react'
import { Link } from 'react-router-dom'
import { AdminHeader, AdminHeaderTitle } from '../../components/admin'

const AppointmentHeader: React.FC<{
  appointmentPlanId: string
}> = ({ appointmentPlanId }) => {
  return (
    <AdminHeader>
      <Link to="/admin/podcast-programs/" className="mr-3">
        <Icon type="arrow-left" />
      </Link>

      <AdminHeaderTitle>{appointmentPlanId}</AdminHeaderTitle>

      <a href={`#${appointmentPlanId}`} target="_blank" rel="noopener noreferrer">
        <Button>預覽</Button>
      </a>
    </AdminHeader>
  )
}

export default AppointmentHeader
