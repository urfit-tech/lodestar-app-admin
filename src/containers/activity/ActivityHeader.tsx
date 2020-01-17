import { Button, Icon } from 'antd'
import React, { useContext } from 'react'
import useRouter from 'use-react-router'
import { AdminHeader, AdminHeaderTitle } from '../../components/admin'
import ActivityContext from '../../contexts/ActivityContext'

const ActivityHeader: React.FC<{
  activityId: string
}> = ({ activityId }) => {
  const { history } = useRouter()
  const { activity } = useContext(ActivityContext)

  return (
    <AdminHeader>
      <Button type="link" onClick={() => history.goBack()} className="mr-3">
        <Icon type="arrow-left" />
      </Button>

      <AdminHeaderTitle>{activity ? activity.title : activityId}</AdminHeaderTitle>
    </AdminHeader>
  )
}

export default ActivityHeader
