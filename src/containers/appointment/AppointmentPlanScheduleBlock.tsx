import moment from 'moment'
import groupBy from 'ramda/es/groupBy'
import React, { useContext } from 'react'
import AppointmentPeriodCollection, {
  ClosePeriodEvent,
  DeleteScheduleEvent,
  EmptyBlock,
} from '../../components/appointment/AppointmentPeriodCollection'
import AppointmentPlanContext from './AppointmentPlanContext'

const AppointmentPlanScheduleBlock: React.FC = () => {
  const { appointmentPlan } = useContext(AppointmentPlanContext)

  if (!appointmentPlan) {
    return null
  }

  if (appointmentPlan.periods.length === 0) {
    return <EmptyBlock>目前還沒有建立任何時段</EmptyBlock>
  }

  const handleDelete: (event: DeleteScheduleEvent) => void = ({ values, onSuccess, onError, onFinally }) => {
    console.log('delete schedule:', values)
    onSuccess && onSuccess()
  }

  const handleClose: (event: ClosePeriodEvent) => void = ({ values, onSuccess, onError, onFinally }) => {
    console.log('close period:', values)
    onSuccess && onSuccess()
  }

  const periodCollections = groupBy(
    period => `${period.startedAt.getFullYear()}${period.startedAt.getMonth() + 1}${period.startedAt.getDate()}`,
    appointmentPlan.periods,
  )

  return (
    <>
      {Object.values(periodCollections).map(periods => (
        <AppointmentPeriodCollection
          key={moment(periods[0].startedAt).format('YYYY-MM-DD(dd)')}
          periods={periods.map(period => ({
            id: period.id,
            schedule: period.schedule,
            startedAt: period.startedAt,
            isEnrolled: period.isEnrolled,
            isExcluded: period.isExcluded,
          }))}
          onDelete={handleDelete}
          onClose={handleClose}
        />
      ))}
    </>
  )
}

export default AppointmentPlanScheduleBlock
