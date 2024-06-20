import Icon, { MoreOutlined, SearchOutlined } from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Dropdown, Input, Menu, message, Popover, Table, Tabs } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import { sum } from 'ramda'
import React, { useRef, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, promotionMessages } from '../../helpers/translation'
import { ReactComponent as TextIcon } from '../../images/icon/text.svg'
import { MemberBriefProps } from '../../types/member'
import { AdminBlock } from '../admin'
import { StyledModal, StyledModalParagraph, StyledModalTitle } from '../common'
import CoinSendingModal from '../common/CoinSendingModal'
import { AvatarImage } from '../common/Image'

const messages = defineMessages({
  coinReleaseHistory: { id: 'promotion.label.coinReleaseHistory', defaultMessage: '發送紀錄' },
  coinConsumptionHistory: { id: 'promotion.label.coinConsumptionHistory', defaultMessage: '消費紀錄' },
  coinAboutToSend: { id: 'promotion.label.coinAboutToSend', defaultMessage: '即將發送' },
  createdAt: { id: 'promotion.label.createdAt', defaultMessage: '建立日期' },
  orderLogId: { id: 'promotion.label.orderLogId', defaultMessage: '訂單編號' },
  nameAndEmail: { id: 'promotion.label.nameAndEmail', defaultMessage: '姓名與 Email' },
  coinLogTitle: { id: 'promotion.label.coinLogTitle', defaultMessage: '項目' },
  coinAvailableDate: { id: 'promotion.label.coinAvailableDate', defaultMessage: '代幣效期' },
  coins: { id: 'promotion.label.coins', defaultMessage: '代幣' },
  unitOfCoins: { id: 'promotion.label.unitOfCoins', defaultMessage: '點' },
  revokeCoin: { id: 'promotion.ui.revokeCoin', defaultMessage: '收回代幣' },
  revokeCoinWarning: {
    id: 'promotion.text.revokeNotation',
    defaultMessage: '系統將收回此次發送的代幣，學員後台並不會留下任何收回紀錄',
  },
  successfullyRevoked: { id: 'promotion.event.successfullyRevoked', defaultMessage: '收回成功' },
})

type CustomizeColumnProps = {
  id: string
  createdAt?: Date
  member: MemberBriefProps
  title: string
  note?: string | null
  startedAt?: Date | null
  endedAt?: Date | null
  orderLogId?: string
  amount: number
}
type CoinLogProps = {
  id: string
  createdAt: Date
  member: MemberBriefProps
  title: string
  note: string | null
  startedAt: Date | null
  endedAt: Date | null
  amount: number
}
type CoinFutureLogProps = {
  id: string
  createdAt: Date
  member: MemberBriefProps
  title: string
  note: string | null
  startedAt: Date | null
  endedAt: Date | null
  amount: number
}
type OrderLogProps = {
  id: string
  member: MemberBriefProps
  title: string
  amount: number
  createdAt: Date
}

const StyledDescription = styled.div`
  font-size: 12px;
  color: var(--gray-dark);
`
const StyledLabel = styled.span<{ variant?: 'coin-log' | 'order-log'; amount?: number }>`
  padding: 0.125rem 0.5rem;
  color: white;
  font-size: 12px;
  border-radius: 11px;
  background: ${props =>
    props.variant === 'coin-log' && props.amount && props.amount >= 0 ? 'var(--success)' : 'var(--warning)'};
  white-space: nowrap;
`
const StyledIcon = styled(Icon)`
  color: ${props => props.theme['@primary-color']};
`
const StyledSearchOutlined = styled(SearchOutlined)`
  &.filtered {
    color: ${props => props.theme['@primary-color']};
  }
`

const MemberCoinAdminBlock: React.VFC<{
  memberId?: string
  withSendingModal?: boolean
}> = ({ memberId, withSendingModal = true }) => {
  const { formatMessage } = useIntl()
  const { settings } = useApp()
  const { permissions } = useAuth()
  const coinUnit = settings['coin.unit'] || formatMessage(messages.unitOfCoins)
  const deleteCoinLog = useDeleteCoinLog()
  const [isRevokedModalVisible, setIsRevokedModalVisible] = useState<boolean>(false)
  const storeCreatedTime = useRef('')
  const currentIndex = useRef(0)

  const [fieldFilter, setFieldFilter] = useState<{
    orderLogId?: string
    nameAndEmail?: string
    title?: string
  }>({})

  const { loadingCoinLogs, errorCoinLogs, coinLogs, refetchCoinLogs, loadMoreCoinLogs } = useCoinLogCollection(
    currentIndex,
    storeCreatedTime,
    {
      ...fieldFilter,
      memberId,
    },
  )
  const { loadingCoinFutureLogs, errorCoinFutureLogs, coinFutureLogs, refetchCoinFutureLogs, loadMoreCoinFutureLogs } =
    useFutureCoinLogCollection(currentIndex, storeCreatedTime, { ...fieldFilter, memberId })
  const { loadingOrderLogs, errorOrderLogs, orderLogs, refetchOrderLogs, loadMoreOrderLogs } =
    useOrderLogWithCoinsCollection(currentIndex, storeCreatedTime, {
      ...fieldFilter,
      memberId,
    })

  const [loading, setLoading] = useState(false)

  const searchInputRef = useRef<Input | null>(null)
  const setFilter = (columnId: string, value: string | null) => {
    setFieldFilter({ ...fieldFilter, [columnId]: value ?? undefined })
  }

  if (errorCoinLogs && errorCoinFutureLogs && errorOrderLogs) {
    message.error(errorMessages.data.fetch)
  }

  const handleRevokeCoin = (id: String) => {
    deleteCoinLog(id).then(() => {
      setIsRevokedModalVisible(false)
      message.success(formatMessage(messages.successfullyRevoked))
      refetchCoinLogs()
    })
  }

  const getColumnSearchProps: (field: keyof typeof fieldFilter) => ColumnProps<CustomizeColumnProps> = columnId => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-2">
        <Input
          ref={searchInputRef}
          value={selectedKeys[0]}
          onChange={e => {
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }}
          onPressEnter={() => {
            confirm()
            setFilter(columnId, selectedKeys[0] as string)
          }}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <div>
          <Button
            type="primary"
            size="small"
            className="mr-2"
            style={{ width: 90 }}
            icon={<SearchOutlined />}
            onClick={() => {
              confirm()
              setFilter(columnId, selectedKeys[0] as string)
            }}
          >
            {formatMessage(commonMessages.ui.search)}
          </Button>
          <Button
            size="small"
            onClick={() => {
              clearFilters && clearFilters()
              setFilter(columnId, null)
            }}
            style={{ width: 90 }}
          >
            {formatMessage(commonMessages.ui.reset)}
          </Button>
        </div>
      </div>
    ),
    filterIcon: filtered => <StyledSearchOutlined className={filtered ? 'filtered' : undefined} />,
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => searchInputRef.current?.select(), 100)
      }
    },
  })

  return (
    <>
      {withSendingModal && (
        <div className="mb-5">
          <CoinSendingModal onRefetch={refetchCoinLogs} />
        </div>
      )}
      <Tabs
        defaultActiveKey="coin-log"
        onChange={() => {
          refetchCoinLogs()
          refetchCoinFutureLogs()
          refetchOrderLogs()
        }}
      >
        <Tabs.TabPane key="coin-log" tab={formatMessage(messages.coinReleaseHistory)} className="pt-3">
          <AdminBlock>
            <Table<CustomizeColumnProps>
              columns={[
                {
                  title: formatMessage(messages.createdAt),
                  dataIndex: 'createdAt',
                  render: (text, record, index) => <div>{moment(text).format('YYYY/MM/DD')}</div>,
                },
                {
                  title: formatMessage(messages.nameAndEmail),
                  key: 'nameAndEmail',
                  render: (text, record, index) => (
                    <div className="d-flex align-items-center">
                      <AvatarImage size="32px" src={record.member.avatarUrl} className="mr-3 flex-shrink-0" />
                      <div className="flex-grow-1">
                        <div>{record.member.name}</div>
                        <StyledDescription>{record.member.email}</StyledDescription>
                      </div>
                    </div>
                  ),
                  ...getColumnSearchProps('nameAndEmail'),
                },
                {
                  title: formatMessage(messages.coinLogTitle),
                  dataIndex: 'title',
                  render: (text, record, index) => (
                    <div>
                      {text}
                      {record.note && (
                        <Popover title={record.note} className="cursor-coiner">
                          <StyledIcon component={() => <TextIcon />} className="ml-2" />
                        </Popover>
                      )}
                    </div>
                  ),
                  ...getColumnSearchProps('title'),
                },
                {
                  title: formatMessage(messages.coinAvailableDate),
                  key: 'date',
                  render: (text, record, index) => (
                    <div>
                      {record.startedAt
                        ? moment(record.startedAt).format('YYYY/MM/DD')
                        : formatMessage(promotionMessages.label.fromNow)}
                      {` ~ `}
                      {record.endedAt
                        ? moment(record.endedAt).format('YYYY/MM/DD')
                        : formatMessage(promotionMessages.label.unlimited)}
                    </div>
                  ),
                },
                {
                  title: formatMessage(messages.coins),
                  dataIndex: 'amount',
                  render: (text, record, index) => (
                    <div className="d-flex justify-content-between">
                      <StyledLabel variant="coin-log" amount={text}>
                        {text > 0 && '+'}
                        {text} {coinUnit}
                      </StyledLabel>
                      {permissions.RECLAIM_COIN && (
                        <Dropdown
                          trigger={['click']}
                          overlay={
                            <Menu onClick={() => setIsRevokedModalVisible(true)}>
                              <Menu.Item>{formatMessage(messages.revokeCoin)}</Menu.Item>
                              <StyledModal
                                visible={isRevokedModalVisible}
                                onOk={() => handleRevokeCoin(record.id)}
                                okText={formatMessage(messages.revokeCoin)}
                                onCancel={() => setIsRevokedModalVisible(false)}
                              >
                                <StyledModalTitle className="mb-4">
                                  {formatMessage(messages.revokeCoin)}
                                </StyledModalTitle>
                                <StyledModalParagraph>{formatMessage(messages.revokeCoinWarning)}</StyledModalParagraph>
                              </StyledModal>
                            </Menu>
                          }
                          placement="bottomRight"
                        >
                          <MoreOutlined className="cursor-coiner" />
                        </Dropdown>
                      )}
                    </div>
                  ),
                },
              ]}
              dataSource={coinLogs}
              rowKey="id"
              pagination={false}
              loading={loadingCoinLogs}
            />

            {coinLogs.length > 0 && loadMoreCoinLogs && (
              <div className="text-center mt-4">
                <Button
                  loading={loading}
                  onClick={() => {
                    setLoading(true)
                    loadMoreCoinLogs().finally(() => setLoading(false))
                  }}
                >
                  {formatMessage(commonMessages.ui.showMore)}
                </Button>
              </div>
            )}
          </AdminBlock>
        </Tabs.TabPane>

        <Tabs.TabPane key="future-log" tab={formatMessage(messages.coinAboutToSend)} className="pt-3">
          <AdminBlock>
            <Table<CustomizeColumnProps>
              columns={[
                {
                  title: formatMessage(messages.createdAt),
                  dataIndex: 'createdAt',
                  render: (text, record, index) => <div>{moment(text).format('YYYY/MM/DD')}</div>,
                },
                {
                  title: formatMessage(messages.nameAndEmail),
                  key: 'nameAndEmail',
                  render: (text, record, index) => (
                    <div className="d-flex align-items-center">
                      <AvatarImage size="32px" src={record.member.avatarUrl} className="mr-3 flex-shrink-0" />
                      <div className="flex-grow-1">
                        <div>{record.member.name}</div>
                        <StyledDescription>{record.member.email}</StyledDescription>
                      </div>
                    </div>
                  ),
                  ...getColumnSearchProps('nameAndEmail'),
                },
                {
                  title: formatMessage(messages.coinLogTitle),
                  dataIndex: 'title',
                  render: (text, record, index) => (
                    <div>
                      {text}
                      {record.note && (
                        <Popover title={record.note} className="cursor-coiner">
                          <StyledIcon component={() => <TextIcon />} className="ml-2" />
                        </Popover>
                      )}
                    </div>
                  ),
                  ...getColumnSearchProps('title'),
                },
                {
                  title: formatMessage(messages.coinAvailableDate),
                  key: 'date',
                  render: (text, record, index) => (
                    <div>
                      {record.startedAt
                        ? moment(record.startedAt).format('YYYY/MM/DD')
                        : formatMessage(promotionMessages.label.fromNow)}
                      {` ~ `}
                      {record.endedAt
                        ? moment(record.endedAt).format('YYYY/MM/DD')
                        : formatMessage(promotionMessages.label.unlimited)}
                    </div>
                  ),
                },
                {
                  title: formatMessage(messages.coins),
                  dataIndex: 'amount',
                  render: (text, record, index) => (
                    <div className="d-flex justify-content-between">
                      <StyledLabel variant="coin-log" amount={text}>
                        {text > 0 && '+'}
                        {text} {coinUnit}
                      </StyledLabel>
                      <Dropdown
                        trigger={['click']}
                        overlay={
                          <Menu onClick={() => setIsRevokedModalVisible(true)}>
                            <Menu.Item>{formatMessage(messages.revokeCoin)}</Menu.Item>
                            <StyledModal
                              visible={isRevokedModalVisible}
                              onOk={() => handleRevokeCoin(record.id)}
                              okText={formatMessage(messages.revokeCoin)}
                              onCancel={() => setIsRevokedModalVisible(false)}
                            >
                              <StyledModalTitle className="mb-4">{formatMessage(messages.revokeCoin)}</StyledModalTitle>
                              <StyledModalParagraph>{formatMessage(messages.revokeCoinWarning)}</StyledModalParagraph>
                            </StyledModal>
                          </Menu>
                        }
                        placement="bottomRight"
                      >
                        <MoreOutlined className="cursor-coiner" />
                      </Dropdown>
                    </div>
                  ),
                },
              ]}
              dataSource={coinFutureLogs}
              rowKey="id"
              pagination={false}
              loading={loadingCoinFutureLogs}
            />

            {coinFutureLogs.length > 0 && loadMoreCoinFutureLogs && (
              <div className="text-center mt-4">
                <Button
                  loading={loading}
                  onClick={() => {
                    setLoading(true)
                    loadMoreCoinFutureLogs().finally(() => setLoading(false))
                  }}
                >
                  {formatMessage(commonMessages.ui.showMore)}
                </Button>
              </div>
            )}
          </AdminBlock>
        </Tabs.TabPane>

        <Tabs.TabPane key="order-log" tab={formatMessage(messages.coinConsumptionHistory)} className="pt-3">
          <AdminBlock>
            <Table<CustomizeColumnProps>
              columns={[
                {
                  title: formatMessage(messages.createdAt),
                  dataIndex: 'createdAt',
                  render: (text, record, index) => moment(record.createdAt).format('YYYY/MM/DD'),
                },
                {
                  title: formatMessage(messages.orderLogId),
                  dataIndex: 'orderLogId',
                  render: (text, record, index) => <div>{record.id}</div>,
                  ...getColumnSearchProps('orderLogId'),
                },
                {
                  title: formatMessage(messages.nameAndEmail),
                  key: 'nameAndEmail',
                  render: (text, record, index) => (
                    <div className="d-flex align-items-center">
                      <AvatarImage size="32px" src={record.member.avatarUrl} className="mr-3 flex-shrink-0" />
                      <div className="flex-grow-1">
                        <div>{record.member.name}</div>
                        <StyledDescription>{record.member.email}</StyledDescription>
                      </div>
                    </div>
                  ),
                  ...getColumnSearchProps('nameAndEmail'),
                },
                {
                  title: formatMessage(messages.coinLogTitle),
                  dataIndex: 'title',
                  render: (text, record, index) => <div>{text}</div>,
                  ...getColumnSearchProps('title'),
                },

                {
                  title: formatMessage(messages.coins),
                  dataIndex: 'coins',
                  render: (text, record, index) => (
                    <StyledLabel variant="order-log">{`- ${record.amount} ${coinUnit} `}</StyledLabel>
                  ),
                },
              ]}
              dataSource={orderLogs}
              rowKey="id"
              pagination={false}
              loading={loadingOrderLogs}
            />

            {orderLogs.length > 0 && loadMoreOrderLogs && (
              <div className="text-center mt-4">
                <Button
                  loading={loading}
                  onClick={() => {
                    setLoading(true)
                    loadMoreOrderLogs().finally(() => setLoading(false))
                  }}
                >
                  {formatMessage(commonMessages.ui.showMore)}
                </Button>
              </div>
            )}
          </AdminBlock>
        </Tabs.TabPane>
      </Tabs>
    </>
  )
}
const useCoinLogCollection = (
  currentIndex: React.MutableRefObject<number>,
  storeCreatedTime: React.MutableRefObject<string>,
  filter?: { nameAndEmail?: string; title?: string; memberId?: string },
) => {
  const condition: hasura.GET_COIN_RELEASE_HISTORYVariables['condition'] = {
    member_id: filter?.memberId
      ? {
          _eq: filter.memberId,
        }
      : undefined,
    member: filter?.nameAndEmail
      ? {
          _or: [{ name: { _like: `%${filter.nameAndEmail}%` } }, { email: { _like: `%${filter.nameAndEmail}%` } }],
        }
      : undefined,
    title: filter?.title ? { _like: `%${filter.title}%` } : undefined,
    _or: [{ started_at: { _is_null: true } }, { started_at: { _lte: 'now()' } }],
    claimed_at: { _is_null: false },
  }
  const { loading, error, data, refetch, fetchMore } = useQuery<
    hasura.GET_COIN_RELEASE_HISTORY,
    hasura.GET_COIN_RELEASE_HISTORYVariables
  >(
    gql`
      query GET_COIN_RELEASE_HISTORY($condition: coin_log_bool_exp, $limit: Int!) {
        coin_log_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
        coin_log(where: $condition, order_by: { created_at: desc }, limit: $limit) {
          id
          member {
            id
            picture_url
            name
            username
            email
          }
          title
          description
          note
          created_at
          started_at
          ended_at
          amount
        }
      }
    `,
    {
      variables: {
        condition,
        limit: 10,
      },
    },
  )

  const coinLogs: CoinLogProps[] =
    loading || error || !data
      ? []
      : data.coin_log.map(coinLog => ({
          id: coinLog.id,
          createdAt: new Date(coinLog.created_at),
          member: {
            id: coinLog.member.id,
            avatarUrl: coinLog.member.picture_url || null,
            name: coinLog.member.name || coinLog.member.username,
            email: coinLog.member.email,
          },
          title: coinLog.title || '',
          description: coinLog.description || '',
          note: coinLog.note || '',
          startedAt: coinLog.started_at && new Date(coinLog.started_at),
          endedAt: coinLog.ended_at && new Date(coinLog.ended_at),
          amount: coinLog.amount,
        }))

  if (storeCreatedTime.current === '' && data) {
    storeCreatedTime.current = data?.coin_log[0]?.created_at ? data?.coin_log[0]?.created_at : ''
  }

  const loadMoreCoinLogs = () =>
    fetchMore({
      variables: {
        condition: { ...condition, created_at: { _lt: data?.coin_log.slice(-1)[0]?.created_at } },
        limit: 10,
        offset: 10 + currentIndex.current,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev
        }
        currentIndex.current += 10

        return Object.assign({}, prev, {
          coin_log: [...prev.coin_log, ...fetchMoreResult.coin_log],
        })
      },
    })

  return {
    loadingCoinLogs: loading,
    errorCoinLogs: error,
    coinLogs,
    refetchCoinLogs: refetch,
    loadMoreCoinLogs:
      (data?.coin_log_aggregate.aggregate?.count || 0) - coinLogs.length > 0 ? loadMoreCoinLogs : undefined,
  }
}

const useFutureCoinLogCollection = (
  currentIndex: React.MutableRefObject<number>,
  storeCreatedTime: React.MutableRefObject<string>,
  filter?: { nameAndEmail?: string; title?: string; memberId?: string },
) => {
  const condition: hasura.GET_COIN_ABOUT_TO_SENDVariables['condition'] = {
    member_id: filter?.memberId
      ? {
          _eq: filter.memberId,
        }
      : undefined,
    member: filter?.nameAndEmail
      ? {
          _or: [{ name: { _like: `%{filter.nameAndEmail}%` } }, { email: { _like: `%${filter.nameAndEmail}%` } }],
        }
      : undefined,
    title: filter?.title ? { _like: `%${filter.title}%` } : undefined,
    started_at: { _gte: 'now()' },
  }
  const { loading, error, data, refetch, fetchMore } = useQuery<
    hasura.GET_COIN_ABOUT_TO_SEND,
    hasura.GET_COIN_ABOUT_TO_SENDVariables
  >(
    gql`
      query GET_COIN_ABOUT_TO_SEND($condition: coin_log_bool_exp, $limit: Int!, $offset: Int!) {
        coin_log_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
        coin_log(order_by: { created_at: desc }, limit: $limit, offset: $offset, where: $condition) {
          id
          member {
            id
            picture_url
            name
            username
            email
          }
          title
          description
          note
          created_at
          started_at
          ended_at
          amount
        }
      }
    `,
    {
      variables: {
        condition,
        limit: 10,
        offset: 0,
      },
    },
  )

  const coinFutureLogs: CoinFutureLogProps[] =
    loading || error || !data
      ? []
      : data.coin_log.map(coinFutureLog => ({
          id: coinFutureLog.id,
          createdAt: new Date(coinFutureLog.created_at),
          member: {
            id: coinFutureLog.member.id,
            avatarUrl: coinFutureLog.member.picture_url || null,
            name: coinFutureLog.member.name || coinFutureLog.member.username,
            email: coinFutureLog.member.email,
          },
          title: coinFutureLog.title || '',
          description: coinFutureLog.description || '',
          note: coinFutureLog.note || '',
          startedAt: coinFutureLog.started_at && new Date(coinFutureLog.started_at),
          endedAt: coinFutureLog.ended_at && new Date(coinFutureLog.ended_at),
          amount: coinFutureLog.amount,
        }))
  if (storeCreatedTime.current === '' && data) {
    storeCreatedTime.current = data?.coin_log[0]?.created_at ? data?.coin_log[0]?.created_at : ''
  }

  const loadMoreCoinFutureLogs = () =>
    fetchMore({
      variables: {
        condition: { ...condition, created_at: { _lte: storeCreatedTime.current } },
        limit: 10,
        offset: 10 + currentIndex.current,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev
        }
        currentIndex.current += 10

        return Object.assign({}, prev, {
          coin_log: [...prev.coin_log, ...fetchMoreResult.coin_log],
        })
      },
    })

  return {
    loadingCoinFutureLogs: loading,
    errorCoinFutureLogs: error,
    coinFutureLogs,
    refetchCoinFutureLogs: refetch,
    loadMoreCoinFutureLogs:
      (data?.coin_log_aggregate.aggregate?.count || 0) - coinFutureLogs.length > 0 ? loadMoreCoinFutureLogs : undefined,
  }
}

const useOrderLogWithCoinsCollection = (
  currentIndex: React.MutableRefObject<number>,
  storeCreatedTime: React.MutableRefObject<string>,
  filter?: {
    orderLogId?: string
    nameAndEmail?: string
    title?: string
    memberId?: string
  },
) => {
  const condition: hasura.GET_ORDER_LOG_WITH_COINS_COLLECTIONVariables['condition'] = {
    id: filter?.orderLogId ? { _like: `%${filter.orderLogId}%` } : undefined,
    member_id: filter?.memberId
      ? {
          _eq: filter.memberId,
        }
      : undefined,
    member: filter?.nameAndEmail
      ? {
          _or: [{ name: { _like: `%${filter.nameAndEmail}%` } }, { email: { _like: `%${filter.nameAndEmail}%` } }],
        }
      : undefined,
    order_discounts: filter?.title
      ? {
          name: { _like: `%${filter.title}%` },
          type: { _eq: 'Coin' },
        }
      : { type: { _eq: 'Coin' } },
  }
  const { loading, error, data, refetch, fetchMore } = useQuery<
    hasura.GET_ORDER_LOG_WITH_COINS_COLLECTION,
    hasura.GET_ORDER_LOG_WITH_COINS_COLLECTIONVariables
  >(
    gql`
      query GET_ORDER_LOG_WITH_COINS_COLLECTION($condition: order_log_bool_exp, $limit: Int!, $offset: Int!) {
        order_log_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
        order_log(where: $condition, limit: $limit, offset: $offset, order_by: { created_at: desc }) {
          id
          created_at
          member {
            id
            picture_url
            name
            username
            email
          }
          order_discounts(where: { type: { _eq: "Coin" } }, limit: 1) {
            id
            name
            price
            options
          }
        }
      }
    `,
    {
      variables: {
        condition,
        limit: 10,
        offset: 0,
      },
    },
  )

  const orderLogs: OrderLogProps[] =
    loading || error || !data
      ? []
      : data.order_log.map(orderLog => ({
          id: orderLog.id,
          member: {
            id: orderLog.member.id,
            avatarUrl: orderLog.member.picture_url || null,
            name: orderLog.member.name || orderLog.member.username,
            email: orderLog.member.email,
          },
          title: orderLog.order_discounts[0]?.name || '',
          amount: sum(orderLog.order_discounts.map(v => v.price / (v.options?.exchangeRate || 1))),
          createdAt: orderLog.created_at,
        }))

  if (storeCreatedTime.current === '' && data) {
    storeCreatedTime.current = data?.order_log[0]?.created_at ? data?.order_log[0]?.created_at : ''
  }

  const loadMoreOrderLogs = () =>
    fetchMore({
      variables: {
        condition: { ...condition, created_at: { _lte: storeCreatedTime.current } },
        limit: 10,
        offset: 10 + currentIndex.current,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev
        }
        currentIndex.current += 10
        return Object.assign({}, prev, {
          order_log: [...prev.order_log, ...fetchMoreResult.order_log],
        })
      },
    })

  return {
    loadingOrderLogs: loading,
    errorOrderLogs: error,
    orderLogs,
    refetchOrderLogs: refetch,
    loadMoreOrderLogs:
      (data?.order_log_aggregate.aggregate?.count || 0) - orderLogs.length > 0 ? loadMoreOrderLogs : undefined,
  }
}

const useDeleteCoinLog = () => {
  const [deleteCoinLogHandler] = useMutation<hasura.DELETE_COIN_LOG>(gql`
    mutation DELETE_COIN_LOG($coinLogId: uuid!) {
      delete_coin_log(where: { id: { _eq: $coinLogId } }) {
        affected_rows
      }
    }
  `)

  const deleteCoinLog: (coinLogId: String) => Promise<void> = async coinLogId => {
    try {
      await deleteCoinLogHandler({
        variables: {
          coinLogId,
        },
      })
    } catch (err) {
      handleError(err)
    }
  }

  return deleteCoinLog
}

export default MemberCoinAdminBlock
