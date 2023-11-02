import { BellOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Badge, Button, List, Popover } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import hasura from '../../hasura'
import { useNotifications } from '../../hooks/data'
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
const StyledBadgeWrapper = styled.div`
  .ant-badge-count {
    top: 8px;
    right: 4px;
  }

  @media screen and (max-width: 480px) {
    width: 29.85px;
    font-size: 50%;
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

  @media screen and (max-width: 480px) {
    width: 29.85px;
  }
`
const StyledReadAllButton = styled(Button)`
  color: var(--gray-dark);
`

const messages = defineMessages({
  notification: { id: 'common.label.notification', defaultMessage: '通知' },
  checkNotifications: { id: 'common.ui.checkNotifications', defaultMessage: '查看通知' },
  markAllAsRead: { id: 'common.ui.markAllAsRead', defaultMessage: '全部標示為已讀' },
})

const NotificationDropdown: React.FC<{
  memberId: string
}> = ({ memberId }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { notifications, refetch } = useNotifications(memberId, 15)

  const [readAllNotification] = useMutation<hasura.READ_ALL_NOTIFICATIONS, hasura.READ_ALL_NOTIFICATIONSVariables>(
    READ_ALL_NOTIFICATION,
  )

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
        <Button type="link" block onClick={() => history.push(`/notifications`)}>
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
      <StyledBadgeWrapper className="mr-2">
        <Badge count={notifications.filter(notification => notification.readAt === null).length}>
          <StyledButton type="link" icon={<BellOutlined />} />
        </Badge>
      </StyledBadgeWrapper>
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
