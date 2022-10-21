import { Button } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import AdminModal from '../admin/AdminModal'
import giftPlanMessages from './translation'

const GiftPlanPublishAdminModal: React.VFC<{
  giftPlanId: string
  onRefetch?: () => void
}> = ({ giftPlanId }) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)

  const handlePublish = (id: string, setVisible: (visible: boolean) => void) => {
    setLoading(true)
    setLoading(false)
    setVisible(false)
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <span onClick={() => setVisible(true)}>{formatMessage(commonMessages['ui'].discontinue)}</span>
      )}
      title={formatMessage(giftPlanMessages.GiftPlanPublishAdminModal.discontinueGriftPlanMessage)}
      footer={null}
      renderFooter={({ setVisible }) => (
        <div>
          <Button
            className="mr-2"
            onClick={() => {
              setVisible(false)
            }}
          >
            {formatMessage(commonMessages['ui'].cancel)}
          </Button>
          <Button
            type="primary"
            danger={true}
            loading={loading}
            onClick={() => {
              handlePublish(giftPlanId, setVisible)
            }}
          >
            {formatMessage(commonMessages['ui'].confirm)}
          </Button>
        </div>
      )}
    />
  )
}

export default GiftPlanPublishAdminModal
