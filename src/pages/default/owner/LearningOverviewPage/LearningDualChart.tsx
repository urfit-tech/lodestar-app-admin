import { DualAxes } from '@ant-design/charts'
import { DualAxesConfig } from '@ant-design/charts/es/dualAxes'
import * as Moment from 'moment'
import { extendMoment } from 'moment-range'
import React from 'react'

const moment = extendMoment(Moment)

type LearningDualChartValue = {
  date: string
  count: number
  duration: number
}
const LearningDualChart: React.FC<{ values: LearningDualChartValue[] }> = ({ values }) => {
  const countData: { date: string; count: number }[] = []
  const durationData: { date: string; hour: number }[] = []
  const startDate = moment().startOf('day').subtract(1, 'month')
  const endDate = moment().startOf('day')
  const dateRange = moment().range(startDate, endDate)
  for (const dateMoment of Array.from(dateRange.by('day'))) {
    const date = dateMoment.format('YYYY-MM-DD')
    countData.push({
      date,
      count: values.find(v => v.date === date)?.count || 0,
    })
    durationData.push({
      date,
      hour: (values.find(v => v.date === date)?.duration || 0) / 60 / 60,
    })
  }

  const config: DualAxesConfig = {
    data: [countData, durationData],
    xField: 'date',
    yField: ['count', 'hour'],
    geometryOptions: [{ geometry: 'column' }, { geometry: 'line' }],
  }
  return <DualAxes {...config} />
}

export default LearningDualChart
