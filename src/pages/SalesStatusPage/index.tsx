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
import { GroupSettingProps, SalesStatus } from '../../types/sales'
import CallStatusBlock from './CallStatusBlock'
import TotalRevenueBlock from './TotalRevenueBlock'

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
  const { groupSettings } = useSalesGroups(process.env.REACT_APP_ID || 'xuemi')

  return {
    loading,
    error,
    data: groupSettings?.map(setting => ({
      name: setting.name,
      data: setting.sales.map(sales => {
        return {
          id: sales.id,
          name: sales.name,
          revenue: {
            today: sum(
              data?.member_contract
                ?.filter(v => moment(v.agreed_at) >= today)
                .map(v =>
                  sum(
                    v.values.orderExecutors
                      ?.filter((executor: { member_id: string; ratio: number }) => executor.member_id === sales.id)
                      .map((executor: { member_id: string; ratio: number }) => v.values.price * executor.ratio) || [],
                  ),
                ) || [],
            ),
            thisWeek: sum(
              data?.member_contract
                ?.filter(v => moment(v.agreed_at) >= thisWeek)
                .map(v =>
                  sum(
                    v.values.orderExecutors
                      ?.filter((executor: { member_id: string; ratio: number }) => executor.member_id === sales.id)
                      .map((executor: { member_id: string; ratio: number }) => v.values.price * executor.ratio) || [],
                  ),
                ) || [],
            ),
            thisMonth: sum(
              data?.member_contract
                ?.filter(v => moment(v.agreed_at) >= thisMonth)
                .map(v =>
                  sum(
                    v.values.orderExecutors
                      ?.filter((executor: { member_id: string; ratio: number }) => executor.member_id === sales.id)
                      .map((executor: { member_id: string; ratio: number }) => v.values.price * executor.ratio) || [],
                  ),
                ) || [],
            ),
          },
          callTimes: {
            today:
              data?.member_note?.filter(v => moment(v.created_at) >= today && v.author.id === sales.id).length || 0,
            thisWeek:
              data?.member_note?.filter(v => moment(v.created_at) >= thisWeek && v.author.id === sales.id).length || 0,
            thisMonth:
              data?.member_note?.filter(v => moment(v.created_at) >= thisMonth && v.author.id === sales.id).length || 0,
          },
          callDuration: {
            today: sum(
              data?.member_note
                ?.filter(v => moment(v.created_at) >= today && v.author.id === sales.id)
                .map(v => v.duration) || [],
            ),
            thisWeek: sum(
              data?.member_note
                ?.filter(v => moment(v.created_at) >= thisWeek && v.author.id === sales.id)
                .map(v => v.duration) || [],
            ),
            thisMonth: sum(
              data?.member_note
                ?.filter(v => moment(v.created_at) >= thisMonth && v.author.id === sales.id)
                .map(v => v.duration) || [],
            ),
          },
        }
      }),
    })),
  }
}

const useSalesGroups = (appId: string) => {
  const { loading, error, data } = useQuery<hasura.GET_SALES_GROUPS, hasura.GET_SALES_GROUPSVariables>(
    gql`
      query GET_SALES_GROUPS($appId: String!) {
        member_property(where: { property: { app_id: { _eq: $appId }, name: { _eq: "組別" } } }) {
          value
          member {
            id
            name
          }
        }
      }
    `,
    {
      variables: {
        appId,
      },
    },
  )

  const groupSettings: GroupSettingProps[] =
    loading || error || !data
      ? []
      : data.member_property?.reduce<GroupSettingProps[]>((currentGroupSettings, currentSalesMember) => {
          const {
            value: groupName,
            member: { id, name },
          } = currentSalesMember

          const currentGroupId = currentGroupSettings.findIndex(groupSetting => groupSetting.name === groupName)

          if (currentGroupId >= 0) {
            const newSalesMembers = [...currentGroupSettings[currentGroupId].sales, { id, name }]
            currentGroupSettings[currentGroupId].sales = newSalesMembers
            return currentGroupSettings
          }
          const newGroupSetting: GroupSettingProps = { name: groupName, sales: [{ id, name }] }

          return [...currentGroupSettings, newGroupSetting]
        }, [])

  return {
    loadingGroupSettings: loading,
    errorGroupSettings: error,
    groupSettings,
  }
}
export default SalesStatusPage
