import { SearchOutlined } from '@ant-design/icons'
import { IconButton } from '@chakra-ui/react'
import { Button, Input, message, Spin, Table, Tooltip, Typography } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useState } from 'react'
import { AiOutlineRedo } from 'react-icons/ai'
import { useIntl } from 'react-intl'
import styled, { css } from 'styled-components'
import { currencyFormatter, desktopViewMixin } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useOrderLogPreviewCollection } from '../../hooks/order'
import AdminCard from '../admin/AdminCard'
import OrderStatusTag from './OrderStatusTag'
import SaleCollectionExpandRow from './SaleCollectionExpandRow'
import saleMessages from './translation'

export type OrderLogColumn = {
  id: string
  createdAt: Date
  name: string
  email: string
  status: string
  totalPrice: number
  options?: any
  parentOrderId?: string | null
  children?: OrderLogColumn[]
}

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
  isShowRefetchButton?: boolean
}> = ({ memberId, isShowRefetchButton }) => {
  const { formatMessage } = useIntl()
  const { currentMemberId, permissions } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [statuses, setStatuses] = useState<string[] | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [memberNameAndEmail, setMemberNameAndEmail] = useState<string | null>(null)

  const {
    totalCount,
    loadingOrderLogPreviewCollection,
    loadingOrderLogAggregate,
    loadingOrderLogsMember,
    loadingOrderProductsByOrderIdList,
    loadingOrderDiscountsByOrderIdList,
    parentOrders,
    childOrdersMap,
    refetchOrderLogPreviewCollection,
    refetchOrderLogAggregate,
    loadMoreOrderLogPreviewCollection,
  } = useOrderLogPreviewCollection(
    permissions.CHECK_MEMBER_ORDER && memberId ? memberId : currentMemberId || '',
    permissions.SALES_RECORDS_ADMIN ? 'Admin' : permissions.SALES_RECORDS_NORMAL ? 'Personal' : 'None',
    { statuses, orderId, memberNameAndEmail, memberId },
  )

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

  const columns: ColumnProps<OrderLogColumn>[] = [
    {
      title: formatMessage(commonMessages.label.orderLogId),
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => {
        const uuidRegexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi
        const orderNo = uuidRegexExp.test(text) ? text.split('-')[0] : text
        return (
          <Tooltip title={orderNo}>
            <span>{orderNo}</span>
          </Tooltip>
        )
      },
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
      render: (_, record) => <OrderStatusTag status={record.status} />,
      filters: [
        {
          text: formatMessage(commonMessages.status.orderSuccess),
          value: 'SUCCESS',
        },
        {
          text: formatMessage(commonMessages.status.orderPaying),
          value: 'PAYING',
        },
        {
          text: formatMessage(commonMessages.status.orderUnpaid),
          value: 'UNPAID',
        },
        {
          text: formatMessage(commonMessages.status.orderPartialPaid),
          value: 'PARTIAL_PAID',
        },
        {
          text: formatMessage(commonMessages.status.orderFailed),
          value: 'FAILED',
        },
        {
          text: formatMessage(commonMessages.status.orderPartialRefund),
          value: 'PARTIAL_REFUND',
        },
        {
          text: formatMessage(commonMessages.status.orderRefund),
          value: 'REFUND',
        },
        {
          text: formatMessage(commonMessages.status.orderExpired),
          value: 'EXPIRED',
        },
        {
          text: formatMessage(commonMessages.status.deleted),
          value: 'DELETED',
        },
      ],
    },
    {
      title: formatMessage(commonMessages.label.orderLogPrice),
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      align: 'right',
      render: (_, record) => currencyFormatter(record.totalPrice),
    },
  ]

  return (
    <AdminCard>
      <StyledContainer>
        {isShowRefetchButton && (
          <IconButton
            ml="3"
            w="45px"
            h="45px"
            _hover={{}}
            aria-label="refresh"
            icon={<AiOutlineRedo />}
            variant="outline"
            onClick={async () => {
              await Promise.all([refetchOrderLogPreviewCollection(), refetchOrderLogAggregate()])
              message.info(formatMessage(saleMessages.SaleCollectionAdminCard.successfullyRefreshed))
            }}
          />
        )}
        <div className="d-flex justify-content-end">
          <Typography.Text type="secondary">
            {loadingOrderLogAggregate ? (
              <span>
                <Spin /> {formatMessage(saleMessages.SaleCollectionAdminCard.calculatingTotalCount)}
              </span>
            ) : (
              formatMessage(commonMessages.text.totalCount, { count: totalCount })
            )}
          </Typography.Text>
        </div>
        <Table<OrderLogColumn>
          rowKey="id"
          loading={
            loadingOrderLogPreviewCollection ||
            loadingOrderLogsMember ||
            loadingOrderProductsByOrderIdList ||
            loadingOrderDiscountsByOrderIdList
          }
          dataSource={parentOrders}
          columns={columns}
          expandedRowRender={(record: OrderLogColumn) => {
            const childOrders = childOrdersMap.get(record.id) || []
            return (
              <SaleCollectionExpandRow
                record={record}
                onRefetchOrderLog={refetchOrderLogPreviewCollection}
                childOrders={childOrders}
                columns={columns}
              />
            )
          }}
          pagination={false}
          onChange={(_, filters) => setStatuses(filters.status as string[])}
        />
        {loadMoreOrderLogPreviewCollection && (
          <div className="text-center mt-4">
            <Button
              loading={isLoading}
              disabled={loadingOrderLogAggregate}
              onClick={() => {
                setIsLoading(true)
                refetchOrderLogAggregate()
                loadMoreOrderLogPreviewCollection().then(() => setIsLoading(false))
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
