import Icon from '@ant-design/icons'
import { Button, DatePicker, Input, Select, Skeleton, Tabs } from 'antd'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminPageTitle, EmptyBlock } from '../../components/admin'
import AppointmentPeriodCard from '../../components/appointment/AppointmentPeriodCard'
import AdminLayout from '../../components/layout/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'
import { appointmentMessages, commonMessages } from '../../helpers/translation'
import { useAppointmentEnrollmentCollection, useAppointmentEnrollmentCreator } from '../../hooks/appointment'
import { ReactComponent as CalendarAltOIcon } from '../../images/icon/calendar-alt-o.svg'

const StyledFilterBlock = styled.div`
  margin-bottom: 2rem;
`

const messages = defineMessages({
  allInstructors: { id: 'appointment.label.allInstructors', defaultMessage: '全部老師' },
  emptyAppointment: { id: 'appointment.ui.emptyAppointment', defaultMessage: '目前還沒有任何預約' },
})

const AppointmentPeriodCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentUserRole } = useAuth()
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const [endedAt, setEndedAt] = useState<Date | null>(null)
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>('')
  const { appointmentCreators } = useAppointmentEnrollmentCreator()

  const tabConditions = [
    {
      key: 'scheduled',
      tab: formatMessage(appointmentMessages.status.aboutToStart),
      isCanceled: false,
      isFinished: false,
    },
    {
      key: 'canceled',
      tab: formatMessage(appointmentMessages.status.canceled),
      isCanceled: true,
    },
    {
      key: 'finished',
      tab: formatMessage(appointmentMessages.status.finished),
      isCanceled: false,
      isFinished: true,
    },
  ]

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <CalendarAltOIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.appointments)}</span>
      </AdminPageTitle>

      <StyledFilterBlock className="d-flex">
        {currentUserRole === 'app-owner' && (
          <Select<string>
            value={selectedCreatorId}
            onChange={(value: string) => setSelectedCreatorId?.(value)}
            className="mr-3"
            style={{ width: '100%', maxWidth: '15rem' }}
          >
            <Select.Option value="">{formatMessage(messages.allInstructors)}</Select.Option>
            {appointmentCreators.map(v => (
              <Select.Option value={v.id}>{v.name}</Select.Option>
            ))}
          </Select>
        )}

        <Input.Group compact>
          <DatePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
            placeholder={formatMessage(commonMessages.term.startedAt)}
            value={startedAt && moment(startedAt)}
            onChange={value => setStartedAt(value && value.startOf('minute').toDate())}
          />
          <DatePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm', defaultValue: moment('23:59:00', 'HH:mm:ss') }}
            placeholder={formatMessage(commonMessages.term.endedAt)}
            value={endedAt && moment(endedAt)}
            onChange={value => setEndedAt(value && value.startOf('minute').toDate())}
          />
        </Input.Group>
      </StyledFilterBlock>

      <Tabs>
        {tabConditions.map(v => (
          <Tabs.TabPane key={v.key} tab={v.tab}>
            <div className="py-4">
              <AppointmentPlanPeriodTabContent
                selectedCreatorId={selectedCreatorId}
                startedAt={startedAt}
                endedAt={endedAt}
                isFinished={v.isFinished}
                isCanceled={v.isCanceled}
              />
            </div>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

const AppointmentPlanPeriodTabContent: React.FC<{
  selectedCreatorId: string
  startedAt: Date | null
  endedAt: Date | null
  isCanceled: boolean
  isFinished?: boolean
}> = ({ selectedCreatorId, startedAt, endedAt, isCanceled, isFinished }) => {
  const { formatMessage } = useIntl()

  const {
    loadingAppointmentEnrollments,
    appointmentEnrollments,
    loadMoreAppointmentEnrollments,
  } = useAppointmentEnrollmentCollection(selectedCreatorId, startedAt, endedAt, isCanceled, isFinished)
  const [isLoading, setIsLoading] = useState(false)

  if (loadingAppointmentEnrollments) {
    return <Skeleton active />
  }

  if (appointmentEnrollments.length === 0) {
    return <EmptyBlock>{formatMessage(messages.emptyAppointment)}</EmptyBlock>
  }

  return (
    <>
      {appointmentEnrollments.map(v => (
        <AppointmentPeriodCard
          key={v.orderProduct.id}
          id={v.id}
          avatarUrl={v.avatarUrl}
          member={v.member}
          appointmentPlanTitle={v.appointmentPlanTitle}
          startedAt={v.startedAt}
          endedAt={v.endedAt}
          canceledAt={v.canceledAt}
          creator={v.creator}
          orderProduct={v.orderProduct}
          appointmentIssue={v.appointmentIssue}
          appointmentResult={v.appointmentResult}
        />
      ))}

      {loadMoreAppointmentEnrollments && (
        <div className="text-center mt-4">
          <Button
            loading={isLoading}
            onClick={() => {
              setIsLoading(true)
              loadMoreAppointmentEnrollments().then(() => setIsLoading(false))
            }}
          >
            {formatMessage(commonMessages.ui.showMore)}
          </Button>
        </div>
      )}
    </>
  )
}

export default AppointmentPeriodCollectionAdminPage
