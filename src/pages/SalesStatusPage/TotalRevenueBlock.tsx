import { Bar, Gauge } from '@ant-design/charts'
import { BarConfig } from '@ant-design/charts/es/bar'
import { GaugeConfig } from '@ant-design/charts/es/gauge'
import { flatten, sum } from 'ramda'
import React from 'react'
import { SalesStatus } from '../../types/sales'

const TARGET_REVENUE = 7000000
const TotalRevenueBlock: React.VFC<{
  salesStatus: SalesStatus
  loading?: boolean
  error?: Error
}> = ({ salesStatus, loading, error }) => {
  if (error) {
    return null
  }

  const totalMonthlyRevenue = sum(
    salesStatus.map(status => {
      return sum(status.data.map(d => d.revenue.thisMonth))
    }),
  )

  return (
    <div className="row mb-5">
      <div className="col-3">
        <TotalRevenueGaugeChart loading={loading} value={totalMonthlyRevenue / TARGET_REVENUE} />
      </div>
      <div className="col-9">
        <TeamRevenueBarChart loading={loading} salesStatus={salesStatus} />
      </div>
    </div>
  )
}

const TotalRevenueGaugeChart: React.VFC<{ value: number; loading?: boolean }> = ({ value, loading }) => {
  const config: GaugeConfig = {
    percent: value,
    range: {
      ticks: [0, 1 / 3, 2 / 3, 1],
      color: ['#F4664A', '#FAAD14', '#30BF78'],
    },
    indicator: {
      pointer: { style: { stroke: '#D0D0D0' } },
      pin: { style: { stroke: '#D0D0D0' } },
    },
    statistic: {
      content: {
        style: {
          fontSize: '36px',
          lineHeight: '36px',
        },
      },
    },
  }
  return <Gauge loading={loading} {...config} />
}

const TeamRevenueBarChart: React.VFC<{ salesStatus: SalesStatus; loading?: boolean }> = ({ salesStatus, loading }) => {
  const data = flatten(
    salesStatus.map(status =>
      status.data.map(d => [
        {
          category: '當日',
          salesName: d.name,
          teamName: status.name,
          value: Math.floor(d.revenue.today / 10000),
        },
        {
          category: '當週',
          salesName: d.name,
          teamName: status.name,
          value: Math.floor(d.revenue.thisWeek / 10000),
        },
        {
          category: '當月',
          salesName: d.name,
          teamName: status.name,
          value: Math.floor(d.revenue.thisMonth / 10000),
        },
      ]),
    ),
  )

  var config: BarConfig = {
    data,
    isStack: true,
    isGroup: true,
    xField: 'value',
    yField: 'category',
    seriesField: 'salesName',
    groupField: 'teamName',
    label: {
      position: 'middle',
      layout: [{ type: 'interval-adjust-position' }, { type: 'interval-hide-overlap' }, { type: 'adjust-color' }],
    },
  }
  return <Bar loading={loading} {...config} />
}

export default TotalRevenueBlock
