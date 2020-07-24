import { Select, Tabs } from 'antd'
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
  allInstructors: { id: 'appointment.label.allInstructors', defaultMessage: '全部老師' },
  emptyAppointment: { id: 'appointment.ui.emptyAppointment', defaultMessage: '目前還沒有任何預約' },
})

const AppointmentPeriodCollectionTabs: React.FC<{
  periods: AppointmentPeriodProps[]
  withSelector?: boolean
  onRefetch?: () => void
}> = ({ periods, withSelector, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const [selectedCreatorId, setSelectedCreatorId] = useState('')

  const creators = uniqBy(
    creator => creator.id,
    periods.map(period => period.creator),
  )
  const filteredPeriods = periods.filter(period => !selectedCreatorId || period.creator.id === selectedCreatorId)
  const tabContents = [
    {
      key: 'scheduled',
      tab: formatMessage(appointmentMessages.status.aboutToStart),
      periods: filteredPeriods
        .filter(period => period.endedAt.getTime() > Date.now() && !period.canceledAt)
        .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime()),
    },
    {
      key: 'canceled',
      tab: formatMessage(appointmentMessages.status.canceled),
      periods: filteredPeriods
        .filter(period => period.canceledAt)
        .sort((a, b) => b.endedAt.getTime() - a.endedAt.getTime() || b.startedAt.getTime() - a.startedAt.getTime()),
    },
    {
      key: 'finished',
      tab: formatMessage(appointmentMessages.status.finished),
      periods: filteredPeriods
        .filter(period => period.endedAt.getTime() < Date.now() && !period.canceledAt)
        .sort((a, b) => b.endedAt.getTime() - a.endedAt.getTime() || b.startedAt.getTime() - a.startedAt.getTime()),
    },
  ]

  return (
    <StyledTabs activeKey={activeKey || 'scheduled'} onChange={key => setActiveKey(key)}>
      {tabContents.map(tabContent => (
        <Tabs.TabPane key={tabContent.key} tab={tabContent.tab}>
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

            {tabContent.periods.length > 0 ? (
              tabContent.periods.map(period => (
                <AppointmentPeriodCard key={period.orderProduct.id} {...period} onRefetch={onRefetch} />
              ))
            ) : (
              <EmptyBlock>{formatMessage(messages.emptyAppointment)}</EmptyBlock>
            )}
          </div>
        </Tabs.TabPane>
      ))}
    </StyledTabs>
  )
}

export default AppointmentPeriodCollectionTabs
