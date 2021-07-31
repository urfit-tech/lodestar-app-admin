import { BellOutlined } from '@ant-design/icons'
import { List, Typography } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import AdminCard from '../components/admin/AdminCard'
import DefaultLayout from '../components/layout/DefaultLayout'
import NotificationItem from '../components/notification/NotificationItem'
import { useAuth } from '../contexts/AuthContext'
import { errorMessages } from '../helpers/translation'
import { useNotifications } from '../hooks/data'

const messages = defineMessages({
  yourNotification: { id: 'common.label.yourNotification', defaultMessage: '你的通知' },
  emptyNotification: { id: 'common.text.emptyNotification', defaultMessage: '目前沒有任何通知' },
})

const NotificationPage = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()

  return (
    <DefaultLayout>
      <div className="py-5">
        <div className="container">
          <Typography.Title className="mb-4" level={3}>
            <BellOutlined className="mr-1" />
            <span>{formatMessage(messages.yourNotification)}</span>
          </Typography.Title>
          {currentMemberId && <NotificationCard memberId={currentMemberId} />}
        </div>
      </div>
    </DefaultLayout>
  )
}

const NotificationCard: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { formatMessage } = useIntl()
  const { notifications, refetch, loading, error } = useNotifications(memberId)

  return (
    <AdminCard loading={loading} style={{ color: '#9b9b9b' }}>
      {error ? (
        formatMessage(errorMessages.data.fetch)
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
        formatMessage(messages.emptyNotification)
      )}
    </AdminCard>
  )
}

export default NotificationPage
