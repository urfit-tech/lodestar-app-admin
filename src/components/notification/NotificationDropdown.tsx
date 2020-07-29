import { BellOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Badge, Button, List, Popover } from 'antd'
import gql from 'graphql-tag'
import React, { useEffect } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { useNotifications } from '../../hooks/data'
import types from '../../types'
import NotificationItem from './NotificationItem'

const Wrapper = styled.div`
  width: 100vw;
  max-width: 432px;
`
const StyledList = styled(List)`
  && {
    max-height: calc(70vh - 57px - 42px);
    overflow-y: auto;
    overflow-x: hidden;
  }
`
const StyledAction = styled.div`
  border-top: 1px solid #ececec;

  button {
    color: #9b9b9b;
  }
`
const StyledBadge = styled(Badge)`
  .ant-badge-count {
    top: 8px;
    right: 4px;
  }
`
const StyledButton = styled(Button)`
  font-size: 20px;
  &&,
  &&:hover,
  &&:active,
  &&:focus {
    color: var(--gray-darker);
  }
`
const StyledReadAllButton = styled(Button)`
  color: var(--gray-dark);
`

const messages = defineMessages({
  checkNotifications: { id: 'notification.ui.checkNotifications', defaultMessage: '查看通知' },
  notification: { id: 'notification.term.notification', defaultMessage: '通知' },
  markAllAsRead: { id: 'notification.ui.markAllAsRead', defaultMessage: '全部標示為已讀' },
})

const NotificationDropdown: React.FC<{
  memberId: string
}> = ({ memberId }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { notifications, startPolling, refetch } = useNotifications(memberId, 15)

  const [readAllNotification] = useMutation<types.READ_ALL_NOTIFICATIONS, types.READ_ALL_NOTIFICATIONSVariables>(
    READ_ALL_NOTIFICATION,
  )

  useEffect(() => {
    startPolling(3000)
  }, [startPolling])

  const content = (
    <Wrapper>
      <StyledList itemLayout="horizontal">
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
      </StyledList>
      <StyledAction>
        <Button type="link" block onClick={() => history.push('/notifications')}>
          {formatMessage(messages.checkNotifications)}
        </Button>
      </StyledAction>
    </Wrapper>
  )

  return (
    <Popover
      placement="bottomRight"
      trigger="click"
      title={
        <div className="d-flex align-items-center justify-content-between">
          <span>{formatMessage(messages.notification)}</span>
          <StyledReadAllButton
            type="link"
            size="small"
            onClick={() =>
              readAllNotification({
                variables: {
                  readAt: new Date(),
                },
              }).then(() => refetch())
            }
          >
            {formatMessage(messages.markAllAsRead)}
          </StyledReadAllButton>
        </div>
      }
      content={content}
    >
      <StyledBadge count={notifications.filter(notification => notification.readAt === null).length} className="mr-2">
        <StyledButton type="link" icon={<BellOutlined />} />
      </StyledBadge>
    </Popover>
  )
}

const READ_ALL_NOTIFICATION = gql`
  mutation READ_ALL_NOTIFICATIONS($readAt: timestamptz) {
    update_notification(where: { read_at: { _is_null: true } }, _set: { read_at: $readAt }) {
      affected_rows
    }
  }
`

export default NotificationDropdown
