import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { FormComponentProps } from '@ant-design/compatible/lib/form'
import { gql, useMutation } from '@apollo/client'
import { Button } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import { ExecutionResult } from 'graphql'
import moment from 'moment-timezone'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as CalendarOIcon } from '../../images/default/calendar-alt-o.svg'
import AdminModal from '../admin/AdminModal'
import { StyledDate } from './OrderPhysicalProductCollectionBlock'

const messages = defineMessages({
  shippingNotice: { id: 'merchandise.ui.shippingNotice', defaultMessage: '通知出貨' },
  shipped: { id: 'merchandise.ui.shipped', defaultMessage: '已出貨' },
  cancelNotice: { id: 'merchandise.ui.cancelNotice', defaultMessage: '取消通知' },
  notice: { id: 'merchandise.text.notice', defaultMessage: '※ 請告知買家物流編號與寄送時間，以利買家追蹤商品寄送狀態' },
  send: { id: 'merchandise.ui.send', defaultMessage: '送出' },
})

const StyledFormItemContent = styled.div`
  && {
    .ant-form-item-control {
      line-height: 1.2;
    }
  }
`
const StyledDeliverMessages = styled.p`
  white-space: pre-wrap;
`
const StyledNotice = styled.span`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: var(--gray-darker);
`
type ShippingNoticeModalProps = FormComponentProps & {
  orderLogId: string
  deliveredAt: Date | null
  deliverMessage: string | null
  onRefetch?: () => void
}
const ShippingNoticeModal: React.FC<ShippingNoticeModalProps> = ({
  form: { getFieldDecorator, validateFields },
  orderLogId,
  deliveredAt,
  deliverMessage,
  onRefetch,
}) => {
  const { formatMessage } = useIntl()
  const [isVisible, setVisible] = useState<boolean>(false)
  const [isLoading, setLoading] = useState<boolean>(false)
  const updateDeliverInfo = useUpdateDeliverInfo(orderLogId)

  const handleDeliver = () => {
    validateFields((error, { deliverMessage }) => {
      if (error) return

      setLoading(true)

      updateDeliverInfo({
        deliverMessage,
        deliveredAt: deliverMessage ? new Date() : null,
      })
        .then(() => {
          setVisible(false)
          onRefetch?.()
        })
        .catch(handleError)
        .finally(() => setLoading(false))
    })
  }

  return (
    <AdminModal
      visible={isVisible}
      onCancel={() => setVisible(false)}
      destroyOnClose
      renderTrigger={() => {
        return deliveredAt && deliverMessage ? (
          <Button onClick={() => setVisible(true)}>{formatMessage(messages.shipped)}</Button>
        ) : (
          <Button type="primary" onClick={() => setVisible(true)}>
            {formatMessage(messages.shippingNotice)}
          </Button>
        )
      }}
      footer={
        deliveredAt && deliverMessage ? (
          <>
            <Button style={{ width: '100%' }} onClick={() => handleDeliver()} loading={isLoading}>
              {formatMessage(messages.cancelNotice)}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setVisible(false)}>{formatMessage(commonMessages.ui.cancel)}</Button>
            <Button type="primary" onClick={() => handleDeliver()} loading={isLoading}>
              {formatMessage(messages.send)}
            </Button>
          </>
        )
      }
    >
      <h3 className="mb-4">{formatMessage(messages.shippingNotice)}</h3>
      {deliveredAt && deliverMessage ? (
        <>
          <StyledDate className="mb-4 d-flex align-items-center">
            <CalendarOIcon className="mr-2" />
            {moment(deliveredAt).format('YYYY-MM-DD HH:mm')}
          </StyledDate>
          <StyledDeliverMessages>{deliverMessage}</StyledDeliverMessages>
        </>
      ) : (
        <div>
          <Form>
            <Form.Item>
              <StyledFormItemContent>
                {getFieldDecorator('deliverMessage', {
                  initialValue: `您好，商品已於 ${moment().format('YYYY-MM-DD')} 出貨。
物流編號是 [請填入您的物流編號]，謝謝！`,
                })(<TextArea rows={3} />)}
              </StyledFormItemContent>
              <StyledNotice>{formatMessage(messages.notice)}</StyledNotice>
            </Form.Item>
          </Form>
        </div>
      )}
    </AdminModal>
  )
}

const useUpdateDeliverInfo = (orderLogId: string) => {
  const [updateDeliverInfoHandler] = useMutation(
    gql`
      mutation UPDATE_DELIVER_INFO($deliverMessage: String, $deliveredAt: timestamptz, $orderLogId: String) {
        update_order_log(
          _set: { deliver_message: $deliverMessage, delivered_at: $deliveredAt }
          where: { id: { _eq: $orderLogId } }
        ) {
          affected_rows
        }
      }
    `,
  )

  const updateDeliverInfo: (params: {
    deliverMessage: String | null
    deliveredAt: Date | null
  }) => Promise<ExecutionResult<any>> = ({ deliverMessage, deliveredAt }) => {
    return updateDeliverInfoHandler({
      variables: {
        orderLogId,
        deliverMessage,
        deliveredAt,
      },
    })
  }

  return updateDeliverInfo
}

export default Form.create<ShippingNoticeModalProps>()(ShippingNoticeModal)
