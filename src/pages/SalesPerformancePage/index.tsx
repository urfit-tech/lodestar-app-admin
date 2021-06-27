import Icon, { DollarOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { DatePicker, Select, Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import gql from 'graphql-tag'
import { AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import { useAuth } from 'lodestar-app-admin/src/contexts/AuthContext'
import { notEmpty } from 'lodestar-app-admin/src/helpers'
import moment from 'moment-timezone'
import { sum } from 'ramda'
import React, { useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import hasura from '../../hasura'
import { salesMessages } from '../../helpers/translation'

type MemberContract = {
  id: string
  agreedAt: Date
  approvedAt?: Date
  author: {
    id: string
    name: string
  }
  member: {
    id: string
    name: string
  }
  status: string
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
      title: '審核通過日',
      dataIndex: 'approvedAt',
      key: 'approvedAt',
      render: v => v && moment(v).format('MM/DD'),
    },
    {
      title: '顧問',
      dataIndex: 'author',
      key: 'author',
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
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '業績',
      dataIndex: 'performance',
      key: 'performance',
    },
    {
      title: '產品',
      dataIndex: 'products',
      key: 'products',
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
    ? memberContracts.filter(memberContract => memberContract.author.id === activeManagerId)
    : memberContracts
  const agreedPerformance = sum(filteredMemberContracts.filter(mc => mc.agreedAt).map(mc => mc.performance))
  const approvedPerformance = sum(filteredMemberContracts.filter(mc => mc.approvedAt).map(mc => mc.performance))

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon className="mr-3" component={() => <DollarOutlined />} />
        <span className="mr-3">{formatMessage(salesMessages.label.salesPerformance)}</span>
        <DatePicker className="mr-2" picker="month" onChange={date => date && setMonth(date.startOf('month'))} />
        {currentMemberId && (
          <Select
            className="mr-3"
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
        <span className="mr-3">進件：{new Intl.NumberFormat('zh').format(agreedPerformance)}</span>
        <span>完款：{new Intl.NumberFormat('zh').format(approvedPerformance)}</span>
      </AdminPageTitle>
      <TableWrapper>
        <Table loading={loading} pagination={false} dataSource={filteredMemberContracts} columns={columns} />
      </TableWrapper>
    </AdminLayout>
  )
}

const useMemberContract = (startedAt: moment.Moment, endedAt: moment.Moment) => {
  const { data, loading } = useQuery<hasura.GET_MEMBER_CONTRACT, hasura.GET_MEMBER_CONTRACTVariables>(
    gql`
      query GET_MEMBER_CONTRACT($startedAt: timestamptz!, $endedAt: timestamptz!) {
        xuemi_sales {
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
  const memberContracts: MemberContract[] = useMemo(
    () =>
      data?.member_contract
        .map(v =>
          v.values.orderExecutors.map((orderExecutor: any) => {
            return {
              id: v.id,
              author: {
                id: v.author?.id,
                name: v.author?.name,
              },
              member: {
                id: v.member.id,
                name: v.member.name,
              },
              agreedAt: v.agreed_at,
              approvedAt: v.options?.approvedAt,
              status: '',
              performance: orderExecutor.ratio * v.values.price,
              products: v.values.orderProducts?.filter((op: any) => op.price >= 10000).map((op: any) => op.name),
              paymentMethod: `${v.values.paymentOptions.paymentMethod}/${v.values.paymentOptions.installmentPlan}`,
              paymentNumber: v.values.paymentOptions.paymentNumber,
              note: v.options?.note,
            }
          }),
        )
        .flat() || [],
    [data?.member_contract],
  )
  const managers = useMemo(() => data?.xuemi_sales.map(v => v.member).filter(notEmpty) || [], [data?.xuemi_sales])
  return { loading, memberContracts, managers }
}
export default SalesPerformancePage
