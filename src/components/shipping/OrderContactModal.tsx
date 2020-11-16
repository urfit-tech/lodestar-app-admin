import Icon from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Form, message, Modal } from 'antd'
import ButtonGroup from 'antd/lib/button/button-group'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled, { css } from 'styled-components'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as IconMail } from '../../images/icon/email-o.svg'
import types from '../../types'
import { AvatarImage } from '../common/Image'
import { BraftContent } from '../common/StyledBraftEditor'
import { createUploadFn } from '../form/AdminBraftEditor'

const messages = defineMessages({
  contactMessage: { id: 'merchandise.ui.contactMessage', defaultMessage: '聯絡訊息' },
  messageContent: { id: 'merchandise.label.messageContent', defaultMessage: '請填寫訊息內容' },
})

const StyledButton = styled(Button)<{ isMark?: boolean }>`
  position: relative;

  ${props =>
    props.isMark &&
    css`
      &::after {
        position: absolute;
        top: 10px;
        right: 10px;
        border-radius: 50%;
        width: 6px;
        height: 6px;
        background-color: var(--error);
        content: '';
      }
    `}
`

const StyledEditor = styled(BraftEditor)`
  .bf-controlbar {
    box-shadow: initial;
  }
  .bf-content {
    border: 1px solid #cdcdcd;
    border-radius: 4px;
    height: initial;
  }
`

const StyledContactBlock = styled.div`
  &:nth-child(n + 1):not(:last-child) {
    border-bottom: 1px solid var(--gray);
  }
`

const StyledMemberInfo = styled.div`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
  line-height: 36px;
  color: var(--gray-dark);
`

const OrderContactBlock: React.FC<{
  avatarUrl: string | null
  name: string
  createdAt: Date
  message: string
}> = ({ avatarUrl, name, createdAt, message }) => {
  return (
    <StyledContactBlock className="d-flex align-items-between mt-4">
      <AvatarImage src={avatarUrl} className="mr-3" size="36px" shape="circle" />
      <div className="mb-4">
        <StyledMemberInfo className="mb-3">
          <span className="mr-2">{name}</span>
          <span>{moment(createdAt).fromNow()}</span>
        </StyledMemberInfo>
        <BraftContent>{message}</BraftContent>
      </div>
    </StyledContactBlock>
  )
}

const OrderContactModal: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { authToken, currentMemberId, backendEndpoint } = useAuth()
  const {
    loading,
    error,
    orderContacts,
    withUnread,
    refetch,
    insertOrderContact,
    updateOrderContactReadAt,
  } = useOrderContact(orderId, currentMemberId || '')
  const [form] = useForm()
  const [isVisible, setVisible] = useState(false)

  const handleFinish = (values: any) => {
    insertOrderContact(values.message.toRAW()).then(() => {
      message.success(formatMessage(commonMessages.event.successfullySaved))
      form.resetFields()
      refetch()
    })
  }

  if (loading || error) {
    return null
  }

  return (
    <>
      <StyledButton
        isMark={withUnread}
        icon={<Icon component={() => <IconMail />} />}
        type="text"
        onClick={() =>
          updateOrderContactReadAt(new Date())
            .then(() => refetch())
            .catch(err => console.error(err))
            .finally(() => setVisible(true))
        }
      >
        {formatMessage(messages.contactMessage)}
      </StyledButton>
      <Modal
        visible={isVisible}
        title={formatMessage(messages.contactMessage)}
        footer={null}
        onCancel={() => setVisible(false)}
      >
        <Form onFinish={handleFinish} form={form}>
          <Form.Item name="message" rules={[{ required: true }]}>
            <StyledEditor
              language="zh-hant"
              className="mb-3"
              controls={['bold', 'italic', 'underline', 'remove-styles', 'separator', 'media']}
              media={{ uploadFn: createUploadFn(appId, authToken, backendEndpoint) }}
              placeholder={formatMessage(messages.messageContent)}
            />
          </Form.Item>
          <Form.Item>
            <ButtonGroup className="d-flex justify-content-end">
              <Button className="mr-2" onClick={() => setVisible(false)}>
                {formatMessage(commonMessages.ui.cancel)}
              </Button>
              <Button type="primary" htmlType="submit">
                {formatMessage(commonMessages.ui.save)}
              </Button>
            </ButtonGroup>
          </Form.Item>
        </Form>
        {orderContacts.map(v => (
          <OrderContactBlock
            key={v.id}
            avatarUrl={v.member.pictureUrl}
            name={v.member.name}
            createdAt={v.createdAt}
            message={v.message}
          />
        ))}
      </Modal>
    </>
  )
}

const useOrderContact = (orderId: string, memberId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_ORDER_CONTACT, types.GET_ORDER_CONTACTVariables>(
    GET_ORDER_CONTACT,
    {
      variables: {
        orderId,
        memberId,
      },
    },
  )

  const orderContacts: {
    id: string
    message: string
    createdAt: Date
    member: {
      id: string
      name: string
      pictureUrl: string | null
    }
  }[] =
    loading || error || !data
      ? []
      : data.order_contact.map(v => ({
          id: v.id,
          message: v.message,
          createdAt: v.created_at,
          member: {
            id: v.member?.id || '',
            name: v.member?.name || '',
            pictureUrl: v.member?.picture_url || '',
          },
        }))

  const latestCreatedAt: Date | null = data?.order_contact_aggregate.aggregate?.max?.created_at
  const latestReadAt: Date | null = data?.order_contact_aggregate.aggregate?.max?.read_at

  const withUnread =
    loading || error || !data ? false : !!latestCreatedAt && (latestReadAt ? latestCreatedAt > latestReadAt : true)

  const [insertOrderContactHandler] = useMutation<types.INSERT_ORDER_CONTACT, types.INSERT_ORDER_CONTACTVariables>(
    INSERT_ORDER_CONTACT,
  )
  const insertOrderContact = (message: string) =>
    insertOrderContactHandler({
      variables: {
        orderId,
        memberId,
        message,
      },
    })

  const [updateOrderContactHandler] = useMutation<
    types.UPDATE_ORDER_CONTACT_READ_AT,
    types.UPDATE_ORDER_CONTACT_READ_ATVariables
  >(UPDATE_ORDER_CONTACT_READ_AT)

  const updateOrderContactReadAt = (readAt: Date) => {
    return updateOrderContactHandler({
      variables: {
        orderId,
        memberId,
        readAt,
      },
    })
  }

  return {
    loading,
    error,
    orderContacts,
    withUnread,
    refetch,
    insertOrderContact,
    updateOrderContactReadAt,
  }
}

const GET_ORDER_CONTACT = gql`
  query GET_ORDER_CONTACT($orderId: String!, $memberId: String!) {
    order_contact(where: { order_id: { _eq: $orderId } }, order_by: { created_at: asc }) {
      id
      message
      created_at
      read_at
      member {
        id
        name
        picture_url
      }
    }
    order_contact_aggregate(where: { order_id: { _eq: $orderId }, member_id: { _neq: $memberId } }) {
      aggregate {
        max {
          created_at
          read_at
        }
      }
    }
  }
`

const INSERT_ORDER_CONTACT = gql`
  mutation INSERT_ORDER_CONTACT($orderId: String!, $memberId: String!, $message: String!) {
    insert_order_contact(objects: { order_id: $orderId, member_id: $memberId, message: $message }) {
      affected_rows
    }
  }
`

const UPDATE_ORDER_CONTACT_READ_AT = gql`
  mutation UPDATE_ORDER_CONTACT_READ_AT($orderId: String!, $memberId: String!, $readAt: timestamptz!) {
    update_order_contact(
      _set: { read_at: $readAt }
      where: { order_id: { _eq: $orderId }, member_id: { _neq: $memberId }, read_at: { _is_null: true } }
    ) {
      affected_rows
    }
  }
`

export default OrderContactModal
