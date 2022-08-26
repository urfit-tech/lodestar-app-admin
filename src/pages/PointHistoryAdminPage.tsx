import Icon, { MoreOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Dropdown, Menu, message, Popover, Skeleton, Table, Tabs } from 'antd'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminBlock, AdminPageTitle } from '../components/admin'
import { StyledModal, StyledModalParagraph, StyledModalTitle } from '../components/common'
import { AvatarImage } from '../components/common/Image'
import PointSendingModal from '../components/common/PointSendingModal'
import AdminLayout from '../components/layout/AdminLayout'
import hasura from '../hasura'
import { handleError } from '../helpers'
import { commonMessages, errorMessages, promotionMessages } from '../helpers/translation'
import { ReactComponent as PointIcon } from '../images/icon/point.svg'
import { ReactComponent as TextIcon } from '../images/icon/text.svg'
import { MemberBriefProps } from '../types/member'
import ForbiddenPage from './ForbiddenPage'
import LoadingPage from './LoadingPage'

const messages = defineMessages({
  pointReleaseHistory: { id: 'promotion.label.pointReleaseHistory', defaultMessage: '發送紀錄' },
  pointConsumptionHistory: { id: 'promotion.label.pointConsumptionHistory', defaultMessage: '消費紀錄' },
  createdAt: { id: 'promotion.label.createdAt', defaultMessage: '建立日期' },
  nameAndEmail: { id: 'promotion.label.nameAndEmail', defaultMessage: '姓名與 Email' },
  pointLogTitle: { id: 'promotion.label.pointLogTitle', defaultMessage: '項目' },
  pointAvailableDate: { id: 'promotion.label.pointAvailableDate', defaultMessage: '點數效期' },
  points: { id: 'promotion.label.points', defaultMessage: '點數' },
  unitOfPoints: { id: 'promotion.label.unitOfPoints', defaultMessage: '點' },
  revokePoint: { id: 'promotion.ui.revokePoint', defaultMessage: '收回點數' },
  revokePointWarning: {
    id: 'promotion.text.revokeNotation',
    defaultMessage: '系統將收回此次發送的點數，學員後台並不會留下任何收回紀錄',
  },
  successfullyRevoked: { id: 'promotion.event.successfullyRevoked', defaultMessage: '收回成功' },
})

type PointLogProps = {
  id: string
  createdAt: Date
  member: MemberBriefProps
  title: string
  note: string | null
  startedAt: Date | null
  endedAt: Date | null
  points: number
}
type OrderLogProps = {
  id: string
  member: MemberBriefProps
  title: string
  points: number
}

const StyledDescription = styled.div`
  font-size: 12px;
  color: var(--gray-dark);
`
const StyledLabel = styled.span<{ variant?: 'point-log' | 'order-log' }>`
  padding: 0.125rem 0.5rem;
  color: white;
  font-size: 12px;
  border-radius: 11px;
  background: ${props => (props.variant === 'point-log' ? 'var(--success)' : 'var(--warning)')};
  white-space: nowrap;
`
const StyledIcon = styled(Icon)`
  color: ${props => props.theme['@primary-color']};
`

const PointHistoryAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { loading: loadingApp, enabledModules, settings } = useApp()
  const pointUnit = settings['point.unit'] || formatMessage(messages.unitOfPoints)
  const { loadingPointLogs, errorPointLogs, pointLogs, refetchPointLogs, fetchMorePointLogs } = usePointLogCollection()
  const deletePointLog = useDeletePointLog()
  const [isRevokedModalVisible, setIsRevokedModalVisible] = useState<boolean>(false)

  const { loadingOrderLogs, errorOrderLogs, orderLogs, refetchOrderLogs, fetchMoreOrderLogs } =
    useOrderLogWithPointsCollection()
  const [loading, setLoading] = useState(false)

  const handleRevokePoint = (id: String) => {
    deletePointLog(id).then(() => {
      setIsRevokedModalVisible(false)
      message.success(formatMessage(messages.successfullyRevoked))
      refetchPointLogs()
    })
  }

  if (loadingApp) {
    return <LoadingPage />
  }

  if (errorPointLogs && errorOrderLogs) {
    message.error(errorMessages.data.fetch)
  }

  if (!enabledModules.point) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <PointIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.pointHistory)}</span>
      </AdminPageTitle>

      <div className="mb-5">
        <PointSendingModal onRefetch={refetchPointLogs} />
      </div>

      <Tabs
        defaultActiveKey="point-log"
        onChange={() => {
          refetchPointLogs()
          refetchOrderLogs()
        }}
      >
        <Tabs.TabPane key="point-log" tab={formatMessage(messages.pointReleaseHistory)} className="pt-3">
          <AdminBlock>
            {loadingPointLogs ? (
              <Skeleton active />
            ) : (
              <Table<PointLogProps>
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
                    title: formatMessage(messages.pointLogTitle),
                    dataIndex: 'title',
                    render: (text, record, index) => (
                      <div>
                        {text}
                        {record.note && (
                          <Popover title={record.note} className="cursor-pointer">
                            <StyledIcon component={() => <TextIcon />} className="ml-2" />
                          </Popover>
                        )}
                      </div>
                    ),
                  },
                  {
                    title: formatMessage(messages.pointAvailableDate),
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
                    title: formatMessage(messages.points),
                    dataIndex: 'points',
                    render: (text, record, index) => (
                      <div className="d-flex justify-content-between">
                        <StyledLabel variant="point-log">
                          {text > 0 && '+'}
                          {text} {pointUnit}
                        </StyledLabel>
                        <Dropdown
                          trigger={['click']}
                          overlay={
                            <Menu onClick={() => setIsRevokedModalVisible(true)}>
                              <Menu.Item>{formatMessage(messages.revokePoint)}</Menu.Item>
                              <StyledModal
                                visible={isRevokedModalVisible}
                                onOk={() => handleRevokePoint(record.id)}
                                okText={formatMessage(messages.revokePoint)}
                                onCancel={() => setIsRevokedModalVisible(false)}
                              >
                                <StyledModalTitle className="mb-4">
                                  {formatMessage(messages.revokePoint)}
                                </StyledModalTitle>
                                <StyledModalParagraph>
                                  {formatMessage(messages.revokePointWarning)}
                                </StyledModalParagraph>
                              </StyledModal>
                            </Menu>
                          }
                          placement="bottomRight"
                        >
                          <MoreOutlined className="cursor-pointer" />
                        </Dropdown>
                      </div>
                    ),
                  },
                ]}
                dataSource={pointLogs}
                rowKey="id"
                pagination={false}
              />
            )}

            {pointLogs.length > 0 && fetchMorePointLogs && (
              <div className="text-center mt-4">
                <Button
                  loading={loading}
                  onClick={() => {
                    setLoading(true)
                    fetchMorePointLogs().finally(() => setLoading(false))
                  }}
                >
                  {formatMessage(commonMessages.ui.showMore)}
                </Button>
              </div>
            )}
          </AdminBlock>
        </Tabs.TabPane>

        <Tabs.TabPane key="order-log" tab={formatMessage(messages.pointConsumptionHistory)} className="pt-3">
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
                  { title: formatMessage(messages.pointLogTitle), dataIndex: 'title' },
                  {
                    title: formatMessage(messages.points),
                    dataIndex: 'points',
                    render: (text, record, index) => (
                      <StyledLabel variant="order-log">
                        -{text} {pointUnit}
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

const usePointLogCollection = () => {
  const { loading, error, data, refetch, fetchMore } = useQuery<
    hasura.GET_POINT_RELEASE_HISTORY,
    hasura.GET_POINT_RELEASE_HISTORYVariables
  >(gql`
    query GET_POINT_RELEASE_HISTORY($offset: Int) {
      point_log(order_by: { created_at: desc }, limit: 10, offset: $offset) {
        id
        member {
          id
          picture_url
          name
          username
          email
        }
        description
        note
        created_at
        started_at
        ended_at
        point
      }
    }
  `)
  const [isNoMore, setIsNoMore] = useState(false)

  const pointLogs: PointLogProps[] =
    loading || error || !data
      ? []
      : data.point_log.map(pointLog => ({
          id: pointLog.id,
          createdAt: new Date(pointLog.created_at),
          member: {
            id: pointLog.member.id,
            avatarUrl: pointLog.member.picture_url,
            name: pointLog.member.name || pointLog.member.username,
            email: pointLog.member.email,
          },
          title: pointLog.description,
          note: pointLog.note,
          startedAt: pointLog.started_at && new Date(pointLog.started_at),
          endedAt: pointLog.ended_at && new Date(pointLog.ended_at),
          points: pointLog.point,
        }))

  return {
    loadingPointLogs: loading,
    errorPointLogs: error,
    pointLogs,
    refetchPointLogs: () => {
      setIsNoMore(false)
      return refetch()
    },
    fetchMorePointLogs: isNoMore
      ? undefined
      : () =>
          fetchMore({
            variables: { offset: data?.point_log.length || 0 },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              if (fetchMoreResult.point_log.length < 10) {
                setIsNoMore(true)
              }
              return {
                ...prev,
                point_log: [...prev.point_log, ...fetchMoreResult.point_log],
              }
            },
          }),
  }
}

const useOrderLogWithPointsCollection = () => {
  const { loading, error, data, refetch, fetchMore } = useQuery<
    hasura.GET_ORDER_LOG_WITH_POINTS_COLLECTION,
    hasura.GET_ORDER_LOG_WITH_POINTS_COLLECTIONVariables
  >(gql`
    query GET_ORDER_LOG_WITH_POINTS_COLLECTION($offset: Int) {
      order_log(
        where: { order_discounts: { type: { _eq: "Point" } } }
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
        order_discounts(where: { type: { _eq: "Point" } }, limit: 1) {
          id
          name
        }
        order_discounts_aggregate(where: { type: { _eq: "Point" } }) {
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
          points: orderLog.order_discounts_aggregate.aggregate?.sum?.price || 0,
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

const useDeletePointLog = () => {
  const [deletePointLogHandler] = useMutation<hasura.DELETE_POINT_LOG>(gql`
    mutation DELETE_POINT_LOG($pointLogId: uuid!) {
      delete_point_log(where: { id: { _eq: $pointLogId } }) {
        affected_rows
      }
    }
  `)

  const deletePointLog: (pointLogId: String) => Promise<void> = async pointLogId => {
    try {
      await deletePointLogHandler({
        variables: {
          pointLogId,
        },
      })
    } catch (err) {
      handleError(err)
    }
  }

  return deletePointLog
}

export default PointHistoryAdminPage
