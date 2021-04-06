import { BarChartOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { DatePicker, Form, Table } from 'antd'
import gql from 'graphql-tag'
import { AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import AdminCard from 'lodestar-app-admin/src/components/admin/AdminCard'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import { useAuth } from 'lodestar-app-admin/src/contexts/AuthContext'
import moment, { Moment } from 'moment'
import { groupBy, map, mapObjIndexed, split, sum, toPairs } from 'ramda'
import React, { useState } from 'react'
import hasura from '../hasura'

type LogsProps = {
  id: string | null
  salesId: string | null
  startedAt?: Date
  endedAt?: Date
  duration?: number
  price?: number
}

const SalesActivenessPage: React.FC = () => {
  const [range, setRange] = useState<[Moment, Moment]>([moment().startOf('month'), moment().endOf('month')])
  const { isAuthenticated } = useAuth()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <BarChartOutlined className="mr-3" />
        <span>活動量</span>
      </AdminPageTitle>
      <Form colon={false}>
        <Form.Item label="時間">
          <DatePicker.RangePicker
            value={range}
            onChange={value => value?.[0] && value[1] && setRange([value[0].startOf('hour'), value[1].endOf('hour')])}
            format="YYYY-MM-DD HH:mm:ss"
            showTime={{
              format: 'YYYY-MM-DD HH',
            }}
          />
        </Form.Item>
      </Form>
      {isAuthenticated && <SalesActivenessTable startedAt={range[0].toDate()} endedAt={range[1].toDate()} />}
    </AdminLayout>
  )
}

const SalesActivenessTable: React.FC<{
  startedAt: Date
  endedAt: Date
}> = ({ startedAt, endedAt }) => {
  const { loading, error, data, salesMapping } = useSalesLogsCollection({
    startedAt,
    endedAt,
  })

  if (error) return <div>讀取錯誤</div>

  const firsthand = mapObjIndexed(
    obj => obj.length,
    groupBy<LogsProps>(({ salesId }) => `${salesId}_firsthand`)(data.firsthandLogs),
  )
  const secondhand = mapObjIndexed(
    obj => obj.length,
    groupBy<LogsProps>(({ salesId }) => `${salesId}_secondhand`)(data.secondhandLogs),
  )
  const attend = mapObjIndexed(
    obj => sum(obj.map(v => (v.endedAt && v.startedAt && v.endedAt.getTime() - v.startedAt.getTime()) || 0)),
    groupBy<LogsProps>(({ salesId }) => `${salesId}_attend`)(data.attendLogs),
  )
  const validSpeaking = mapObjIndexed(
    obj => sum(obj.map(v => v.duration || 0)),
    groupBy<LogsProps>(({ salesId }) => `${salesId}_validSpeaking`)(data.validSpeakingLogs),
  )
  const dial = mapObjIndexed(obj => obj.length, groupBy<LogsProps>(({ salesId }) => `${salesId}_dial`)(data.dialLogs))
  const validGetThrough = mapObjIndexed(
    obj => obj.length,
    groupBy<LogsProps>(({ salesId }) => `${salesId}_validGetThrough`)(data.validGetThroughLogs),
  )
  const invalidNumber = mapObjIndexed(
    obj => obj.length,
    groupBy<LogsProps>(({ salesId }) => `${salesId}_invalidNumber`)(data.invalidNumberLogs),
  )
  const rejected = mapObjIndexed(
    obj => obj.length,
    groupBy<LogsProps>(({ salesId }) => `${salesId}_rejected`)(data.rejectedLogs),
  )
  const keepInTouch = mapObjIndexed(
    obj => obj.length,
    groupBy<LogsProps>(({ salesId }) => `${salesId}_keepInTouch`)(data.keepInTouchLogs),
  )
  const reserveDemo = mapObjIndexed(
    obj => obj.length,
    groupBy<LogsProps>(({ salesId }) => `${salesId}_reserveDemo`)(data.reserveDemoLogs),
  )
  const deal = mapObjIndexed(
    obj => obj.length,
    groupBy<LogsProps>(({ salesId }) => `${salesId}_deal`)(data.performanceLogs),
  )
  const performance = mapObjIndexed(
    obj => sum(obj.map(v => v.price || 0)),
    groupBy<LogsProps>(({ salesId }) => `${salesId}_performance`)(data.performanceLogs),
  )
  const revoked = mapObjIndexed(
    obj => sum(obj.map(v => v.price || 0)),
    groupBy<LogsProps>(({ salesId }) => `${salesId}_revoked`)(data.revokedLogs),
  )

  const salesCollection = Object.assign(
    firsthand,
    secondhand,
    attend,
    validSpeaking,
    dial,
    validGetThrough,
    invalidNumber,
    rejected,
    keepInTouch,
    reserveDemo,
    deal,
    performance,
    revoked,
  )

  const dataSource = Object.values(
    map(([sale, value]) => {
      const [salesId, field] = split('_')(sale)
      return {
        salesId,
        [field]: value,
      }
    }, toPairs(salesCollection)).reduce<{
      [x: string]: {
        salesId: string
        salesName: string
        firsthand: number
        secondhand: number
        totalAssignments: number
        attend: number
        validSpeaking: number
        dial: number
        validGetThrough: number
        invalidNumber: number
        rejected: number
        keepInTouch: number
        reserveDemo: number
        deal: number
        performance: number
        revoked: number
      }
    }>((r, value) => {
      const salesId = value.salesId
      r[salesId] = Object.assign({}, r[salesId], value)
      return r
    }, {}),
  )

  type RecordType = typeof dataSource[number]

  const columnSorter = (prev: { [key: string]: number }, next: { [key: string]: number }, keyName: string) => {
    if (prev && prev[keyName] && next && next[keyName]) {
      return prev[keyName] - next[keyName]
    } else if (prev && prev[keyName] && !next[keyName]) {
      return 1
    } else if (next && next[keyName] && !prev[keyName]) {
      return -1
    }
    return 0
  }

  return (
    <AdminCard>
      <Table<RecordType>
        loading={loading}
        dataSource={dataSource}
        rowKey="salesId"
        scroll={{ x: 1000, y: 400 }}
        bordered
        pagination={false}
      >
        <Table.Column<RecordType>
          key="salesName"
          title="業務名稱"
          dataIndex="salesName"
          width="8rem"
          fixed="left"
          render={(_, record) => salesMapping[record.salesId] || ''}
        />
        <Table.ColumnGroup title="指派名單數">
          <Table.Column<Pick<RecordType, 'firsthand'>>
            key="firsthand"
            dataIndex="firsthand"
            title="一手"
            render={v => v || 0}
            sorter={(a, b) => columnSorter(a, b, 'firsthand')}
            width="6rem"
          />

          <Table.Column<Pick<RecordType, 'secondhand'>>
            key="secondhand"
            title="二手"
            dataIndex="secondhand"
            render={v => v || 0}
            sorter={(a, b) => columnSorter(a, b, 'secondhand')}
            width="6rem"
          />
          <Table.Column<RecordType>
            key="totalAssignments"
            title="總數"
            dataIndex="totalAssignments"
            render={(_, record) => record.firsthand + record.secondhand || 0}
            sorter={(a, b) => a.firsthand + a.secondhand - (b.firsthand + b.secondhand)}
            width="6rem"
          />
        </Table.ColumnGroup>
        <Table.Column<Pick<RecordType, 'attend'>>
          key="attend"
          title="在線時間(分)"
          dataIndex="attend"
          render={v => Math.ceil(v / 60000) || 0}
          sorter={(a, b) => columnSorter(a, b, 'attend')}
          width="9rem"
        />
        <Table.Column<Pick<RecordType, 'validSpeaking'>>
          key="validSpeaking"
          title="通話時間(分)"
          dataIndex="validSpeaking"
          render={v => Math.ceil(v / 60000) || 0}
          sorter={(a, b) => columnSorter(a, b, 'validSpeaking')}
          width="9rem"
        />
        <Table.Column<Pick<RecordType, 'dial'>>
          key="dial"
          title="撥打次數"
          dataIndex="dial"
          render={v => v || 0}
          sorter={(a, b) => columnSorter(a, b, 'dial')}
          width="7.5rem"
        />
        <Table.Column<Pick<RecordType, 'validGetThrough'>>
          key="validGetThrough"
          title="接通次數"
          dataIndex="validGetThrough"
          render={v => v || 0}
          sorter={(a, b) => columnSorter(a, b, 'validGetThrough')}
          width="7.5rem"
        />
        <Table.Column<Pick<RecordType, 'invalidNumber'>>
          key="invalidNumber"
          title="空號數"
          dataIndex="invalidNumber"
          render={v => v || 0}
          sorter={(a, b) => columnSorter(a, b, 'invalidNumber')}
          width="7rem"
        />
        <Table.Column<Pick<RecordType, 'rejected'>>
          key="rejected"
          title="拒絕數"
          dataIndex="rejected"
          render={v => v || 0}
          sorter={(a, b) => columnSorter(a, b, 'rejected')}
          width="7rem"
        />
        <Table.Column<Pick<RecordType, 'keepInTouch'>>
          key="keepInTouch"
          title="開發中"
          dataIndex="keepInTouch"
          render={v => v || 0}
          sorter={(a, b) => columnSorter(a, b, 'keepInTouch')}
          width="7rem"
        />
        <Table.Column<Pick<RecordType, 'reserveDemo'>>
          key="reserveDemo"
          title="預約示範次數"
          dataIndex="reserveDemo"
          render={v => v || 0}
          sorter={(a, b) => columnSorter(a, b, 'reserveDemo')}
          width="9.5rem"
        />
        <Table.Column<Pick<RecordType, 'deal'>>
          key="deal"
          title="成交數"
          dataIndex="deal"
          render={v => v || 0}
          sorter={(a, b) => columnSorter(a, b, 'deal')}
          width="7rem"
        />
        <Table.Column<Pick<RecordType, 'performance'>>
          key="performance"
          title="業績量"
          dataIndex="performance"
          render={v => v || 0}
          sorter={(a, b) => columnSorter(a, b, 'performance')}
          width="7rem"
        />
        <Table.Column<Pick<RecordType, 'revoked'>>
          key="revoked"
          title="解約金額"
          dataIndex="revoked"
          render={v => v || 0}
          sorter={(a, b) => columnSorter(a, b, 'revoked')}
          width="8rem"
        />
      </Table>
    </AdminCard>
  )
}

const useSalesLogsCollection = (filter: { startedAt: Date; endedAt: Date }) => {
  const { loading, error, data } = useQuery<hasura.GET_SALES_ACTIVE_LOG, hasura.GET_SALES_ACTIVE_LOGVariables>(
    gql`
      query GET_SALES_ACTIVE_LOG($startedAt: timestamptz!, $endedAt: timestamptz!) {
        sales_active_log(distinct_on: sales_id) {
          id
          sales {
            id
            name
          }
        }
        firsthand: sales_active_log(
          where: { event: { _eq: "note" }, created_at: { _gt: $startedAt, _lte: $endedAt }, past_count: { _eq: 0 } }
        ) {
          id
          sales_id
        }
        secondhand: sales_active_log(
          where: { event: { _eq: "note" }, created_at: { _gt: $startedAt, _lte: $endedAt }, past_count: { _gte: 1 } }
        ) {
          id
          sales_id
        }
        attend: sales_active_log(
          where: { event: { _eq: "attend" }, started_at: { _lt: $endedAt }, ended_at: { _gt: $startedAt } }
        ) {
          id
          started_at
          ended_at
          sales_id
        }
        validSpeaking: sales_active_log(
          where: { event: { _eq: "note" }, created_at: { _gt: $startedAt, _lte: $endedAt }, duration: { _gt: 90 } }
        ) {
          id
          duration
          sales_id
        }
        dial: sales_active_log(where: { event: { _eq: "note" }, created_at: { _gt: $startedAt, _lte: $endedAt } }) {
          id
          sales_id
        }
        validGetThrough: sales_active_log(
          where: {
            event: { _eq: "note" }
            created_at: { _gt: $startedAt, _lte: $endedAt }
            duration: { _gt: 90 }
            status: { _eq: "answered" }
          }
        ) {
          id
          sales_id
        }
        invalidNumber: sales_active_log(
          where: { event: { _eq: "note" }, created_at: { _gt: $startedAt, _lte: $endedAt }, status: { _eq: "missed" } }
        ) {
          id
          sales_id
        }
        rejected: sales_active_log(
          where: {
            event: { _eq: "note" }
            created_at: { _gt: $startedAt, _lte: $endedAt }
            status: { _eq: "answered" }
            rejected_at: { _is_null: false }
          }
        ) {
          id
          sales_id
        }
        keepInTouch: sales_active_log(
          where: {
            event: { _eq: "note" }
            created_at: { _gt: $startedAt, _lte: $endedAt }
            status: { _eq: "answered" }
            rejected_at: { _is_null: true }
          }
        ) {
          id
          sales_id
        }
        reserveDemo: sales_active_log(where: { event: { _eq: "task" }, due_at: { _gt: $startedAt, _lte: $endedAt } }) {
          id
          sales_id
        }
        performance: sales_active_log(
          where: { event: { _eq: "contract" }, agreed_at: { _gt: $startedAt, _lte: $endedAt } }
        ) {
          id
          price
          sales_id
        }
        revoked: sales_active_log(
          where: {
            event: { _eq: "contract" }
            agreed_at: { _is_null: false }
            revoked_at: { _gt: $startedAt, _lte: $endedAt }
          }
        ) {
          id
          price
          sales_id
        }
      }
    `,
    {
      variables: filter,
    },
  )
  const salesMapping =
    data?.sales_active_log.reduce<{ [key: string]: string }>(
      (accumulator, v) =>
        v && v.sales?.id && v.sales.name ? { ...accumulator, [v.sales.id]: v.sales.name } : accumulator,
      {},
    ) || {}
  const firsthandLogs: LogsProps[] =
    data?.firsthand.map(v => ({
      id: v.id,
      salesId: v.sales_id,
    })) || []
  const secondhandLogs: LogsProps[] =
    data?.secondhand.map(v => ({
      id: v.id,
      salesId: v.sales_id,
    })) || []
  const attendLogs: LogsProps[] =
    data?.attend.map(v => ({
      id: v.id,
      salesId: v.sales_id,
      startedAt: new Date(v.started_at),
      endedAt: new Date(v.ended_at),
    })) || []
  const validSpeakingLogs: LogsProps[] =
    data?.validSpeaking.map(v => ({
      id: v.id,
      salesId: v.sales_id,
      duration: v.duration || 0,
    })) || []
  const dialLogs: LogsProps[] =
    data?.dial.map(v => ({
      id: v.id,
      salesId: v.sales_id,
    })) || []
  const validGetThroughLogs: LogsProps[] =
    data?.validGetThrough.map(v => ({
      id: v.id,
      salesId: v.sales_id,
    })) || []
  const invalidNumberLogs: LogsProps[] =
    data?.invalidNumber.map(v => ({
      id: v.id,
      salesId: v.sales_id,
    })) || []
  const rejectedLogs: LogsProps[] =
    data?.rejected.map(v => ({
      id: v.id,
      salesId: v.sales_id,
    })) || []
  const keepInTouchLogs: LogsProps[] =
    data?.keepInTouch.map(v => ({
      id: v.id,
      salesId: v.sales_id,
    })) || []
  const reserveDemoLogs: LogsProps[] =
    data?.reserveDemo.map(v => ({
      id: v.id,
      salesId: v.sales_id,
    })) || []
  const performanceLogs: LogsProps[] =
    data?.performance.map(v => ({
      id: v.id,
      salesId: v.sales_id,
      price: v.price,
    })) || []
  const revokedLogs: LogsProps[] =
    data?.revoked.map(v => ({
      id: v.id,
      salesId: v.sales_id,
      price: v.price,
    })) || []

  return {
    loading,
    error,
    salesMapping,
    data: {
      firsthandLogs,
      secondhandLogs,
      attendLogs,
      validSpeakingLogs,
      dialLogs,
      validGetThroughLogs,
      invalidNumberLogs,
      rejectedLogs,
      keepInTouchLogs,
      reserveDemoLogs,
      performanceLogs,
      revokedLogs,
    },
  }
}

export default SalesActivenessPage
