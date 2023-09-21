import { Button, Skeleton } from 'antd'
import moment from 'moment'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { EmptyBlock } from '../../components/admin'
import AppointmentPeriodCard from '../../components/appointment/AppointmentPeriodCard'
import { useAppointmentEnrollmentCollection } from '../../hooks/appointment'
import pageMessages from '../translation'

const StyledDateRangeWarning = styled.div`
  padding: 12.5rem 0;
  color: var(--gray-dark);
  font-size: 16px;
  text-align: center;
`

const AppointmentPlanPeriodTabContent: React.FC<{
  tabKey: 'scheduled' | 'canceled' | 'finished'
  selectedCreatorId: string
  startedAt: Date | null
  endedAt: Date | null
}> = ({ tabKey, selectedCreatorId, startedAt, endedAt }) => {
  const { formatMessage } = useIntl()

  const {
    loading: loadingAppointmentEnrollments,
    error: errorAppointmentEnrollments,
    appointmentEnrollments,
    refetch: refetchEnrolledAppointments,
    loadMoreAppointmentEnrollments,
  } = useAppointmentEnrollmentCollection(tabKey, selectedCreatorId, startedAt, endedAt)
  const [isLoading, setIsLoading] = useState(false)

  if (moment(endedAt).diff(moment(startedAt), 'months') >= 1) {
    return (
      <StyledDateRangeWarning>
        {formatMessage(pageMessages.AppointmentPeriodCollectionAdminPage.dateRangeWarning)}
      </StyledDateRangeWarning>
    )
  }

  if (errorAppointmentEnrollments) {
    return (
      <div className="d-flex justify-content-center algin-items-center">
        {formatMessage(pageMessages['*'].fetchDataError)}
      </div>
    )
  }

  if (loadingAppointmentEnrollments) {
    return <Skeleton active />
  }

  if (appointmentEnrollments.length === 0) {
    return <EmptyBlock>{formatMessage(pageMessages.AppointmentPeriodCollectionAdminPage.emptyAppointment)}</EmptyBlock>
  }

  return (
    <>
      {appointmentEnrollments.map(v => (
        <AppointmentPeriodCard
          key={v.id}
          id={v.id}
          avatarUrl={v.avatarUrl}
          member={v.member}
          appointmentPlanTitle={v.appointmentPlanTitle}
          startedAt={v.startedAt}
          endedAt={v.endedAt}
          canceledAt={v.canceledAt}
          creator={v.creator}
          orderProduct={v.orderProduct}
          onRefetch={refetchEnrolledAppointments}
          meetGenerationMethod={v.meetGenerationMethod}
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
            {formatMessage(pageMessages['*'].showMore)}
          </Button>
        </div>
      )}
    </>
  )
}

export default AppointmentPlanPeriodTabContent
