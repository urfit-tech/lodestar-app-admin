import Icon, { DollarOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { DatePicker, Select, Table } from 'antd'
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
import { AdminPageTitle } from '../components/admin'
import AdminLayout from '../components/layout/AdminLayout'
import hasura from '../hasura'
import { notEmpty } from '../helpers'
import { salesMessages } from '../helpers/translation'
import ForbiddenPage from './ForbiddenPage'

type MemberContract = {
  id: string
  agreedAt: Date
  approvedAt?: Date
  canceledAt?: Date
  author: {
    id: string
    name: string
  }
  executor: {
    id: string
    name: string
  }
  member: {
    id: string
    name: string
  }
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
  const { currentMemberId } = useAuth()
  const { enabledModules } = useApp()

  useEffect(() => {
    currentMemberId && setActiveManagerId(currentMemberId)
  }, [currentMemberId])

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
        <Link to={`/admin/members/${v.id}`} target="blank">
          {v.name}
        </Link>
      ),
    },
    {
      title: '業績',
      dataIndex: 'performance',
      key: 'performance',
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

  const filteredMemberContracts = activeManagerId
    ? memberContracts.filter(memberContract => memberContract.executor.id === activeManagerId)
    : memberContracts
  const agreedPerformance = sum(filteredMemberContracts.filter(mc => mc.agreedAt).map(mc => mc.performance))
  const approvedPerformance = sum(filteredMemberContracts.filter(mc => mc.approvedAt).map(mc => mc.performance))
  const canceledPerformance = sum(filteredMemberContracts.filter(mc => mc.canceledAt).map(mc => mc.performance))

  if (!enabledModules.sales) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon className="mr-3" component={() => <DollarOutlined />} />
        <span className="mr-3">{formatMessage(salesMessages.salesPerformance)}</span>
        <DatePicker className="mr-2" picker="month" onChange={date => date && setMonth(date.startOf('month'))} />
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
      </AdminPageTitle>

      <TableWrapper>
        <Table
          title={() => (
            <div className="d-flex">
              <span className="mr-3">
                總共：{new Intl.NumberFormat('zh').format(approvedPerformance - canceledPerformance)}
              </span>
              <span className="mr-3">進件：{new Intl.NumberFormat('zh').format(agreedPerformance)}</span>
              <span className="mr-3">過件：{new Intl.NumberFormat('zh').format(approvedPerformance)}</span>
              <span className="mr-3">
                退件：{new Intl.NumberFormat('zh').format(canceledPerformance)} (
                {approvedPerformance ? ((canceledPerformance / approvedPerformance) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          )}
          loading={loading}
          pagination={false}
          dataSource={filteredMemberContracts}
          columns={columns}
        />
      </TableWrapper>
    </AdminLayout>
  )
}

const useMemberContract = (startedAt: moment.Moment, endedAt: moment.Moment) => {
  const { id: appId } = useApp()
  const { data, loading } = useQuery<hasura.GET_MEMBER_CONTRACT_SALES, hasura.GET_MEMBER_CONTRACT_SALESVariables>(
    gql`
      query GET_MEMBER_CONTRACT_SALES($appId: String!, $startedAt: timestamptz!, $endedAt: timestamptz!) {
        order_executor(where: { member: { app_id: { _eq: $appId } } }, distinct_on: member_id) {
          member {
            id
            name
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
        appId,
        startedAt,
        endedAt,
      },
    },
  )
  const managers = useMemo(() => data?.order_executor.map(v => v.member).filter(notEmpty) || [], [data?.order_executor])
  const memberContracts: MemberContract[] = useMemo(
    () =>
      data?.member_contract
        .map(
          v =>
            v.values.orderExecutors?.map((orderExecutor: any) => {
              const executor = managers.find(v => v.id === orderExecutor.member_id)
              const isGuaranteed = v.options?.note?.includes('保買') || false
              const performance = orderExecutor.ratio * v.values.price
              return {
                id: v.id,
                author: {
                  id: v.author?.id,
                  name: v.author?.name,
                },
                executor: {
                  id: executor?.id,
                  name: executor?.name,
                },
                member: {
                  id: v.member.id,
                  name: v.member.name,
                },
                agreedAt: v.agreed_at,
                revokedAt: v.revoked_at,
                approvedAt: v.options?.approvedAt,
                canceledAt: v.options?.loanCanceledAt || v.options?.refundAppliedAt,
                performance: isGuaranteed ? performance * 0.7 : performance,
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
