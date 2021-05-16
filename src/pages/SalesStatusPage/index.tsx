import Icon, { RadarChartOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { DatePicker } from 'antd'
import gql from 'graphql-tag'
import { AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import moment from 'moment-timezone'
import { sum } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { salesMessages } from '../../helpers/translation'
import { SalesStatus } from '../../types/sales'
import CallStatusBlock from './CallStatusBlock'
import TotalRevenueBlock from './TotalRevenueBlock'

const teamSettings = [
  {
    name: '無名組',
    sales: [
      { name: 'rooney', id: '44649150-6f11-4b95-a9c8-7ff3530febc6' },
      { name: 'ann', id: '32dfd15f-4e75-4fc5-a753-ef1ad349af4f' },
      { name: 'julie', id: 'a0fef166-413f-4512-8bb0-633066fe135c' },
      { name: 'shani', id: '1fc69bdc-519a-40fb-ab05-265a57dd2e0d' },
      { name: 'apple', id: '335f04ae-eaf4-4da1-ae00-4d5fb6a62666' },
      { name: 'ashley', id: '775d6a85-83f0-4226-949f-52ffc86bdabf' },
    ],
  },
  {
    name: '今天吃什麼',
    sales: [
      { id: '67d897bb-d500-497f-b8a8-7ceb55227da4', name: 'alan' },
      { id: '906450b5-e4ab-4736-96ae-261d8a3abb96', name: 'nicole' },
      { id: '585757d9-50c1-4800-a16b-fadf6fd8b669', name: 'cherry' },
    ],
  },
  {
    name: '喜刷刷',
    sales: [
      { id: 'fac9ad75-296b-456e-a577-a7cf7264635d', name: 'violet' },
      { id: 'a8c910cf-c626-4f2d-827a-d7c92e22b707', name: 'jason' },
      { id: 'c91ef026-c46b-4cf4-bc8d-7aba9fe650bc', name: 'jade' },
    ],
  },
  {
    name: '攻城獅',
    sales: [
      { id: '54eec91c-a636-4043-ac8e-7c1616b970eb', name: 'steven' },
      { id: 'f13368e0-ca7f-4ec3-a5fb-88224b287896', name: 'youjia' },
    ],
  },
]

const SalesStatusPage: React.VFC = () => {
  const [today, setToday] = useState(moment().startOf('day'))
  const { loading, data: salesStatus, error } = useSalesStatus(today)
  const { formatMessage } = useIntl()
  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon className="mr-3" component={() => <RadarChartOutlined />} />
        <span className="mr-3">{formatMessage(salesMessages.label.salesStatus)}</span>
        <DatePicker onChange={e => setToday((e || moment()).startOf('day'))} />
      </AdminPageTitle>
      <TotalRevenueBlock salesStatus={salesStatus} loading={loading} error={error} />
      <CallStatusBlock salesStatus={salesStatus} loading={loading} error={error} />
    </AdminLayout>
  )
}

const GET_SALES_STATUS = gql`
  query GET_SALES_STATUS($startedAt: timestamptz!, $endedAt: timestamptz!) {
    member_contract(where: { agreed_at: { _gte: $startedAt }, revoked_at: { _is_null: true } }) {
      agreed_at
      values
    }
    member_note(
      where: { created_at: { _gte: $startedAt, _lt: $endedAt }, type: { _eq: "outbound" }, status: { _eq: "answered" } }
    ) {
      author {
        id
      }
      type
      status
      duration
      created_at
    }
  }
`
const useSalesStatus = (today: moment.Moment): { loading: boolean; error: Error | undefined; data: SalesStatus } => {
  const tomorrow = today.clone().add(1, 'day')
  const thisWeek = today.clone().startOf('week')
  const thisMonth = today.clone().startOf('month')
  const { loading, error, data } = useQuery<hasura.GET_SALES_STATUS, hasura.GET_SALES_STATUSVariables>(
    GET_SALES_STATUS,
    {
      variables: {
        startedAt: thisMonth,
        endedAt: tomorrow,
      },
      pollInterval: 10000,
    },
  )
  return {
    loading,
    error,
    data: teamSettings.map(setting => ({
      name: setting.name,
      data: setting.sales.map(sales => {
        return {
          id: sales.id,
          name: sales.name,
          revenue: {
            today: sum(
              data?.member_contract
                .filter(v => moment(v.agreed_at) >= today)
                .map(v =>
                  sum(
                    v.values.orderExecutors
                      .filter((executor: { member_id: string; ratio: number }) => executor.member_id === sales.id)
                      .map((executor: { member_id: string; ratio: number }) => v.values.price * executor.ratio) || [],
                  ),
                ) || [],
            ),
            thisWeek: sum(
              data?.member_contract
                .filter(v => moment(v.agreed_at) >= thisWeek)
                .map(v =>
                  sum(
                    v.values.orderExecutors
                      .filter((executor: { member_id: string; ratio: number }) => executor.member_id === sales.id)
                      .map((executor: { member_id: string; ratio: number }) => v.values.price * executor.ratio) || [],
                  ),
                ) || [],
            ),
            thisMonth: sum(
              data?.member_contract
                .filter(v => moment(v.agreed_at) >= thisMonth)
                .map(v =>
                  sum(
                    v.values.orderExecutors
                      .filter((executor: { member_id: string; ratio: number }) => executor.member_id === sales.id)
                      .map((executor: { member_id: string; ratio: number }) => v.values.price * executor.ratio) || [],
                  ),
                ) || [],
            ),
          },
          callTimes: {
            today: data?.member_note.filter(v => moment(v.created_at) >= today && v.author.id === sales.id).length || 0,
            thisWeek:
              data?.member_note.filter(v => moment(v.created_at) >= thisWeek && v.author.id === sales.id).length || 0,
            thisMonth:
              data?.member_note.filter(v => moment(v.created_at) >= thisMonth && v.author.id === sales.id).length || 0,
          },
          callDuration: {
            today: sum(
              data?.member_note
                .filter(v => moment(v.created_at) >= today && v.author.id === sales.id)
                .map(v => v.duration) || [],
            ),
            thisWeek: sum(
              data?.member_note
                .filter(v => moment(v.created_at) >= thisWeek && v.author.id === sales.id)
                .map(v => v.duration) || [],
            ),
            thisMonth: sum(
              data?.member_note
                .filter(v => moment(v.created_at) >= thisMonth && v.author.id === sales.id)
                .map(v => v.duration) || [],
            ),
          },
        }
      }),
    })),
  }
}
export default SalesStatusPage
