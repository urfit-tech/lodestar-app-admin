import { BarChartOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Checkbox, DatePicker, Form, Skeleton, Table, Tabs } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment, { Moment } from 'moment'
import { countBy, eqProps, filter, flatten, map, pipe, split, trim, unionWith, uniq } from 'ramda'
import React, { useState } from 'react'
import { AdminPageTitle } from '../../components/admin'
import SalesMemberInput from '../../components/common/SalesMemberInput'
import AdminLayout from '../../components/layout/AdminLayout'
import hasura from '../../hasura'
import ForbiddenPage from '../ForbiddenPage'
import SalesMaterialsExportButton from './SalesMaterialsExportButton'

export type MaterialStatistics = {
  materialName: string
  called: number
  contacted: number
  demoInvited: number
  demonstrated: number
  dealt: number
  rejected: number
}

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
  const { id: appId } = useApp()
  const [range, setRange] = useState<[Moment, Moment]>([moment().startOf('month'), moment().endOf('month')])
  const [selectedSalesId, setSelectedSalesId] = useState('')
  const [isSelectedAllSales, setIsSelectedAllSales] = useState(false)
  const [selectedMaterialName, setSelectedMaterialName] = useState('廣告素材')
  const { permissions } = useAuth()

  const { loading, error, data } = useQuery<hasura.GET_SALES_MATERIALS, hasura.GET_SALES_MATERIALSVariables>(
    GET_SALES_MATERIALS,
    {
      variables: {
        appId,
        startedAt: range[0].toDate(),
        endedAt: range[1].toDate(),
        sales: isSelectedAllSales ? {} : { _eq: selectedSalesId },
        materialName: selectedMaterialName,
      },
    },
  )

  const salesMaterials = {
    calledMembersCount: count(data?.calledMembers.map(v => v.v) || []),
    contactedMembersCount: count(data?.contactedMembers.map(v => v.v) || []),
    demoInvitedMembersCount: count(
      unionWith(eqProps('m'), data?.demoInvitedMembers || [], data?.dealtMembers || []).map(v => v.v),
    ),
    demonstratedMembersCount: count(data?.demonstratedMembers.map(v => v.v) || []),
    dealtMembersCount: count(data?.dealtMembers.map(v => v.v) || []),
    rejectedMembersCount: count(data?.rejectedMembers.map(v => v.v) || []),
  }
  const allMaterialNames = pipe(
    map((v: { [index: string]: number }) => Object.keys(v)),
    flatten,
    uniq,
  )(Object.values(salesMaterials))

  const columns: ColumnProps<MaterialStatistics>[] = [
    {
      key: 'materialName',
      title: selectedMaterialName,
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
      dataIndex: 'demoInvited',
      title: '已邀約',
      sorter: (a, b) => a.demoInvited - b.demoInvited,
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
  if (!permissions.ANALYSIS_ADMIN) {
    return <ForbiddenPage />
  }

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
            onChange={value => value?.[0] && value[1] && setRange([value[0].startOf('day'), value[1].endOf('day')])}
          />
        </Form.Item>
        <Form.Item label="業務">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center" style={{ width: '400px' }}>
              <SalesMemberInput value={selectedSalesId} onChange={setSelectedSalesId} disabled={isSelectedAllSales} />
              <Checkbox
                checked={isSelectedAllSales}
                onChange={e => setIsSelectedAllSales(e.target.checked)}
                className="ml-3 flex-shrink-0"
              >
                全部業務
              </Checkbox>
            </div>
            <SalesMaterialsExportButton
              selectedMaterialName={selectedMaterialName}
              allMaterialNames={allMaterialNames}
              salesMaterials={salesMaterials}
            />
          </div>
        </Form.Item>
      </Form>

      <Tabs activeKey={selectedMaterialName} onChange={key => setSelectedMaterialName(key)}>
        <Tabs.TabPane key="廣告素材" tab="廣告素材"></Tabs.TabPane>
        <Tabs.TabPane key="廣告組合" tab="廣告組合"></Tabs.TabPane>
        <Tabs.TabPane key="行銷活動" tab="行銷活動"></Tabs.TabPane>
        <Tabs.TabPane key="名單分級" tab="名單分級"></Tabs.TabPane>
      </Tabs>

      {loading ? (
        <Skeleton active />
      ) : error || !data ? (
        <div>讀取錯誤</div>
      ) : selectedSalesId || isSelectedAllSales ? (
        <Table<MaterialStatistics>
          rowKey="id"
          columns={columns}
          dataSource={allMaterialNames.map(materialName => {
            const called = salesMaterials.calledMembersCount[materialName] || 0
            const contacted = salesMaterials.contactedMembersCount[materialName] || 0
            const demoInvited = salesMaterials.demoInvitedMembersCount[materialName] || 0
            const demonstrated = salesMaterials.demonstratedMembersCount[materialName] || 0
            const dealt = salesMaterials.dealtMembersCount[materialName] || 0
            const rejected = salesMaterials.rejectedMembersCount[materialName] || 0

            return {
              materialName,
              called: Math.max(called, contacted),
              contacted: Math.max(contacted, demoInvited),
              demoInvited: Math.max(demoInvited, demonstrated),
              demonstrated: Math.max(demonstrated, dealt),
              dealt,
              rejected,
            }
          })}
          pagination={false}
          className="mb-5"
        />
      ) : (
        <>請選擇業務</>
      )}
    </AdminLayout>
  )
}

const GET_SALES_MATERIALS = gql`
  query GET_SALES_MATERIALS(
    $appId: String!
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
          app_id: { _eq: $appId }
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
          app_id: { _eq: $appId }
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
    demoInvitedMembers: member_property(
      where: {
        property: { name: { _eq: $materialName } }
        value: { _neq: "" }
        member: {
          app_id: { _eq: $appId }
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
      m: member_id
    }
    demonstratedMembers: member_property(
      where: {
        property: { name: { _eq: $materialName } }
        value: { _neq: "" }
        member: {
          app_id: { _eq: $appId }
          manager_id: $sales
          member_notes: {
            author_id: $sales
            created_at: { _gt: $startedAt, _lt: $endedAt }
            type: { _eq: "demo" }
            status: { _eq: "answered" }
          }
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
          app_id: { _eq: $appId }
          manager_id: $sales
          member_notes: { author_id: $sales, created_at: { _gt: $startedAt, _lt: $endedAt }, type: { _eq: "outbound" } }
          member_contracts: { agreed_at: { _gt: $startedAt, _lt: $endedAt }, revoked_at: { _is_null: true } }
        }
      }
    ) {
      v: value
      m: member_id
    }
    rejectedMembers: member_property(
      where: {
        property: { name: { _eq: $materialName } }
        value: { _neq: "" }
        member: {
          app_id: { _eq: $appId }
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
