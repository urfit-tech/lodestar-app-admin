import Icon, { MoreOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Dropdown, Menu, message, Popover, Skeleton, Table, Tabs } from 'antd'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminBlock, AdminPageTitle } from '../../../components/admin'
import CoinSendingModal from '../../../components/common/CoinSendingModal'
import { AvatarImage } from '../../../components/common/Image'
import AdminLayout from '../../../components/layout/AdminLayout'
import {
  StyledModal,
  StyledModalParagraph,
  StyledModalTitle,
} from '../../../components/program/ProgramDeletionAdminCard'
import AppContext from '../../../contexts/AppContext'
import { handleError } from '../../../helpers'
import { commonMessages, errorMessages, promotionMessages } from '../../../helpers/translation'
import { ReactComponent as CoinIcon } from '../../../images/icon/coin.svg'
import { ReactComponent as TextIcon } from '../../../images/icon/text.svg'
import types from '../../../types'
import { MemberBriefProps } from '../../../types/general'
import LoadingPage from '../LoadingPage'
import NotFoundPage from '../NotFoundPage'

const messages = defineMessages({
  coinReleaseHistory: { id: 'promotion.label.coinReleaseHistory', defaultMessage: '發送紀錄' },
  coinConsumptionHistory: { id: 'promotion.label.coinConsumptionHistory', defaultMessage: '消費記錄' },
  coinAboutToSend: { id: 'promotion.label.coinAboutToSend', defaultMessage: '即將發送' },
  createdAt: { id: 'promotion.label.createdAt', defaultMessage: '建立日期' },
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
}

const StyledDescription = styled.div`
  font-size: 12px;
  color: var(--gray-dark);
`
const StyledLabel = styled.span<{ variant?: 'coin-log' | 'order-log' }>`
  padding: 0.125rem 0.5rem;
  color: white;
  font-size: 12px;
  border-radius: 11px;
  background: ${props => (props.variant === 'coin-log' ? 'var(--success)' : 'var(--warning)')};
  white-space: nowrap;
`
const StyledIcon = styled(Icon)`
  color: ${props => props.theme['@primary-color']};
`

const CoinHistoryAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { loading: loadingApp, enabledModules, settings } = useContext(AppContext)
  const coinUnit = settings['coin.unit'] || formatMessage(messages.unitOfCoins)
  const { loadingCoinLogs, errorCoinLogs, coinLogs, refetchCoinLogs, fetchMoreCoinLogs } = useCoinLogCollection()
  const deleteCoinLog = useDeleteCoinLog()
  const [isRevokedModalVisible, setIsRevokedModalVisible] = useState<boolean>(false)
  const {
    loadingCoinFutureLogs,
    errorCoinFutureLogs,
    coinFutureLogs,
    refetchCoinFutureLogs,
    fetchMoreCoinFutureLogs,
  } = useFutureCoinLogCollection()
  const {
    loadingOrderLogs,
    errorOrderLogs,
    orderLogs,
    refetchOrderLogs,
    fetchMoreOrderLogs,
  } = useOrderLogWithCoinsCollection()
  const [loading, setLoading] = useState(false)

  const handleRevokeCoin = (id: String) => {
    deleteCoinLog(id).then(() => {
      setIsRevokedModalVisible(false)
      message.success(formatMessage(messages.successfullyRevoked))
      refetchCoinLogs()
    })
  }

  if (loadingApp) {
    return <LoadingPage />
  }

  if (errorCoinLogs && errorCoinFutureLogs && errorOrderLogs) {
    message.error(errorMessages.data.fetch)
  }

  if (!enabledModules.coin) {
    return <NotFoundPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <CoinIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.coinHistory)}</span>
      </AdminPageTitle>

      <div className="mb-5">
        <CoinSendingModal onRefetch={refetchCoinLogs} />
      </div>

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
            {loadingCoinLogs ? (
              <Skeleton active />
            ) : (
              <Table<CoinLogProps>
                columns={[
                  {
                    title: formatMessage(messages.createdAt),
                    dataIndex: 'createdAt',
                    render: (text, record, index) => <div>{moment(text).format('YYYY/MM/DD')}</div>,
                  },
                  {
                    title: formatMessage(messages.nameAndEmail),
                    key: 'member',
                    render: (text, record, index) => (
                      <div className="d-flex align-items-center">
                        <AvatarImage size="32px" src={record.member.avatarUrl} className="mr-3 flex-shrink-0" />
                        <div className="flex-grow-1">
                          <div>{record.member.name}</div>
                          <StyledDescription>{record.member.email}</StyledDescription>
                        </div>
                      </div>
                    ),
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
                        <StyledLabel variant="coin-log">
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
                      </div>
                    ),
                  },
                ]}
                dataSource={coinLogs}
                rowKey="id"
                pagination={false}
              />
            )}

            {coinLogs.length > 0 && fetchMoreCoinLogs && (
              <div className="text-center mt-4">
                <Button
                  loading={loading}
                  onClick={() => {
                    setLoading(true)
                    fetchMoreCoinLogs().finally(() => setLoading(false))
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
            {loadingCoinFutureLogs ? (
              <Skeleton active />
            ) : (
              <Table<CoinLogProps>
                columns={[
                  {
                    title: formatMessage(messages.createdAt),
                    dataIndex: 'createdAt',
                    render: (text, record, index) => <div>{moment(text).format('YYYY/MM/DD')}</div>,
                  },
                  {
                    title: formatMessage(messages.nameAndEmail),
                    key: 'member',
                    render: (text, record, index) => (
                      <div className="d-flex align-items-center">
                        <AvatarImage size="32px" src={record.member.avatarUrl} className="mr-3 flex-shrink-0" />
                        <div className="flex-grow-1">
                          <div>{record.member.name}</div>
                          <StyledDescription>{record.member.email}</StyledDescription>
                        </div>
                      </div>
                    ),
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
                        <StyledLabel variant="coin-log">
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
                      </div>
                    ),
                  },
                ]}
                // dataSource={coinLogs.filter(coinLog => coinLog.startedAt && coinLog.startedAt > moment().toDate())}
                dataSource={coinFutureLogs}
                rowKey="id"
                pagination={false}
              />
            )}

            {coinFutureLogs.length > 0 && fetchMoreCoinFutureLogs && (
              <div className="text-center mt-4">
                <Button
                  loading={loading}
                  onClick={() => {
                    setLoading(true)
                    fetchMoreCoinFutureLogs().finally(() => setLoading(false))
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
            {loadingOrderLogs ? (
              <Skeleton active />
            ) : (
              <Table<OrderLogProps>
                columns={[
                  {
                    title: formatMessage(messages.createdAt),
                    dataIndex: 'createdAt',
                    render: (text, record, index) => moment(text).format('YYYY/MM/DD'),
                  },
                  {
                    title: formatMessage(messages.nameAndEmail),
                    key: 'member',
                    render: (text, record, index) => (
                      <div className="d-flex align-items-center">
                        <AvatarImage size="32px" src={record.member.avatarUrl} className="mr-3 flex-shrink-0" />
                        <div className="flex-grow-1">
                          <div>{record.member.name}</div>
                          <StyledDescription>{record.member.email}</StyledDescription>
                        </div>
                      </div>
                    ),
                  },
                  { title: formatMessage(messages.coinLogTitle), dataIndex: 'title' },
                  {
                    title: formatMessage(messages.coins),
                    dataIndex: 'coins',
                    render: (text, record, index) => (
                      <StyledLabel variant="order-log">
                        -{text} {coinUnit}
                      </StyledLabel>
                    ),
                  },
                ]}
                dataSource={orderLogs}
                rowKey="id"
                pagination={false}
              />
            )}

            {orderLogs.length > 0 && fetchMoreOrderLogs && (
              <div className="text-center mt-4">
                <Button
                  loading={loading}
                  onClick={() => {
                    setLoading(true)
                    fetchMoreOrderLogs().finally(() => setLoading(false))
                  }}
                >
                  {formatMessage(commonMessages.ui.showMore)}
                </Button>
              </div>
            )}
          </AdminBlock>
        </Tabs.TabPane>
      </Tabs>
    </AdminLayout>
  )
}

const useCoinLogCollection = () => {
  const { loading, error, data, refetch, fetchMore } = useQuery<
    types.GET_COIN_RELEASE_HISTORY,
    types.GET_COIN_RELEASE_HISTORYVariables
  >(gql`
    query GET_COIN_RELEASE_HISTORY($offset: Int) {
      coin_log(order_by: { created_at: desc }, limit: 10, offset: $offset) {
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
  `)
  const [isNoMore, setIsNoMore] = useState(false)

  const coinLogs: CoinLogProps[] =
    loading || error || !data
      ? []
      : data.coin_log.map(coinLog => ({
          id: coinLog.id,
          createdAt: new Date(coinLog.created_at),
          member: {
            id: coinLog.member.id,
            avatarUrl: coinLog.member.picture_url,
            name: coinLog.member.name || coinLog.member.username,
            email: coinLog.member.email,
          },
          title: coinLog.title,
          description: coinLog.description,
          note: coinLog.note,
          startedAt: coinLog.started_at && new Date(coinLog.started_at),
          endedAt: coinLog.ended_at && new Date(coinLog.ended_at),
          amount: coinLog.amount,
        }))

  return {
    loadingCoinLogs: loading,
    errorCoinLogs: error,
    coinLogs,
    refetchCoinLogs: () => {
      setIsNoMore(false)
      return refetch()
    },
    fetchMoreCoinLogs: isNoMore
      ? undefined
      : () =>
          fetchMore({
            variables: { offset: data?.coin_log.length || 0 },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              if (fetchMoreResult.coin_log.length < 10) {
                setIsNoMore(true)
              }
              return {
                ...prev,
                coin_log: [...prev.coin_log, ...fetchMoreResult.coin_log],
              }
            },
          }),
  }
}

const useFutureCoinLogCollection = () => {
  const { loading, error, data, refetch, fetchMore } = useQuery<
    types.GET_COIN_ABOUT_TO_SEND,
    types.GET_COIN_ABOUT_TO_SENDVariables
  >(gql`
    query GET_COIN_ABOUT_TO_SEND($offset: Int) {
      coin_log(order_by: { created_at: desc }, limit: 10, offset: $offset, where: { started_at: { _gte: "now()" } }) {
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
  `)
  const [isNoMore, setIsNoMore] = useState(false)

  const coinFutureLogs: CoinFutureLogProps[] =
    loading || error || !data
      ? []
      : data.coin_log.map(coinFutureLog => ({
          id: coinFutureLog.id,
          createdAt: new Date(coinFutureLog.created_at),
          member: {
            id: coinFutureLog.member.id,
            avatarUrl: coinFutureLog.member.picture_url,
            name: coinFutureLog.member.name || coinFutureLog.member.username,
            email: coinFutureLog.member.email,
          },
          title: coinFutureLog.title,
          description: coinFutureLog.description,
          note: coinFutureLog.note,
          startedAt: coinFutureLog.started_at && new Date(coinFutureLog.started_at),
          endedAt: coinFutureLog.ended_at && new Date(coinFutureLog.ended_at),
          amount: coinFutureLog.amount,
        }))

  return {
    loadingCoinFutureLogs: loading,
    errorCoinFutureLogs: error,
    coinFutureLogs,
    refetchCoinFutureLogs: () => {
      setIsNoMore(false)
      return refetch()
    },
    fetchMoreCoinFutureLogs: isNoMore
      ? undefined
      : () =>
          fetchMore({
            variables: { offset: data?.coin_log.length || 0 },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              if (fetchMoreResult.coin_log.length < 10) {
                setIsNoMore(true)
              }
              return {
                ...prev,
                coin_log: [...prev.coin_log, ...fetchMoreResult.coin_log],
              }
            },
          }),
  }
}

const useOrderLogWithCoinsCollection = () => {
  const { loading, error, data, refetch, fetchMore } = useQuery<
    types.GET_ORDER_LOG_WITH_COINS_COLLECTION,
    types.GET_ORDER_LOG_WITH_COINS_COLLECTIONVariables
  >(gql`
    query GET_ORDER_LOG_WITH_COINS_COLLECTION($offset: Int) {
      order_log(
        where: { order_discounts: { type: { _eq: "Coin" } } }
        order_by: { created_at: desc }
        limit: 10
        offset: $offset
      ) {
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
        }
        order_discounts_aggregate(where: { type: { _eq: "Coin" } }) {
          aggregate {
            sum {
              price
            }
          }
        }
      }
    }
  `)
  const [isNoMore, setIsNoMore] = useState(false)

  const orderLogs: OrderLogProps[] =
    loading || error || !data
      ? []
      : data.order_log.map(orderLog => ({
          id: orderLog.id,
          member: {
            id: orderLog.member.id,
            avatarUrl: orderLog.member.picture_url,
            name: orderLog.member.name || orderLog.member.username,
            email: orderLog.member.email,
          },
          title: orderLog.order_discounts[0]?.name || '',
          amount: orderLog.order_discounts_aggregate.aggregate?.sum?.price || 0,
        }))

  return {
    loadingOrderLogs: loading,
    errorOrderLogs: error,
    orderLogs,
    refetchOrderLogs: () => {
      setIsNoMore(false)
      return refetch()
    },
    fetchMoreOrderLogs: isNoMore
      ? undefined
      : () =>
          fetchMore({
            variables: { offset: data?.order_log.length || 0 },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              if (fetchMoreResult.order_log.length < 10) {
                setIsNoMore(true)
              }
              return {
                ...prev,
                order_log: [...prev.order_log, ...fetchMoreResult.order_log],
              }
            },
          }),
  }
}

const useDeleteCoinLog = () => {
  const [deleteCoinLogHandler] = useMutation<types.DELETE_COIN_LOG>(gql`
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

export default CoinHistoryAdminPage
