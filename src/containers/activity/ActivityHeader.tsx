import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AdminHeader, AdminHeaderTitle } from '../../components/admin'
import ActivityContext from '../../contexts/ActivityContext'
import AppContext from '../../contexts/AppContext'

const ActivityHeader: React.FC<{
  activityId: string
}> = ({ activityId }) => {
  const { settings } = useContext(AppContext)
  const { activity } = useContext(ActivityContext)

  return (
    <AdminHeader>
      <Link to="/activities">
        <Button type="link" className="mr-3">
          <ArrowLeftOutlined />
        </Button>
      </Link>

      <AdminHeaderTitle>{activity ? activity.title : activityId}</AdminHeaderTitle>
      <a href={`//${settings['host']}/activities/${activityId}`} target="_blank" rel="noopener noreferrer">
        <Button>預覽</Button>
      </a>
    </AdminHeader>
  )
}

export default ActivityHeader
