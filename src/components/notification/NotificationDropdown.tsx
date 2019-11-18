import { Badge, Button, List, Popover } from 'antd'
import gql from 'graphql-tag'
import React, { useEffect } from 'react'
import { useMutation } from 'react-apollo-hooks'
import styled from 'styled-components'
import useRouter from 'use-react-router'
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
  button {
    font-size: 20px;
  }

  .ant-badge-count {
    top: 8px;
    right: 4px;
  }
`
const StyledButton = styled(Button)`
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

type NotificationDropdownProps = {
  memberId: string
}
const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ memberId }) => {
  const { history } = useRouter()
  const { notifications, startPolling, refetch } = useNotifications(memberId, 15)
  const readAllNotification = useMutation<types.READ_ALL_NOTIFICATIONS, types.READ_ALL_NOTIFICATIONSVariables>(
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
          查看通知
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
          <span>通知</span>
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
            全部標示為已讀
          </StyledReadAllButton>
        </div>
      }
      content={content}
    >
      <StyledBadge count={notifications.filter(notification => notification.readAt === null).length} className="mr-2">
        <StyledButton type="link" icon="bell" />
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
