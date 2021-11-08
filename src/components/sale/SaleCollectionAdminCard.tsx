import { SearchOutlined } from '@ant-design/icons'
import { Button, Divider, Input, Table, Tooltip, Typography } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled, { css } from 'styled-components'
import { currencyFormatter, dateFormatter, dateRangeFormatter, desktopViewMixin } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useOrderLog } from '../../hooks/order'
import { OrderLogProps } from '../../types/general'
import AdminCard from '../admin/AdminCard'
import ProductTypeLabel from '../common/ProductTypeLabel'
import ShippingMethodLabel from '../common/ShippingMethodLabel'
import ModifyOrderStatusModal from './ModifyOrderStatusModal'
import OrderStatusTag from './OrderStatusTag'
import SubscriptionCancelModal from './SubscriptionCancelModal'

const StyledContainer = styled.div`
  overflow: auto;

  table th {
    white-space: nowrap;
  }
`
const StyledFilterButton = styled(Button)`
  height: 36px;
  width: 90px;
`
const StyledFilterInput = styled(Input)`
  width: 188px;
`

const StyledCell = styled.div`
  div {
    white-space: nowrap;
  }

  ${desktopViewMixin(css`
    display: flex;
    flex-wrap: wrap;

    div:first-child {
      margin-right: 0.5rem;
    }
  `)}
`

const SaleCollectionAdminCard: React.VFC<{
  memberId?: string
}> = ({ memberId }) => {
  const { formatMessage } = useIntl()
  const { settings } = useApp()
  const { currentUserRole, permissions } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [statuses, setStatuses] = useState<string[] | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [memberNameAndEmail, setMemberNameAndEmail] = useState<string | null>(null)
  const [tmpOrderLogStatus, setTmpOrderLogStatus] = useState<{ [OrderId in string]?: string }>({})

  const { loadingOrderLogs, errorOrderLogs, orderLogs, totalCount, refetchOrderLogs, loadMoreOrderLogs } = useOrderLog({
    statuses,
    orderId,
    memberNameAndEmail,
    memberId,
  })

  const getColumnSearchProps = ({
    onReset,
    onSearch,
  }: {
    onReset: (clearFilters: any) => void
    onSearch: (selectedKeys?: React.ReactText[], confirm?: () => void) => void
  }): ColumnProps<any> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-2">
        <StyledFilterInput
          autoFocus
          value={selectedKeys && selectedKeys[0]}
          onChange={e => setSelectedKeys && setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => onSearch(selectedKeys, confirm)}
          className="mb-2 d-block"
        />
        <StyledFilterButton
          className="mr-2"
          type="primary"
          size="small"
          onClick={() => onSearch(selectedKeys, confirm)}
        >
          {formatMessage(commonMessages.ui.search)}
        </StyledFilterButton>
        <StyledFilterButton size="small" onClick={() => onReset(clearFilters)}>
          {formatMessage(commonMessages.ui.reset)}
        </StyledFilterButton>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
  })

  const columns: ColumnProps<OrderLogProps>[] = [
    {
      title: formatMessage(commonMessages.label.orderLogId),
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text.split('-')[0]}</span>
        </Tooltip>
      ),
      ...getColumnSearchProps({
        onReset: clearFilters => {
          clearFilters()
          setOrderId(null)
        },
        onSearch: (selectedKeys, confirm) => {
          confirm?.()
          selectedKeys && setOrderId(`${selectedKeys[0]}`)
        },
      }),
    },
    {
      title: formatMessage(commonMessages.label.orderLogCreatedDate),
      key: 'createdAt',
      render: (_, record) => {
        const orderLogCreatedMoment = moment(record.createdAt)
        return (
          <StyledCell>
            <div>{orderLogCreatedMoment.format('YYYY-MM-DD')}</div>
            <div>{orderLogCreatedMoment.format('HH:mm')}</div>
          </StyledCell>
        )
      },
    },
    {
      title: formatMessage(
        permissions['SALES_RECORDS_DETAILS'] ? commonMessages.label.nameAndEmail : commonMessages.label.memberName,
      ),
      key: 'nameAndEmail',
      ...getColumnSearchProps({
        onReset: clearFilters => {
          clearFilters()
          setMemberNameAndEmail(null)
        },
        onSearch: (selectedKeys, confirm) => {
          confirm?.()
          selectedKeys && setMemberNameAndEmail(`${selectedKeys[0]}`)
        },
      }),
      render: (_, record) => (
        <StyledCell>
          <div>{`${record.name}`}</div>
          {permissions['SALES_RECORDS_DETAILS'] && <div>{`/${record.email}`}</div>}
        </StyledCell>
      ),
    },
    {
      title: formatMessage(commonMessages.label.orderLogStatus),
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => <OrderStatusTag status={tmpOrderLogStatus[record.id] || record.status} />,
      filters: [
        {
          text: formatMessage(commonMessages.status.orderSuccess),
          value: 'SUCCESS',
        },
        {
          text: formatMessage(commonMessages.status.orderUnpaid),
          value: 'UNPAID',
        },
        {
          text: formatMessage(commonMessages.status.orderRefund),
          value: 'REFUND',
        },
        {
          text: formatMessage(commonMessages.status.orderExpired),
          value: 'EXPIRED',
        },
      ],
    },
    {
      title: formatMessage(commonMessages.label.orderLogPrice),
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      align: 'right',
      render: currencyFormatter,
    },
  ]

  const expandedRow = ({
    id: orderLogId,
    orderProducts,
    orderDiscounts,
    orderExecutors,
    paymentMethod,
    expiredAt,
    shipping,
    totalPrice,
  }: OrderLogProps) => (
    <div>
      {orderProducts.map(v => (
        <>
          <div className="row" key={v.id}>
            <div className="col-2">
              <ProductTypeLabel productType={v.product.type} />
            </div>
            <div className="col-8">
              <span>{v.name}</span>

              {v.endedAt && v.product.type !== 'AppointmentPlan' && (
                <span className="ml-2">
                  {`(${moment(v.endedAt).format('YYYY-MM-DD')} ${formatMessage(commonMessages.status.productExpired)})`}
                </span>
              )}

              {v.startedAt && v.endedAt && v.product.type === 'AppointmentPlan' && (
                <span>
                  {`(${dateRangeFormatter({
                    startedAt: v.startedAt,
                    endedAt: v.endedAt,
                    dateFormat: 'YYYY-MM-DD',
                  })})`}
                </span>
              )}
              {v.quantity && <span>{` X ${v.quantity} `}</span>}
            </div>
            <div className="col-2 text-right">{currencyFormatter(v.price)}</div>
          </div>
          <Divider />
        </>
      ))}

      <div className="row">
        <div className="col-3" style={{ fontSize: '14px' }}>
          {orderExecutors.length !== 0 && permissions['SALES_RECORDS_DETAILS'] && (
            <div>承辦人：{orderExecutors.join('、')}</div>
          )}
          {paymentMethod && permissions['SALES_RECORDS_DETAILS'] && <div>付款方式：{paymentMethod}</div>}
          {expiredAt && permissions['SALES_RECORDS_DETAILS'] && (
            <div>付款期限：{moment(expiredAt).format('YYYY-MM-DD')}</div>
          )}
        </div>

        <div className="col-9">
          {shipping?.shippingMethod && typeof shipping?.fee === 'number' && (
            <div className="row text-right">
              <div className="col-9">
                <ShippingMethodLabel shippingMethodId={shipping.shippingMethod} />
              </div>
              <div className="col-3">{currencyFormatter(shipping.fee || 0)}</div>
            </div>
          )}

          {orderDiscounts.map(v => (
            <div className="row text-right">
              <div className="col-9">{v.name}</div>
              <div className="col-3">- {currencyFormatter(v.price)}</div>
            </div>
          ))}

          <div className="row align-items-center">
            <div className="col-9 text-right">{formatMessage(commonMessages.label.totalPrice)}</div>
            <div className="col-3 text-right">{currencyFormatter(totalPrice)}</div>
          </div>
        </div>
      </div>

      <div className="row col-12 align-items-center pt-3">
        {currentUserRole === 'app-owner' && settings['feature.modify_order_status'] === 'enabled' && (
          <ModifyOrderStatusModal
            orderLogId={orderLogId}
            defaultPrice={totalPrice}
            onRefetch={status =>
              setTmpOrderLogStatus(prev => ({
                ...prev,
                [orderLogId]: status,
              }))
            }
          />
        )}

        {currentUserRole === 'app-owner' &&
          orderProducts.some(v =>
            ['ProgramPlan', 'ProjectPlan', 'PodcastPlan', 'ProgramPackagePlan'].includes(v.product.type),
          ) &&
          (orderProducts.some(v => v.options?.unsubscribedAt) ? (
            <span style={{ color: '#9b9b9b', fontSize: '14px' }}>
              {formatMessage(commonMessages.text.cancelSubscriptionDate, {
                date: dateFormatter(orderProducts.find(v => v.options?.unsubscribedAt)?.options?.unsubscribedAt),
              })}
            </span>
          ) : (
            <SubscriptionCancelModal
              orderProducts={orderProducts.map(v => ({
                id: v.id,
                options: v.options,
              }))}
              onRefetch={refetchOrderLogs}
            />
          ))}
      </div>
    </div>
  )

  return (
    <AdminCard>
      <StyledContainer>
        <div className="d-flex justify-content-end">
          <Typography.Text type="secondary">
            {formatMessage(commonMessages.text.totalCount, { count: totalCount })}
          </Typography.Text>
        </div>

        <Table<OrderLogProps>
          rowKey="id"
          loading={!!(loadingOrderLogs || errorOrderLogs)}
          dataSource={orderLogs}
          columns={columns}
          expandedRowRender={expandedRow}
          pagination={false}
          onChange={(_, filters) => setStatuses(filters.status as string[])}
        />

        {loadMoreOrderLogs && (
          <div className="text-center mt-4">
            <Button
              loading={isLoading}
              onClick={() => {
                setIsLoading(true)
                loadMoreOrderLogs().then(() => setIsLoading(false))
              }}
            >
              {formatMessage(commonMessages.ui.showMore)}
            </Button>
          </div>
        )}
      </StyledContainer>
    </AdminCard>
  )
}

export default SaleCollectionAdminCard
