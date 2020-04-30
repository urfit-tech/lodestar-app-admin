import { Button } from 'antd'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { appointmentMessages, commonMessages } from '../../helpers/translation'
import AdminModal from '../admin/AdminModal'
import AppointmentPeriodItem, { AppointmentPeriodProps } from './AppointmentPeriodItem'

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
export const EmptyBlock = styled.div`
  padding: 2.5rem 0;
  color: var(--gray-dark);
  font-size: 14px;
  text-align: center;
  letter-spacing: 0.4px;
`

const messages = defineMessages({
  editPeriod: { id: 'appointment.ui.editPeriod', defaultMessage: '編輯時段' },
  repetitiveMeta: { id: 'appointment.warning.repetitiveMeta', defaultMessage: '※重複週期為' },
  perYear: { id: 'appointment.label.perYear', defaultMessage: '每年' },
  perMonth: { id: 'appointment.label.perMonth', defaultMessage: '每月' },
  perWeek: { id: 'appointment.label.perWeek', defaultMessage: '每週' },
  perDay: { id: 'appointment.label.perDay', defaultMessage: '每日' },
  singlePeriod: { id: 'appointment.label.singlePeriod', defaultMessage: '時段' },
  seriesPeriod: { id: 'appointment.label.seriesPeriod', defaultMessage: '重複週期' },
  single: { id: 'appointment.ui.single', defaultMessage: '單一' },
  open: { id: 'appointment.ui.open', defaultMessage: '開啟' },
  close: { id: 'appointment.ui.close', defaultMessage: '關閉' },
})

export type ScheduleIntervalType = 'Y' | 'M' | 'W' | 'D'
export type DeleteScheduleEvent = {
  values: {
    scheduleId: string
  }
  onSuccess?: () => void
  onError?: (error: Error) => void
  onFinally?: () => void
}
export type ClosePeriodEvent = {
  values: {
    scheduleId: string
    startedAt: Date
  }
  onSuccess?: () => void
  onError?: (error: Error) => void
  onFinally?: () => void
}

const AppointmentPeriodCollection: React.FC<{
  periods: AppointmentPeriodProps[]
  onDelete?: (event: DeleteScheduleEvent) => void
  onClose?: (event: ClosePeriodEvent) => void
}> = ({ periods, onDelete, onClose }) => {
  const { formatMessage } = useIntl()
  const [visible, setVisible] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<AppointmentPeriodProps | null>(null)

  return (
    <>
      <StyledTitle>{periods.length > 0 && moment(periods[0].startedAt).format('YYYY-MM-DD(dd)')}</StyledTitle>
      <StyledWrapper>
        {periods.map(period => (
          <div
            key={period.id}
            onClick={() => {
              if (period.isEnrolled) {
                return
              }
              setSelectedPeriod(period)
              setVisible(true)
            }}
          >
            <AppointmentPeriodItem {...period} />
          </div>
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
                  type="danger"
                  block
                  onClick={() =>
                    onDelete &&
                    onDelete({
                      values: {
                        scheduleId: selectedPeriod.schedule.id,
                      },
                      onSuccess: () => {
                        setVisible(false)
                        setSelectedPeriod(null)
                      },
                      onError: error => handleError(error),
                    })
                  }
                >
                  {formatMessage(commonMessages.ui.delete)}
                  {selectedPeriod.schedule.periodType !== null
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
                    onClose({
                      values: {
                        scheduleId: selectedPeriod.schedule.id,
                        startedAt: selectedPeriod.startedAt,
                      },
                      onSuccess: () => {
                        setVisible(false)
                        setSelectedPeriod(null)
                      },
                      onError: error => handleError(error),
                    })
                  }
                >
                  {selectedPeriod.isExcluded ? formatMessage(messages.open) : formatMessage(messages.close)}
                  {selectedPeriod.schedule.periodType !== null && formatMessage(messages.single)}
                  {formatMessage(appointmentMessages.term.period)}
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
        {selectedPeriod && selectedPeriod.schedule.periodType !== null && selectedPeriod.schedule.periodAmount && (
          <StyledModalMeta className="mb-2">
            {formatMessage(messages.repetitiveMeta)}
            {selectedPeriod.schedule.periodType === 'Y'
              ? formatMessage(messages.perYear)
              : selectedPeriod.schedule.periodType === 'M'
              ? formatMessage(messages.perMonth)
              : selectedPeriod.schedule.periodType === 'W'
              ? formatMessage(messages.perWeek)
              : selectedPeriod.schedule.periodType === 'D'
              ? formatMessage(messages.perDay)
              : ''}
          </StyledModalMeta>
        )}
      </AdminModal>
    </>
  )
}

export default AppointmentPeriodCollection
