import { BarChartOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { DatePicker, Form, Skeleton, Table, Tabs } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import { AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import moment, { Moment } from 'moment'
import { countBy, filter, flatten, map, pipe, split, trim, uniq } from 'ramda'
import React, { useState } from 'react'
import SalesMemberInput from '../components/common/SalesMemberInput'
import types from '../types'

const count = pipe(
  map(
    pipe(
      split(','),
      map(trim),
      filter(v => !!v),
      uniq,
    ),
  ),
  flatten,
  countBy(v => v),
)

const SalesMaterialsPage: React.FC = () => {
  const [range, setRange] = useState<[Moment, Moment]>([moment().startOf('month'), moment().endOf('month')])
  const [selectedSalesId, setSelectedSalesId] = useState<string>('')
  const [selectedMaterialName, setSelectedMaterialName] = useState('廣告素材')

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <BarChartOutlined className="mr-3" />
        <span>素材表現</span>
      </AdminPageTitle>

      <Form colon={false} labelAlign="left">
        <Form.Item label="時間">
          <DatePicker.RangePicker
            value={range}
            onChange={value => value?.[0] && value[1] && setRange([value[0], value[1]])}
          />
        </Form.Item>
        <Form.Item label="業務">
          <SalesMemberInput value={selectedSalesId} onChange={setSelectedSalesId} />
        </Form.Item>
      </Form>

      <Tabs activeKey={selectedMaterialName} onChange={key => setSelectedMaterialName(key)}>
        <Tabs.TabPane key="廣告素材" tab="廣告素材"></Tabs.TabPane>
        <Tabs.TabPane key="廣告組合" tab="廣告組合"></Tabs.TabPane>
        <Tabs.TabPane key="行銷活動" tab="行銷活動"></Tabs.TabPane>
      </Tabs>

      {selectedSalesId && (
        <MaterialStatisticsTable
          startedAt={range[0].toDate()}
          endedAt={range[1].toDate()}
          salesId={selectedSalesId}
          materialName={selectedMaterialName}
        />
      )}
    </AdminLayout>
  )
}

type MaterialStatisticsProps = {
  materialName: string
  all: number
  assigned: number
  called: number
  answered: number
  demonstrated: number
  dealt: number
}

const MaterialStatisticsTable: React.FC<{
  startedAt: Date
  endedAt: Date
  salesId: string
  materialName: string
}> = ({ startedAt, endedAt, salesId, materialName }) => {
  const { loading, error, data } = useQuery<types.GET_SALES_MATERIALS, types.GET_SALES_MATERIALSVariables>(
    GET_SALES_MATERIALS,
    {
      variables: {
        startedAt,
        endedAt,
        salesId,
        materialName,
      },
    },
  )

  if (loading) {
    return <Skeleton active />
  }

  if (error || !data) {
    return <div>讀取錯誤</div>
  }

  const allMembersCount = count(data.allMembers.map(v => v.v))
  const assignedMembersCount = count(data.assignedMembers.map(v => v.v))
  const calledMembersCount = count(data.calledMembers.map(v => v.v))
  const answeredMembersCount = count(data.answeredMembers.map(v => v.v))
  const demonstratedMembersCount = count(data.demonstratedMembers.map(v => v.v))
  const dealtMembersCount = count(data.dealtMembers.map(v => v.v))

  const allMaterialNames = pipe(
    map((v: { [index: string]: number }) => Object.keys(v)),
    flatten,
    uniq,
  )([
    allMembersCount,
    assignedMembersCount,
    calledMembersCount,
    answeredMembersCount,
    demonstratedMembersCount,
    dealtMembersCount,
  ])

  const columns: ColumnProps<MaterialStatisticsProps>[] = [
    {
      key: 'materialName',
      title: materialName,
      render: (_, record, i) => record.materialName,
      filters: allMaterialNames.map(materialName => ({
        text: materialName,
        value: materialName,
      })),
      onFilter: (value, record) => record.materialName.includes(`${value}`),
    },
    {
      dataIndex: 'all',
      title: '總數',
      sorter: (a, b) => a.all - b.all,
    },
    {
      dataIndex: 'assigned',
      title: '已分配',
      sorter: (a, b) => a.assigned - b.assigned,
    },
    {
      dataIndex: 'called',
      title: '已撥打',
      sorter: (a, b) => a.called - b.called,
    },
    {
      dataIndex: 'answered',
      title: '已通話',
      sorter: (a, b) => a.answered - b.answered,
    },
    {
      dataIndex: 'demonstrated',
      title: '已示範',
      sorter: (a, b) => a.demonstrated - b.demonstrated,
    },
    {
      dataIndex: 'dealt',
      title: '已成交',
      sorter: (a, b) => a.dealt - b.dealt,
    },
  ]

  return (
    <Table<MaterialStatisticsProps>
      columns={columns}
      dataSource={allMaterialNames.map(materialName => {
        const dealt = dealtMembersCount[materialName] || 0
        const demonstrated = Math.max(demonstratedMembersCount[materialName] || 0, dealt)
        const answered = Math.max(answeredMembersCount[materialName] || 0, demonstrated)
        const called = Math.max(calledMembersCount[materialName] || 0, answered)
        const assigned = Math.max(assignedMembersCount[materialName] || 0, called)
        const all = Math.max(allMembersCount[materialName] || 0, assigned)

        return {
          materialName,
          all,
          assigned,
          called,
          answered,
          demonstrated,
          dealt,
        }
      })}
      pagination={false}
      className="mb-5"
    />
  )
}

const GET_SALES_MATERIALS = gql`
  query GET_SALES_MATERIALS(
    $startedAt: timestamptz!
    $endedAt: timestamptz!
    $salesId: String!
    $materialName: String!
  ) {
    allMembers: member_property(
      where: {
        property: { name: { _eq: $materialName } }
        value: { _neq: "" }
        member: { manager_id: { _eq: $salesId } }
        updated_at: { _gt: $startedAt, _lt: $endedAt }
      }
    ) {
      v: value
    }
    assignedMembers: member_property(
      where: {
        property: { name: { _eq: $materialName } }
        value: { _neq: "" }
        member: { manager_id: { _eq: $salesId }, assigned_at: { _gt: $startedAt, _lt: $endedAt } }
      }
    ) {
      v: value
    }
    calledMembers: member_property(
      where: {
        property: { name: { _eq: $materialName } }
        value: { _neq: "" }
        member: {
          manager_id: { _eq: $salesId }
          member_notes: {
            author_id: { _eq: $salesId }
            created_at: { _gt: $startedAt, _lt: $endedAt }
            type: { _eq: "outbound" }
          }
        }
      }
    ) {
      v: value
    }
    answeredMembers: member_property(
      where: {
        property: { name: { _eq: $materialName } }
        value: { _neq: "" }
        member: {
          manager_id: { _eq: $salesId }
          member_notes: {
            author_id: { _eq: $salesId }
            created_at: { _gt: $startedAt, _lt: $endedAt }
            type: { _eq: "outbound" }
            status: { _eq: "answered" }
            duration: { _gt: 90 }
          }
        }
      }
    ) {
      v: value
    }
    demonstratedMembers: member_property(
      where: {
        property: { name: { _eq: $materialName } }
        value: { _neq: "" }
        member: {
          manager_id: { _eq: $salesId }
          member_tags: { tag_name: { _eq: "已示範" }, created_at: { _gt: $startedAt, _lt: $endedAt } }
        }
      }
    ) {
      v: value
    }
    dealtMembers: member_property(
      where: {
        property: { name: { _eq: $materialName } }
        value: { _neq: "" }
        member: {
          manager_id: { _eq: $salesId }
          member_contracts: { agreed_at: { _gt: $startedAt, _lt: $endedAt }, revoked_at: { _is_null: true } }
        }
      }
    ) {
      v: value
    }
  }
`

export default SalesMaterialsPage
