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
    name: '今天吃什麼',
    sales: ['alan@xuemi.co', 'cherry@xuemi.co', 'nicole@xuemi.co'],
  },
  {
    name: '喜刷刷',
    sales: ['violet@xuemi.co', 'jason@xuemi.co', 'jade@xuemi.co'],
  },
  {
    name: '攻城獅',
    sales: ['steven@xuemi.co', 'youjia@xuemi.co'],
  },
]

const SalesStatusPage: React.VFC = () => {
  const [today, setToday] = useState(moment().startOf('day'))
  const { loading, data: salesStatus } = useSalesStatus(today)
  const { formatMessage } = useIntl()
  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon className="mr-3" component={() => <RadarChartOutlined />} />
        <span className="mr-3">{formatMessage(salesMessages.label.salesStatus)}</span>
        <DatePicker onChange={e => setToday((e || moment()).startOf('day'))} />
      </AdminPageTitle>
      <TotalRevenueBlock salesStatus={salesStatus} loading={loading} />
      <CallStatusBlock salesStatus={salesStatus} loading={loading} />
    </AdminLayout>
  )
}

const GET_SALES_STATUS = gql`
  query GET_SALES_STATUS($startedAt: timestamptz!, $endedAt: timestamptz!) {
    order_executor_sharing(where: { created_at: { _gte: $startedAt, _lt: $endedAt } }) {
      executor {
        email
      }
      total_price
      ratio
      created_at
    }
    member_note(
      where: { created_at: { _gte: $startedAt, _lt: $endedAt }, type: { _eq: "outbound" }, status: { _eq: "answered" } }
    ) {
      author {
        email
      }
      type
      status
      duration
      created_at
    }
  }
`
const useSalesStatus = (today: moment.Moment): { loading: boolean; data: SalesStatus } => {
  const tomorrow = today.clone().add(1, 'day')
  const thisWeek = today.clone().startOf('week')
  const thisMonth = today.clone().startOf('month')
  const { loading, data } = useQuery<hasura.GET_SALES_STATUS, hasura.GET_SALES_STATUSVariables>(GET_SALES_STATUS, {
    variables: {
      startedAt: thisMonth,
      endedAt: tomorrow,
    },
    pollInterval: 10000,
  })
  return {
    loading,
    data: teamSettings.map(setting => ({
      name: setting.name,
      data: setting.sales.map(sales => {
        return {
          id: sales,
          name: sales.split('@')[0],
          revenue: {
            today: sum(
              data?.order_executor_sharing
                .filter(v => moment(v.created_at) >= today && v.executor?.email === sales)
                .map(v => v.total_price * v.ratio) || [],
            ),
            thisWeek: sum(
              data?.order_executor_sharing
                .filter(v => moment(v.created_at) >= thisWeek && v.executor?.email === sales)
                .map(v => v.total_price * v.ratio) || [],
            ),
            thisMonth: sum(
              data?.order_executor_sharing
                .filter(v => moment(v.created_at) >= thisMonth && v.executor?.email === sales)
                .map(v => v.total_price * v.ratio) || [],
            ),
          },
          callTimes: {
            today: data?.member_note.filter(v => moment(v.created_at) >= today && v.author.email === sales).length || 0,
            thisWeek:
              data?.member_note.filter(v => moment(v.created_at) >= thisWeek && v.author.email === sales).length || 0,
            thisMonth:
              data?.member_note.filter(v => moment(v.created_at) >= thisMonth && v.author.email === sales).length || 0,
          },
          callDuration: {
            today: sum(
              data?.member_note
                .filter(v => moment(v.created_at) >= today && v.author.email === sales)
                .map(v => v.duration) || [],
            ),
            thisWeek: sum(
              data?.member_note
                .filter(v => moment(v.created_at) >= thisWeek && v.author.email === sales)
                .map(v => v.duration) || [],
            ),
            thisMonth: sum(
              data?.member_note
                .filter(v => moment(v.created_at) >= thisMonth && v.author.email === sales)
                .map(v => v.duration) || [],
            ),
          },
        }
      }),
    })),
  }
}
export default SalesStatusPage
