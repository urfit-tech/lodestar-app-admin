import Icon from '@ant-design/icons'
import { Button } from 'antd'
import React, { useContext } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as IconMail } from '../../images/icon/email-o.svg'
import AdminModal from '../admin/AdminModal'
import { createUploadFn } from '../form/AdminBraftEditor'
import { StyledEditor } from '../issue/IssueReplyCreationBlock'

const messages = defineMessages({
  contactMessage: { id: 'merchandise.ui.contactMessage', defaultMessage: '聯絡訊息' },
  messageContent: { id: 'merchandise.label.messageContent', defaultMessage: '請填寫訊息內容' },
})

const ShippingContactModal: React.FC = () => {
  const { formatMessage } = useIntl()
  const { id: appId } = useContext(AppContext)
  const { authToken } = useAuth()

  return (
    <AdminModal
      title={formatMessage(messages.contactMessage)}
      renderTrigger={({ setVisible }) => (
        <Button icon={<Icon component={() => <IconMail />} />} type="text" onClick={() => setVisible(true)}>
          {formatMessage(messages.contactMessage)}
        </Button>
      )}
      okText={formatMessage(commonMessages.ui.save)}
    >
      <StyledEditor
        language="zh-hant"
        controls={['bold', 'italic', 'underline', 'remove-styles', 'separator', 'media']}
        media={{ uploadFn: createUploadFn(appId, authToken) }}
        placeholder={formatMessage(messages.messageContent)}
      />
    </AdminModal>
  )
}

export default ShippingContactModal
