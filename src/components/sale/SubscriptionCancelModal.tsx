import { useMutation } from '@apollo/react-hooks'
import { Button, message } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { defineMessage, useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import AdminModal from '../admin/AdminModal'

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

const StyledSaleAdminButton = styled(Button)`
  font-size: 14px;
  border-radius: 4px;
  height: 36px;
  padding: 8px 16px;
`

const SubscriptionCancelModal: React.FC<{
  orderProductId: string
  orderProductOptions: any
  onRefetch?: () => void
}> = ({ orderProductId, orderProductOptions, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [updateSubscriptionPlan] = useMutation<
    types.UPDATE_SUBSCRIPTION_CANCELED,
    types.UPDATE_SUBSCRIPTION_CANCELEDVariables
  >(gql`
    mutation UPDATE_SUBSCRIPTION_CANCELED($orderProductId: uuid, $options: jsonb) {
      update_order_product(where: { id: { _eq: $orderProductId } }, _set: { auto_renewed: false, options: $options }) {
        affected_rows
      }
    }
  `)

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
    <StyledSaleAdminModal
      width="384px"
      bodyStyle={{ padding: '32px 32px 0px 32px', height: '223px' }}
      renderTrigger={({ setVisible }) => (
        <StyledSaleAdminButton type="default" onClick={() => setVisible(true)} size="middle">
          {formatMessage(messages.cancelSubscription)}
        </StyledSaleAdminButton>
      )}
      title={formatMessage(messages.cancelSubscriptionTitle)}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <StyledSaleAdminButton onClick={() => setVisible(false)} style={{ marginRight: '12px' }}>
            {formatMessage(commonMessages.ui.back)}
          </StyledSaleAdminButton>
          <StyledSaleAdminButton
            danger
            type="primary"
            onClick={() => {
              handleSubscriptionCancel()
              setVisible(false)
            }}
          >
            {formatMessage(messages.cancelSubscription)}
          </StyledSaleAdminButton>
        </>
      )}
    >
      <p>{formatMessage(messages.cancelSubscriptionDescription)}</p>
    </StyledSaleAdminModal>
  )
}

export default SubscriptionCancelModal
