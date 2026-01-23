import { DownOutlined, LoadingOutlined } from '@ant-design/icons'
import { useToast } from '@chakra-ui/toast'
import { Button, DatePicker, Dropdown, Form, Menu, Radio, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios from 'axios'
import { last } from 'lodash'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
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
  exportMime: 'text/csv' | 'xlsx'
}
type orderStatus =
  | 'UNPAID'
  | 'SUCCESS'
  | 'PAYING'
  | 'FAILED'
  | 'REFUND'
  | 'EXPIRED'
  | 'DELETED'
  | 'PARTIAL_REFUND'
  | 'PARTIAL_PAID'
type OrderExportPayload = {
  statuses?: Array<orderStatus>
  createdAt?: {
    start: string
    end: string
  }
  lastPaidAt?: {
    start: string
    end: string
  }
  productIds?: Array<string>
  couponPlanIds?: Array<string>
  voucherPlanIds?: Array<string>
  exportMime?: string
  timezone?: string
}

const OrderExportModal: React.FC<AdminModalProps> = ({ renderTrigger, ...adminModalProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { authToken } = useAuth()
  const [selectedField, setSelectedField] = useState<'createdAt' | 'lastPaidAt'>('createdAt')
  const [selectedSpeicfy, setSelectedSpecify] = useState<OrderSpecify>('ALL')
  const [selectedProducts, setSelectedProducts] = useState<{ id: string; title: string; children?: any[] }[]>([])
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleExport = (exportTarget: 'orderLog' | 'orderProduct' | 'orderDiscount' | 'paymentLog') => {
    form
      .validateFields()
      .then(async () => {
        setLoading(true)
        const values = form.getFieldsValue()
        const startedAt = values.timeRange[0].startOf('day').toDate()
        const endedAt = values.timeRange[1].endOf('day').toDate()
        const statuses: orderStatus[] = values.orderStatuses
        const specified = values.orderSpecify as OrderSpecify
        const exportMime = values.exportMime
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const orderExportPayload: OrderExportPayload = {
          [selectedField]: { startedAt, endedAt },
          statuses,
          exportMime,
          timezone,
        }
        const selectedIds = selectedProducts.map(each => each.id)

        switch (specified) {
          case 'ALL':
            break
          case 'SPECIFY':
            Object.assign(orderExportPayload, { productIds: selectedIds })
            break
          case 'SPECIFY_COUPON_PLAN':
            Object.assign(orderExportPayload, { couponPlanIds: selectedIds.map(each => last(each.split('_'))) })
            break
          case 'SPECIFY_VOUCHER_PLAN':
            Object.assign(orderExportPayload, { voucherPlanIds: selectedIds.map(each => last(each.split('_'))) })
            break
        }

        switch (exportTarget) {
          case 'orderLog':
            await axios.post(`${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/orders/export`, orderExportPayload, {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            })
            break

          case 'orderProduct':
            await axios.post(
              `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/orders/export/products`,
              orderExportPayload,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              },
            )
            break

          case 'orderDiscount':
            await axios.post(
              `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/orders/export/discounts`,
              orderExportPayload,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              },
            )
            break
        }
        toast({
          title: formatMessage(saleMessages.OrderExportModal.requestSuccess),
          status: 'success',
          duration: 3000,
          position: 'top',
        })
      })
      .catch(handleError)
      .finally(() => setLoading(false))
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
          exportMime: 'xlsx',
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
        <Form.Item label={formatMessage(saleMessages.OrderExportModal.exportMime)} name="exportMime">
          <Radio.Group>
            <Radio.Button value="xlsx">xlsx</Radio.Button>
            <Radio.Button value="text/csv">csv</Radio.Button>
          </Radio.Group>
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
                      'MerchandiseSpec',
                      'ProjectPlan',
                      'AppointmentPlan',
                      'VoucherPlan',
                    ]
              }
              onProductChange={value => setSelectedProducts(value)}
            />
          </Form.Item>
        )}
      </Form>
    </AdminModal>
  )
}

export default OrderExportModal
