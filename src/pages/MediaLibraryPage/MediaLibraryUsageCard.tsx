import { DualAxes } from '@ant-design/charts'
import { DualAxesConfig } from '@ant-design/plots'
import { DatePicker } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import moment from 'moment'
import { RangeValue } from 'rc-picker/lib/interface'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import AdminCard from '../../components/admin/AdminCard'
import { useAppPlan, useAppUsage } from '../../hooks/data'
import pageMessages from '../translation'

const StyledTextColor = styled.span`
  color: #ff7d62;
`

type VideoFlowInfoProps = {
  info: {
    title: string
    remainingTime?: number
    totalMinutes: number
    maxDuration?: number
    unit: string
    unitLabel: string
  }
}

const formatUnit = (unit: string, mapping: Record<string, string>): string => {
  return mapping[unit] || unit
}

const VideoFlowInfo: React.FC<VideoFlowInfoProps> = ({ info }) => {
  return (
    <>
      {info.title} :{' '}
      {info.remainingTime && info.remainingTime < 0 ? (
        <StyledTextColor>{info.totalMinutes}</StyledTextColor>
      ) : (
        <span>{info.totalMinutes}</span>
      )}
      {info.maxDuration !== undefined && <span> / </span>}
      {info.maxDuration} {formatUnit(info.unit, { minute: info.unitLabel })}
    </>
  )
}

const MediaLibraryUsageCard: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { settings } = useApp()
  const [dateRange, setDateRange] = useState<RangeValue<moment.Moment>>([moment().subtract(1, 'day'), moment()])
  const { ticks, totalVideoDuration, totalWatchedSeconds } = useAppUsage(dateRange)
  const { appPlan } = useAppPlan()
  const { maxVideoDuration, maxVideoDurationUnit, maxVideoWatch, maxVideoWatchUnit } = appPlan.options
  const totalVideoDurationMinutes = Math.round(totalVideoDuration / 60)
  const totalWatchedSecondsMinutes = Math.round(totalWatchedSeconds / 60)

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
        <div className="mr-3">
          <VideoFlowInfo
            info={{
              title: formatMessage(pageMessages.MediaLibraryPage.maxVideoDuration),
              remainingTime: maxVideoDuration && maxVideoDuration - totalVideoDurationMinutes,
              totalMinutes: totalVideoDurationMinutes,
              maxDuration: maxVideoDuration,
              unit: maxVideoDurationUnit,
              unitLabel: formatMessage(pageMessages.MediaLibraryPage.maxVideoDurationUnit),
            }}
          />
        </div>
        <div>
          <VideoFlowInfo
            info={{
              title: formatMessage(pageMessages.MediaLibraryPage.maxVideoWatch),
              remainingTime: maxVideoWatch && maxVideoWatch - totalWatchedSecondsMinutes,
              totalMinutes: totalWatchedSecondsMinutes,
              maxDuration: maxVideoWatch,
              unit: maxVideoWatchUnit,
              unitLabel: formatMessage(pageMessages.MediaLibraryPage.maxVideoWatchUnit),
            }}
          />
        </div>
      </div>

      <DemoDualAxes />
    </AdminCard>
  )
}

export default MediaLibraryUsageCard
