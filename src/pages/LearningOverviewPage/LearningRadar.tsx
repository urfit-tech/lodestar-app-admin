import { Radar } from '@ant-design/charts'
import React from 'react'

const LearningRadar: React.FC<{ value: { name: string; rate: number }[] }> = ({ value }) => {
  const config = {
    data: value,
    xField: 'name',
    yField: 'rate',
    meta: {
      rate: {
        alias: '完課率',
        min: 0,
        nice: true,
      },
    },
    xAxis: {
      line: null,
      tickLine: null,
    },
    yAxis: {
      label: false,
      grid: {
        alternateColor: 'rgba(0, 0, 0, 0.04)',
      },
    },
  }
  return <Radar {...config} />
}

export default LearningRadar
