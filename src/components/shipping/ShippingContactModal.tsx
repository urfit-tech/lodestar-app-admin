import Icon from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Form, message, Modal } from 'antd'
import ButtonGroup from 'antd/lib/button/button-group'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import AppContext from '../../contexts/AppContext'
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

const MerchandiseContactBlock: React.FC<{
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

const ShippingContactModal: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useContext(AppContext)
  const { authToken, currentMemberId } = useAuth()
  const [isVisible, setVisible] = useState(false)
  const [form] = useForm()
  const { loading, error, orderContacts, refetch, insertOrderContact } = useOrderContact(orderId)

  const handleFinish = (values: any) => {
    insertOrderContact({
      variables: {
        orderId,
        memberId: currentMemberId || '',
        message: values.message.toRAW(),
      },
    }).then(() => {
      form.resetFields()
      message.success(formatMessage(commonMessages.event.successfullySaved))
      refetch()
    })
  }

  if (loading || error) {
    return null
  }

  return (
    <>
      <Button icon={<Icon component={() => <IconMail />} />} type="text" onClick={() => setVisible(true)}>
        {formatMessage(messages.contactMessage)}
      </Button>
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
              media={{ uploadFn: createUploadFn(appId, authToken) }}
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
        <div>
          {orderContacts.map(v => (
            <MerchandiseContactBlock
              key={v.id}
              avatarUrl={v.member.pictureUrl}
              name={v.member.name}
              createdAt={v.createdAt}
              message={v.message}
            />
          ))}
        </div>
      </Modal>
    </>
  )
}

const useOrderContact = (orderId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_ORDER_CONTACT, types.GET_ORDER_CONTACTVariables>(
    GET_ORDER_CONTACT,
    {
      variables: {
        orderId,
      },
    },
  )
  const [insertOrderContact] = useMutation<types.INSERT_ORDER_CONTACT, types.INSERT_ORDER_CONTACTVariables>(
    INSERT_ORDER_CONTACT,
  )

  const orderContacts: {
    id: string
    message: string
    createdAt: Date
    updatedAt: Date
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
          updatedAt: v.updated_at,
          member: {
            id: v.member.id,
            name: v.member.name,
            pictureUrl: v.member.picture_url,
          },
        }))

  return {
    loading,
    error,
    orderContacts,
    refetch,
    insertOrderContact,
  }
}

const GET_ORDER_CONTACT = gql`
  query GET_ORDER_CONTACT($orderId: String!) {
    order_contact(where: { order_log: { id: { _eq: $orderId } } }) {
      id
      message
      created_at
      updated_at
      member {
        id
        name
        picture_url
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

export default ShippingContactModal
