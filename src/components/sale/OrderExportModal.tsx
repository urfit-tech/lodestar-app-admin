import { DownOutlined, LoadingOutlined } from '@ant-design/icons'
import { useApolloClient } from '@apollo/react-hooks'
import { Button, DatePicker, Dropdown, Form, Menu, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { isNull } from 'lodash'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { ProductType } from 'lodestar-app-element/src/types/product'
import moment, { Moment } from 'moment'
import React, { useCallback, useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { dateFormatter, downloadCSV, toCSV } from '../../helpers'
import { useOrderStatuses } from '../../hooks/order'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import ProductSelector from '../form/ProductSelector'
import saleMessages from './translation'

const fieldOrderStatuses = [
  'UNPAID',
  'SUCCESS',
  'PAYING',
  'FAILED',
  'REFUND',
  'EXPIRED',
  'DELETED',
  'PARTIAL_REFUND',
  'PARTIAL_PAID',
] as const

type OrderSpecify = 'ALL' | 'SPECIFY' | 'SPECIFY_COUPON_PLAN' | 'SPECIFY_VOUCHER_PLAN'

type FieldProps = {
  selectedField: 'createdAt' | 'lastPaidAt'
  timeRange: [Moment, Moment]
  orderStatuses: typeof fieldOrderStatuses[number][]
  orderSpecify: OrderSpecify
  specifiedCategories: { id: string; title: string; children?: any[] }[]
}

const OrderExportModal: React.FC<AdminModalProps> = ({ renderTrigger, ...adminModalProps }) => {
  const { formatMessage } = useIntl()
  const client = useApolloClient()
  const [form] = useForm<FieldProps>()
  const { enabledModules, settings } = useApp()
  const { data: allOrderStatuses } = useOrderStatuses()
  const [selectedField, setSelectedField] = useState<'createdAt' | 'lastPaidAt'>('createdAt')
  const [selectedSpeicfy, setSelectedSpecify] = useState<OrderSpecify>('ALL')
  const [fullSelected, setFullSelectedProducts] = useState<(ProductType | 'CouponPlan')[]>([])
  const [selectedProducts, setSelectedProducts] = useState<{ id: string; title: string; children?: any[] }[]>([])
  const [loading, setLoading] = useState(false)

  const getOrderLogContent: (
    startedAt: Date,
    endedAt: Date,
    orderStatuses: string[],
    specified: OrderSpecify,
    fullSelected: (ProductType | 'CouponPlan')[],
    specifiedCategories: { id: string; title: string; children?: any[] }[],
  ) => Promise<string[][]> = useCallback(
    async (startedAt, endedAt, orderStatuses, specified, fullSelected, specifiedCategories) => {
      const orderLogExportResult = await client.query<
        hasura.GET_ORDER_LOG_EXPORT,
        hasura.GET_ORDER_LOG_EXPORTVariables
      >({
        query: GET_ORDER_LOG_EXPORT,
        variables: {
          condition: {
            ...(specified !== 'ALL' &&
              specifiedCategories.length > 0 && {
                _or: [
                  ...specifiedCategories
                    .filter(({ id }) => id.startsWith('Merchandise'))
                    .map(({ title }) => ({
                      order_products: { _like: `${title}%` },
                    })),
                  ...specifiedCategories
                    .filter(
                      ({ id }) =>
                        !id.startsWith('Merchandise') && !id.startsWith('CouponPlan') && !id.startsWith('VoucherPlan'),
                    )
                    .map(({ title }) => ({ order_products: { _like: `${title}%` } })),
                  ...(fullSelected.includes('CouponPlan')
                    ? [
                        {
                          order_discounts: { _like: '【折價券】%' },
                        },
                      ]
                    : specifiedCategories
                        .filter(({ id }) => id.startsWith('CouponPlan'))
                        .map(({ title }) => ({ order_discounts: { _like: `【折價券】${title}%` } }))),
                  ...(fullSelected.includes('VoucherPlan')
                    ? [
                        {
                          order_discounts: { _like: '【兌換券】%' },
                        },
                      ]
                    : specifiedCategories
                        .filter(({ id }) => id.startsWith('VoucherPlan'))
                        .map(({ title }) => ({ order_discounts: { _like: `【兌換券】${title}%` } }))),
                ],
              }),
            status: {
              _in: orderStatuses,
            },
            [selectedField === 'createdAt' ? 'created_at' : 'last_paid_at']: {
              _gte: startedAt,
              _lte: endedAt,
            },
          },
          orderBy: [
            {
              [selectedField === 'createdAt' ? 'created_at' : 'last_paid_at']: 'asc_nulls_last' as hasura.order_by,
            },
          ],
        },
      })

      const orderLogs: hasura.GET_ORDER_LOG_EXPORT['order_log_export'] =
        orderLogExportResult.data.order_log_export || []

      const data: string[][] = [
        [
          formatMessage(saleMessages.OrderExportModal.orderLogId),
          formatMessage(saleMessages.OrderExportModal.paymentLogNo),
          formatMessage(saleMessages.OrderExportModal.orderLogStatus),
          formatMessage(saleMessages.OrderExportModal.paymentLogGateway),
          formatMessage(saleMessages.OrderExportModal.paymentLogDetails),
          formatMessage(saleMessages.OrderExportModal.orderCountry),
          formatMessage(saleMessages.OrderExportModal.orderLogCreatedAt),
          formatMessage(saleMessages.OrderExportModal.paymentLogPaidAt),
          formatMessage(saleMessages.OrderExportModal.memberName),
          formatMessage(saleMessages.OrderExportModal.memberEmail),
          formatMessage(saleMessages.OrderExportModal.orderProductName),
          formatMessage(saleMessages.OrderExportModal.orderDiscountName),
          formatMessage(saleMessages.OrderExportModal.orderProductCount),
          formatMessage(saleMessages.OrderExportModal.orderProductTotalPrice),
          formatMessage(saleMessages.OrderExportModal.orderDiscountTotalPrice),
          formatMessage(saleMessages.OrderExportModal.orderLogTotalPrice),
          enabledModules.sharing_code ? formatMessage(saleMessages.OrderExportModal.sharingCode) : undefined,
          enabledModules.sharing_code ? formatMessage(saleMessages.OrderExportModal.sharingNote) : undefined,
          enabledModules.member_assignment ? formatMessage(saleMessages.OrderExportModal.orderLogExecutor) : undefined,
          formatMessage(saleMessages.OrderExportModal.gift),
          formatMessage(saleMessages.OrderExportModal.send),
          formatMessage(saleMessages.OrderExportModal.recipientName),
          formatMessage(saleMessages.OrderExportModal.recipientPhone),
          formatMessage(saleMessages.OrderExportModal.recipientAddress),
          formatMessage(saleMessages.OrderExportModal.invoiceName),
          formatMessage(saleMessages.OrderExportModal.invoiceEmail),
          formatMessage(saleMessages.OrderExportModal.invoicePhone),
          formatMessage(saleMessages.OrderExportModal.invoiceTarget),
          formatMessage(saleMessages.OrderExportModal.invoiceDonationCode),
          formatMessage(saleMessages.OrderExportModal.invoiceCarrier),
          formatMessage(saleMessages.OrderExportModal.invoiceUniformNumber),
          formatMessage(saleMessages.OrderExportModal.invoiceUniformTitle),
          formatMessage(saleMessages.OrderExportModal.invoiceAddress),
          enabledModules.invoice ? formatMessage(saleMessages.OrderExportModal.invoiceId) : undefined,
          enabledModules.invoice ? formatMessage(saleMessages.OrderExportModal.invoiceIssuedAt) : undefined,
          formatMessage(saleMessages.OrderExportModal.invoiceStatus),
        ].filter(v => typeof v !== 'undefined'),
        ...orderLogs.map(orderLog =>
          [
            orderLog.order_log_id,
            orderLog.payment_no?.split('\\n').join('\n') || '',
            orderLog.status,
            orderLog.payment_gateway,
            orderLog.payment_options?.split('\\n').join('\n') || '',
            (orderLog.country && orderLog.country_code && `${orderLog.country}(${orderLog.country_code})`) || '',
            dateFormatter(orderLog.created_at),
            orderLog.paid_at
              ?.split('\\n')
              .map(v => (v ? dateFormatter(v) : ''))
              .join('\n') || '',
            orderLog.member_name,
            orderLog.member_email,
            orderLog.order_products?.split('\\n').join('\n') || '',
            orderLog.order_discounts?.split('\\n').join('\n') || '',
            orderLog.order_product_num || 0,
            Math.max(orderLog.order_product_total_price || 0, 0),
            Math.max(orderLog.order_discount_total_price || 0, 0),
            Math.max(
              (orderLog.order_product_total_price || 0) -
                (orderLog.order_discount_total_price || 0) +
                (orderLog.shipping?.fee || 0),
              0,
            ),
            enabledModules.sharing_code ? orderLog.sharing_codes?.split('\\n').join('\n') || '' : undefined,
            enabledModules.sharing_code ? orderLog.sharing_notes?.split('\\n').join('\n') || '' : undefined,
            enabledModules.member_assignment ? orderLog.order_executors?.split('\\n').join('\n') || '' : undefined,
            orderLog.gift_plans?.split('\\n').join('\n') || '',
            orderLog.shipping?.isOutsideTaiwanIsland
              ? orderLog.shipping?.isOutsideTaiwanIsland === 'true'
                ? formatMessage(saleMessages.OrderExportModal.no)
                : orderLog.shipping?.isOutsideTaiwanIsland === 'false'
                ? formatMessage(saleMessages.OrderExportModal.yes)
                : ''
              : !!orderLog.shipping?.name && !!orderLog.shipping?.phone && !!orderLog.shipping?.address
              ? formatMessage(saleMessages.OrderExportModal.yes)
              : '',
            orderLog.shipping?.isOutsideTaiwanIsland === 'true' ? '' : orderLog.shipping?.name || '',
            orderLog.shipping?.isOutsideTaiwanIsland === 'true' ? '' : orderLog.shipping?.phone || '',
            !!Number(settings['checkout.taiwan_shipping_selector'])
              ? orderLog.shipping?.isOutsideTaiwanIsland === 'true'
                ? ''
                : `${orderLog.shipping?.zipCode || ''}${orderLog.shipping?.city || ''}${
                    orderLog.shipping?.district || ''
                  }${orderLog.shipping?.address || ''}`
              : orderLog.shipping?.address || '',
            orderLog.invoice_options?.name || '',
            orderLog.invoice_options?.email || '',
            orderLog.invoice_options?.phone || orderLog.invoice_options?.buyerPhone || '',
            orderLog.invoice_options?.donationCode ? '捐贈' : orderLog.invoice_options?.uniformNumber ? '公司' : '個人',
            orderLog.invoice_options?.donationCode || '',
            orderLog.invoice_options?.phoneBarCode ? '手機' : orderLog.invoice_options?.citizenCode ? '自然人憑證' : '',
            orderLog.invoice_options?.uniformNumber || '',
            orderLog.invoice_options?.uniformTitle || '',
            `${orderLog.invoice_options?.postCode || ''} ${orderLog.invoice_options?.address || ''}`,
            enabledModules.invoice
              ? orderLog.invoice_options?.id ||
                orderLog.invoice_options?.invoiceNumber ||
                orderLog.invoice_options?.InvoiceNumber ||
                ''
              : undefined,
            enabledModules.invoice
              ? (orderLog.invoice_issued_at && dateFormatter(orderLog.invoice_issued_at)) || ''
              : undefined,
            !orderLog.invoice_options?.status
              ? formatMessage(saleMessages.OrderExportModal.invoicePending)
              : orderLog.invoice_options?.status === 'SUCCESS'
              ? formatMessage(saleMessages.OrderExportModal.invoiceSuccess)
              : formatMessage(saleMessages.OrderExportModal.invoiceFailed, {
                  errorCode: orderLog.invoice_options?.status,
                }),
          ].filter(v => typeof v !== 'undefined'),
        ),
      ]
      return data
    },
    [client, enabledModules, formatMessage, selectedField],
  )

  const getOrderProductContent: (
    startedAt: Date,
    endedAt: Date,
    orderStatuses: string[],
    specified: OrderSpecify,
    fullSelected: (ProductType | 'CouponPlan')[],
    specifiedCategories: { id: string; title: string; children?: any[] }[],
  ) => Promise<string[][]> = useCallback(
    async (startedAt, endedAt, orderStatuses, specified, fullSelected, specifiedCategories) => {
      const orderProductsCondition = [
        {
          order_products: {
            product_id: {
              _in: [
                ...specifiedCategories
                  .filter(({ id }) => id.startsWith('Merchandise'))
                  .map(({ children }) => children!.map(each => `MerchandiseSpec_${each}`))
                  .flat(),
                ...specifiedCategories
                  .filter(
                    ({ id }) =>
                      !id.startsWith('Merchandise') && !id.startsWith('CouponPlan') && !id.startsWith('VoucherPlan'),
                  )
                  .map(({ id }) => id),
              ],
            },
          },
        },
      ]
      const orderDiscountCondition = [
        {
          order_discounts: {
            _or: [
              ...(fullSelected.includes('CouponPlan')
                ? [
                    {
                      name: { _like: '【折價券】%' },
                    },
                  ]
                : specifiedCategories
                    .filter(({ id }) => id.startsWith('CouponPlan'))
                    .map(({ title }) => ({ name: { _like: `【折價券】${title}%` } }))),
              ...(fullSelected.includes('VoucherPlan')
                ? [
                    {
                      name: { _like: '【兌換券】%' },
                    },
                  ]
                : specifiedCategories
                    .filter(({ id }) => id.startsWith('VoucherPlan'))
                    .map(({ title }) => ({ name: { _like: `【兌換券】${title}%` } }))),
            ],
          },
        },
      ]
      const orderProductExportResult = await client.query<
        hasura.GET_ORDER_PRODUCT_EXPORT,
        hasura.GET_ORDER_PRODUCT_EXPORTVariables
      >({
        query: GET_ORDER_PRODUCT_EXPORT,
        variables: {
          condition: {
            order_log: {
              status: {
                _in: orderStatuses,
              },
              [selectedField === 'createdAt' ? 'created_at' : 'last_paid_at']: {
                _gte: startedAt,
                _lte: endedAt,
              },
              ...(specified !== 'ALL' && {
                _or: [
                  ...(specifiedCategories.filter(
                    ({ id }) => !id.startsWith('CouponPlan') && !id.startsWith('VoucherPlan'),
                  ).length > 0
                    ? orderProductsCondition
                    : []),
                  ...(specifiedCategories.filter(
                    ({ id }) => id.startsWith('CouponPlan') || id.startsWith('VoucherPlan'),
                  ).length > 0
                    ? orderDiscountCondition
                    : []),
                ],
              }),
            },
          },
          orderBy: {
            [selectedField === 'createdAt' ? 'created_at' : 'last_paid_at']: 'asc_nulls_last' as hasura.order_by,
          },
        },
      })

      const productTypeLabel: { [key: string]: string } = {
        Program: formatMessage(saleMessages['*'].program),
        ProgramPlan: formatMessage(saleMessages['*'].programPlan),
        ProgramContent: formatMessage(saleMessages['*'].programContent),
        ProgramPackagePlan: formatMessage(saleMessages['*'].programPackagePlan),
        ProjectPlan: formatMessage(saleMessages['*'].projectPlan),
        Card: formatMessage(saleMessages['*'].card),
        ActivityTicket: formatMessage(saleMessages['*'].activityTicket),
        MerchandiseSpec: formatMessage(saleMessages['*'].merchandiseSpec),
        PodcastProgram: formatMessage(saleMessages['*'].podcastProgram),
        PodcastPlan: formatMessage(saleMessages['*'].podcastPlan),
        AppointmentPlan: formatMessage(saleMessages['*'].appointmentPlan),
      }

      const orderProducts: hasura.GET_ORDER_PRODUCT_EXPORT['order_product_export'] =
        orderProductExportResult.data?.order_product_export || []

      const data: string[][] = [
        [
          formatMessage(saleMessages.OrderExportModal.orderLogId),
          formatMessage(saleMessages.OrderExportModal.orderCountry),
          formatMessage(saleMessages.OrderExportModal.orderLogCreatedAt), // TBC: Date or DateTime
          formatMessage(saleMessages.OrderExportModal.paymentLogPaidAt),
          formatMessage(saleMessages.OrderExportModal.productOwner),
          formatMessage(saleMessages.OrderExportModal.productType),
          formatMessage(saleMessages.OrderExportModal.orderProductId),
          formatMessage(saleMessages.OrderExportModal.orderProductName),
          formatMessage(saleMessages.OrderExportModal.productEndedAt), // TBC: Date or DateTime
          formatMessage(saleMessages.OrderExportModal.productQuantity),
          formatMessage(saleMessages.OrderExportModal.productPrice),
          enabledModules.sharing_code ? formatMessage(saleMessages.OrderExportModal.sharingCode) : undefined,
        ].filter(v => typeof v !== 'undefined'),
        ...orderProducts.map(orderProduct =>
          [
            orderProduct.order_log_id,
            (orderProduct.country &&
              orderProduct.country_code &&
              `${orderProduct.country}(${orderProduct.country_code})`) ||
              '',
            orderProduct.order_created_at ? dateFormatter(orderProduct.order_created_at) : '',
            orderProduct.paid_at ? dateFormatter(orderProduct.paid_at) : '',
            orderProduct.product_owner || '',
            productTypeLabel[orderProduct.product_id?.split('_')[0] || ''] ||
              formatMessage(saleMessages.OrderExportModal.unknownType),
            orderProduct.product_id?.split('_')[1]?.slice(0, -(orderProduct.product_id?.split('_')[1].length - 6)) ||
              '',
            orderProduct.name,
            orderProduct.order_product_ended_at ? dateFormatter(orderProduct.order_product_ended_at) : '',
            orderProduct.quantity,
            Math.max(orderProduct.price, 0),
            enabledModules.sharing_code ? orderProduct.options?.sharingCode || '' : undefined,
          ].filter(v => typeof v !== 'undefined'),
        ),
      ]
      return data
    },
    [client, enabledModules, formatMessage, selectedField],
  )

  const getOrderDiscountContent: (
    startedAt: Date,
    endedAt: Date,
    orderStatuses: string[],
    specified: OrderSpecify,
    fullSelected: (ProductType | 'CouponPlan')[],
    specifiedCategories: { id: string; title: string; children?: any[] }[],
  ) => Promise<string[][]> = useCallback(
    async (startedAt, endedAt, orderStatuses, specified, fullSelected, specifiedCategories) => {
      const orderDiscountResult = await client.query<
        hasura.GET_ORDER_DISCOUNT_COLLECTION,
        hasura.GET_ORDER_DISCOUNT_COLLECTIONVariables
      >({
        query: GET_ORDER_DISCOUNT_COLLECTION,
        variables: {
          condition: {
            order_log: {
              status: {
                _in: orderStatuses,
              },
              [selectedField === 'createdAt' ? 'created_at' : 'last_paid_at']: {
                _gte: startedAt,
                _lte: endedAt,
              },
              ...(specified !== 'ALL' &&
                specifiedCategories.filter(({ id }) => !id.startsWith('CouponPlan') && !id.startsWith('VoucherPlan'))
                  .length > 0 && {
                  _or: [
                    {
                      order_products: {
                        product_id: {
                          _in: [
                            ...specifiedCategories
                              .filter(({ id }) => id.startsWith('Merchandise'))
                              .map(({ children }) => children!.map(each => `MerchandiseSpec_${each}`))
                              .flat(),
                            ...specifiedCategories
                              .filter(
                                ({ id }) =>
                                  !id.startsWith('Merchandise') &&
                                  !id.startsWith('CouponPlan') &&
                                  !id.startsWith('VoucherPlan'),
                              )
                              .map(({ id }) => id),
                          ],
                        },
                      },
                    },
                  ],
                }),
            },
            ...(specified !== 'ALL' &&
              specifiedCategories.filter(({ id }) => id.startsWith('CouponPlan') || id.startsWith('VoucherPlan'))
                .length > 0 && {
                _or: [
                  ...(fullSelected.includes('CouponPlan')
                    ? [
                        {
                          name: { _like: '【折價券】%' },
                        },
                      ]
                    : specifiedCategories
                        .filter(({ id }) => id.startsWith('CouponPlan'))
                        .map(({ title }) => ({ name: { _like: `【折價券】${title}%` } }))),
                  ...(fullSelected.includes('VoucherPlan')
                    ? [
                        {
                          name: { _like: '【兌換券】%' },
                        },
                      ]
                    : specifiedCategories
                        .filter(({ id }) => id.startsWith('VoucherPlan'))
                        .map(({ title }) => ({ name: { _like: `【兌換券】${title}%` } }))),
                ],
              }),
          },
          orderBy: {
            [selectedField === 'createdAt' ? 'created_at' : 'last_paid_at']: 'asc_nulls_last' as hasura.order_by,
          },
        },
      })

      const orderDiscounts: hasura.GET_ORDER_DISCOUNT_COLLECTION['order_discount'] =
        orderDiscountResult.data?.order_discount || []

      const data: string[][] = [
        [
          formatMessage(saleMessages.OrderExportModal.orderLogId),
          formatMessage(saleMessages.OrderExportModal.orderCountry),
          formatMessage(saleMessages.OrderExportModal.orderDiscountId),
          formatMessage(saleMessages.OrderExportModal.orderDiscountName),
          formatMessage(saleMessages.OrderExportModal.orderDiscountPrice),
        ],
        ...orderDiscounts.map(({ id, name, price, order_log }) => {
          const { id: logId, options } = order_log
          return [
            logId,
            (!isNull(options) &&
              !isNull(options.country) &&
              !isNull(options.countryCode) &&
              options.country !== '' &&
              options.countryCode !== '' &&
              `${options.country}(${options.countryCode})`) ||
              '',
            id,
            name,
            price,
          ]
        }),
      ]
      return data
    },
    [client, formatMessage, selectedField],
  )

  const getPaymentLogContent: (startedAt: Date, endedAt: Date, orderStatuses: string[]) => Promise<string[][]> =
    useCallback(
      async (startedAt, endedAt, orderStatuses) => {
        const paymentLogExportResult = await client.query<
          hasura.GET_PAYMENT_LOG_EXPORT,
          hasura.GET_PAYMENT_LOG_EXPORTVariables
        >({
          query: GET_PAYMENT_LOG_EXPORT,
          variables: {
            condition: {
              order_log: {
                status: {
                  _in: orderStatuses,
                },
                created_at: {
                  _gte: startedAt,
                  _lte: endedAt,
                },
              },
            },
            orderBy: {
              [selectedField === 'createdAt' ? 'created_at' : 'last_paid_at']: 'asc_nulls_last' as hasura.order_by,
            },
          },
        })

        const paymentLogs: hasura.GET_PAYMENT_LOG_EXPORT['payment_log_export'] =
          paymentLogExportResult.data?.payment_log_export || []

        const data: string[][] = [
          [
            formatMessage(saleMessages.OrderExportModal.orderLogId),
            formatMessage(saleMessages.OrderExportModal.paymentLogNo),
            enabledModules.invoice ? formatMessage(saleMessages.OrderExportModal.invoiceId) : undefined,
            enabledModules.invoice ? formatMessage(saleMessages.OrderExportModal.invoiceIssuedAt) : undefined,
            formatMessage(saleMessages.OrderExportModal.orderLogStatus),
            formatMessage(saleMessages.OrderExportModal.orderProductName),
            formatMessage(saleMessages.OrderExportModal.memberName),
            formatMessage(saleMessages.OrderExportModal.memberEmail),
            formatMessage(saleMessages.OrderExportModal.paymentLogPaidAt),
            formatMessage(saleMessages.OrderExportModal.orderProductCount),
            formatMessage(saleMessages.OrderExportModal.orderProductTotalPrice),
            formatMessage(saleMessages.OrderExportModal.orderDiscountTotalPrice),
            formatMessage(saleMessages.OrderExportModal.orderLogTotalPrice),
            formatMessage(saleMessages.OrderExportModal.invoiceStatus),
          ].filter(v => typeof v !== 'undefined'),
          ...paymentLogs.map(paymentLog =>
            [
              paymentLog.order_log_id,
              paymentLog.payment_log_no,
              enabledModules.invoice
                ? paymentLog.invoice_options?.id ||
                  paymentLog.invoice_options?.invoiceNumber ||
                  paymentLog.invoice_options?.InvoiceNumber ||
                  ''
                : undefined,
              enabledModules.invoice && paymentLog.invoice_issued_at != null
                ? dateFormatter(paymentLog.invoice_issued_at)
                : undefined,
              paymentLog.status,
              paymentLog.order_products?.split('\\n').join('\n'),
              paymentLog.member_name,
              paymentLog.email,
              paymentLog.paid_at ? dateFormatter(paymentLog.paid_at) : '',
              paymentLog.order_product_num || 0,
              Math.max(paymentLog.order_product_total_price || 0, 0),
              Math.max(paymentLog.order_discount_total_price || 0, 0),
              Math.max(
                (paymentLog.order_product_total_price || 0) -
                  (paymentLog.order_discount_total_price || 0) +
                  (paymentLog.shipping?.fee || 0),
                0,
              ),
              !paymentLog.invoice_options?.status
                ? formatMessage(saleMessages.OrderExportModal.invoicePending)
                : paymentLog.invoice_options?.status === 'SUCCESS'
                ? formatMessage(saleMessages.OrderExportModal.invoiceSuccess)
                : formatMessage(saleMessages.OrderExportModal.invoiceFailed, {
                    errorCode: paymentLog.invoice_options?.status,
                  }),
            ].filter(v => typeof v !== 'undefined'),
          ),
        ]
        return data
      },
      [client, enabledModules, formatMessage, selectedField],
    )

  const handleExport = (exportTarget: 'orderLog' | 'orderProduct' | 'orderDiscount' | 'paymentLog') => {
    form
      .validateFields()
      .then(async () => {
        setLoading(true)
        const values = form.getFieldsValue()
        const startedAt = values.timeRange[0].startOf('day').toDate()
        const endedAt = values.timeRange[1].endOf('day').toDate()
        const orderStatuses: string[] = values.orderStatuses.includes('FAILED')
          ? [
              ...values.orderStatuses,
              ...(allOrderStatuses.filter(
                status => !fieldOrderStatuses.some(fieldOrderStatus => status === fieldOrderStatus),
              ) || []),
            ]
          : values.orderStatuses
        const specified = values.orderSpecify as OrderSpecify

        let fileName = 'untitled.csv'
        let content: string[][] = []

        switch (exportTarget) {
          case 'orderLog':
            fileName = 'orders'
            content = await getOrderLogContent(
              startedAt,
              endedAt,
              orderStatuses,
              specified,
              fullSelected,
              selectedProducts,
            )
            break

          case 'orderProduct':
            fileName = 'items'
            content = await getOrderProductContent(
              startedAt,
              endedAt,
              orderStatuses,
              specified,
              fullSelected,
              selectedProducts,
            )
            break

          case 'orderDiscount':
            fileName = 'discounts'
            content = await getOrderDiscountContent(
              startedAt,
              endedAt,
              orderStatuses,
              specified,
              fullSelected,
              selectedProducts,
            )
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
      renderTrigger={renderTrigger}
      title={formatMessage(saleMessages.OrderExportModal.exportOrder)}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(saleMessages['*'].cancel)}
          </Button>
          <Dropdown.Button
            type="primary"
            icon={<DownOutlined />}
            trigger={['click']}
            overlay={
              <Menu>
                <Menu.Item key="order-product" onClick={() => handleExport('orderProduct')}>
                  <Button type="link" size="small">
                    {formatMessage(saleMessages.OrderExportModal.exportOrderProduct)}
                  </Button>
                </Menu.Item>
                <Menu.Item key="order-discount" onClick={() => handleExport('orderDiscount')}>
                  <Button type="link" size="small">
                    {formatMessage(saleMessages.OrderExportModal.exportOrderDiscount)}
                  </Button>
                </Menu.Item>
              </Menu>
            }
            onClick={() => !loading && handleExport('orderLog')}
          >
            {loading ? <LoadingOutlined /> : <div>{formatMessage(saleMessages.OrderExportModal.exportOrderLog)}</div>}
          </Dropdown.Button>
        </>
      )}
      maskClosable={false}
      {...adminModalProps}
    >
      <Form
        form={form}
        colon={false}
        hideRequiredMark
        layout="vertical"
        initialValues={{
          selectedField: 'createdAt',
          timeRange: [moment().startOf('month'), moment().endOf('day')],
          orderStatuses: [],
          orderSpecify: 'ALL',
          specifiedCategories: [],
        }}
        onValuesChange={(_, values) => {
          setSelectedField(values.selectedField)
          if (values.selectedField === 'lastPaidAt') {
            form.setFieldsValue({ orderStatuses: values.orderStatuses.filter(v => v !== 'UNPAID' && v !== 'FAILED') })
          }
          if (selectedSpeicfy !== values.orderSpecify) {
            form.setFieldsValue({
              ...form.getFieldsValue(),
              specifiedCategories: [],
            })
          }
          setSelectedSpecify(values.orderSpecify)
        }}
      >
        <Form.Item label={formatMessage(saleMessages.OrderExportModal.dateRange)}>
          <div className="d-flex">
            <div className="flex-shrink-0">
              <Form.Item name="selectedField" noStyle>
                <Select>
                  <Select.Option value="createdAt">
                    {formatMessage(saleMessages.OrderExportModal.orderLogCreatedDate)}
                  </Select.Option>
                  <Select.Option value="lastPaidAt">
                    {formatMessage(saleMessages.OrderExportModal.orderLogPaymentDate)}
                  </Select.Option>
                </Select>
              </Form.Item>
            </div>
            <div className="flex-grow-1">
              <Form.Item
                name="timeRange"
                rules={[
                  {
                    required: true,
                    message: formatMessage(saleMessages['*'].isRequired, {
                      field: formatMessage(saleMessages.OrderExportModal.timeRange),
                    }),
                  },
                ]}
                noStyle
              >
                <DatePicker.RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" showTime={false} />
              </Form.Item>
            </div>
          </div>
        </Form.Item>

        <Form.Item
          label={formatMessage(saleMessages.OrderExportModal.orderLogStatus)}
          name="orderStatuses"
          rules={[
            {
              required: true,
              message: formatMessage(saleMessages['*'].isRequired, {
                field: formatMessage(saleMessages.OrderExportModal.orderStatus),
              }),
            },
          ]}
        >
          <Select mode="multiple" placeholder={formatMessage(saleMessages.OrderExportModal.orderLogStatus)}>
            <Select.Option value="UNPAID" disabled={selectedField === 'lastPaidAt'}>
              {formatMessage(saleMessages.OrderExportModal.orderUnpaid)}
            </Select.Option>
            <Select.Option value="PARTIAL_PAID">
              {formatMessage(saleMessages.OrderExportModal.orderPartialPaid)}
            </Select.Option>
            <Select.Option value="SUCCESS">{formatMessage(saleMessages.OrderExportModal.orderSuccess)}</Select.Option>
            <Select.Option value="PAYING" disabled={selectedField === 'lastPaidAt'}>
              {formatMessage(saleMessages.OrderExportModal.orderPaying)}
            </Select.Option>
            <Select.Option value="FAILED" disabled={selectedField === 'lastPaidAt'}>
              {formatMessage(saleMessages.OrderExportModal.orderFailed)}
            </Select.Option>
            <Select.Option value="PARTIAL_REFUND">
              {formatMessage(saleMessages.OrderExportModal.orderPartialRefund)}
            </Select.Option>
            <Select.Option value="REFUND">{formatMessage(saleMessages.OrderExportModal.orderRefund)}</Select.Option>
            <Select.Option value="DELETED">{formatMessage(saleMessages.OrderExportModal.orderDeleted)}</Select.Option>
            <Select.Option value="EXPIRED">{formatMessage(saleMessages.OrderExportModal.orderExpired)}</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label={formatMessage(saleMessages.OrderExportModal.orderLogCategory)}
          name="orderSpecify"
          rules={[
            {
              required: true,
              message: formatMessage(saleMessages['*'].isRequired, {
                field: formatMessage(saleMessages.OrderExportModal.orderCategory),
              }),
            },
          ]}
        >
          <Select>
            <Select.Option value="ALL">{formatMessage(saleMessages.OrderExportModal.all)}</Select.Option>
            <Select.Option value="SPECIFY">{formatMessage(saleMessages.OrderExportModal.specify)}</Select.Option>
            <Select.Option value="SPECIFY_COUPON_PLAN">
              {formatMessage(saleMessages.OrderExportModal.specifyCouponPlan)}
            </Select.Option>
            <Select.Option value="SPECIFY_VOUCHER_PLAN">
              {formatMessage(saleMessages.OrderExportModal.specifyVoucherPlan)}
            </Select.Option>
          </Select>
        </Form.Item>
        {selectedSpeicfy !== 'ALL' && (
          <Form.Item
            label={
              selectedSpeicfy === 'SPECIFY' ? formatMessage(saleMessages.OrderExportModal.otherSpecifyCategories) : ''
            }
            name="specifiedCategories"
          >
            <ProductSelector
              multiple
              allowTypes={
                selectedSpeicfy === 'SPECIFY_COUPON_PLAN'
                  ? ['CouponPlan']
                  : selectedSpeicfy === 'SPECIFY_VOUCHER_PLAN'
                  ? ['VoucherPlan']
                  : [
                      'ProgramPlan',
                      'PodcastPlan',
                      'ProgramPackagePlan',
                      'PodcastProgram',
                      'ActivityTicket',
                      'Merchandise',
                      'ProjectPlan',
                      'AppointmentPlan',
                      'VoucherPlan',
                    ]
              }
              onFullSelected={value => setFullSelectedProducts(value)}
              onProductChange={value => setSelectedProducts(value)}
            />
          </Form.Item>
        )}
      </Form>
    </AdminModal>
  )
}

const GET_ORDER_LOG_EXPORT = gql`
  query GET_ORDER_LOG_EXPORT($condition: order_log_export_bool_exp!, $orderBy: [order_log_export_order_by!]!) {
    order_log_export(where: $condition, order_by: $orderBy) {
      order_log_id
      status
      created_at
      updated_at
      invoice_options
      invoice_issued_at
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
      shipping
      payment_gateway
      gift_plans
      country
      country_code
    }
  }
`
const GET_ORDER_PRODUCT_EXPORT = gql`
  query GET_ORDER_PRODUCT_EXPORT($condition: order_product_export_bool_exp!, $orderBy: order_log_order_by!) {
    order_product_export(where: $condition, order_by: [{ order_log: $orderBy }]) {
      order_product_id
      name
      quantity
      price
      options
      order_log_id
      app_id
      product_owner
      order_created_at
      paid_at
      order_product_ended_at
      product_id
      country
      country_code
    }
  }
`
const GET_ORDER_DISCOUNT_COLLECTION = gql`
  query GET_ORDER_DISCOUNT_COLLECTION($condition: order_discount_bool_exp!, $orderBy: order_log_order_by!) {
    order_discount(where: $condition, order_by: [{ order_log: $orderBy }]) {
      id
      order_log {
        id
        invoice_options
        options
      }
      type
      target
      name
      price
    }
  }
`
const GET_PAYMENT_LOG_EXPORT = gql`
  query GET_PAYMENT_LOG_EXPORT($condition: payment_log_export_bool_exp!, $orderBy: order_log_order_by!) {
    payment_log_export(where: $condition, order_by: [{ order_log: $orderBy }]) {
      payment_log_no
      paid_at
      order_log_id
      status
      invoice_options
      invoice_issued_at
      app_id
      member_name
      email
      order_products
      order_product_num
      order_product_total_price
      order_discount_total_price
      shipping
    }
  }
`

export default OrderExportModal
