import gql from 'graphql-tag'
import moment from 'moment'
import { groupBy } from 'ramda'
import React, { useContext } from 'react'
import AppointmentPeriodCollection, {
  ClosePeriodEvent,
  DeleteScheduleEvent,
  EmptyBlock,
} from '../../components/appointment/AppointmentPeriodCollection'
import AppointmentPlanContext from './AppointmentPlanContext'

const AppointmentPlanScheduleBlock: React.FC = () => {
  const { appointmentPlan } = useContext(AppointmentPlanContext)

  if (!appointmentPlan || appointmentPlan.periods.length === 0) {
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
    period => Math.floor(period.startedAt.getTime() / 86400000).toString(),
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

const UPDATE_APPOINTMENT_SCHEDULE = gql`
  mutation UPDATE_APPOINTMENT_SCHEDULE(
    $appointmentScheduleId: uuid!
    $startedAt: timestamptz!
    $intervalType: String
    $intervalAmount: Int
    $excludes: jsonb
  ) {
    update_appointment_schedule(
      where: { id: { _eq: $appointmentScheduleId } }
      _set: {
        started_at: $startedAt
        interval_type: $intervalType
        interval_amount: $intervalAmount
        excludes: $excludes
      }
    ) {
      affected_rows
    }
  }
`
const DELETE_APPOINTMENT_SCHEDULE = gql`
  mutation DELETE_APPOINTMENT_SCHEDULE($appointmentScheduleId: uuid!) {
    delete_appointment_schedule(where: { id: { _eq: $appointmentScheduleId } }) {
      affected_rows
    }
  }
`

export default AppointmentPlanScheduleBlock
