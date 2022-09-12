import { Button, message } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useGiftPlanMutation } from '../../hooks/giftPlan'
import AdminModal from '../admin/AdminModal'
import giftPlanMessages from './translation'

const GiftPlanDeleteAdminModal: React.VFC<{
  giftPlanId: string
  onRefetch?: () => void
}> = ({ giftPlanId, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const { deleteGiftPlan } = useGiftPlanMutation()

  const handleDelete = (id: string, setVisible: (visible: boolean) => void) => {
    setLoading(true)
    deleteGiftPlan({
      variables: {
        giftPlanId: id,
      },
    })
      .then(() => {
        onRefetch?.()
        setLoading(false)
        setVisible(false)
        message.success(formatMessage(commonMessages.event.successfullyDeleted))
      })
      .catch(handleError)
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <span onClick={() => setVisible(true)}>{formatMessage(commonMessages['ui'].delete)}</span>
      )}
      title={formatMessage(giftPlanMessages.GiftPlanDeleteAdminModal.deleteGriftPlanMessage)}
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
              handleDelete(giftPlanId, setVisible)
            }}
          >
            {formatMessage(commonMessages['ui'].confirm)}
          </Button>
        </div>
      )}
    />
  )
}

export default GiftPlanDeleteAdminModal
