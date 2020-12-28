import { DownloadOutlined, DownOutlined, LoadingOutlined } from '@ant-design/icons'
import { useApolloClient } from '@apollo/react-hooks'
import { Button, DatePicker, Dropdown, Form, Menu, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import moment, { Moment } from 'moment'
import React, { useCallback, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { useApp } from '../../contexts/AppContext'
import { dateFormatter, downloadCSV, toCSV } from '../../helpers'
import { commonMessages, errorMessages, orderMessages } from '../../helpers/translation'
import { useOrderStatuses } from '../../hooks/order'
import types from '../../types'
import AdminModal from '../admin/AdminModal'

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

const StyledRangePicker = styled(props => <DatePicker.RangePicker {...props} />)`
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

type FieldProps = {
  timeRange: [Moment, Moment]
  orderStatuses: ('UNPAID' | 'SUCCESS' | 'FAILED' | 'REFUND')[]
}

const OrderExportModal: React.FC = () => {
  const { formatMessage } = useIntl()
  const client = useApolloClient()
  const [form] = useForm<FieldProps>()
  const { data: allOrderStatuses } = useOrderStatuses()
  const { enabledModules } = useApp()

  const [loading, setLoading] = useState(false)

  const getOrderLogContent: (
    startedAt: Date,
    endedAt: Date,
    orderStatuses: string[],
  ) => Promise<string[][]> = useCallback(
    async (startedAt, endedAt, orderStatuses) => {
      const orderLogExportResult = await client.query<types.GET_ORDER_LOG_EXPORT, types.GET_ORDER_LOG_EXPORTVariables>({
        query: GET_ORDER_LOG_EXPORT,
        variables: {
          condition: {
            _or: [
              { updated_at: { _gte: startedAt, _lte: endedAt } },
              { updated_at: { _is_null: true }, created_at: { _gte: startedAt, _lte: endedAt } },
            ],
            status: {
              _in: orderStatuses,
            },
          },
        },
      })

      const orderLogs: types.GET_ORDER_LOG_EXPORT['order_log_export'] = orderLogExportResult.data.order_log_export || []

      const data: string[][] = [
        [
          formatMessage(orderMessages.label.orderLogId),
          formatMessage(orderMessages.label.paymentLogNo),
          formatMessage(orderMessages.label.orderLogStatus),
          formatMessage(orderMessages.label.orderLogCreatedAt),
          formatMessage(orderMessages.label.orderLogUpdatedAt),
          formatMessage(orderMessages.label.paymentLogPaidAt),
          formatMessage(orderMessages.label.memberName),
          formatMessage(orderMessages.label.memberEmail),
          formatMessage(orderMessages.label.orderProductName),
          formatMessage(orderMessages.label.orderDiscountName),
          formatMessage(orderMessages.label.orderProductCount),
          formatMessage(orderMessages.label.orderProductTotalPrice),
          formatMessage(orderMessages.label.orderDiscountTotalPrice),
          formatMessage(orderMessages.label.orderLogTotalPrice),
          formatMessage(orderMessages.label.paymentLogDetails),
          enabledModules.sharing_code ? formatMessage(orderMessages.label.sharingCode) : undefined,
          enabledModules.sharing_code ? formatMessage(orderMessages.label.sharingNote) : undefined,
          enabledModules.member_assignment ? formatMessage(orderMessages.label.orderLogExecutor) : undefined,
          formatMessage(orderMessages.label.invoiceName),
          formatMessage(orderMessages.label.invoiceEmail),
          formatMessage(orderMessages.label.invoicePhone),
          formatMessage(orderMessages.label.invoiceTarget),
          formatMessage(orderMessages.label.invoiceDonationCode),
          formatMessage(orderMessages.label.invoiceCarrier),
          formatMessage(orderMessages.label.invoiceUniformNumber),
          formatMessage(orderMessages.label.invoiceUniformTitle),
          formatMessage(orderMessages.label.invoiceAddress),
          enabledModules.invoice ? formatMessage(orderMessages.label.invoiceId) : undefined,
          formatMessage(orderMessages.label.invoiceStatus),
        ].filter(v => typeof v !== 'undefined'),
        ...orderLogs
          .sort(
            (a, b) =>
              new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime(),
          )
          .map(orderLog =>
            [
              orderLog.order_log_id,
              orderLog.payment_no?.split('\\n').join('\n') || '',
              orderLog.status,
              dateFormatter(orderLog.created_at),
              orderLog.updated_at ? dateFormatter(orderLog.updated_at) : '',
              orderLog.paid_at
                ?.split('\\n')
                .map(v => (v ? dateFormatter(v) : ''))
                .join('\n') || '',
              orderLog.member_name,
              orderLog.member_email,
              orderLog.order_products?.split('\\n').join('\n') || '',
              orderLog.order_discounts?.split('\\n').join('\n') || '',
              orderLog.order_product_num || 0,
              orderLog.order_product_total_price || 0,
              orderLog.order_discount_total_price || 0,
              (orderLog.order_product_total_price || 0) - (orderLog.order_discount_total_price || 0),
              orderLog.payment_options?.split('\\n').join('\n') || '',
              enabledModules.sharing_code ? orderLog.sharing_codes?.split('\\n').join('\n') || '' : undefined,
              enabledModules.sharing_code ? orderLog.sharing_notes?.split('\\n').join('\n') || '' : undefined,
              enabledModules.member_assignment ? orderLog.order_executors?.split('\\n').join('\n') || '' : undefined,
              orderLog.invoice?.name || '',
              orderLog.invoice?.email || '',
              orderLog.invoice?.phone || orderLog.invoice?.buyerPhone || '',
              orderLog.invoice?.donationCode ? '捐贈' : orderLog.invoice?.uniformNumber ? '公司' : '個人',
              orderLog.invoice?.donationCode || '',
              orderLog.invoice?.phoneBarCode ? '手機' : orderLog.invoice?.citizenCode ? '自然人憑證' : '',
              orderLog.invoice?.uniformNumber || '',
              orderLog.invoice?.uniformTitle || '',
              `${orderLog.invoice?.postCode || ''} ${orderLog.invoice?.address || ''}`,
              enabledModules.invoice ? orderLog.invoice?.id || '' : undefined,
              !orderLog.invoice?.status
                ? formatMessage(messages.invoicePending)
                : orderLog.invoice?.status === 'SUCCESS'
                ? formatMessage(messages.invoiceSuccess)
                : formatMessage(messages.invoiceFailed, { errorCode: orderLog.invoice?.status }),
            ].filter(v => typeof v !== 'undefined'),
          ),
      ]

      return data
    },
    [client, enabledModules, formatMessage],
  )

  const getOrderProductContent: (
    startedAt: Date,
    endedAt: Date,
    orderStatuses: string[],
  ) => Promise<string[][]> = useCallback(
    async (startedAt, endedAt, orderStatuses) => {
      const orderProductExportResult = await client.query<
        types.GET_ORDER_PRODUCT_EXPORT,
        types.GET_ORDER_PRODUCT_EXPORTVariables
      >({
        query: GET_ORDER_PRODUCT_EXPORT,
        variables: {
          condition: {
            order_log: {
              _or: [
                { updated_at: { _gte: startedAt, _lte: endedAt } },
                { updated_at: { _is_null: true }, created_at: { _gte: startedAt, _lte: endedAt } },
              ],
              status: {
                _in: orderStatuses,
              },
            },
          },
        },
      })

      const productTypeLabel: { [key: string]: string } = {
        Program: formatMessage(commonMessages.product.program),
        ProgramPlan: formatMessage(commonMessages.product.programPlan),
        ProgramContent: formatMessage(commonMessages.product.programContent),
        ProgramPackagePlan: formatMessage(commonMessages.product.programPackagePlan),
        ProjectPlan: formatMessage(commonMessages.product.projectPlan),
        Card: formatMessage(commonMessages.product.card),
        ActivityTicket: formatMessage(commonMessages.product.activityTicket),
        MerchandiseSpec: formatMessage(commonMessages.product.merchandiseSpec),
        PodcastProgram: formatMessage(commonMessages.product.podcastProgram),
        PodcastPlan: formatMessage(commonMessages.product.podcastPlan),
        AppointmentPlan: formatMessage(commonMessages.product.appointmentPlan),
      }

      const orderProducts: types.GET_ORDER_PRODUCT_EXPORT['order_product_export'] =
        orderProductExportResult.data?.order_product_export || []

      const data: string[][] = [
        [
          formatMessage(orderMessages.label.orderLogId),
          formatMessage(orderMessages.label.paymentLogPaidAt),
          formatMessage(orderMessages.label.productOwner),
          formatMessage(orderMessages.label.productType),
          formatMessage(orderMessages.label.orderProductName),
          formatMessage(orderMessages.label.productQuantity),
          formatMessage(orderMessages.label.productPrice),
          enabledModules.sharing_code ? formatMessage(orderMessages.label.sharingCode) : undefined,
        ].filter(v => typeof v !== 'undefined'),
        ...orderProducts.map(orderProduct =>
          [
            orderProduct.order_log_id,
            orderProduct.paid_at ? dateFormatter(orderProduct.paid_at) : '',
            orderProduct.product_owner || '',
            productTypeLabel[orderProduct.product_id?.split('_')[0] || ''] ||
              formatMessage(commonMessages.product.unknownType),
            orderProduct.name,
            orderProduct.quantity,
            orderProduct.price,
            enabledModules.sharing_code ? orderProduct.options?.sharingCode || '' : undefined,
          ].filter(v => typeof v !== 'undefined'),
        ),
      ]

      return data
    },
    [client, enabledModules, formatMessage],
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
          formatMessage(commonMessages.label.orderDiscountId),
          formatMessage(commonMessages.label.orderDiscountName),
          formatMessage(commonMessages.label.orderDiscountPrice),
        ],
        ...orderDiscounts.map(orderDiscount => [
          orderDiscount.order_log.id,
          orderDiscount.id,
          orderDiscount.name,
          orderDiscount.price,
        ]),
      ]

      return data
    },
    [client, formatMessage],
  )

  const getPaymentLogContent: (
    startedAt: Date,
    endedAt: Date,
    orderStatuses: string[],
  ) => Promise<string[][]> = useCallback(
    async (startedAt, endedAt, orderStatuses) => {
      const paymentLogExportResult = await client.query<
        types.GET_PAYMENT_LOG_EXPORT,
        types.GET_PAYMENT_LOG_EXPORTVariables
      >({
        query: GET_PAYMENT_LOG_EXPORT,
        variables: {
          condition: {
            order_log: {
              _or: [
                { updated_at: { _gte: startedAt, _lte: endedAt } },
                { updated_at: { _is_null: true }, created_at: { _gte: startedAt, _lte: endedAt } },
              ],
              status: {
                _in: orderStatuses,
              },
            },
          },
        },
      })

      const paymentLogs: types.GET_PAYMENT_LOG_EXPORT['payment_log_export'] =
        paymentLogExportResult.data?.payment_log_export || []

      const data: string[][] = [
        [
          formatMessage(orderMessages.label.orderLogId),
          formatMessage(orderMessages.label.paymentLogNo),
          enabledModules.invoice ? formatMessage(orderMessages.label.invoiceId) : undefined,
          formatMessage(orderMessages.label.orderLogStatus),
          formatMessage(orderMessages.label.orderProductName),
          formatMessage(orderMessages.label.memberName),
          formatMessage(orderMessages.label.memberEmail),
          formatMessage(orderMessages.label.paymentLogPaidAt),
          formatMessage(orderMessages.label.orderProductCount),
          formatMessage(orderMessages.label.orderProductTotalPrice),
          formatMessage(orderMessages.label.orderDiscountTotalPrice),
          formatMessage(orderMessages.label.orderLogTotalPrice),
          formatMessage(orderMessages.label.invoiceStatus),
        ].filter(v => typeof v !== 'undefined'),
        ...paymentLogs.map(paymentLog =>
          [
            paymentLog.order_log_id,
            paymentLog.payment_log_no,
            enabledModules.invoice ? paymentLog.invoice?.id || '' : undefined,
            paymentLog.status,
            paymentLog.order_products?.split('\\n').join('\n'),
            paymentLog.member_name,
            paymentLog.email,
            paymentLog.paid_at ? dateFormatter(paymentLog.paid_at) : '',
            paymentLog.order_product_num || 0,
            paymentLog.order_product_total_price || 0,
            paymentLog.order_discount_total_price || 0,
            (paymentLog.order_product_total_price || 0) - (paymentLog.order_discount_total_price || 0),
            !paymentLog.invoice?.status
              ? formatMessage(messages.invoicePending)
              : paymentLog.invoice?.status === 'SUCCESS'
              ? formatMessage(messages.invoiceSuccess)
              : formatMessage(messages.invoiceFailed, { errorCode: paymentLog.invoice?.status }),
          ].filter(v => typeof v !== 'undefined'),
        ),
      ]

      return data
    },
    [client, enabledModules, formatMessage],
  )

  const handleExport = (exportTarget: 'orderLog' | 'orderProduct' | 'orderDiscount' | 'paymentLog') => {
    form
      .validateFields()
      .then(async () => {
        setLoading(true)
        const values = form.getFieldsValue()
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
      })
      .catch(() => {})
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
            trigger={['click']}
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
      <Form
        form={form}
        colon={false}
        hideRequiredMark
        initialValues={{
          orderStatuses: [],
        }}
      >
        <Form.Item
          label={formatMessage(commonMessages.label.dateRange)}
          name="timeRange"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.term.timeRange),
              }),
            },
          ]}
        >
          <StyledRangePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD HH:mm:ss"
            showTime={{
              format: 'YYYY-MM-DD HH:mm:ss',
              defaultValue: [moment().startOf('day'), moment().endOf('day')],
            }}
          />
        </Form.Item>

        <Form.Item
          label={formatMessage(commonMessages.label.orderLogStatus)}
          name="orderStatuses"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.term.orderStatus),
              }),
            },
          ]}
        >
          <Select mode="multiple" placeholder={formatMessage(commonMessages.label.orderLogStatus)}>
            <Select.Option value="UNPAID">{formatMessage(commonMessages.status.orderUnpaid)}</Select.Option>
            <Select.Option value="SUCCESS">{formatMessage(commonMessages.status.orderSuccess)}</Select.Option>
            <Select.Option value="FAILED">{formatMessage(commonMessages.status.orderFailed)}</Select.Option>
            <Select.Option value="REFUND">{formatMessage(commonMessages.status.orderRefund)}</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const GET_ORDER_LOG_EXPORT = gql`
  query GET_ORDER_LOG_EXPORT($condition: order_log_export_bool_exp) {
    order_log_export(where: $condition) {
      order_log_id
      status
      created_at
      updated_at
      invoice
      app_id
      member_id
      member_name
      member_email
      payment_no
      paid_at
      payment_options
      order_products
      order_product_num
      order_product_total_price
      sharing_codes
      sharing_notes
      order_discounts
      order_discount_total_price
      order_executors
    }
  }
`
const GET_ORDER_PRODUCT_EXPORT = gql`
  query GET_ORDER_PRODUCT_EXPORT($condition: order_product_export_bool_exp) {
    order_product_export(where: $condition) {
      order_product_id
      name
      quantity
      price
      options
      order_log_id
      app_id
      product_owner
      paid_at
      product_id
    }
  }
`
const GET_ORDER_DISCOUNT_COLLECTION = gql`
  query GET_ORDER_DISCOUNT_COLLECTION($startedAt: timestamptz!, $endedAt: timestamptz!, $orderStatuses: [String!]) {
    order_discount(
      where: {
        order_log: {
          status: { _in: $orderStatuses }
          _or: [
            { updated_at: { _gte: $startedAt, _lte: $endedAt } }
            { updated_at: { _is_null: true }, created_at: { _gte: $startedAt, _lte: $endedAt } }
          ]
        }
      }
      order_by: { order_log: { updated_at: desc } }
    ) {
      id
      order_log {
        id
        invoice
      }
      type
      target
      name
      price
    }
  }
`
const GET_PAYMENT_LOG_EXPORT = gql`
  query GET_PAYMENT_LOG_EXPORT($condition: payment_log_export_bool_exp) {
    payment_log_export(where: $condition) {
      payment_log_no
      paid_at
      order_log_id
      status
      invoice
      app_id
      member_name
      email
      order_products
      order_product_num
      order_product_total_price
      order_discount_total_price
    }
  }
`

export default OrderExportModal
