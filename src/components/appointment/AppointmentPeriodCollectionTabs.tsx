import { Select, Skeleton, Tabs } from 'antd'
import { uniqBy } from 'ramda'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import { appointmentMessages } from '../../helpers/translation'
import AppointmentPeriodCard, { AppointmentPeriodProps } from './AppointmentPeriodCard'

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

const messages = defineMessages({
  aboutToStart: { id: 'appointment.status.aboutToStart', defaultMessage: '即將舉行' },
  allInstructors: { id: 'appointment.label.allInstructors', defaultMessage: '全部老師' },
  emptyAppointment: { id: 'appointment.ui.emptyAppointment', defaultMessage: '目前還沒有任何預約' },
})

const AppointmentPeriodCollectionTabs: React.FC<{
  loading?: boolean
  periods: AppointmentPeriodProps[]
  withSelector?: boolean
  onRefetch?: () => void
}> = ({ loading, periods, withSelector, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [activeKey, setActiveKey] = useQueryParam('tabkey', StringParam)
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>('')

  const creators = uniqBy(
    creator => creator.id,
    periods.map(period => period.creator),
  )
  const filteredPeriods = periods.filter(period => !selectedCreatorId || period.creator.id === selectedCreatorId)
  const scheduledPeriod = filteredPeriods
    .filter(period => period.endedAt.getTime() > Date.now())
    .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime())
  const finishedPeriod = filteredPeriods
    .filter(period => period.endedAt.getTime() < Date.now())
    .sort((a, b) => b.endedAt.getTime() - a.endedAt.getTime() || b.startedAt.getTime() - a.startedAt.getTime())

  return (
    <StyledTabs activeKey={activeKey || 'scheduled'} onChange={key => setActiveKey(key)}>
      <Tabs.TabPane tab={formatMessage(messages.aboutToStart)} key="scheduled">
        <div className="py-4">
          {withSelector && (
            <StyledFilterBlock>
              <Select value={selectedCreatorId} onChange={(value: string) => setSelectedCreatorId(value)}>
                <Select.Option value="">{formatMessage(messages.allInstructors)}</Select.Option>
                {creators.map(creator => (
                  <Select.Option key={creator.id} value={creator.id}>
                    {creator.name}
                  </Select.Option>
                ))}
              </Select>
            </StyledFilterBlock>
          )}

          {loading ? (
            <Skeleton />
          ) : scheduledPeriod.length ? (
            scheduledPeriod.map(period => (
              <AppointmentPeriodCard key={period.orderProduct.id} {...period} onRefetch={onRefetch} />
            ))
          ) : (
            <EmptyBlock>{formatMessage(messages.emptyAppointment)}</EmptyBlock>
          )}
        </div>
      </Tabs.TabPane>
      <Tabs.TabPane tab={formatMessage(appointmentMessages.status.finished)} key="finished">
        <div className="py-4">
          {withSelector && (
            <StyledFilterBlock>
              <Select value={selectedCreatorId} onChange={(value: string) => setSelectedCreatorId(value)}>
                <Select.Option value="">{formatMessage(messages.allInstructors)}</Select.Option>
                {creators.map(creator => (
                  <Select.Option key={creator.id} value={creator.id}>
                    {creator.name}
                  </Select.Option>
                ))}
              </Select>
            </StyledFilterBlock>
          )}

          {loading ? (
            <Skeleton />
          ) : finishedPeriod.length ? (
            finishedPeriod.map(period => (
              <AppointmentPeriodCard key={period.orderProduct.id} {...period} onRefetch={onRefetch} />
            ))
          ) : (
            <EmptyBlock>{formatMessage(messages.emptyAppointment)}</EmptyBlock>
          )}
        </div>
      </Tabs.TabPane>
    </StyledTabs>
  )
}

export default AppointmentPeriodCollectionTabs
