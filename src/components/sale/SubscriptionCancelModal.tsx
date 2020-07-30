import React from 'react'
import { useIntl, defineMessage } from 'react-intl'
import { useMutation } from '@apollo/react-hooks'
import { Button, message } from 'antd'
import AdminModal from '../admin/AdminModal'
import gql from 'graphql-tag'
import types from '../../types'
import { commonMessages } from '../../helpers/translation'

const messages = defineMessage({
  cancelSubscription: {
    id: 'common.ui.cancelSbuscription',
    defaultMessage: '取消訂閱',
  },
  cancelSubscriptionTitle: {
    id: 'common.text.cancelSubscriptionTitle',
    defaultMessage: '確定要取消訂閱嗎?',
  },
  cancelSubscriptionDescription: {
    id: 'common.text.cancelSubscriptionDescription',
    defaultMessage: '取消訂閱後，此用戶將於下期停止服務，且不再自動扣款。',
  },
  cancelSubscriptionSuccess: {
    id: 'common.event.cancelSubscriptionSuccess',
    defaultMessage: '取消訂閱成功',
  },
})

const SubscriptionCancelModal: React.FC<{
  orderProductId: string
  orderProductOptions: any
  onRefetch?: () => void
}> = ({ orderProductId, orderProductOptions, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [updateSubscriptionPlan] = useMutation<
    types.UPDATE_SUBSCRIPTION_CANCELED,
    types.UPDATE_SUBSCRIPTION_CANCELEDVariables
  >(UPDATE_SUBSCRIPTION_CANCELED)
  const handleSubscriptionCancel = () => {
    updateSubscriptionPlan({
      variables: {
        orderProductId: orderProductId,
        options: { ...orderProductOptions, unsubscribedAt: new Date() },
      },
    }).then(() => {
      message.success(formatMessage(messages.cancelSubscriptionSuccess))
      onRefetch && onRefetch()
    })
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="default" onClick={() => setVisible(true)} size="middle">
          {formatMessage(messages.cancelSubscription)}
        </Button>
      )}
      title={formatMessage(messages.cancelSubscriptionTitle)}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.back)}
          </Button>
          <Button
            danger
            type="primary"
            onClick={() => {
              handleSubscriptionCancel()
              setVisible(false)
            }}
          >
            {formatMessage(messages.cancelSubscription)}
          </Button>
        </>
      )}
    >
      <p>{formatMessage(messages.cancelSubscriptionDescription)}</p>
    </AdminModal>
  )
}

const UPDATE_SUBSCRIPTION_CANCELED = gql`
  mutation UPDATE_SUBSCRIPTION_CANCELED($orderProductId: uuid, $options: jsonb) {
    update_order_product(where: { id: { _eq: $orderProductId } }, _set: { auto_renewed: false, options: $options }) {
      affected_rows
    }
  }
`

export default SubscriptionCancelModal
