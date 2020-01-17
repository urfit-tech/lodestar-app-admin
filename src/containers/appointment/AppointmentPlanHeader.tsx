import { Button, Icon } from 'antd'
import React, { useContext } from 'react'
import useRouter from 'use-react-router'
import { AdminHeader, AdminHeaderTitle } from '../../components/admin'
import AppointmentPlanContext from '../../contexts/AppointmentPlanContext'

const AppointmentPlanHeader: React.FC<{
  appointmentPlanId: string
}> = ({ appointmentPlanId }) => {
  const { history } = useRouter()
  const { appointmentPlan } = useContext(AppointmentPlanContext)

  return (
    <AdminHeader>
      <Button type="link" onClick={() => history.goBack()} className="mr-3">
        <Icon type="arrow-left" />
      </Button>

      <AdminHeaderTitle>{appointmentPlan ? appointmentPlan.title : appointmentPlanId}</AdminHeaderTitle>
    </AdminHeader>
  )
}

export default AppointmentPlanHeader
