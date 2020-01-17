import { useMutation } from '@apollo/react-hooks'
import { Skeleton } from 'antd'
import gql from 'graphql-tag'
import moment from 'moment'
import { groupBy } from 'ramda'
import React, { useContext } from 'react'
import AppointmentPeriodCollection, {
  ClosePeriodEvent,
  DeleteScheduleEvent,
  EmptyBlock,
} from '../../components/appointment/AppointmentPeriodCollection'
import AppointmentPlanContext from '../../contexts/AppointmentPlanContext'
import types from '../../types'

const AppointmentPlanScheduleBlock: React.FC = () => {
  const { loadingAppointmentPlan, appointmentPlan, refetchAppointmentPlan } = useContext(AppointmentPlanContext)
  const [updateAppointmentSchedule] = useMutation<
    types.UPDATE_APPOINTMENT_SCHEDULE,
    types.UPDATE_APPOINTMENT_SCHEDULEVariables
  >(UPDATE_APPOINTMENT_SCHEDULE)
  const [deleteAppointmentSchedule] = useMutation<
    types.DELETE_APPOINTMENT_SCHEDULE,
    types.DELETE_APPOINTMENT_SCHEDULEVariables
  >(DELETE_APPOINTMENT_SCHEDULE)

  if (loadingAppointmentPlan || !appointmentPlan) {
    return <Skeleton />
  }

  if (appointmentPlan.periods.length === 0) {
    return <EmptyBlock>目前還沒有建立任何時段</EmptyBlock>
  }

  const handleDelete: (event: DeleteScheduleEvent) => void = ({ values, onSuccess, onError, onFinally }) => {
    deleteAppointmentSchedule({
      variables: {
        appointmentScheduleId: values.scheduleId,
      },
    })
      .then(() => {
        refetchAppointmentPlan && refetchAppointmentPlan()
        onSuccess && onSuccess()
      })
      .catch(error => onError && onError(error))
      .finally(() => onFinally && onFinally())
  }

  const handleClose: (event: ClosePeriodEvent) => void = ({ values, onSuccess, onError, onFinally }) => {
    const targetSchedule = appointmentPlan.schedules.find(schedule => schedule.id === values.scheduleId)
    if (!targetSchedule) {
      return
    }

    const isReopenedPeriod = targetSchedule.excludes.includes(values.startedAt.getTime())
    const excludes: number[] = isReopenedPeriod
      ? targetSchedule.excludes.filter(exclude => exclude !== values.startedAt.getTime())
      : [...targetSchedule.excludes, values.startedAt.getTime()].sort()

    updateAppointmentSchedule({
      variables: {
        appointmentScheduleId: targetSchedule.id,
        excludes: excludes.map(exclude => new Date(exclude).toISOString()),
      },
    })
      .then(() => {
        refetchAppointmentPlan && refetchAppointmentPlan()
        onSuccess && onSuccess()
      })
      .catch(error => onError && onError(error))
      .finally(() => onFinally && onFinally())
  }

  const periodCollections = groupBy(period => moment(period.startedAt).format('YYYYMMDD'), appointmentPlan.periods)

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
  mutation UPDATE_APPOINTMENT_SCHEDULE($appointmentScheduleId: uuid!, $excludes: jsonb) {
    update_appointment_schedule(where: { id: { _eq: $appointmentScheduleId } }, _set: { excludes: $excludes }) {
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
