import { FileAddOutlined } from '@ant-design/icons'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { Button, Form, Select } from 'antd'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { appointmentMessages, commonMessages } from '../../helpers/translation'
import { INSERT_APPOINTMENT_SCHEDULES } from '../../hooks/appointment'
import { AppointmentPlanAdmin, AppointmentSchedule } from '../../types/appointment'
import { PeriodType } from '../../types/general'
import AdminModal from '../admin/AdminModal'

const messages = defineMessages({
  noAvailableSchedule: { id: 'appointment.text.noAvailableSchedule', defaultMessage: '沒有可匯入的時段' },
  repeatEveryDay: { id: 'appointment.text.repeatEveryDay', defaultMessage: '重複週期：每日' },
  repeatEveryWeek: { id: 'appointment.text.repeatEveryWeek', defaultMessage: '重複週期：每週' },
  repeatEveryMonth: { id: 'appointment.text.repeatEveryMonth', defaultMessage: '重複週期：每月' },
  repeatEveryYear: { id: 'appointment.text.repeatEveryYear', defaultMessage: '重複週期：每年' },
  isExisted: { id: 'appointment.label.isExisted', defaultMessage: '已匯入' },
})

const StyledText = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
`
const StyledSchedule = styled.span<{ isExisted: boolean }>`
  ${props => (props.isExisted ? 'text-decoration: line-through;' : '')}
`

type OverLappingSchedule = Pick<
  AppointmentSchedule,
  'id' | 'startedAt' | 'intervalAmount' | 'intervalType' | 'excludes'
> & {
  isExisted: boolean
}

type AppointmentPlanImporting = {
  id: string
  title: string
  creator: {
    id: string
    name: string
  }
  schedules: OverLappingSchedule[]
}

const isScheduleOverlapping = (scheduleA: OverLappingSchedule, scheduleB: Omit<OverLappingSchedule, 'isExisted'>) =>
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
  appointmentPlanAdmin: AppointmentPlanAdmin
  creatorId?: string | null
  onRefetch?: () => void
}> = ({ appointmentPlanAdmin, creatorId, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { refetch, loadingAppointmentPlans, appointmentPlans } = useAppointmentPlansWithSchedules(
    appointmentPlanAdmin,
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

  const handleSubmit = (onSuccess: () => void) => {
    const schedules = appointmentPlans.find(appointmentPlan => appointmentPlan.id === selectedPlanId)?.schedules || []
    if (!schedules.length) {
      return
    }

    setLoading(true)
    insertAppointmentSchedules({
      variables: {
        data: schedules.map(schedule => ({
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
        <Button
          icon={<FileAddOutlined />}
          onClick={() => {
            refetch()
            setVisible(true)
          }}
        >
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

      {selectedPlanId && (
        <ul>
          {appointmentPlans
            .find(plan => plan.id === selectedPlanId)
            ?.schedules.map(schedule => (
              <li key={schedule.id}>
                <StyledSchedule isExisted={schedule.isExisted}>
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
                </StyledSchedule>
                {schedule.isExisted && <span className="ml-2">{formatMessage(messages.isExisted)}</span>}
              </li>
            )) || null}
        </ul>
      )}
    </AdminModal>
  )
}

const useAppointmentPlansWithSchedules = (currentPlan: AppointmentPlanAdmin, creatorId?: string | null) => {
  const [{ now, startedAt }] = useState<{
    now: Date
    startedAt: Date
  }>({
    now: moment().endOf('minute').toDate(),
    startedAt: moment().subtract(3, 'months').startOf('minute').toDate(),
  })
  const condition: hasura.GET_APPOINTMENT_PLAN_SCHEDULESVariables['condition'] = {
    id: { _neq: currentPlan.id },
    creator_id: creatorId ? { _eq: creatorId } : undefined,
    published_at: { _is_null: false },
  }

  const [getAppointmentPlanSchedules, { loading, data }] = useLazyQuery<
    hasura.GET_APPOINTMENT_PLAN_SCHEDULES,
    hasura.GET_APPOINTMENT_PLAN_SCHEDULESVariables
  >(
    gql`
      query GET_APPOINTMENT_PLAN_SCHEDULES(
        $condition: appointment_plan_bool_exp!
        $now: timestamptz!
        $startedAt: timestamptz!
      ) {
        appointment_plan(where: { _and: [$condition] }) {
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
                {
                  interval_amount: { _is_null: false }
                  interval_type: { _is_null: false }
                  started_at: { _gte: $startedAt }
                }
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
  )

  const appointmentPlans: AppointmentPlanImporting[] =
    data?.appointment_plan.map(v => ({
      id: v.id,
      title: v.title || '',
      creator: {
        id: v.creator?.id || '',
        name: v.creator?.name || v.creator?.username || '',
      },
      schedules: v.appointment_schedules.map(s => ({
        id: s.id,
        startedAt: new Date(s.started_at),
        intervalAmount: s.interval_amount || null,
        intervalType: s.interval_type as PeriodType | null,
        excludes: s.excludes.map((e: string) => new Date(e)),
        isExisted: false,
      })),
    })) || []

  return {
    refetch: () =>
      getAppointmentPlanSchedules({
        variables: { condition, now, startedAt },
      }),
    loadingAppointmentPlans: loading,
    appointmentPlans: appointmentPlans
      .filter(appointmentPlan => appointmentPlan.schedules.length > 0)
      .map(appointmentPlan => ({
        ...appointmentPlan,
        schedules: appointmentPlan.schedules.map(schedule => ({
          ...schedule,
          isExisted: currentPlan.schedules.some(currentSchedule =>
            schedule.intervalType === null
              ? schedule.startedAt.getTime() === currentSchedule.startedAt.getTime()
              : isScheduleOverlapping(schedule, currentSchedule),
          ),
        })),
      }))
      .filter(appointmentPlan => appointmentPlan.schedules.length),
  }
}

export default AppointmentScheduleImportModal
