import {
  BookOutlined,
  DollarOutlined,
  HeartOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  TagOutlined,
} from '@ant-design/icons'
import { useMutation } from '@apollo/client'
import { List } from 'antd'
import { gql } from '@apollo/client'
import moment from 'moment'
import React from 'react'
import styled from 'styled-components'
import hasura from '../../hasura'
import { rgba } from '../../helpers'
import { AvatarImage } from '../common/Image'

const StyledListItem = styled(List.Item)`
  && {
    padding: 0.75rem;
    cursor: pointer;
  }

  &.unread {
    background: ${props => rgba(props.theme['@primary-color'], 0.1)};
  }
`

const NotificationItem: React.FC<{
  id: string
  description: string
  avatar: string | null
  updatedAt: Date
  extra: string | null
  referenceUrl: string | null
  type: string | null
  readAt: Date | null
  onRead?: () => void
}> = ({ id, description, avatar, updatedAt, extra, referenceUrl, type, readAt, onRead }) => {
  const [readNotification] = useMutation<hasura.READ_NOTIFICATION, hasura.READ_NOTIFICATIONVariables>(READ_NOTIFICATION)

  return (
    <StyledListItem
      className={readAt ? '' : 'unread'}
      onClick={() => {
        readNotification({
          variables: { notificationId: id, readAt: new Date() },
        }).then(() => {
          onRead && onRead()
          window.open(referenceUrl || window.location.href)
        })
      }}
    >
      <List.Item.Meta
        className="align-item-start"
        avatar={<AvatarImage size="32px" src={avatar} />}
        title={description}
        description={
          <div style={{ color: '#9b9b9b' }}>
            <span className="mr-1">
              <NotificationIcon type={type} />
            </span>
            <span>{moment(updatedAt).fromNow()}</span>
            {extra && <span>・{extra}</span>}
          </div>
        }
      />
    </StyledListItem>
  )
}

const NotificationIcon: React.FC<{ type: string | null }> = ({ type }) => {
  switch (type) {
    case 'message':
      return <MessageOutlined />
    case 'payment':
      return <DollarOutlined />
    case 'content':
      return <BookOutlined />
    case 'reaction':
      return <HeartOutlined />
    case 'mark':
      return <TagOutlined />
    default:
      return <QuestionCircleOutlined />
  }
}

const READ_NOTIFICATION = gql`
  mutation READ_NOTIFICATION($notificationId: uuid!, $readAt: timestamptz) {
    update_notification(where: { id: { _eq: $notificationId } }, _set: { read_at: $readAt }) {
      affected_rows
    }
  }
`

export default NotificationItem
