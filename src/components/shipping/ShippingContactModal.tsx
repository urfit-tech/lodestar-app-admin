import Icon from '@ant-design/icons'
import { Button, Modal } from 'antd'
import ButtonGroup from 'antd/lib/button/button-group'
import BraftEditor from 'braft-editor'
import moment from 'moment'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as IconMail } from '../../images/icon/email-o.svg'
import { AvatarImage } from '../common/Image'
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
    border-bottom: 2px solid var(--gray);
  }
`

const StyledMemberInfo = styled.div`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
  line-height: 36px;
  color: var(--gray-dark);
`

const StyledContactMessage = styled.div`
  white-space: break-spaces;
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
        <StyledContactMessage>{message}</StyledContactMessage>
      </div>
    </StyledContactBlock>
  )
}

const ShippingContactModal: React.FC<{
  orderContacts: {
    id: string
    message: string
    createdAt: Date
    updatedAt: Date
    member: {
      id: string
      name: string
      pictureUrl: string | null
    }
  }[]
}> = ({ orderContacts }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useContext(AppContext)
  const { authToken } = useAuth()
  const [isVisible, setVisible] = useState(false)

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
        <StyledEditor
          language="zh-hant"
          className="mb-3"
          controls={['bold', 'italic', 'underline', 'remove-styles', 'separator', 'media']}
          media={{ uploadFn: createUploadFn(appId, authToken) }}
          placeholder={formatMessage(messages.messageContent)}
        />
        <ButtonGroup className="d-flex justify-content-end">
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </ButtonGroup>
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

export default ShippingContactModal
