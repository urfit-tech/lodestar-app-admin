import Icon, { DollarOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { DatePicker, Select, Skeleton, Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment-timezone'
import { sum } from 'ramda'
import React, { useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import { v4 } from 'uuid'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import hasura from '../../hasura'
import { notEmpty } from '../../helpers'
import { salesMessages } from '../../helpers/translation'
import ForbiddenPage from '../ForbiddenPage'

export type MemberContract = {
  id: string
  agreedAt: Date
  approvedAt?: Date
  canceledAt?: Date
  revokedAt?: Date
  refundAppliedAt?: Date
  author: {
    id: string
    name: string
  }
  executor: {
    id: string
    name: string
    agency: string
  }
  member: {
    id: string
    name: string
  }
  recognizePerformance: number
  performance: number
  products: string[]
  paymentMethod: string
  paymentNumber: string
  note: string
}

const TableWrapper = styled.div`
  overflow-x: auto;
  th,
  td {
    white-space: nowrap;
  }
`

const SalesPerformancePage: React.VFC = () => {
  const [month, setMonth] = useState(moment().startOf('month'))
  const [activeManagerId, setActiveManagerId] = useState<string>()
  const { formatMessage } = useIntl()
  const { memberContracts, managers, loading } = useMemberContract(month, month.clone().endOf('month'))
  const { currentMemberId, permissions } = useAuth()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)

  useEffect(() => {
    currentMemberId && setActiveManagerId(currentMemberId)
  }, [currentMemberId])

  if (!permissions.SALES_PERFORMANCE_ADMIN && !permissions.SALES_CALL_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon className="mr-3" component={() => <DollarOutlined />} />
        <span className="mr-3">{formatMessage(salesMessages.salesPerformance)}</span>
        <div className="d-flex flex-row-reverse">
          <DatePicker
            className="mr-2 mb-10"
            picker="month"
            onChange={date => date && setMonth(date.startOf('month'))}
          />
          {currentMemberId && (
            <Select
              className="mr-3"
              style={{ width: 200 }}
              showSearch
              allowClear
              placeholder="業務顧問"
              value={activeManagerId}
              optionFilterProp="children"
              onChange={setActiveManagerId}
            >
              {managers?.map(manager => (
                <Select.Option key={manager?.id} value={manager?.id}>
                  {manager?.name}
                </Select.Option>
              ))}
            </Select>
          )}
        </div>
      </AdminPageTitle>
      {currentMemberId ? (
        <SalesPerformanceTable
          loading={loading}
          memberContracts={
            activeManagerId
              ? memberContracts.filter(memberContract => memberContract.executor.id === activeManagerId)
              : memberContracts
          }
        />
      ) : (
        <Skeleton active />
      )}
    </AdminLayout>
  )
}

const SalesPerformanceTable: React.VFC<{
  loading: boolean
  activeManagerId?: string
  memberContracts: MemberContract[]
}> = ({ loading, activeManagerId, memberContracts }) => {
  const columns: ColumnsType<MemberContract> = [
    {
      title: '簽署日',
      dataIndex: 'agreedAt',
      key: 'agreedAt',
      render: v => v && moment(v).format('MM/DD'),
    },
    {
      title: '通過日',
      dataIndex: 'approvedAt',
      key: 'approvedAt',
      render: v => v && moment(v).format('MM/DD'),
    },
    {
      title: '取消日',
      dataIndex: 'canceledAt',
      key: 'canceledAt',
      render: v => v && moment(v).format('MM/DD'),
    },
    {
      title: '解約日',
      dataIndex: 'revokedAt',
      key: 'revokedAt',
      render: v => v && moment(v).format('MM/DD'),
    },
    {
      title: '顧問',
      dataIndex: 'executor',
      key: 'executor',
      render: v => v.name,
    },
    {
      title: '學員',
      dataIndex: 'member',
      key: 'member',
      render: v => (
        <Link to={`/members/${v.id}`} target="blank">
          {v.name}
        </Link>
      ),
    },
    {
      title: '訂單金額',
      dataIndex: 'performance',
      key: 'performance',
      render: v => v.toFixed(0),
    },
    {
      title: '績效金額',
      dataIndex: 'recognizePerformance',
      key: 'recognizePerformance',
      render: v => v.toFixed(0),
    },
    {
      title: '產品',
      dataIndex: 'products',
      key: 'products',
      render: v => v?.join('、'),
    },
    {
      title: '付款方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: '金流編號',
      dataIndex: 'paymentNumber',
      key: 'paymentNumber',
    },
    {
      title: '備註',
      dataIndex: 'note',
      key: 'note',
    },
  ]

  const managerMemberContracts = activeManagerId
    ? memberContracts.filter(memberContract => memberContract.executor.id === activeManagerId)
    : memberContracts

  const isCanceled = (mc: MemberContract) => !!mc.canceledAt && !!mc.agreedAt && !mc.approvedAt
  const isRevoked = (mc: MemberContract) => !!mc.revokedAt && !!mc.agreedAt && !mc.canceledAt
  const isRefundApplied = (mc: MemberContract) =>
    !!mc.refundAppliedAt && !!mc.agreedAt && !!mc.approvedAt && !mc.revokedAt
  const isApproved = (mc: MemberContract) => !!mc.approvedAt && !!mc.agreedAt && !mc.refundAppliedAt && !mc.revokedAt
  const isAgreed = (mc: MemberContract) =>
    !!mc.agreedAt && !mc.approvedAt && !mc.refundAppliedAt && !mc.revokedAt && !mc.canceledAt

  const calculatePerformance = (condition: (mc: MemberContract) => boolean) =>
    sum(managerMemberContracts.filter(condition).map(mc => mc.performance))
  const calculateRecognizePerformance = (condition: (mc: MemberContract) => boolean) =>
    sum(managerMemberContracts.filter(condition).map(mc => mc.recognizePerformance))

  const performance = {
    currentPerformance: calculateRecognizePerformance(isApproved),
    agreed: calculatePerformance(isAgreed),
    approved: calculatePerformance(isApproved),
    refundApplied: calculatePerformance(isRefundApplied),
    revoked: calculatePerformance(isRevoked),
    canceled: calculatePerformance(isCanceled),
  }

  return (
    <TableWrapper>
      <Table
        title={() => (
          <div className="d-flex">
            <span className="mr-3">目前績效：{new Intl.NumberFormat('zh').format(performance.currentPerformance)}</span>
            <span className="mr-3">審核中：{new Intl.NumberFormat('zh').format(performance.agreed)}</span>
            <span className="mr-3">審核通過：{new Intl.NumberFormat('zh').format(performance.approved)}</span>
            <span className="mr-3">提出退費：{new Intl.NumberFormat('zh').format(performance.refundApplied)}</span>
            <span className="mr-3">解約：{new Intl.NumberFormat('zh').format(performance.revoked)}</span>
            <span className="mr-3">取消：{new Intl.NumberFormat('zh').format(performance.canceled)}</span>
          </div>
        )}
        loading={loading}
        pagination={false}
        dataSource={memberContracts}
        columns={columns}
      />
    </TableWrapper>
  )
}

const useMemberContract = (startedAt: moment.Moment, endedAt: moment.Moment) => {
  const { id: appId } = useApp()
  const { data, loading } = useQuery<hasura.GET_MEMBER_CONTRACT_LIST, hasura.GET_MEMBER_CONTRACT_LISTVariables>(
    gql`
      query GET_MEMBER_CONTRACT_LIST($startedAt: timestamptz!, $endedAt: timestamptz!) {
        order_executor(distinct_on: member_id) {
          member {
            id
            name
            email
            app_id
          }
        }
        member_contract(
          where: {
            _or: [
              { agreed_at: { _gte: $startedAt, _lte: $endedAt } }
              { agreed_at: { _is_null: true }, started_at: { _gte: $startedAt, _lte: $endedAt } }
            ]
          }
          order_by: { agreed_at: asc }
        ) {
          id
          agreed_at
          revoked_at
          member {
            id
            name
          }
          author {
            id
            name
          }
          options
          values
        }
      }
    `,
    {
      variables: {
        startedAt,
        endedAt,
      },
    },
  )
  const managers = useMemo(
    () =>
      data?.order_executor.filter(notEmpty).map(v => {
        return {
          id: v.member?.id || v4(),
          name: v.member?.name || 'unknown',
          email: v.member?.email || 'unknown',
          agency: v.member?.app_id || appId,
        }
      }) || [],
    [data?.order_executor],
  )
  const memberContracts: MemberContract[] = useMemo(
    () =>
      data?.member_contract
        .map(
          v =>
            v.values.orderExecutors?.map((orderExecutor: any) => {
              const executor = managers.find(v => v.id === orderExecutor.member_id)
              const isGuaranteed = v.options?.note?.includes('保買') || false
              const performance = orderExecutor.ratio * v.values.price
              const recognizePerformance = Math.round(
                orderExecutor.ratio * (v.values.orderOptions?.recognizePerformance || v.values.price),
              )
              return {
                id: v.id,
                author: {
                  id: v.author?.id,
                  name: v.author?.name,
                },
                executor: {
                  id: executor?.id,
                  name: executor?.name,
                  agency: executor?.agency,
                },
                member: {
                  id: v.member.id,
                  name: v.member.name,
                },
                agreedAt: v.agreed_at,
                revokedAt: v.revoked_at,
                approvedAt: v.options?.approvedAt,
                canceledAt: v.options?.loanCanceledAt,
                refundAppliedAt: v.options?.refundAppliedAt,
                performance: isGuaranteed ? performance * 0.7 : performance,
                recognizePerformance,
                products: v.values.orderProducts
                  ?.filter((op: any) => op.price >= 1500)
                  .map((op: any) => op.name + (op.options ? `(${op.options.quantity})` : '')),
                paymentMethod: `${v.values.paymentOptions.paymentMethod}/${v.values.paymentOptions.installmentPlan}`,
                paymentNumber: v.values.paymentOptions.paymentNumber,
                note: v.options?.note,
              }
            }) || [],
        )
        .flat() || [],
    [data?.member_contract],
  )

  return { loading, memberContracts, managers }
}

export default SalesPerformancePage
