import { CopyOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Checkbox, DatePicker, message, Modal, Select, Space, Tooltip, Typography } from 'antd'
import moment from 'moment'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuidv4 } from 'uuid'

import {
  createEmptyWeeklySchedule,
  DAY_LABELS,
  DaySchedule,
  RepeatConfig,
  TIME_OPTIONS,
  TimeSlot,
  WeeklySchedule,
} from './openTimeSchedule.type'
import {
  compareTimeStrings,
  getAvailableEndTimeOptions,
  getAvailableStartTimeOptions,
  isTimeSlotOverlapping,
  timeStringToMinutes,
} from './openTimeSchedule.utils'
import memberMessages from '../member/translation'

const ModalContent = styled.div`
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 8px;
`

const DayRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`

const DayLabel = styled.div`
  width: 50px;
  flex-shrink: 0;
  padding-top: 5px;
  font-weight: 500;
`

const SlotsContainer = styled.div`
  flex: 1;
`

const SlotRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`

const TimeSelectWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const ActionButtons = styled.div`
  display: flex;
  gap: 4px;
  margin-left: 12px;
`

const NoSlotText = styled.span`
  color: #999;
  font-size: 14px;
`

const RepeatSection = styled.div`
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
`

const HintText = styled.div`
  color: #999;
  font-size: 12px;
  margin-top: 8px;
`

interface OpenTimeSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (schedule: WeeklySchedule, repeatConfig: RepeatConfig, existingEventIds?: string[]) => Promise<void>
  isLoading?: boolean
  initialSchedule?: WeeklySchedule
  initialRepeatConfig?: RepeatConfig
  isEditMode?: boolean
  existingEventIds?: string[]
}

const OpenTimeSettingsModal: React.FC<OpenTimeSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
  initialSchedule,
  initialRepeatConfig,
  isEditMode = false,
  existingEventIds,
}) => {
  const { formatMessage } = useIntl()

  // 週期時間表狀態
  const [schedule, setSchedule] = useState<WeeklySchedule>(() => initialSchedule || createEmptyWeeklySchedule())

  // 重複設定
  const [isWeeklyRepeat, setIsWeeklyRepeat] = useState(initialRepeatConfig?.isWeeklyRepeat ?? true)
  const [repeatUntil, setRepeatUntil] = useState<Date | null>(initialRepeatConfig?.repeatUntil ?? null)

  // 當 Modal 開啟時，根據 props 初始化狀態
  useEffect(() => {
    if (isOpen) {
      setSchedule(initialSchedule || createEmptyWeeklySchedule())
      setIsWeeklyRepeat(initialRepeatConfig?.isWeeklyRepeat ?? true)
      setRepeatUntil(initialRepeatConfig?.repeatUntil ?? null)
    }
  }, [isOpen, initialSchedule, initialRepeatConfig])

  // 重置狀態
  const resetState = useCallback(() => {
    setSchedule(createEmptyWeeklySchedule())
    setIsWeeklyRepeat(true)
    setRepeatUntil(null)
  }, [])

  // 新增時段
  const handleAddSlot = useCallback((dayIndex: number) => {
    setSchedule(prev => {
      const newSchedule = [...prev]
      const daySchedule = newSchedule[dayIndex]
      const existingSlots = daySchedule.slots

      // 計算新時段的起始時間
      let newStartTime = '09:00'
      let newEndTime = '10:00'

      if (existingSlots.length > 0) {
        // 從最後一個時段的結束時間後一小時開始
        const sortedSlots = [...existingSlots].sort((a, b) => compareTimeStrings(a.endTime, b.endTime))
        const lastSlot = sortedSlots[sortedSlots.length - 1]
        const lastEndMinutes = timeStringToMinutes(lastSlot.endTime)

        // 找到下一個可用的起始時間（上一筆結束時間後一小時）
        const nextStartTime = TIME_OPTIONS.find(t => timeStringToMinutes(t) >= lastEndMinutes + 60)
        if (nextStartTime) {
          newStartTime = nextStartTime
          // 結束時間為起始時間後一小時
          const startMinutes = timeStringToMinutes(newStartTime)
          const endMinutes = startMinutes + 60
          newEndTime = TIME_OPTIONS.find(t => timeStringToMinutes(t) >= endMinutes) || '23:30'
        }
      }

      const newSlot: TimeSlot = {
        id: uuidv4(),
        startTime: newStartTime,
        endTime: newEndTime,
      }

      newSchedule[dayIndex] = {
        ...daySchedule,
        slots: [...existingSlots, newSlot],
      }

      return newSchedule
    })
  }, [])

  // 刪除時段
  const handleRemoveSlot = useCallback((dayIndex: number, slotId: string) => {
    setSchedule(prev => {
      const newSchedule = [...prev]
      const daySchedule = newSchedule[dayIndex]

      newSchedule[dayIndex] = {
        ...daySchedule,
        slots: daySchedule.slots.filter(slot => slot.id !== slotId),
      }

      return newSchedule
    })
  }, [])

  // 更新時段時間
  const handleUpdateSlotTime = useCallback(
    (dayIndex: number, slotId: string, field: 'startTime' | 'endTime', value: string) => {
      setSchedule(prev => {
        const newSchedule = [...prev]
        const daySchedule = newSchedule[dayIndex]

        newSchedule[dayIndex] = {
          ...daySchedule,
          slots: daySchedule.slots.map(slot => {
            if (slot.id !== slotId) return slot

            const updatedSlot = { ...slot, [field]: value }

            // 如果更新起始時間，且結束時間不合法，自動調整結束時間
            if (field === 'startTime') {
              const startMinutes = timeStringToMinutes(value)
              const endMinutes = timeStringToMinutes(slot.endTime)
              if (endMinutes <= startMinutes) {
                // 設定結束時間為起始時間後一小時
                const newEndMinutes = startMinutes + 60
                updatedSlot.endTime = TIME_OPTIONS.find(t => timeStringToMinutes(t) >= newEndMinutes) || '23:30'
              }
            }

            return updatedSlot
          }),
        }

        return newSchedule
      })
    },
    []
  )

  // 複製到所有天（含衝突檢查）
  const handleCopyToAll = useCallback((sourceDayIndex: number) => {
    const conflicts: Array<{ dayLabel: string; timeRange: string }> = []

    setSchedule(prev => {
      const sourceSlots = prev[sourceDayIndex].slots

      return prev.map((day, index) => {
        if (index === sourceDayIndex) return day

        // 檢查每個來源時段是否與目標天的現有時段衝突
        const nonConflictingSlots: TimeSlot[] = []
        sourceSlots.forEach(sourceSlot => {
          const hasConflict = day.slots.some(existingSlot => isTimeSlotOverlapping(sourceSlot, existingSlot))
          if (hasConflict) {
            conflicts.push({
              dayLabel: day.dayLabel,
              timeRange: `${sourceSlot.startTime}-${sourceSlot.endTime}`,
            })
          } else {
            nonConflictingSlots.push({
              ...sourceSlot,
              id: uuidv4(),
            })
          }
        })

        return {
          ...day,
          slots: [...day.slots, ...nonConflictingSlots],
        }
      })
    })

    if (conflicts.length > 0) {
      message.warning(
        formatMessage(memberMessages.ui.copyConflictWarning, {
          conflicts: conflicts.map(c => `${c.dayLabel} ${c.timeRange}`).join('、'),
        })
      )
    } else {
      message.success(formatMessage(memberMessages.ui.copySuccess))
    }
  }, [formatMessage])

  // 獲取可用的起始時間選項
  const getStartTimeOptions = useCallback(
    (daySchedule: DaySchedule, slotIndex: number, currentSlotId?: string) => {
      const baseOptions = getAvailableStartTimeOptions(daySchedule.slots, currentSlotId)
      if (slotIndex <= 0) return baseOptions

      const prevSlot = daySchedule.slots[slotIndex - 1]
      if (!prevSlot?.endTime) return baseOptions

      const prevEndMinutes = timeStringToMinutes(prevSlot.endTime)
      return baseOptions.filter(time => timeStringToMinutes(time) >= prevEndMinutes)
    },
    []
  )

  // 獲取可用的結束時間選項
  const getEndTimeOptions = useCallback((daySchedule: DaySchedule, startTime: string, currentSlotId?: string) => {
    return getAvailableEndTimeOptions(startTime, daySchedule.slots, currentSlotId)
  }, [])

  // 處理儲存
  const handleSave = useCallback(async () => {
    const hasSlots = schedule.some(day => day.slots.length > 0)
    if (!hasSlots) {
      return
    }

    await onSave(schedule, { isWeeklyRepeat, repeatUntil }, isEditMode ? existingEventIds : undefined)
    resetState()
  }, [schedule, isWeeklyRepeat, repeatUntil, onSave, resetState, isEditMode, existingEventIds])

  // 處理關閉
  const handleClose = useCallback(() => {
    resetState()
    onClose()
  }, [resetState, onClose])

  // 計算總時段數
  const totalSlots = useMemo(() => {
    return schedule.reduce((sum, day) => sum + day.slots.length, 0)
  }, [schedule])

  return (
    <Modal
      title={formatMessage(isEditMode ? memberMessages.ui.editOpenTime : memberMessages.ui.setOpenTime)}
      visible={isOpen}
      onCancel={handleClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          {formatMessage(memberMessages.ui.cancel)}
        </Button>,
        <Button key="save" type="primary" onClick={handleSave} loading={isLoading} disabled={totalSlots === 0}>
          {formatMessage(memberMessages.ui.confirm)}
        </Button>,
      ]}
      destroyOnClose
    >
      <ModalContent>
        {schedule.map((daySchedule, dayIndex) => (
          <DayRow key={daySchedule.dayOfWeek}>
            <DayLabel>{daySchedule.dayLabel}</DayLabel>
            <SlotsContainer>
              {daySchedule.slots.length === 0 ? (
                <SlotRow>
                  <NoSlotText>{formatMessage(memberMessages.ui.noOpenTime)}</NoSlotText>
                  <ActionButtons>
                    <Tooltip title={formatMessage(memberMessages.ui.addSlot)}>
                      <Button size="small" icon={<PlusOutlined />} onClick={() => handleAddSlot(dayIndex)} />
                    </Tooltip>
                  </ActionButtons>
                </SlotRow>
              ) : (
                daySchedule.slots.map((slot, slotIndex) => {
                  const isFirstSlot = slotIndex === 0
                  const startOptions = getStartTimeOptions(daySchedule, slotIndex, slot.id)
                  const endOptions = getEndTimeOptions(daySchedule, slot.startTime, slot.id)

                  return (
                    <SlotRow key={slot.id}>
                      <TimeSelectWrapper>
                        <Select
                          value={slot.startTime}
                          onChange={value => handleUpdateSlotTime(dayIndex, slot.id, 'startTime', value)}
                          style={{ width: 100 }}
                          size="small"
                        >
                          {startOptions.map(time => (
                            <Select.Option key={time} value={time}>
                              {time}
                            </Select.Option>
                          ))}
                        </Select>
                        <span>-</span>
                        <Select
                          value={slot.endTime}
                          onChange={value => handleUpdateSlotTime(dayIndex, slot.id, 'endTime', value)}
                          style={{ width: 100 }}
                          size="small"
                        >
                          {endOptions.map(time => (
                            <Select.Option key={time} value={time}>
                              {time}
                            </Select.Option>
                          ))}
                        </Select>
                      </TimeSelectWrapper>
                      <ActionButtons>
                        <Tooltip title={formatMessage(memberMessages.ui.removeSlot)}>
                          <Button
                            size="small"
                            icon={<MinusOutlined />}
                            onClick={() => handleRemoveSlot(dayIndex, slot.id)}
                          />
                        </Tooltip>
                        {isFirstSlot && (
                          <Tooltip title={formatMessage(memberMessages.ui.copyToAll)}>
                            <Button size="small" icon={<CopyOutlined />} onClick={() => handleCopyToAll(dayIndex)} />
                          </Tooltip>
                        )}
                        {slotIndex === daySchedule.slots.length - 1 && (
                          <Tooltip title={formatMessage(memberMessages.ui.addSlot)}>
                            <Button size="small" icon={<PlusOutlined />} onClick={() => handleAddSlot(dayIndex)} />
                          </Tooltip>
                        )}
                      </ActionButtons>
                    </SlotRow>
                  )
                })
              )}
            </SlotsContainer>
          </DayRow>
        ))}
      </ModalContent>

      <RepeatSection>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Checkbox checked={isWeeklyRepeat} onChange={e => setIsWeeklyRepeat(e.target.checked)}>
            {formatMessage(memberMessages.ui.weeklyRepeat)}
          </Checkbox>

          {isWeeklyRepeat && (
            <div>
              <Space>
                <span>{formatMessage(memberMessages.ui.repeatUntil)}</span>
                <DatePicker
                  value={repeatUntil ? moment(repeatUntil) : null}
                  onChange={date => setRepeatUntil(date ? date.toDate() : null)}
                  placeholder={formatMessage(memberMessages.ui.selectDate)}
                  disabledDate={current => current && current < moment().startOf('day')}
                />
              </Space>
              <HintText>{formatMessage(memberMessages.ui.repeatUntilHint)}</HintText>
            </div>
          )}
        </Space>
      </RepeatSection>
    </Modal>
  )
}

export default OpenTimeSettingsModal
