import { Button } from 'antd'
import moment from 'moment'
import React, { useState } from 'react'
import styled from 'styled-components'
import { handleError } from '../../helpers'
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

export type ScheduleIntervalType = 'Y' | 'M' | 'W' | 'D'
const scheduleIntervalTypeLabel: { [key in ScheduleIntervalType]: string } = {
  Y: '每年',
  M: '每月',
  W: '每週',
  D: '每日',
}
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
        title="編輯時段"
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
                  刪除{selectedPeriod.schedule.periodType !== null ? '重複週期' : '時段'}
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
                  {selectedPeriod.isExcluded ? '開啟' : '關閉'}
                  {selectedPeriod.schedule.periodType !== null && '單一'}時段
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
            ※重複週期為{scheduleIntervalTypeLabel[selectedPeriod.schedule.periodType]}
          </StyledModalMeta>
        )}
      </AdminModal>
    </>
  )
}

export default AppointmentPeriodCollection
