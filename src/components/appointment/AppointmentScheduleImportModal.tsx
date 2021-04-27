import { FileAddOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Form, Select } from 'antd'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { appointmentMessages, commonMessages } from '../../helpers/translation'
import { INSERT_APPOINTMENT_SCHEDULES } from '../../hooks/appointment'
import { AppointmentPlanAdminProps, AppointmentScheduleProps } from '../../types/appointment'
import { PeriodType } from '../../types/general'
import AdminModal from '../admin/AdminModal'

const messages = defineMessages({
  noAvailableSchedule: { id: 'appointment.text.noAvailableSchedule', defaultMessage: '沒有可匯入的時段' },
  repeatEveryDay: { id: 'appointment.text.repeatEveryDay', defaultMessage: '重複週期：每日' },
  repeatEveryWeek: { id: 'appointment.text.repeatEveryWeek', defaultMessage: '重複週期：每週' },
  repeatEveryMonth: { id: 'appointment.text.repeatEveryMonth', defaultMessage: '重複週期：每月' },
  repeatEveryYear: { id: 'appointment.text.repeatEveryYear', defaultMessage: '重複週期：每年' },
})

const StyledText = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
`

type AppointmentPlanImportingProps = {
  id: string
  title: string
  creator: {
    id: string
    name: string
  }
  schedules: AppointmentScheduleProps[]
}

const isScheduleOverlapping = (scheduleA: AppointmentScheduleProps, scheduleB: AppointmentScheduleProps) =>
  scheduleA.intervalType === scheduleB.intervalType &&
  scheduleA.intervalAmount === scheduleB.intervalAmount &&
  Number.isInteger(
    moment(scheduleA.startedAt).diff(
      scheduleB.startedAt,
      scheduleA.intervalType === 'D'
        ? 'days'
        : scheduleA.intervalType === 'W'
        ? 'weeks'
        : scheduleA.intervalType === 'M'
        ? 'months'
        : 'years',
      true,
    ),
  )

const AppointmentScheduleImportModal: React.VFC<{
  appointmentPlanAdmin: AppointmentPlanAdminProps
  creatorId?: string | null
  onRefetch?: () => void
}> = ({ appointmentPlanAdmin, creatorId, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { loadingAppointmentPlans, appointmentPlans } = useAppointmentPlansWithSchedules(
    appointmentPlanAdmin.id,
    creatorId,
  )
  const [insertAppointmentSchedules] = useMutation<
    hasura.INSERT_APPOINTMENT_SCHEDULES,
    hasura.INSERT_APPOINTMENT_SCHEDULESVariables
  >(INSERT_APPOINTMENT_SCHEDULES)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (loadingAppointmentPlans) {
    return (
      <Button icon={<FileAddOutlined />} disabled>
        {formatMessage(appointmentMessages.ui.importPeriod)}
      </Button>
    )
  }

  const uniqSchedules =
    appointmentPlans
      .find(plan => plan.id === selectedPlanId)
      ?.schedules.filter(schedule =>
        appointmentPlanAdmin.schedules.every(currentSchedule =>
          schedule.intervalType === null
            ? schedule.startedAt.getTime() !== currentSchedule.startedAt.getTime()
            : !isScheduleOverlapping(schedule, currentSchedule),
        ),
      ) || []

  const handleSubmit = (onSuccess: () => void) => {
    setLoading(true)

    if (!uniqSchedules.length) {
      setLoading(false)
      return
    }

    insertAppointmentSchedules({
      variables: {
        data: uniqSchedules.map(schedule => ({
          appointment_plan_id: appointmentPlanAdmin.id,
          started_at: schedule.startedAt,
          interval_amount: schedule.intervalAmount,
          interval_type: schedule.intervalType,
          excludes: schedule.excludes.map(exclude => exclude.toISOString()),
        })),
      },
    })
      .then(() => {
        setSelectedPlanId(null)
        onSuccess()
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
          {formatMessage(appointmentMessages.ui.importPeriod)}
        </Button>
      )}
      title={<div className="mb-3">{formatMessage(appointmentMessages.ui.importPeriod)}</div>}
      maskClosable={false}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button
            className="mr-2"
            onClick={() => {
              setVisible(false)
              setSelectedPlanId(null)
            }}
          >
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(() => setVisible(false))}>
            {formatMessage(commonMessages.ui.import)}
          </Button>
        </>
      )}
    >
      <StyledText className="mb-4">{formatMessage(appointmentMessages.text.scheduleImportNotation)}</StyledText>
      <Form layout="vertical">
        <Form.Item label={formatMessage(appointmentMessages.label.selectPlan)}>
          <Select<string>
            placeholder={formatMessage(appointmentMessages.text.selectImportedSchedule)}
            showSearch
            onSelect={id => setSelectedPlanId(id)}
          >
            {appointmentPlans.map(appointmentPlan => (
              <Select.Option key={appointmentPlan.id} value={appointmentPlan.id}>
                {creatorId ? appointmentPlan.title : `${appointmentPlan.creator.name} - ${appointmentPlan.title}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>

      {!selectedPlanId ? null : uniqSchedules.length === 0 ? (
        <div>{formatMessage(messages.noAvailableSchedule)}</div>
      ) : (
        <ul>
          {uniqSchedules.map(schedule => (
            <li key={schedule.id}>
              <span>{moment(schedule.startedAt).format('YYYY-MM-DD(dd) HH:mm')}</span>
              <StyledText className="d-inline ml-2">
                {schedule.intervalType === 'D'
                  ? formatMessage(messages.repeatEveryDay)
                  : schedule.intervalType === 'W'
                  ? formatMessage(messages.repeatEveryWeek)
                  : schedule.intervalType === 'M'
                  ? formatMessage(messages.repeatEveryMonth)
                  : schedule.intervalType === 'Y'
                  ? formatMessage(messages.repeatEveryYear)
                  : null}
              </StyledText>
            </li>
          ))}
        </ul>
      )}
    </AdminModal>
  )
}

const useAppointmentPlansWithSchedules = (currentPlanId: string, creatorId?: string | null) => {
  const condition: hasura.GET_APPOINTMENT_PLAN_SCHEDULESVariables['condition'] = {
    id: { _neq: currentPlanId },
    creator_id: creatorId ? { _eq: creatorId } : undefined,
    published_at: { _is_null: false },
  }

  const { loading, data } = useQuery<
    hasura.GET_APPOINTMENT_PLAN_SCHEDULES,
    hasura.GET_APPOINTMENT_PLAN_SCHEDULESVariables
  >(
    gql`
      query GET_APPOINTMENT_PLAN_SCHEDULES($condition: appointment_plan_bool_exp!, $now: timestamptz!) {
        appointment_plan(where: $condition) {
          id
          title
          creator {
            id
            name
            username
          }
          appointment_schedules(
            where: {
              _or: [
                { interval_amount: { _is_null: false }, interval_type: { _is_null: false } }
                { started_at: { _gte: $now } }
              ]
            }
            order_by: [{ started_at: asc }]
          ) {
            id
            started_at
            interval_amount
            interval_type
            excludes
          }
        }
      }
    `,
    {
      variables: {
        condition,
        now: moment().endOf('minute').toDate(),
      },
    },
  )

  const appointmentPlans: AppointmentPlanImportingProps[] =
    data?.appointment_plan.map(v => ({
      id: v.id,
      title: v.title,
      creator: {
        id: v.creator?.id || '',
        name: v.creator?.name || v.creator?.username || '',
      },
      schedules: v.appointment_schedules.map(s => ({
        id: s.id,
        startedAt: new Date(s.started_at),
        intervalAmount: s.interval_amount,
        intervalType: s.interval_type as PeriodType | null,
        excludes: s.excludes.map((e: string) => new Date(e)),
      })),
    })) || []

  return {
    loadingAppointmentPlans: loading,
    appointmentPlans,
  }
}

export default AppointmentScheduleImportModal
