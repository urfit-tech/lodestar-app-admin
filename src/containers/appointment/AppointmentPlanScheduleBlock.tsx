import moment from 'moment'
import groupBy from 'ramda/es/groupBy'
import React, { useContext } from 'react'
import AppointmentPeriodCollection, {
  DeleteSessionEvent,
  EmptyBlock,
} from '../../components/appointment/AppointmentPeriodCollection'
import AppointmentPlanContext from './AppointmentPlanContext'

const AppointmentPlanScheduleBlock: React.FC = () => {
  const { appointmentPlan } = useContext(AppointmentPlanContext)

  if (!appointmentPlan) {
    return null
  }

  const handleDelete: DeleteSessionEvent = ({ id }) => {
    console.log(`delete appointment session: ${id}`)
  }

  const periodCollections = groupBy(
    period => `${period.startedAt.getFullYear()}${period.startedAt.getMonth() + 1}${period.startedAt.getDate()}`,
    appointmentPlan.periods,
  )

  return (
    <>
      {appointmentPlan.periods.length === 0 ? (
        <EmptyBlock>目前還沒有建立任何時段</EmptyBlock>
      ) : (
        Object.values(periodCollections).map(periods => (
          <AppointmentPeriodCollection
            key={moment(periods[0].startedAt).format('YYYY-MM-DD(dd)')}
            periods={periods.map(period => ({
              id: period.id,
              startedAt: period.startedAt,
              isEnrolled: period.isEnrolled,
              isExcluded: period.isExcluded,
              onDelete: handleDelete,
            }))}
          />
        ))
      )}
    </>
  )
}

export default AppointmentPlanScheduleBlock
