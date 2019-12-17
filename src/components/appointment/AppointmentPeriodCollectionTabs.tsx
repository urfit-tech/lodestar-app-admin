import { Tabs } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import AppointmentPeriodCard, { AppointmentPeriodCardProps } from './AppointmentPeriodCard'

const StyledTabs = styled(Tabs)`
  && {
    overflow: visible;
  }
`

const AppointmentPeriodCollectionTabs: React.FC<{
  periods: AppointmentPeriodCardProps[]
}> = ({ periods }) => {
  const [activeKey, setActiveKey] = useQueryParam('tabkey', StringParam)

  return (
    <StyledTabs defaultActiveKey="scheduled" activeKey={activeKey || 'scheduled'} onChange={key => setActiveKey(key)}>
      <Tabs.TabPane tab="即將舉行" key="scheduled">
        <div className="py-5">
          {periods
            .filter(period => period.endedAt.getTime() > Date.now())
            .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime())
            .map(period => (
              <AppointmentPeriodCard key={period.id} {...period} />
            ))}
        </div>
      </Tabs.TabPane>
      <Tabs.TabPane tab="已結束" key="finished">
        <div className="py-5">
          {periods
            .filter(period => period.endedAt.getTime() < Date.now())
            .sort((a, b) => b.endedAt.getTime() - a.endedAt.getTime() || b.startedAt.getTime() - a.startedAt.getTime())
            .map(period => (
              <AppointmentPeriodCard key={period.id} {...period} />
            ))}
        </div>
      </Tabs.TabPane>
    </StyledTabs>
  )
}

export default AppointmentPeriodCollectionTabs
