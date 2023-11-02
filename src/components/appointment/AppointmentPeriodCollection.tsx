import { Button } from 'antd'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { appointmentMessages, commonMessages } from '../../helpers/translation'
import { useService } from '../../hooks/service'
import { AppointmentPeriod, AppointmentSchedule } from '../../types/appointment'
import AdminModal from '../admin/AdminModal'
import AppointmentPeriodItem from './AppointmentPeriodItem'

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-bottom: 2rem;
`
const StyledTitle = styled.div`
  margin-bottom: 1.5rem;
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledModalDescription = styled.div`
  color: var(--gray-darker);
  line-height: 1.5;
  letter-spacing: 0.2px;
`
const StyledModalMeta = styled.div`
  font-size: 14px;
  color: var(--gray-dark);
  letter-spacing: 0.4px;
`

const messages = defineMessages({
  editPeriod: { id: 'appointment.ui.editPeriod', defaultMessage: '編輯時段' },
  repetitiveMeta: { id: 'appointment.warning.repetitiveMeta', defaultMessage: '※重複週期為' },
  singlePeriod: { id: 'appointment.label.singlePeriod', defaultMessage: '時段' },
  seriesPeriod: { id: 'appointment.label.seriesPeriod', defaultMessage: '重複週期' },
  single: { id: 'appointment.ui.single', defaultMessage: '單一' },
  open: { id: 'appointment.ui.open', defaultMessage: '開啟' },
  close: { id: 'appointment.ui.close', defaultMessage: '關閉' },
})

type AppointmentPeriodCollectionProps = {
  appointmentPlan: {
    id: string
    capacity: number
    defaultMeetGateway: string
    creatorId: string
  }
  periods: (Pick<AppointmentPeriod, 'appointmentScheduleId' | 'startedAt' | 'endedAt'> & {
    schedule: Pick<AppointmentSchedule, 'id' | 'startedAt' | 'intervalAmount' | 'intervalType' | 'excludes'> | null
    isEnrolled?: boolean
    isExcluded?: boolean
  })[]
  onDelete?: (scheduleId: string) => Promise<any>
  onClose?: (scheduleId: string, startedAt: Date) => Promise<any> | undefined
}

const AppointmentPeriodCollection: React.FC<AppointmentPeriodCollectionProps> = ({
  appointmentPlan,
  periods,
  onDelete,
  onClose,
}) => {
  const { formatMessage } = useIntl()
  const { loading: loadingServices, services } = useService()
  const [visible, setVisible] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<AppointmentPeriodCollectionProps['periods'][number] | null>(null)

  return (
    <>
      <StyledTitle>{periods.length > 0 && moment(periods[0].startedAt).format('YYYY-MM-DD(dd)')}</StyledTitle>

      <StyledWrapper>
        {periods.map((period, index) => (
          <AppointmentPeriodItem
            key={`${appointmentPlan.id}-${index}`}
            creatorId={appointmentPlan.creatorId}
            appointmentPlan={{
              id: appointmentPlan.id,
              capacity: appointmentPlan.capacity,
              defaultMeetGateway: appointmentPlan.defaultMeetGateway,
            }}
            period={{
              startedAt: period.startedAt,
              endedAt: period.endedAt,
            }}
            services={services}
            loadingServices={loadingServices}
            isPeriodExcluded={period.isExcluded}
            isEnrolled={period.isEnrolled}
            onClick={() => {
              if (!period.isEnrolled) {
                setSelectedPeriod(period)
                setVisible(true)
              }
            }}
          />
        ))}
      </StyledWrapper>

      <AdminModal
        visible={visible}
        onCancel={() => setVisible(false)}
        title={formatMessage(messages.editPeriod)}
        footer={null}
        renderFooter={() => (
          <div className="row pt-4">
            <div className="col-6">
              {selectedPeriod && (
                <Button
                  danger
                  block
                  onClick={() =>
                    onDelete?.(selectedPeriod.appointmentScheduleId).then(() => {
                      setVisible(false)
                      setSelectedPeriod(null)
                    })
                  }
                >
                  {formatMessage(commonMessages.ui.delete)}
                  {selectedPeriod.schedule?.intervalType !== null
                    ? formatMessage(messages.seriesPeriod)
                    : formatMessage(messages.singlePeriod)}
                </Button>
              )}
            </div>
            <div className="col-6">
              {selectedPeriod && (
                <Button
                  block
                  onClick={() =>
                    onClose &&
                    onClose(selectedPeriod.appointmentScheduleId, selectedPeriod.startedAt)?.then(() => {
                      setVisible(false)
                      setSelectedPeriod(null)
                    })
                  }
                >
                  {selectedPeriod.isExcluded ? formatMessage(messages.open) : formatMessage(messages.close)}
                  {selectedPeriod.schedule?.intervalType !== null && formatMessage(messages.single)}
                  {formatMessage(appointmentMessages.label.period)}
                </Button>
              )}
            </div>
          </div>
        )}
      >
        {selectedPeriod && (
          <StyledModalDescription className="mb-2">
            {moment(selectedPeriod.startedAt).format('YYYY-MM-DD(dd) HH:mm')}
          </StyledModalDescription>
        )}
        {selectedPeriod?.schedule?.intervalType && selectedPeriod.schedule.intervalAmount && (
          <StyledModalMeta className="mb-2">
            {formatMessage(messages.repetitiveMeta)}
            {selectedPeriod.schedule.intervalType === 'Y'
              ? formatMessage(commonMessages.label.perYear)
              : selectedPeriod.schedule.intervalType === 'M'
              ? formatMessage(commonMessages.label.perMonth)
              : selectedPeriod.schedule.intervalType === 'W'
              ? formatMessage(commonMessages.label.perWeek)
              : selectedPeriod.schedule.intervalType === 'D'
              ? formatMessage(commonMessages.label.perDay)
              : ''}
          </StyledModalMeta>
        )}
      </AdminModal>
    </>
  )
}

export default AppointmentPeriodCollection
