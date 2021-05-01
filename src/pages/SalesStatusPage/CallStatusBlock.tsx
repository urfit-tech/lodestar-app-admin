import { DualAxes, Liquid } from '@ant-design/charts'
import { DualAxesConfig } from '@ant-design/charts/es/dualAxes'
import { LiquidConfig } from '@ant-design/charts/es/liquid'
import { flatten, sum } from 'ramda'
import React, { useRef } from 'react'
import { SalesStatus } from '../../types/sales'

const TARGET_CALL_DURATION = 180 * 60

const CallStatusBlock: React.VFC<{ salesStatus: SalesStatus; loading?: boolean }> = ({ salesStatus, loading }) => {
  return (
    <div className="row">
      <div className="col-6">
        <div className="text-align">當日平均日通時</div>
        <div className="d-flex">
          {salesStatus.map(status => {
            const teamDuration = sum(status.data.map(d => d.callDuration.today)) / status.data.length
            return (
              <div key={status.name} style={{ width: `${Math.floor(100 / salesStatus.length)}%` }}>
                <CallDurationLiquid name={status.name} value={teamDuration} loading={loading} />
              </div>
            )
          })}
        </div>
      </div>
      <div className="col-6">
        <CallDurationTimesDualChart salesStatus={salesStatus} loading={loading} />
      </div>
    </div>
  )
}

const CallDurationLiquid: React.VFC<{ name: string; value: number; loading?: boolean }> = ({
  name,
  value,
  loading,
}) => {
  const chartRef = useRef()
  const config: LiquidConfig = {
    percent: value / TARGET_CALL_DURATION,
    statistic: {
      title: {
        formatter: ref => `${name}(${ref ? (ref.percent * 100).toFixed(0) : '-'}%)`,
        style: _ref => {
          var percent = _ref.percent
          return { fill: percent > 0.6 ? 'white' : 'rgba(44,53,66,0.85)' }
        },
      },
      content: {
        formatter: _ref => (_ref ? `${(value / 60).toFixed(0)} min` : '-'),
      },
    },
    liquidStyle: _ref => {
      var percent = _ref.percent
      return {
        fill: percent > 0.45 ? '#5B8FF9' : '#FAAD14',
        stroke: percent > 0.45 ? '#5B8FF9' : '#FAAD14',
      }
    },
    color: '#5B8FF9',
  }
  return <Liquid loading={loading} {...config} chartRef={chartRef} />
}

const CallDurationTimesDualChart: React.VFC<{ salesStatus: SalesStatus; loading?: boolean }> = ({
  salesStatus,
  loading,
}) => {
  const columnData = flatten(
    salesStatus.map(status => {
      return status.data.map(d => [
        {
          category: '當日',
          salesName: d.name,
          teamName: status.name,
          value: Math.floor(d.callDuration.today / 60),
        },
        {
          category: '當週',
          salesName: d.name,
          teamName: status.name,
          value: Math.floor(d.callDuration.thisWeek / 60),
        },
        {
          category: '當月',
          salesName: d.name,
          teamName: status.name,
          value: Math.floor(d.callDuration.thisMonth / 60),
        },
      ])
    }),
  )

  var lineData = flatten(
    salesStatus.map(status => {
      const teamTodayCallTimes = sum(status.data.map(d => d.callTimes.today)) / status.data.length
      const teamThisWeekCallTimes = sum(status.data.map(d => d.callTimes.thisWeek)) / status.data.length
      const teamThisMonthCallTimes = sum(status.data.map(d => d.callTimes.thisMonth)) / status.data.length
      return [
        {
          category: '當日',
          teamName: status.name,
          value: teamTodayCallTimes,
        },
        {
          category: '當週',
          teamName: status.name,
          value: teamThisWeekCallTimes,
        },
        {
          category: '當月',
          teamName: status.name,
          value: teamThisMonthCallTimes,
        },
      ]
    }),
  )
  const config: DualAxesConfig = {
    data: [columnData, lineData],
    xField: 'category',
    yField: ['value', 'value'],
    geometryOptions: [
      {
        geometry: 'column',
        isGroup: true,
        isStack: true,
        seriesField: 'salesName',
        groupField: 'teamName',
      },
      {
        geometry: 'line',
        seriesField: 'teamName',
        isStack: true,
      },
    ],
  }
  return <DualAxes loading={loading} {...config} />
}
export default CallStatusBlock
