import { DualAxes } from '@ant-design/charts'
import { DualAxesConfig } from '@ant-design/plots'
import { gql, useQuery } from '@apollo/client'
import { DatePicker } from 'antd'
import { max, sum } from 'lodash'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import moment, { Moment } from 'moment'
import { RangeValue } from 'rc-picker/lib/interface'
import React, { useState } from 'react'
import AdminCard from '../../components/admin/AdminCard'
import hasura from '../../hasura'

const MediaLibraryUsageCard: React.VFC = () => {
  const { settings } = useApp()
  const [dateRange, setDateRange] = useState<RangeValue<moment.Moment>>([moment().subtract(1, 'day'), moment()])
  const { ticks, totalVideoDuration, totalWatchedSeconds } = useAppUsage(dateRange)
  const DemoDualAxes = () => {
    const data = ticks.map(tick => ({
      dateHour: tick.dateHour.format('MM/DD HH:00'),
      videoDuration: Math.round(tick.videoDuration / 60),
      watchedMinutes: Math.round(tick.watchedSeconds / 60),
    }))
    const config: DualAxesConfig = {
      data: [data, data],
      xField: 'dateHour',
      yField: ['videoDuration', 'watchedMinutes'],
      xAxis: {
        label: {
          autoRotate: true,
          autoEllipsis: false,
        },
      },
      geometryOptions: [
        {
          geometry: 'column',
          color: '#4ED1B3',
        },
        {
          geometry: 'line',
          color: '#4C5B8F',
          lineStyle: {
            lineWidth: 2,
          },
        },
      ],
    }
    return <DualAxes {...config} />
  }

  return (
    <AdminCard>
      <div className="d-flex align-items-center mb-3">
        <DatePicker.RangePicker
          className="mr-3"
          allowClear={false}
          ranges={{
            Today: [moment().startOf('day'), moment().endOf('day')],
            'Recent 7 days': [moment().subtract(7, 'days'), moment().endOf('day')],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [
              moment().subtract(1, 'month').startOf('month'),
              moment().subtract(1, 'month').endOf('month'),
            ],
          }}
          value={dateRange}
          onChange={dr => setDateRange([dr?.[0]?.startOf('day') || null, dr?.[1]?.endOf('day') || null])}
          disabledDate={date =>
            date > moment() || (settings['usage.startedAt'] ? date < moment(settings['usage.startedAt']) : false)
          }
        />
        <div className="mr-3">Duration: {Math.round(totalVideoDuration / 60)}min(s)</div>
        <div>Watched: {Math.round(totalWatchedSeconds / 60)}min(s)</div>
      </div>

      <DemoDualAxes />
    </AdminCard>
  )
}

const useAppUsage = (dateRange: RangeValue<Moment>) => {
  const startedAt = dateRange?.[0] || moment().subtract(1, 'day')
  const endedAt = dateRange?.[1] || moment()
  const { data } = useQuery<hasura.GET_APP_USAGE, hasura.GET_APP_USAGEVariables>(
    gql`
      query GET_APP_USAGE($startedDateHour: String!, $endedDateHour: String!) {
        app_usage(where: { date_hour: { _gte: $startedDateHour, _lte: $endedDateHour } }) {
          date_hour
          video_duration
          watched_seconds
        }
        last_app_usage: app_usage(
          where: { date_hour: { _lt: $startedDateHour }, video_duration: { _gte: 0 } }
          limit: 1
        ) {
          video_duration
        }
      }
    `,
    {
      variables: {
        startedDateHour: startedAt.clone().utc().format('YYYYMMDDHH'),
        endedDateHour: endedAt.clone().utc().format('YYYYMMDDHH'),
      },
    },
  )
  const dateHours = []
  for (let dateHour = startedAt; dateHour <= endedAt; dateHour = dateHour.clone().add(1, 'hour')) {
    dateHours.push(dateHour)
  }
  let videoDuration = Number(data?.last_app_usage[0]?.video_duration) || 0
  const ticks = dateHours.map(dateHour => {
    const usage = data?.app_usage.find(v => v.date_hour === dateHour.clone().utc().format('YYYYMMDDHH'))
    const tickVideoDuration = Number(usage?.video_duration) || -1
    // if videoDuration not exist, use last one
    // else, if videoDuration is wierd, set 0
    videoDuration = tickVideoDuration === -1 ? videoDuration : tickVideoDuration
    return {
      dateHour,
      videoDuration,
      watchedSeconds: Number(usage?.watched_seconds) || 0,
    }
  })
  return {
    totalVideoDuration: max(ticks.map(tick => tick.videoDuration)) || 0,
    totalWatchedSeconds: sum(data?.app_usage.map(v => v.watched_seconds || 0) || []),
    ticks,
  }
}

export default MediaLibraryUsageCard
