import { Funnel, FunnelConfig } from '@ant-design/charts'
import React from 'react'
import { useIntl } from 'react-intl'
import pageMessages from '../translation'

type ProgressFunnelValue = {
  stage: string
  count: number
}
const ProgressFunnel: React.FC<{ values: ProgressFunnelValue[] }> = ({ values }) => {
  const { formatMessage } = useIntl()
  const config: FunnelConfig = {
    data: values,
    conversionTag: {
      style: {
        fontSize: 12,
      },
      offsetX: 10,
      offsetY: 0,
      formatter: datum =>
        datum
          ? formatMessage(pageMessages.ProgressFunnel.conversionRate, {
              percentage: (datum.$$percentage$$ * 100).toFixed(1),
            })
          : '',
    },
    xField: 'stage',
    yField: 'count',
    legend: false,
  }
  return <Funnel {...config} />
}

export default ProgressFunnel
