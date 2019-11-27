import { Icon, List, Typography } from 'antd'
import React from 'react'
import { useAuth } from '../../components/auth/AuthContext'
import AdminCard from '../../components/common/AdminCard'
import DefaultLayout from '../../components/layout/DefaultLayout'
import NotificationItem from '../../components/notification/NotificationItem'
import { useNotifications } from '../../hooks/data'

const NotificationPage = () => {
  const { currentMemberId } = useAuth()
  return (
    <DefaultLayout>
      <div className="py-5">
        <div className="container">
          <Typography.Title className="mb-4" level={3}>
            <Icon type="bell" className="mr-1" />
            <span>你的通知</span>
          </Typography.Title>
          {currentMemberId && <NotificationCard memberId={currentMemberId} />}
        </div>
      </div>
    </DefaultLayout>
  )
}

const NotificationCard: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { notifications, refetch, loading, error } = useNotifications(memberId)
  return (
    <AdminCard loading={loading} style={{ color: '#9b9b9b' }}>
      {error ? (
        '無法載入通知'
      ) : notifications.length > 0 ? (
        <List itemLayout="horizontal">
          {notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              id={notification.id}
              description={notification.description}
              avatar={notification.avatar}
              updatedAt={notification.updatedAt}
              extra={notification.extra}
              referenceUrl={notification.referenceUrl}
              type={notification.type}
              readAt={notification.readAt}
              onRead={() => refetch()}
            />
          ))}
        </List>
      ) : (
        '目前沒有任何通知'
      )}
    </AdminCard>
  )
}

export default NotificationPage
