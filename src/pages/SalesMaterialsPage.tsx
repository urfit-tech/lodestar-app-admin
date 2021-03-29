import { BarChartOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Checkbox, DatePicker, Form, Skeleton, Table, Tabs } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import { AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import moment, { Moment } from 'moment'
import { countBy, eqProps, filter, flatten, map, pipe, split, trim, unionWith, uniq } from 'ramda'
import React, { useState } from 'react'
import styled from 'styled-components'
import SalesMemberInput from '../components/common/SalesMemberInput'
import hasura from '../hasura'

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

const StyledWrapper = styled.div`
  width: 400px;
`

const SalesMaterialsPage: React.FC = () => {
  const [range, setRange] = useState<[Moment, Moment]>([moment().startOf('month'), moment().endOf('month')])
  const [selectedSalesId, setSelectedSalesId] = useState('')
  const [isSelectedAllSales, setIsSelectedAllSales] = useState(false)
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
          <StyledWrapper className="d-flex align-items-center">
            <SalesMemberInput value={selectedSalesId} onChange={setSelectedSalesId} disabled={isSelectedAllSales} />
            <Checkbox
              checked={isSelectedAllSales}
              onChange={e => setIsSelectedAllSales(e.target.checked)}
              className="ml-3 flex-shrink-0"
            >
              全部業務
            </Checkbox>
          </StyledWrapper>
        </Form.Item>
      </Form>

      <Tabs activeKey={selectedMaterialName} onChange={key => setSelectedMaterialName(key)}>
        <Tabs.TabPane key="廣告素材" tab="廣告素材"></Tabs.TabPane>
        <Tabs.TabPane key="廣告組合" tab="廣告組合"></Tabs.TabPane>
        <Tabs.TabPane key="行銷活動" tab="行銷活動"></Tabs.TabPane>
      </Tabs>

      {(selectedSalesId || isSelectedAllSales) && (
        <MaterialStatisticsTable
          startedAt={range[0].toDate()}
          endedAt={range[1].toDate()}
          salesId={isSelectedAllSales ? null : selectedSalesId}
          materialName={selectedMaterialName}
        />
      )}
    </AdminLayout>
  )
}

type MaterialStatisticsProps = {
  materialName: string
  called: number
  contacted: number
  demonstrated: number
  dealt: number
  rejected: number
}

const MaterialStatisticsTable: React.FC<{
  startedAt: Date
  endedAt: Date
  salesId: string | null
  materialName: string
}> = ({ startedAt, endedAt, salesId, materialName }) => {
  const { loading, error, data } = useQuery<hasura.GET_SALES_MATERIALS, hasura.GET_SALES_MATERIALSVariables>(
    GET_SALES_MATERIALS,
    {
      variables: {
        startedAt,
        endedAt,
        sales: salesId ? { _eq: salesId } : {},
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

  const salesMaterials = {
    calledMembersCount: count(data.calledMembers.map(v => v.v)),
    contactedMembersCount: count(data.contactedMembers.map(v => v.v)),
    demonstratedMembersCount: count(
      unionWith(eqProps('memberId'), data.demonstratedMembers, data.dealtMembers).map(v => v.v),
    ),
    dealtMembersCount: count(data.dealtMembers.map(v => v.v)),
    rejectedMembersCount: count(data.rejectedMembers.map(v => v.v)),
  }

  const allMaterialNames = pipe(
    map((v: { [index: string]: number }) => Object.keys(v)),
    flatten,
    uniq,
  )(Object.values(salesMaterials))

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
      dataIndex: 'called',
      title: '已撥打',
      sorter: (a, b) => a.called - b.called,
    },
    {
      dataIndex: 'contacted',
      title: '已開發',
      sorter: (a, b) => a.contacted - b.contacted,
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
    {
      dataIndex: 'rejected',
      title: '已拒絕',
      sorter: (a, b) => a.rejected - b.rejected,
    },
  ]

  return (
    <Table<MaterialStatisticsProps>
      columns={columns}
      dataSource={allMaterialNames.map(materialName => {
        const called = salesMaterials.calledMembersCount[materialName] || 0
        const contacted = salesMaterials.contactedMembersCount[materialName] || 0
        const demonstrated = salesMaterials.demonstratedMembersCount[materialName] || 0
        const dealt = salesMaterials.dealtMembersCount[materialName] || 0
        const rejected = salesMaterials.rejectedMembersCount[materialName] || 0

        return {
          materialName,
          called: Math.max(called, contacted),
          contacted: Math.max(contacted, demonstrated),
          demonstrated: Math.max(demonstrated, dealt),
          dealt,
          rejected,
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
    $sales: String_comparison_exp!
    $materialName: String!
  ) {
    calledMembers: member_property(
      where: {
        property: { name: { _eq: $materialName } }
        value: { _neq: "" }
        member: {
          manager_id: $sales
          member_notes: { author_id: $sales, created_at: { _gt: $startedAt, _lt: $endedAt }, type: { _eq: "outbound" } }
        }
      }
    ) {
      v: value
    }
    contactedMembers: member_property(
      where: {
        property: { name: { _eq: $materialName } }
        value: { _neq: "" }
        member: {
          manager_id: $sales
          member_notes: {
            author_id: $sales
            created_at: { _gt: $startedAt, _lt: $endedAt }
            type: { _eq: "outbound" }
            duration: { _gt: 90 }
          }
          _not: { member_notes: { rejected_at: { _is_null: false } } }
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
          manager_id: $sales
          member_notes: {
            author_id: $sales
            created_at: { _gt: $startedAt, _lt: $endedAt }
            type: { _eq: "outbound" }
            duration: { _gt: 90 }
          }
          member_tasks: { category: { name: { _eq: "預約DEMO" } } }
        }
      }
    ) {
      v: value
      memberId: member_id
    }
    dealtMembers: member_property(
      where: {
        property: { name: { _eq: $materialName } }
        value: { _neq: "" }
        member: {
          manager_id: $sales
          member_notes: {
            author_id: $sales
            created_at: { _gt: $startedAt, _lt: $endedAt }
            type: { _eq: "outbound" }
            duration: { _gt: 90 }
          }
          member_contracts: { agreed_at: { _gt: $startedAt, _lt: $endedAt }, revoked_at: { _is_null: true } }
        }
      }
    ) {
      v: value
      memberId: member_id
    }
    rejectedMembers: member_property(
      where: {
        property: { name: { _eq: $materialName } }
        value: { _neq: "" }
        member: {
          manager_id: $sales
          member_notes: {
            author_id: $sales
            created_at: { _gt: $startedAt, _lt: $endedAt }
            type: { _eq: "outbound" }
            rejected_at: { _is_null: false }
          }
        }
      }
    ) {
      v: value
    }
  }
`

export default SalesMaterialsPage
