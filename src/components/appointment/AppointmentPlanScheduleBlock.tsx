import { useMutation } from '@apollo/react-hooks'
import { Skeleton } from 'antd'
import gql from 'graphql-tag'
import moment from 'moment'
import { groupBy } from 'ramda'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import types from '../../types'
import { AppointmentPlanAdminProps } from '../../types/appointment'
import { EmptyBlock } from '../admin'
import AppointmentPeriodCollection from './AppointmentPeriodCollection'

const messages = defineMessages({
  noPeriodCreated: { id: 'appointment.text.noPeriodCreated', defaultMessage: '目前還沒有建立任何時段' },
})

const AppointmentPlanScheduleBlock: React.FC<{
  appointmentPlanAdmin: AppointmentPlanAdminProps | null
  onRefetch?: () => void
}> = ({ appointmentPlanAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()

  const [updateAppointmentSchedule] = useMutation<
    types.UPDATE_APPOINTMENT_SCHEDULE,
    types.UPDATE_APPOINTMENT_SCHEDULEVariables
  >(UPDATE_APPOINTMENT_SCHEDULE)
  const [deleteAppointmentSchedule] = useMutation<
    types.DELETE_APPOINTMENT_SCHEDULE,
    types.DELETE_APPOINTMENT_SCHEDULEVariables
  >(DELETE_APPOINTMENT_SCHEDULE)

  if (!appointmentPlanAdmin) {
    return <Skeleton active />
  }

  if (appointmentPlanAdmin.periods.length === 0) {
    return <EmptyBlock>{formatMessage(messages.noPeriodCreated)}</EmptyBlock>
  }

  const handleDelete = (scheduleId: string) =>
    deleteAppointmentSchedule({
      variables: {
        appointmentScheduleId: scheduleId,
      },
    })
      .then(() => onRefetch?.())
      .catch(handleError)

  const handleClose = (scheduleId: string, startedAt: Date) => {
    const targetSchedule = appointmentPlanAdmin.schedules.find(schedule => schedule.id === scheduleId)
    if (!targetSchedule) {
      return
    }

    const isReopenedPeriod = targetSchedule.excludes.includes(startedAt.getTime())
    const excludes: number[] = isReopenedPeriod
      ? targetSchedule.excludes.filter(exclude => exclude !== startedAt.getTime())
      : [...targetSchedule.excludes, startedAt.getTime()].sort()

    return updateAppointmentSchedule({
      variables: {
        appointmentScheduleId: targetSchedule.id,
        excludes: excludes.map(exclude => new Date(exclude).toISOString()),
      },
    })
      .then(() => onRefetch?.())
      .catch(handleError)
  }

  const periodCollections = groupBy(period => moment(period.startedAt).format('YYYYMMDD'), appointmentPlanAdmin.periods)

  return (
    <>
      {Object.values(periodCollections).map(periods => (
        <AppointmentPeriodCollection
          key={moment(periods[0].startedAt).format('YYYY-MM-DD(dd)')}
          periods={periods.map(period => ({
            id: period.id,
            schedule: period.schedule,
            startedAt: period.startedAt,
            endedAt: period.endedAt,
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

const DELETE_APPOINTMENT_SCHEDULE = gql`
  mutation DELETE_APPOINTMENT_SCHEDULE($appointmentScheduleId: uuid!) {
    delete_appointment_schedule(where: { id: { _eq: $appointmentScheduleId } }) {
      affected_rows
    }
  }
`
const UPDATE_APPOINTMENT_SCHEDULE = gql`
  mutation UPDATE_APPOINTMENT_SCHEDULE($appointmentScheduleId: uuid!, $excludes: jsonb) {
    update_appointment_schedule(where: { id: { _eq: $appointmentScheduleId } }, _set: { excludes: $excludes }) {
      affected_rows
    }
  }
`

export default AppointmentPlanScheduleBlock
