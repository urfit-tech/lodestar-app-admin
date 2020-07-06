import { useApolloClient, useQuery } from '@apollo/react-hooks'
import { Button, DatePicker, Dropdown, Form, Icon, Menu, Select } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useCallback, useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import AdminModal from '../../components/admin/AdminModal'
import AppContext from '../../contexts/AppContext'
import { dateFormatter, downloadCSV, toCSV } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'

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
  const app = useContext(AppContext)
  const client = useApolloClient()
  const { data: orderStatuses } = useOrderStatuses()
  const [loading, setLoading] = useState(false)
  const failOrderStatuses =
    orderStatuses?.filter(
      status => !(status === 'REFUND' || status === 'UNPAID' || status === 'SUCCESS' || status === 'FAILED'),
    ) || []

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

  const getOrderLogContent: (startedAt: Date, endedAt: Date, orderStatuses: string[]) => Promise<string> = useCallback(
    async (startedAt, endedAt, orderStatuses) => {
      const orderLogResult = await client.query<
        types.GET_ORDER_LOG_COLLECTION,
        types.GET_ORDER_LOG_COLLECTIONVariables
      >({
        query: GET_ORDER_LOG_COLLECTION,
        variables: {
          appId: app.id,
          startedAt,
          endedAt,
          orderStatuses,
        },
      })

      const data: string[][] = [
        [
          formatMessage(commonMessages.label.orderLogId),
          formatMessage(commonMessages.label.orderLogStatus),
          formatMessage(commonMessages.label.orderLogMemberName),
          formatMessage(commonMessages.label.orderLogMemberEmail),
          formatMessage(commonMessages.label.orderLogPaymentDate),
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
      ]

      orderLogResult.data.order_log
        .sort(
          (a, b) => new Date(a.updated_at || a.created_at).valueOf() - new Date(b.updated_at || b.created_at).valueOf(),
        )
        .forEach(orderLog => {
          const totalProductPrice = orderLog.order_products_aggregate.aggregate?.sum?.price || 0
          const totalDiscountPrice = orderLog.order_discounts_aggregate.aggregate?.sum?.price || 0

          data.push([
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
          ])
        })

      return toCSV(data)
    },
    [app, client, formatMessage],
  )

  const getOrderProductContent: (
    startedAt: Date,
    endedAt: Date,
    orderStatuses: string[],
  ) => Promise<string> = useCallback(
    async (startedAt, endedAt, orderStatuses) => {
      const orderProductResult = await client.query<
        types.GET_ORDER_PRODUCT_COLLECTION,
        types.GET_ORDER_PRODUCT_COLLECTIONVariables
      >({
        query: GET_ORDER_PRODUCT_COLLECTION,
        variables: {
          appId: app.id,
          startedAt,
          endedAt,
          orderStatuses,
        },
      })

      const data: string[][] = [
        [
          formatMessage(commonMessages.label.orderLogId),
          formatMessage(commonMessages.label.orderProductId),
          formatMessage(commonMessages.label.orderProductType),
          formatMessage(commonMessages.label.orderProductName),
          formatMessage(commonMessages.label.orderProductPrice),
          formatMessage(commonMessages.term.startedAt),
          formatMessage(commonMessages.term.endedAt),
          formatMessage(commonMessages.label.orderProductAutoRenew),
        ],
      ]

      orderProductResult.data.order_product.forEach(orderProduct => {
        data.push([
          orderProduct.order_log.id,
          orderProduct.product.id,
          productTypeLabel[orderProduct.product.type] || formatMessage(commonMessages.product.unknownType),
          orderProduct.name,
          orderProduct.price,
          dateFormatter(orderProduct.started_at),
          dateFormatter(orderProduct.ended_at),
          orderProduct.auto_renewed,
        ])
      })

      return toCSV(data)
    },
    [app, client, formatMessage, productTypeLabel],
  )

  const getOrderDiscountContent: (
    startedAt: Date,
    endedAt: Date,
    orderStatuses: string[],
  ) => Promise<string> = useCallback(
    async (startedAt, endedAt, orderStatuses) => {
      const orderDiscountResult = await client.query<
        types.GET_ORDER_DISCOUNT_COLLECTION,
        types.GET_ORDER_DISCOUNT_COLLECTIONVariables
      >({
        query: GET_ORDER_DISCOUNT_COLLECTION,
        variables: {
          appId: app.id,
          startedAt,
          endedAt,
          orderStatuses,
        },
      })

      const data: string[][] = [
        [
          formatMessage(commonMessages.label.orderLogId),
          formatMessage(commonMessages.label.orderDiscountType),
          formatMessage(commonMessages.label.orderDiscountId),
          formatMessage(commonMessages.label.orderDiscountName),
          formatMessage(commonMessages.label.orderDiscountPrice),
        ],
      ]

      orderDiscountResult.data.order_discount.forEach(orderDiscount => {
        data.push([
          orderDiscount.order_log.id,
          orderDiscount.type,
          orderDiscount.id,
          orderDiscount.name,
          orderDiscount.price,
        ])
      })

      return toCSV(data)
    },
    [app, client, formatMessage],
  )

  const getPaymentLogContent: (
    startedAt: Date,
    endedAt: Date,
    orderStatuses: string[],
  ) => Promise<string> = useCallback(
    async (startedAt, endedAt, orderStatuses) => {
      const paymentLogResult = await client.query<
        types.GET_PAYMENT_LOG_COLLECTION,
        types.GET_PAYMENT_LOG_COLLECTIONVariables
      >({
        query: GET_PAYMENT_LOG_COLLECTION,
        variables: {
          appId: app.id,
          startedAt,
          endedAt,
          orderStatuses,
        },
      })

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
      ]

      paymentLogResult.data.payment_log.forEach(paymentLog => {
        data.push([
          paymentLog.order_log.member.name,
          paymentLog.order_log.member.email,
          paymentLog.order_log.id,
          paymentLog.no,
          paymentLog.order_log.status,
          dateFormatter(paymentLog.paid_at || paymentLog.created_at),
          paymentLog.order_log.order_products_aggregate.aggregate?.sum?.price || 0,
        ])
      })

      return toCSV(data)
    },
    [app, client, formatMessage],
  )

  const handleExport: (
    exportTarget: 'orderLog' | 'orderProduct' | 'orderDiscount' | 'paymentLog',
  ) => void = exportTarget => {
    form.validateFields(
      async (
        error,
        values: {
          startedAt: Date
          endedAt: Date
          orderStatuses: string[]
        },
      ) => {
        if (error) {
          return
        }

        setLoading(true)

        const startedAt = moment(values.startedAt).toDate()
        const endedAt = moment(values.endedAt).toDate()
        let orderStatuses: string[] = []
        if (values.orderStatuses.includes('FAILED')) {
          orderStatuses = failOrderStatuses
        }
        orderStatuses = orderStatuses.concat(values.orderStatuses)

        // const data: string[][] = []

        let fileName = 'untitled.csv'
        let csvContent = ''

        switch (exportTarget) {
          case 'orderLog':
            fileName = 'orders'
            csvContent = await getOrderLogContent(startedAt, endedAt, orderStatuses)
            break

          case 'orderProduct':
            fileName = 'items'
            csvContent = await getOrderProductContent(startedAt, endedAt, orderStatuses)
            break

          case 'orderDiscount':
            fileName = 'discounts'
            csvContent = await getOrderDiscountContent(startedAt, endedAt, orderStatuses)
            break

          case 'paymentLog':
            fileName = 'payments'
            csvContent = await getPaymentLogContent(startedAt, endedAt, orderStatuses)
            break
        }

        downloadCSV(
          `${fileName}_${moment(startedAt).format('YYYYMMDD')}_${moment(endedAt).format('YYYYMMDD')}.csv`,
          csvContent,
        )

        setLoading(false)
      },
    )
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon="download" onClick={() => setVisible(true)}>
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
            icon={<Icon type="down" />}
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
            {loading ? <Icon type="loading" /> : <div>{formatMessage(messages.exportOrderLog)}</div>}
          </Dropdown.Button>
        </>
      )}
      maskClosable={false}
    >
      <Form colon={false} hideRequiredMark>
        <Form.Item label={formatMessage(commonMessages.label.dateRange)}>
          <Form.Item className="mb-2">
            {form.getFieldDecorator('startedAt', {
              rules: [
                {
                  required: true,
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(commonMessages.term.startedAt),
                  }),
                },
              ],
            })(
              <DatePicker
                style={{ width: '100%' }}
                placeholder={formatMessage(commonMessages.term.startedAt)}
                format="YYYY-MM-DD HH:mm"
                showTime={{ defaultValue: moment('00:00:00', 'HH:mm') }}
              />,
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('endedAt', {
              rules: [
                {
                  required: true,
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(commonMessages.term.endedAt),
                  }),
                },
              ],
            })(
              <DatePicker
                style={{ width: '100%' }}
                placeholder={formatMessage(commonMessages.term.endedAt)}
                format="YYYY-MM-DD HH:mm"
                showTime={{ defaultValue: moment('23:59:59', 'HH:mm') }}
              />,
            )}
          </Form.Item>
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
              <Select.Option key="UNPAID">{formatMessage(commonMessages.status.orderUnpaid)}</Select.Option>
              <Select.Option key="SUCCESS">{formatMessage(commonMessages.status.orderSuccess)}</Select.Option>
              <Select.Option key="FAILED">{formatMessage(commonMessages.status.orderFailed)}</Select.Option>
              <Select.Option key="REFUND">{formatMessage(commonMessages.status.orderRefund)}</Select.Option>
            </Select>,
          )}
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const useOrderStatuses = () => {
  const { loading, error, data } = useQuery<types.GET_ORDER_LOG_STATUS>(GET_ORDER_LOG_STATUS)

  return {
    loading,
    error,
    data: data?.order_log?.map(log => log.status),
  }
}

const GET_ORDER_LOG_COLLECTION = gql`
  query GET_ORDER_LOG_COLLECTION(
    $appId: String!
    $startedAt: timestamptz!
    $endedAt: timestamptz!
    $orderStatuses: [String!]
  ) {
    order_log(
      where: {
        member: { app_id: { _eq: $appId } }
        status: { _in: $orderStatuses }
        _or: [
          { updated_at: { _gte: $startedAt, _lte: $endedAt } }
          { updated_at: { _is_null: true }, created_at: { _gte: $startedAt, _lte: $endedAt } }
        ]
      }
    ) {
      id
      status
      member {
        id
        name
        email
      }
      created_at
      updated_at
      invoice

      order_products_aggregate {
        aggregate {
          sum {
            price
          }
        }
      }

      order_discounts_aggregate {
        aggregate {
          sum {
            price
          }
        }
      }
    }
  }
`
const GET_ORDER_PRODUCT_COLLECTION = gql`
  query GET_ORDER_PRODUCT_COLLECTION(
    $appId: String!
    $startedAt: timestamptz!
    $endedAt: timestamptz!
    $orderStatuses: [String!]
  ) {
    order_product(
      where: {
        order_log: {
          member: { app_id: { _eq: $appId } }
          updated_at: { _gte: $startedAt, _lte: $endedAt }
          status: { _in: $orderStatuses }
        }
      }
      order_by: { order_log: { updated_at: desc } }
    ) {
      id
      order_log {
        id
      }
      product {
        id
        type
      }
      name
      price
      started_at
      ended_at
      auto_renewed
    }
  }
`
const GET_ORDER_DISCOUNT_COLLECTION = gql`
  query GET_ORDER_DISCOUNT_COLLECTION(
    $appId: String!
    $startedAt: timestamptz!
    $endedAt: timestamptz!
    $orderStatuses: [String!]
  ) {
    order_discount(
      where: {
        order_log: {
          member: { app_id: { _eq: $appId } }
          updated_at: { _gte: $startedAt, _lte: $endedAt }
          status: { _in: $orderStatuses }
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
const GET_PAYMENT_LOG_COLLECTION = gql`
  query GET_PAYMENT_LOG_COLLECTION(
    $appId: String!
    $startedAt: timestamptz!
    $endedAt: timestamptz!
    $orderStatuses: [String!]
  ) {
    payment_log(
      where: {
        order_log: {
          member: { app_id: { _eq: $appId } }
          updated_at: { _gte: $startedAt, _lte: $endedAt }
          status: { _in: $orderStatuses }
        }
      }
      order_by: { order_log: { updated_at: desc } }
    ) {
      order_log {
        id
        member {
          name
          email
        }
        status
        order_products_aggregate {
          aggregate {
            sum {
              price
            }
          }
        }
      }
      no
      created_at
      paid_at
    }
  }
`

const GET_ORDER_LOG_STATUS = gql`
  query GET_ORDER_LOG_STATUS {
    order_log(distinct_on: status) {
      status
    }
  }
`

export default Form.create<FormComponentProps>()(OrderExportModal)
