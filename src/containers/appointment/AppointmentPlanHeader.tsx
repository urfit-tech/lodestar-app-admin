import { Button, Icon } from 'antd'
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AdminHeader, AdminHeaderTitle } from '../../components/admin'
import AppointmentPlanContext from './AppointmentPlanContext'
import AppContext from '../common/AppContext'
import { useAuth } from '../../components/auth/AuthContext'

const AppointmentPlanHeader: React.FC<{
  appointmentPlanId: string
}> = ({ appointmentPlanId }) => {
  const { appointmentPlan } = useContext(AppointmentPlanContext)
  const app = useContext(AppContext)
  const { currentMemberId } = useAuth()

  return (
    <AdminHeader>
      <Link to="/admin/appointment-plans/" className="mr-3">
        <Icon type="arrow-left" />
      </Link>

      <AdminHeaderTitle>{appointmentPlan ? appointmentPlan.title : appointmentPlanId}</AdminHeaderTitle>

      <a href={`https://${app.domain}/creators/${currentMemberId}?tabkey=appointments`} target="_blank" rel="noopener noreferrer">
        <Button>預覽</Button>
      </a>
    </AdminHeader>
  )
}

export default AppointmentPlanHeader
