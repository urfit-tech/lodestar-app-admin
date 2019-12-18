import { Select, Tabs } from 'antd'
import { uniqBy } from 'ramda'
import React, { useState } from 'react'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import AppointmentPeriodCard, { AppointmentPeriodCardProps } from './AppointmentPeriodCard'

const StyledTabs = styled(Tabs)`
  && {
    overflow: visible;
  }
`
const StyledFilterBlock = styled.div`
  margin-bottom: 2rem;
  max-width: 15rem;

  > * {
    width: 100%;
  }
`
const EmptyBlock = styled.div`
  padding: 13rem 0;
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
  text-align: center;
`

const AppointmentPeriodCollectionTabs: React.FC<{
  periods: AppointmentPeriodCardProps[]
  withSelector?: boolean
}> = ({ periods, withSelector }) => {
  const [activeKey, setActiveKey] = useQueryParam('tabkey', StringParam)
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>('')

  const creators = uniqBy(
    creator => creator.id,
    periods.map(period => period.creator),
  )
  const filteredPeriods = periods.filter(period => !selectedCreatorId || period.creator.id === selectedCreatorId)

  return (
    <StyledTabs defaultActiveKey="scheduled" activeKey={activeKey || 'scheduled'} onChange={key => setActiveKey(key)}>
      <Tabs.TabPane tab="即將舉行" key="scheduled">
        <div className="py-5">
          {withSelector && (
            <StyledFilterBlock>
              <Select value={selectedCreatorId} onChange={(value: string) => setSelectedCreatorId(value)}>
                <Select.Option value="">全部老師</Select.Option>
                {creators.map(creator => (
                  <Select.Option key={creator.id} value={creator.id}>
                    {creator.name}
                  </Select.Option>
                ))}
              </Select>
            </StyledFilterBlock>
          )}

          {filteredPeriods.length ? (
            filteredPeriods
              .filter(period => period.endedAt.getTime() > Date.now())
              .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime())
              .map(period => <AppointmentPeriodCard key={period.id} {...period} />)
          ) : (
            <EmptyBlock>目前還沒有任何預約</EmptyBlock>
          )}
        </div>
      </Tabs.TabPane>
      <Tabs.TabPane tab="已結束" key="finished">
        <div className="py-5">
          {withSelector && (
            <StyledFilterBlock>
              <Select value={selectedCreatorId} onChange={(value: string) => setSelectedCreatorId(value)}>
                <Select.Option value="">全部老師</Select.Option>
                {creators.map(creator => (
                  <Select.Option key={creator.id} value={creator.id}>
                    {creator.name}
                  </Select.Option>
                ))}
              </Select>
            </StyledFilterBlock>
          )}

          {filteredPeriods.length ? (
            filteredPeriods
              .filter(period => period.endedAt.getTime() < Date.now())
              .sort(
                (a, b) => b.endedAt.getTime() - a.endedAt.getTime() || b.startedAt.getTime() - a.startedAt.getTime(),
              )
              .map(period => <AppointmentPeriodCard key={period.id} {...period} />)
          ) : (
            <EmptyBlock>目前還沒有任何預約</EmptyBlock>
          )}
        </div>
      </Tabs.TabPane>
    </StyledTabs>
  )
}

export default AppointmentPeriodCollectionTabs
