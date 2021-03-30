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
  salesId: string
  salesName: string
  startedAt?: Date
  endedAt?: Date
  duration?: number
  price?: number
}

const SalesActivenessPage: React.FC = () => {
  const [range, setRange] = useState<[Moment, Moment]>([moment().startOf('month'), moment().endOf('month')])

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
            onChange={value => value?.[0] && value[1] && setRange([value[0], value[1]])}
            format="YYYY-MM-DD HH:00:00"
            showTime={{
              format: 'YYYY-MM-DD HH:00:00',
            }}
          />
        </Form.Item>
      </Form>
      <SalesActivenessTable startedAt={range[0].toDate()} endedAt={range[1].toDate()} />
    </AdminLayout>
  )
}

const SalesActivenessTable: React.FC<{
  startedAt: Date
  endedAt: Date
}> = ({ startedAt, endedAt }) => {
  const { loading, error, data } = useSalesLogsCollection({
    startedAt,
    endedAt,
  })

  const { isAuthenticated } = useAuth()

  if (error && isAuthenticated) return <div>讀取錯誤</div>

  const firsthand = mapObjIndexed(
    obj => obj.length,
    groupBy<LogsProps>(({ salesId, salesName }) => `${salesId}_${salesName}_firsthand`)(data.firsthandLogs),
  )
  const secondhand = mapObjIndexed(
    obj => obj.length,
    groupBy<LogsProps>(({ salesId, salesName }) => `${salesId}_${salesName}_secondhand`)(data.secondhandLogs),
  )
  const attend = mapObjIndexed(
    obj => sum(obj.map(v => (v.endedAt && v.startedAt && v.endedAt.getTime() - v.startedAt.getTime()) || 0)),
    groupBy<LogsProps>(({ salesId, salesName }) => `${salesId}_${salesName}_attend`)(data.attendLogs),
  )
  const validSpeaking = mapObjIndexed(
    obj => sum(obj.map(v => v.duration || 0)),
    groupBy<LogsProps>(({ salesId, salesName }) => `${salesId}_${salesName}_validSpeaking`)(data.validSpeakingLogs),
  )
  const validDial = mapObjIndexed(
    obj => obj.length,
    groupBy<LogsProps>(({ salesId, salesName }) => `${salesId}_${salesName}_validDial`)(data.validDialLogs),
  )
  const validGetThrough = mapObjIndexed(
    obj => obj.length,
    groupBy<LogsProps>(({ salesId, salesName }) => `${salesId}_${salesName}_validGetThrough`)(data.validGetThroughLogs),
  )
  const invalidNumber = mapObjIndexed(
    obj => obj.length,
    groupBy<LogsProps>(({ salesId, salesName }) => `${salesId}_${salesName}_invalidNumber`)(data.invalidNumberLogs),
  )
  const rejected = mapObjIndexed(
    obj => obj.length,
    groupBy<LogsProps>(({ salesId, salesName }) => `${salesId}_${salesName}_rejected`)(data.rejectedLogs),
  )
  const keepInTouch = mapObjIndexed(
    obj => obj.length,
    groupBy<LogsProps>(({ salesId, salesName }) => `${salesId}_${salesName}_keepInTouch`)(data.keepInTouchLogs),
  )
  const reserveDemo = mapObjIndexed(
    obj => obj.length,
    groupBy<LogsProps>(({ salesId, salesName }) => `${salesId}_${salesName}_reserveDemo`)(data.reserveDemoLogs),
  )
  const deal = mapObjIndexed(
    obj => obj.length,
    groupBy<LogsProps>(({ salesId, salesName }) => `${salesId}_${salesName}_deal`)(data.performanceLogs),
  )
  const performance = mapObjIndexed(
    obj => sum(obj.map(v => v.price || 0)),
    groupBy<LogsProps>(({ salesId, salesName }) => `${salesId}_${salesName}_performance`)(data.performanceLogs),
  )
  const revoked = mapObjIndexed(
    obj => sum(obj.map(v => v.price || 0)),
    groupBy<LogsProps>(({ salesId, salesName }) => `${salesId}_${salesName}_revoked`)(data.revokedLogs),
  )

  const salesCollection = Object.assign(
    firsthand,
    secondhand,
    attend,
    validSpeaking,
    validDial,
    validGetThrough,
    invalidNumber,
    rejected,
    keepInTouch,
    reserveDemo,
    deal,
    performance,
    revoked,
  )

  const dataSourceCollection = map(([sale, value]) => {
    const [salesId, salesName, field] = split('_')(sale)
    return {
      salesId,
      salesName,
      [field]: value,
    }
  }, toPairs(salesCollection))

  const dataSource = Object.values(
    dataSourceCollection.reduce<{
      [x: string]: {
        salesId: string
        salesName: string
        firsthand: number
        secondhand: number
        totalCount: number
        attend: number
        validSpeaking: number
        validDial: number
        validGetThrough: number
        invalidNumber: number
        rejected: number
        keepInTouch: number
        reserveDemo: number
        deal: number
        performance: number
        revoked: number
        test: string
      }
    }>((r, { salesId, ...rest }) => {
      r[salesId] = r[salesId] || { salesId }
      r[salesId] = { ...r[salesId], ...rest }
      return r
    }, {}),
  ).map(v => {
    const obj = Object.assign({}, v)
    obj.totalCount = v.firsthand | (0 + v.secondhand) | 0
    return obj
  })

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
        <Table.Column key="salesName" title="業務名稱" dataIndex="salesName" width="8rem" fixed="left" />
        <Table.ColumnGroup title="指派名單數">
          <Table.Column<Pick<RecordType, 'firsthand'>>
            key="firsthand"
            dataIndex="firsthand"
            title="一手"
            render={firsthand => (firsthand ? <span>{firsthand}</span> : <span>0</span>)}
            sorter={(a, b) => columnSorter(a, b, 'firsthand')}
            width="6rem"
          />

          <Table.Column<Pick<RecordType, 'secondhand'>>
            key="secondhand"
            title="二手"
            dataIndex="secondhand"
            render={secondhand => (secondhand ? <span>{secondhand}</span> : <span>0</span>)}
            sorter={(a, b) => columnSorter(a, b, 'secondhand')}
            width="6rem"
          />

          <Table.Column<Pick<RecordType, 'totalCount'>>
            key="totalCount"
            title="總數"
            dataIndex={'totalCount'}
            render={totalCount => <span>{totalCount}</span>}
            sorter={(a, b) => columnSorter(a, b, 'totalCount')}
            width="6rem"
          />
        </Table.ColumnGroup>
        <Table.Column<Pick<RecordType, 'attend'>>
          key="attend"
          title="在線時間(分)"
          dataIndex="attend"
          render={attend => (attend ? <span>{Math.ceil(attend / 60000)}</span> : <span>0</span>)}
          sorter={(a, b) => columnSorter(a, b, 'attend')}
          width="9rem"
        />
        <Table.Column<Pick<RecordType, 'validSpeaking'>>
          key="validSpeaking"
          title="通話時間(分)"
          dataIndex="validSpeaking"
          render={validSpeaking => (validSpeaking ? <span>{Math.ceil(validSpeaking / 60000)}</span> : <span>0</span>)}
          sorter={(a, b) => columnSorter(a, b, 'validSpeaking')}
          width="9rem"
        />
        <Table.Column<Pick<RecordType, 'validDial'>>
          key="validDial"
          title="撥打次數"
          dataIndex="validDial"
          render={validDial => (validDial ? <span>{validDial}</span> : <span>0</span>)}
          sorter={(a, b) => columnSorter(a, b, 'validDial')}
          width="7.5rem"
        />
        <Table.Column<Pick<RecordType, 'validGetThrough'>>
          key="validGetThrough"
          title="接通次數"
          dataIndex="validGetThrough"
          render={validGetThrough => (validGetThrough ? <span>{validGetThrough}</span> : <span>0</span>)}
          sorter={(a, b) => columnSorter(a, b, 'validGetThrough')}
          width="7.5rem"
        />
        <Table.Column<Pick<RecordType, 'invalidNumber'>>
          key="invalidNumber"
          title="空號數"
          dataIndex="invalidNumber"
          render={invalidNumber => (invalidNumber ? <span>{invalidNumber}</span> : <span>0</span>)}
          sorter={(a, b) => columnSorter(a, b, 'invalidNumber')}
          width="7rem"
        />
        <Table.Column<Pick<RecordType, 'rejected'>>
          key="rejected"
          title="拒絕數"
          dataIndex="rejected"
          render={rejected => (rejected ? <span>{rejected}</span> : <span>0</span>)}
          sorter={(a, b) => columnSorter(a, b, 'rejected')}
          width="7rem"
        />
        <Table.Column<Pick<RecordType, 'keepInTouch'>>
          key="keepInTouch"
          title="開發中"
          dataIndex="keepInTouch"
          render={keepInTouch => (keepInTouch ? <span>{keepInTouch}</span> : <span>0</span>)}
          sorter={(a, b) => columnSorter(a, b, 'keepInTouch')}
          width="7rem"
        />
        <Table.Column<Pick<RecordType, 'reserveDemo'>>
          key="reserveDemo"
          title="預約示範次數"
          dataIndex="reserveDemo"
          render={reserveDemo => (reserveDemo ? <span>{reserveDemo}</span> : <span>0</span>)}
          sorter={(a, b) => columnSorter(a, b, 'reserveDemo')}
          width="9.5rem"
        />
        <Table.Column<Pick<RecordType, 'deal'>>
          key="deal"
          title="成交數"
          dataIndex="deal"
          render={deal => (deal ? <span>{deal}</span> : <span>0</span>)}
          sorter={(a, b) => columnSorter(a, b, 'deal')}
          width="7rem"
        />
        <Table.Column<Pick<RecordType, 'performance'>>
          key="performance"
          title="業績量"
          dataIndex="performance"
          render={performance => (performance ? <span>{performance}</span> : <span>0</span>)}
          sorter={(a, b) => columnSorter(a, b, 'performance')}
          width="7rem"
        />
        <Table.Column<Pick<RecordType, 'revoked'>>
          key="revoked"
          title="解約金額"
          dataIndex="revoked"
          render={revoked => (revoked ? <span>{revoked}</span> : <span>0</span>)}
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
        firsthand: sales_active_log(
          where: { event: { _eq: "note" }, created_at: { _gt: $startedAt, _lte: $endedAt }, past_count: { _eq: 0 } }
        ) {
          id
          sales {
            id
            name
          }
        }
        secondhand: sales_active_log(
          where: { event: { _eq: "note" }, created_at: { _gt: $startedAt, _lte: $endedAt }, past_count: { _gte: 1 } }
        ) {
          id
          sales {
            id
            name
          }
        }
        attend: sales_active_log(
          where: { event: { _eq: "attend" }, started_at: { _lt: $endedAt }, ended_at: { _gt: $startedAt } }
        ) {
          id
          sales {
            id
            name
          }
          started_at
          ended_at
        }
        validSpeaking: sales_active_log(
          where: { event: { _eq: "note" }, created_at: { _gt: $startedAt, _lte: $endedAt }, duration: { _gt: 90 } }
        ) {
          id
          sales {
            id
            name
          }
          duration
        }
        validDial: sales_active_log(
          where: { event: { _eq: "note" }, created_at: { _gt: $startedAt, _lte: $endedAt }, duration: { _gt: 90 } }
        ) {
          id
          sales {
            id
            name
          }
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
          sales {
            id
            name
          }
        }
        invalidNumber: sales_active_log(
          where: { event: { _eq: "note" }, created_at: { _gt: $startedAt, _lte: $endedAt }, status: { _eq: "missed" } }
        ) {
          id
          sales {
            id
            name
          }
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
          sales {
            id
            name
          }
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
          sales {
            id
            name
          }
        }
        reserveDemo: sales_active_log(where: { event: { _eq: "task" }, due_at: { _gt: $startedAt, _lte: $endedAt } }) {
          id
          sales {
            id
            name
          }
        }
        performance: sales_active_log(
          where: { event: { _eq: "contract" }, agreed_at: { _gt: $startedAt, _lte: $endedAt } }
        ) {
          id
          sales {
            id
            name
          }
          price
        }
        revoked: sales_active_log(
          where: {
            event: { _eq: "contract" }
            agreed_at: { _is_null: false }
            revoked_at: { _gt: $startedAt, _lte: $endedAt }
          }
        ) {
          id
          sales {
            id
            name
          }
          price
        }
      }
    `,
    {
      variables: filter,
    },
  )

  const firsthandLogs: LogsProps[] =
    loading || !!error || !data
      ? []
      : data?.firsthand.map(v => ({
          id: v.id,
          salesId: v.sales?.id || '',
          salesName: v.sales?.name || '',
        }))
  const secondhandLogs: LogsProps[] =
    loading || !!error || !data
      ? []
      : data?.secondhand.map(v => ({
          id: v.id,
          salesId: v.sales?.id || '',
          salesName: v.sales?.name || '',
        }))
  const attendLogs: LogsProps[] =
    loading || !!error || !data
      ? []
      : data?.attend.map(v => ({
          id: v.id,
          salesId: v.sales?.id || '',
          salesName: v.sales?.name || '',
          startedAt: new Date(v.started_at),
          endedAt: new Date(v.ended_at),
        }))
  const validSpeakingLogs: LogsProps[] =
    loading || !!error || !data
      ? []
      : data?.validSpeaking.map(v => ({
          id: v.id,
          salesId: v.sales?.id || '',
          salesName: v.sales?.name || '',
          duration: v.duration || 0,
        }))
  const validDialLogs: LogsProps[] =
    loading || !!error || !data
      ? []
      : data?.validDial.map(v => ({
          id: v.id,
          salesId: v.sales?.id || '',
          salesName: v.sales?.name || '',
        }))
  const validGetThroughLogs: LogsProps[] =
    loading || !!error || !data
      ? []
      : data?.validGetThrough.map(v => ({
          id: v.id,
          salesId: v.sales?.id || '',
          salesName: v.sales?.name || '',
        }))
  const invalidNumberLogs: LogsProps[] =
    loading || !!error || !data
      ? []
      : data?.invalidNumber.map(v => ({
          id: v.id,
          salesId: v.sales?.id || '',
          salesName: v.sales?.name || '',
        }))
  const rejectedLogs: LogsProps[] =
    loading || !!error || !data
      ? []
      : data?.rejected.map(v => ({
          id: v.id,
          salesId: v.sales?.id || '',
          salesName: v.sales?.name || '',
        }))
  const keepInTouchLogs: LogsProps[] =
    loading || !!error || !data
      ? []
      : data?.keepInTouch.map(v => ({
          id: v.id,
          salesId: v.sales?.id || '',
          salesName: v.sales?.name || '',
        }))
  const reserveDemoLogs: LogsProps[] =
    loading || !!error || !data
      ? []
      : data?.reserveDemo.map(v => ({
          id: v.id,
          salesId: v.sales?.id || '',
          salesName: v.sales?.name || '',
        }))
  const performanceLogs: LogsProps[] =
    loading || !!error || !data
      ? []
      : data?.performance.map(v => ({
          id: v.id,
          salesId: v.sales?.id || '',
          salesName: v.sales?.name || '',
          price: v.price,
        }))
  const revokedLogs: LogsProps[] =
    loading || !!error || !data
      ? []
      : data?.revoked.map(v => ({
          id: v.id,
          salesId: v.sales?.id || '',
          salesName: v.sales?.name || '',
          price: v.price,
        }))

  return {
    loading,
    error,
    data: {
      firsthandLogs,
      secondhandLogs,
      attendLogs,
      validSpeakingLogs,
      validDialLogs,
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
