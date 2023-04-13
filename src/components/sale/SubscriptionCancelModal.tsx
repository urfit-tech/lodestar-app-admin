import { gql, useMutation } from '@apollo/client'
import { Button, message } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import AdminModal from '../admin/AdminModal'

const messages = defineMessages({
  cancelSubscription: {
    id: 'common.ui.cancelSubscription',
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

const StyledSaleAdminModal = styled(AdminModal)`
  .ant-modal-body {
    letter-spacing: 0.2px;
    h1 {
      font-size: 18px;
      letter-spacing: 0.8px;
    }
    p {
      margin-bottom: 2em;
    }
  }
`

const SubscriptionCancelModal: React.FC<{
  orderProducts: {
    id: string
    options: any
  }[]
  onRefetch?: () => void
}> = ({ orderProducts, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [updateSubscriptionPlan] = useMutation<
    hasura.UPDATE_SUBSCRIPTION_CANCELED,
    hasura.UPDATE_SUBSCRIPTION_CANCELEDVariables
  >(gql`
    mutation UPDATE_SUBSCRIPTION_CANCELED($orderProductId: uuid, $options: jsonb) {
      update_order_product(where: { id: { _eq: $orderProductId } }, _set: { auto_renewed: false, options: $options }) {
        affected_rows
      }
    }
  `)

  const handleSubscriptionCancel = async () => {
    try {
      for (const orderProduct of orderProducts) {
        await updateSubscriptionPlan({
          variables: {
            orderProductId: orderProduct.id,
            options: { ...orderProduct.options, unsubscribedAt: new Date() },
          },
        })
      }
      message.success(formatMessage(messages.cancelSubscriptionSuccess))
      onRefetch?.()
    } catch (error) {
      handleError(error)
    }
  }

  return (
    <StyledSaleAdminModal
      width="384px"
      bodyStyle={{ padding: '32px 32px 0px 32px', height: '223px' }}
      renderTrigger={({ setVisible }) => (
        <Button size="middle" className="mr-2" onClick={() => setVisible(true)}>
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
            onClick={async () => {
              await handleSubscriptionCancel()
              setVisible(false)
            }}
          >
            {formatMessage(messages.cancelSubscription)}
          </Button>
        </>
      )}
    >
      <p>{formatMessage(messages.cancelSubscriptionDescription)}</p>
    </StyledSaleAdminModal>
  )
}

export default SubscriptionCancelModal
