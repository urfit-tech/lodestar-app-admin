import { BarChartOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { DatePicker, Form, Skeleton } from 'antd'
import gql from 'graphql-tag'
import { AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import hasura from '../hasura'

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
          <SalesActivenessTable startedAt={range[0].toDate()} endedAt={range[1].toDate()} />
        </Form.Item>
      </Form>
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

  if (loading) return <Skeleton active />
  if (error || !data) return <div>讀取錯誤</div>
  return <></>
}
const useSalesLogsCollection = (filter: { startedAt: Date; endedAt: Date }) => {
  const { loading, error, data } = useQuery<hasura.GET_SALES_ACTIVE_LOG, hasura.GET_SALES_ACTIVE_LOGVariables>(
    gql`
      query GET_SALES_ACTIVE_LOG($startedAt: timestamptz!, $endedAt: timestamptz!) {
        firsthandMembers: sales_active_log(
          where: { event: { _eq: "note" }, created_at: { _gt: $startedAt, _lte: $endedAt }, past_count: { _eq: 0 } }
        ) {
          id
          sales_id
        }
        secondhandMembers: sales_active_log(
          where: { event: { _eq: "note" }, created_at: { _gt: $startedAt, _lte: $endedAt }, past_count: { _gte: 1 } }
        ) {
          id
          sales_id
        }
        attend: sales_active_log(
          where: { event: { _eq: "attend" }, started_at: { _gt: $startedAt }, ended_at: { _lte: $endedAt } }
        ) {
          id
          sales_id
        }
        validSpeaking: sales_active_log(
          where: { event: { _eq: "note" }, created_at: { _gt: $startedAt, _lte: $endedAt }, duration: { _gt: 90 } }
        ) {
          id
          sales_id
          duration
        }
        validDial: sales_active_log(
          where: { event: { _eq: "note" }, created_at: { _gt: $startedAt, _lte: $endedAt }, duration: { _gt: 90 } }
        ) {
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
          sales_id
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
          sales_id
          price
        }
      }
    `,
    {
      variables: filter,
    },
  )

  return {
    loading,
    error,
    data,
  }
}

export default SalesActivenessPage
