import { Button } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import pageMessages from '../../pages/translation'
import AdminModal from '../admin/AdminModal'

const GiftPlanPublishAdminModal: React.VFC<{
  giftPlanId: string
  onRefetch?: () => void
}> = ({ giftPlanId }) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)

  const handlePublish = (id: string, setVisible: (visible: boolean) => void) => {
    setLoading(true)
    console.log(id)
    setLoading(false)
    setVisible(false)
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <span onClick={() => setVisible(true)}>{formatMessage(commonMessages['ui'].discontinue)}</span>
      )}
      title={formatMessage(pageMessages['GiftPlanCollectionAdminPage'].discontinueGriftPlanMessage)}
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
