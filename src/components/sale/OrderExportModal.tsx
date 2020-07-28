import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { FormComponentProps } from '@ant-design/compatible/lib/form'
import { DownloadOutlined, DownOutlined, LoadingOutlined } from '@ant-design/icons'
import { useApolloClient } from '@apollo/react-hooks'
import { Button, DatePicker, Dropdown, Menu, Select } from 'antd'
import moment, { Moment } from 'moment'
import React, { useCallback, useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import AppContext from '../../contexts/AppContext'
import { dateFormatter, downloadCSV, toCSV } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import {
  GET_ORDER_DISCOUNT_COLLECTION,
  GET_ORDER_LOG_COLLECTION,
  GET_ORDER_PRODUCT_COLLECTION,
  GET_PAYMENT_LOG_COLLECTION,
  useOrderStatuses,
} from '../../hooks/order'
import types from '../../types'
import AdminModal from '../admin/AdminModal'

const StyledRangePicker = styled(DatePicker.RangePicker)`
  input {
    width: 38%;
    text-align: left;
    &:placeholder-shown {
      text-align: left;
    }
  }
  .ant-calendar-range-picker-separator {
    min-width: 32px;
    vertical-align: unset;
  }
`

const messages = defineMessages({
  exportOrder: { id: 'common.ui.exportOrder', defaultMessage: '匯出資料' },
  exportOrderLog: { id: 'common.ui.exportOrderLog', defaultMessage: '匯出訂單' },
  exportOrderProduct: { id: 'common.ui.exportOrderProduct', defaultMessage: '訂單明細' },
  exportOrderDiscount: { id: 'common.ui.exportOrderDiscount', defaultMessage: '折扣明細' },
  exportPaymentLog: { id: 'common.ui.exportPaymentLog', defaultMessage: '交易明細' },

  invoiceSuccess: { id: 'payment.status.invoiceSuccess', defaultMessage: '開立成功' },
  invoiceFailed: { id: 'payment.status.invoiceFailed', defaultMessage: '開立失敗 {errorCode}' },
  invoicePending: { id: 'payment.status.invoicePending', defaultMessage: '未開立電子發票' },
})

const OrderExportModal: React.FC<FormComponentProps> = ({ form }) => {
  const { formatMessage } = useIntl()
  const client = useApolloClient()
  const { id: appId } = useContext(AppContext)
  const { data: allOrderStatuses } = useOrderStatuses()

  const [loading, setLoading] = useState(false)

  const productTypeLabel: { [key: string]: string } = {
    Program: formatMessage(commonMessages.product.program),
    ProgramPlan: formatMessage(commonMessages.product.programPlan),
    ProgramContent: formatMessage(commonMessages.product.programContent),
    ProgramPackagePlan: formatMessage(commonMessages.product.programPackagePlan),
    ProjectPlan: formatMessage(commonMessages.product.projectPlan),
    Card: formatMessage(commonMessages.product.card),
    ActivityTicket: formatMessage(commonMessages.product.activityTicket),
    Merchandise: formatMessage(commonMessages.product.merchandise),
    PodcastProgram: formatMessage(commonMessages.product.podcastProgram),
    PodcastPlan: formatMessage(commonMessages.product.podcastPlan),
    AppointmentPlan: formatMessage(commonMessages.product.appointmentPlan),
  }

  const getOrderLogContent: (
    startedAt: Date,
    endedAt: Date,
    orderStatuses: string[],
  ) => Promise<string[][]> = useCallback(
    async (startedAt, endedAt, orderStatuses) => {
      const orderLogResult = await client.query<
        types.GET_ORDER_LOG_COLLECTION,
        types.GET_ORDER_LOG_COLLECTIONVariables
      >({
        query: GET_ORDER_LOG_COLLECTION,
        variables: {
          appId,
          startedAt,
          endedAt,
          orderStatuses,
        },
      })

      const orderLogs: types.GET_ORDER_LOG_COLLECTION['order_log'] = orderLogResult.data?.order_log || []

      const data: string[][] = [
        [
          formatMessage(commonMessages.label.orderLogId),
          formatMessage(commonMessages.label.orderLogStatus),
          formatMessage(commonMessages.label.orderLogMemberName),
          formatMessage(commonMessages.label.orderLogMemberEmail),
          formatMessage(commonMessages.label.orderLogUpdatedDate),
          formatMessage(commonMessages.label.orderProductPriceTotal),
          formatMessage(commonMessages.label.orderDiscountPriceTotal),
          formatMessage(commonMessages.label.orderLogPriceTotal),
          formatMessage(commonMessages.label.invoiceName),
          formatMessage(commonMessages.label.invoiceEmail),
          formatMessage(commonMessages.label.invoiceBuyerPhone),
          formatMessage(commonMessages.label.invoiceTarget),
          formatMessage(commonMessages.label.invoiceDonationCode),
          formatMessage(commonMessages.label.invoiceCarrier),
          formatMessage(commonMessages.label.invoiceUniformNumber),
          formatMessage(commonMessages.label.invoiceUniformTitle),
          formatMessage(commonMessages.label.invoiceAddress),
          formatMessage(commonMessages.label.invoiceId),
          formatMessage(commonMessages.label.invoiceStatus),
        ],
        ...orderLogs
          .sort(
            (a, b) =>
              new Date(a.updated_at || a.created_at).valueOf() - new Date(b.updated_at || b.created_at).valueOf(),
          )
          .map(orderLog => {
            const totalProductPrice = orderLog.order_products_aggregate.aggregate?.sum?.price || 0
            const totalDiscountPrice = orderLog.order_discounts_aggregate.aggregate?.sum?.price || 0

            return [
              orderLog.id,
              orderLog.status,
              orderLog.member.name,
              orderLog.member.email,
              dateFormatter(orderLog.updated_at || orderLog.created_at),
              totalProductPrice,
              totalDiscountPrice,
              totalProductPrice - totalDiscountPrice,
              orderLog.invoice.name || '',
              orderLog.invoice.email || '',
              orderLog.invoice.phone || orderLog.invoice.buyerPhone || '', // buyerPhone is a deprecated field
              orderLog.invoice.donationCode ? '捐贈' : orderLog.invoice.uniformNumber ? '公司' : '個人',
              orderLog.invoice.donationCode || '',
              orderLog.invoice.phoneBarCode ? '手機' : orderLog.invoice.citizenCode ? '自然人憑證' : '',
              orderLog.invoice.uniformNumber || '',
              orderLog.invoice.uniformTitle || '',
              `${orderLog.invoice.postCode || ''} ${orderLog.invoice.address || ''}`,
              orderLog.invoice.id || '',
              !orderLog.invoice.status
                ? formatMessage(messages.invoicePending)
                : orderLog.invoice.status === 'SUCCESS'
                ? formatMessage(messages.invoiceSuccess)
                : formatMessage(messages.invoiceFailed, { errorCode: orderLog.invoice.status }),
            ]
          }),
      ]

      return data
    },
    [appId, client, formatMessage],
  )

  const getOrderProductContent: (
    startedAt: Date,
    endedAt: Date,
    orderStatuses: string[],
  ) => Promise<string[][]> = useCallback(
    async (startedAt, endedAt, orderStatuses) => {
      const orderProductResult = await client.query<
        types.GET_ORDER_PRODUCT_COLLECTION,
        types.GET_ORDER_PRODUCT_COLLECTIONVariables
      >({
        query: GET_ORDER_PRODUCT_COLLECTION,
        variables: {
          appId,
          startedAt,
          endedAt,
          orderStatuses,
        },
      })

      const orderProducts: types.GET_ORDER_PRODUCT_COLLECTION['order_product'] =
        orderProductResult.data?.order_product || []

      const data: string[][] = [
        [
          formatMessage(commonMessages.label.orderLogId),
          formatMessage(commonMessages.label.orderLogMemberName),
          formatMessage(commonMessages.label.invoicePhone),
          formatMessage(commonMessages.label.orderProductType),
          formatMessage(commonMessages.label.orderProductName),
          formatMessage(commonMessages.label.orderProductPrice),
          formatMessage(commonMessages.term.startedAt),
          formatMessage(commonMessages.term.endedAt),
          formatMessage(commonMessages.label.orderProductAutoRenew),
        ],
        ...orderProducts.map(orderProduct => [
          orderProduct.order_log.id,
          orderProduct.order_log.name,
          orderProduct.order_log.phone,
          productTypeLabel[orderProduct.product.type] || formatMessage(commonMessages.product.unknownType),
          orderProduct.name,
          orderProduct.price,
          dateFormatter(orderProduct.started_at),
          dateFormatter(orderProduct.ended_at),
          orderProduct.auto_renewed,
        ]),
      ]

      return data
    },
    [appId, client, formatMessage, productTypeLabel],
  )

  const getOrderDiscountContent: (
    startedAt: Date,
    endedAt: Date,
    orderStatuses: string[],
  ) => Promise<string[][]> = useCallback(
    async (startedAt, endedAt, orderStatuses) => {
      const orderDiscountResult = await client.query<
        types.GET_ORDER_DISCOUNT_COLLECTION,
        types.GET_ORDER_DISCOUNT_COLLECTIONVariables
      >({
        query: GET_ORDER_DISCOUNT_COLLECTION,
        variables: {
          appId,
          startedAt,
          endedAt,
          orderStatuses,
        },
      })

      const orderDiscounts: types.GET_ORDER_DISCOUNT_COLLECTION['order_discount'] =
        orderDiscountResult.data?.order_discount || []

      const data: string[][] = [
        [
          formatMessage(commonMessages.label.orderLogId),
          formatMessage(commonMessages.label.orderDiscountType),
          formatMessage(commonMessages.label.orderDiscountId),
          formatMessage(commonMessages.label.orderDiscountName),
          formatMessage(commonMessages.label.orderDiscountPrice),
        ],
        ...orderDiscounts.map(orderDiscount => [
          orderDiscount.order_log.id,
          orderDiscount.type,
          orderDiscount.id,
          orderDiscount.name,
          orderDiscount.price,
        ]),
      ]

      return data
    },
    [appId, client, formatMessage],
  )

  const getPaymentLogContent: (
    startedAt: Date,
    endedAt: Date,
    orderStatuses: string[],
  ) => Promise<string[][]> = useCallback(
    async (startedAt, endedAt, orderStatuses) => {
      const paymentLogResult = await client.query<
        types.GET_PAYMENT_LOG_COLLECTION,
        types.GET_PAYMENT_LOG_COLLECTIONVariables
      >({
        query: GET_PAYMENT_LOG_COLLECTION,
        variables: {
          appId,
          startedAt,
          endedAt,
          orderStatuses,
        },
      })

      const paymentLogs: types.GET_PAYMENT_LOG_COLLECTION['payment_log'] = paymentLogResult.data?.payment_log || []

      const data: string[][] = [
        [
          formatMessage(commonMessages.label.orderLogMemberName),
          formatMessage(commonMessages.label.orderLogMemberEmail),
          formatMessage(commonMessages.label.orderLogId),
          formatMessage(commonMessages.label.paymentNo),
          formatMessage(commonMessages.label.orderLogStatus),
          formatMessage(commonMessages.label.paymentCreatedAt),
          formatMessage(commonMessages.label.paymentPrice),
        ],
        ...paymentLogs.map(paymentLog => [
          paymentLog.order_log.member.name,
          paymentLog.order_log.member.email,
          paymentLog.order_log.id,
          paymentLog.no,
          paymentLog.status,
          dateFormatter(paymentLog.paid_at || paymentLog.created_at),
          paymentLog.order_log.order_products_aggregate.aggregate?.sum?.price || 0,
        ]),
      ]

      return data
    },
    [appId, client, formatMessage],
  )

  const handleExport = (exportTarget: 'orderLog' | 'orderProduct' | 'orderDiscount' | 'paymentLog') => {
    form.validateFields(
      async (
        errors,
        values: {
          timeRange: Moment[]
          orderStatuses: string[]
        },
      ) => {
        if (errors) {
          return
        }

        setLoading(true)

        const startedAt = values.timeRange[0].toDate()
        const endedAt = values.timeRange[1].toDate()
        const orderStatuses: string[] = values.orderStatuses.includes('FAILED')
          ? [
              ...values.orderStatuses,
              ...(allOrderStatuses.filter(
                status => !(status === 'REFUND' || status === 'UNPAID' || status === 'SUCCESS' || status === 'FAILED'),
              ) || []),
            ]
          : values.orderStatuses

        let fileName = 'untitled.csv'
        let content: string[][] = []

        switch (exportTarget) {
          case 'orderLog':
            fileName = 'orders'
            content = await getOrderLogContent(startedAt, endedAt, orderStatuses)
            break

          case 'orderProduct':
            fileName = 'items'
            content = await getOrderProductContent(startedAt, endedAt, orderStatuses)
            break

          case 'orderDiscount':
            fileName = 'discounts'
            content = await getOrderDiscountContent(startedAt, endedAt, orderStatuses)
            break

          case 'paymentLog':
            fileName = 'payments'
            content = await getPaymentLogContent(startedAt, endedAt, orderStatuses)
            break
        }

        downloadCSV(
          `${fileName}_${moment(startedAt).format('YYYYMMDD')}_${moment(endedAt).format('YYYYMMDD')}.csv`,
          toCSV(content),
        )
        setLoading(false)
      },
    )
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon={<DownloadOutlined />} onClick={() => setVisible(true)}>
          {formatMessage(messages.exportOrder)}
        </Button>
      )}
      title={formatMessage(messages.exportOrder)}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Dropdown.Button
            type="primary"
            icon={<DownOutlined />}
            overlay={
              <Menu>
                <Menu.Item key="order-product" onClick={() => handleExport('orderProduct')}>
                  <Button type="link">{formatMessage(messages.exportOrderProduct)}</Button>
                </Menu.Item>
                <Menu.Item key="order-discount" onClick={() => handleExport('orderDiscount')}>
                  <Button type="link">{formatMessage(messages.exportOrderDiscount)}</Button>
                </Menu.Item>
                <Menu.Item key="payment-log" onClick={() => handleExport('paymentLog')}>
                  <Button type="link">{formatMessage(messages.exportPaymentLog)}</Button>
                </Menu.Item>
              </Menu>
            }
            onClick={() => !loading && handleExport('orderLog')}
          >
            {loading ? <LoadingOutlined /> : <div>{formatMessage(messages.exportOrderLog)}</div>}
          </Dropdown.Button>
        </>
      )}
      maskClosable={false}
    >
      <Form colon={false} hideRequiredMark>
        <Form.Item label={formatMessage(commonMessages.label.dateRange)}>
          {form.getFieldDecorator('timeRange', {
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.term.timeRange),
                }),
              },
            ],
          })(
            <StyledRangePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD HH:mm:ss"
              defaultValue={[moment().startOf('day'), moment().endOf('day')]}
            />,
          )}
        </Form.Item>

        <Form.Item label={formatMessage(commonMessages.label.orderLogStatus)}>
          {form.getFieldDecorator('orderStatuses', {
            initialValue: [],
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.term.orderStatus),
                }),
              },
            ],
          })(
            <Select mode="multiple" placeholder={formatMessage(commonMessages.label.orderLogStatus)}>
              <Select.Option value="UNPAID">{formatMessage(commonMessages.status.orderUnpaid)}</Select.Option>
              <Select.Option value="SUCCESS">{formatMessage(commonMessages.status.orderSuccess)}</Select.Option>
              <Select.Option value="FAILED">{formatMessage(commonMessages.status.orderFailed)}</Select.Option>
              <Select.Option value="REFUND">{formatMessage(commonMessages.status.orderRefund)}</Select.Option>
            </Select>,
          )}
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default Form.create<FormComponentProps>()(OrderExportModal)
