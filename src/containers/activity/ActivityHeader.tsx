import { Button, Icon } from 'antd'
import React, { useContext } from 'react'
import useRouter from 'use-react-router'
import { AdminHeader, AdminHeaderTitle } from '../../components/admin'
import ActivityContext from '../../contexts/ActivityContext'
import AppContext from '../../contexts/AppContext'

const ActivityHeader: React.FC<{
  activityId: string
}> = ({ activityId }) => {
  const { history } = useRouter()
  const { settings } = useContext(AppContext)
  const { activity } = useContext(ActivityContext)

  return (
    <AdminHeader>
      <Button type="link" onClick={() => history.goBack()} className="mr-3">
        <Icon type="arrow-left" />
      </Button>

      <AdminHeaderTitle>{activity ? activity.title : activityId}</AdminHeaderTitle>
      <a href={`//${settings['host']}/activities/${activityId}`} target="_blank" rel="noopener noreferrer">
        <Button>預覽</Button>
      </a>
    </AdminHeader>
  )
}

export default ActivityHeader
