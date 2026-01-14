import { Card, Checkbox, DatePicker, InputNumber, Radio, Space, Tag, Typography } from 'antd'
import moment, { Moment } from 'moment'
import React, { useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { Order, ScheduleCondition, scheduleStore } from '../../types/schedule'
import scheduleMessages from './translation'

const PanelCard = styled(Card)`
  .ant-card-body {
    padding: 16px;
  }
`

const FieldRow = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`

const FieldLabel = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`

const HelpText = styled(Typography.Text)`
  display: block;
  font-size: 12px;
`

const WarningText = styled(Typography.Text)`
  display: block;
  font-size: 12px;
  color: #faad14;
`

const ExcludedDateTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
`

interface ScheduleConditionPanelProps {
  selectedOrders: Order[]
  condition: ScheduleCondition
  onConditionChange: (condition: Partial<ScheduleCondition>) => void
  hideMinutesOption?: boolean
  expiryDateByLanguage?: Record<string, Date | null>
  minutesLimitMode?: 'sum' | 'minPerStudent'
  endDateLimitMode?: 'latest' | 'earliest'
}

const ScheduleConditionPanel: React.FC<ScheduleConditionPanelProps> = ({
  selectedOrders,
  condition,
  onConditionChange,
  hideMinutesOption = false,
  expiryDateByLanguage = {},
  minutesLimitMode = 'sum',
  endDateLimitMode = 'latest',
}) => {
  const { formatMessage } = useIntl()
  const holidays = scheduleStore.getHolidays()

  // Calculate limits based on selected orders and language expiry settings
  const limits = useMemo(() => {
    if (selectedOrders.length === 0) {
      return {
        maxStartDate: moment().add(180, 'day'),
        maxEndDate: moment().add(180, 'day'),
        maxMinutes: 0,
        earliestOrderDate: moment(),
      }
    }

    // Earliest order creation date + 180 days for start date
    const earliestOrderDate = selectedOrders.reduce(
      (earliest, order) => (moment(order.createdAt).isBefore(earliest) ? moment(order.createdAt) : earliest),
      moment(selectedOrders[0].createdAt),
    )

    // Get unique languages from selected orders
    const selectedLanguages = [...new Set(selectedOrders.map(o => o.language).filter(Boolean))]

    // Calculate max end date based on language expiry settings
    let maxEndDate = moment().add(180, 'day') // Default fallback

    if (selectedLanguages.length > 0) {
      // Find the earliest expiry date among all selected languages
      const languageExpiryDates = selectedLanguages
        .map(lang => expiryDateByLanguage[lang])
        .filter((date): date is Date => date !== null && date !== undefined)

      if (languageExpiryDates.length > 0) {
        // Use the earliest expiry date (most restrictive)
        const earliestExpiry = languageExpiryDates.reduce(
          (earliest, date) => (moment(date).isBefore(earliest) ? moment(date) : earliest),
          moment(languageExpiryDates[0]),
        )
        maxEndDate = earliestExpiry
      }
    }

    // Fallback to order's expiresAt if no language expiry settings
    if (maxEndDate.isSame(moment().add(180, 'day'), 'day')) {
      const expiryDates = selectedOrders
        .map(order => order.expiresAt)
        .filter((date): date is Date => Boolean(date))
        .map(date => moment(date))

      if (expiryDates.length > 0) {
        const targetExpiry = expiryDates.reduce((candidate, current) => {
          if (endDateLimitMode === 'earliest') {
            return current.isBefore(candidate) ? current : candidate
          }
          return current.isAfter(candidate) ? current : candidate
        }, expiryDates[0])
        maxEndDate = targetExpiry
      }
    }

    // Total available minutes
    let totalMinutes = selectedOrders.reduce((sum, order) => sum + order.availableMinutes, 0)

    if (minutesLimitMode === 'minPerStudent') {
      const minutesByStudent = selectedOrders.reduce<Record<string, number>>((acc, order) => {
        const current = acc[order.studentId] || 0
        acc[order.studentId] = current + order.availableMinutes
        return acc
      }, {})
      const perStudentMinutes = Object.values(minutesByStudent)
      totalMinutes = perStudentMinutes.length > 0 ? Math.min(...perStudentMinutes) : 0
    }

    return {
      maxStartDate: earliestOrderDate.clone().add(180, 'day'),
      maxEndDate,
      maxMinutes: totalMinutes,
      earliestOrderDate,
    }
  }, [selectedOrders, expiryDateByLanguage, minutesLimitMode, endDateLimitMode])

  // Mode: endDate or totalLessons
  const [mode, setMode] = React.useState<'endDate' | 'totalLessons'>('endDate')

  // Calculate max lessons (1 lesson = 50 minutes)
  const maxLessons = Math.floor(limits.maxMinutes / 50)

  const handleStartDateChange = useCallback(
    (date: Moment | null) => {
      if (date) {
        const isValid = date.isSameOrAfter(moment(), 'day') && date.isSameOrBefore(limits.maxStartDate, 'day')
        if (isValid) {
          onConditionChange({ startDate: date.toDate() })
        }
      }
    },
    [limits.maxStartDate, onConditionChange],
  )

  const handleEndDateChange = useCallback(
    (date: Moment | null) => {
      if (date) {
        onConditionChange({ endDate: date.toDate(), totalMinutes: undefined })
      }
    },
    [onConditionChange],
  )

  const handleTotalLessonsChange = useCallback(
    (value: number | null) => {
      if (value !== null && value >= 0) {
        // Convert lessons to minutes for storage (1 lesson = 50 minutes)
        onConditionChange({ totalMinutes: value * 50, endDate: undefined })
      }
    },
    [onConditionChange],
  )

  const handleModeChange = useCallback(
    (newMode: 'endDate' | 'totalLessons') => {
      setMode(newMode)
      if (newMode === 'endDate') {
        onConditionChange({ totalMinutes: undefined })
      } else {
        onConditionChange({ endDate: undefined })
      }
    },
    [onConditionChange],
  )

  const handleAddExcludedDate = useCallback(
    (date: Moment | null) => {
      if (date) {
        const dateStr = date.format('YYYY-MM-DD')
        // Check if date already exists
        const exists = condition.excludedDates.some(d => moment(d).format('YYYY-MM-DD') === dateStr)
        if (!exists) {
          onConditionChange({
            excludedDates: [...condition.excludedDates, date.toDate()].sort((a, b) => a.getTime() - b.getTime()),
          })
        }
      }
    },
    [condition.excludedDates, onConditionChange],
  )

  const handleRemoveExcludedDate = useCallback(
    (dateToRemove: Date) => {
      onConditionChange({
        excludedDates: condition.excludedDates.filter(
          d => moment(d).format('YYYY-MM-DD') !== moment(dateToRemove).format('YYYY-MM-DD'),
        ),
      })
    },
    [condition.excludedDates, onConditionChange],
  )

  const handleExcludeHolidaysChange = useCallback(
    (checked: boolean) => {
      onConditionChange({ excludeHolidays: checked })
    },
    [onConditionChange],
  )

  const isStartDateValid = useMemo(() => {
    const startDate = moment(condition.startDate)
    return startDate.isSameOrAfter(moment(), 'day') && startDate.isSameOrBefore(limits.maxStartDate, 'day')
  }, [condition.startDate, limits.maxStartDate])

  const isDisabled = selectedOrders.length === 0

  return (
    <PanelCard title={formatMessage(scheduleMessages.ScheduleCondition.title)} size="small" style={{ height: '100%' }}>
      {/* Start Date */}
      <FieldRow>
        <FieldLabel>{formatMessage(scheduleMessages.ScheduleCondition.startDate)}</FieldLabel>
        <DatePicker
          value={moment(condition.startDate)}
          onChange={handleStartDateChange}
          disabledDate={date => date.isBefore(moment(), 'day') || date.isAfter(limits.maxStartDate, 'day')}
          disabled={isDisabled}
          style={{ width: '100%' }}
          status={!isStartDateValid ? 'error' : undefined}
        />
        <HelpText type="secondary">{formatMessage(scheduleMessages.ScheduleCondition.startDateHint)}</HelpText>
        {!isStartDateValid && (
          <Typography.Text type="danger" style={{ fontSize: 12 }}>
            {formatMessage(scheduleMessages.ScheduleCondition.startDateError)}
          </Typography.Text>
        )}
      </FieldRow>

      {/* End Date or Total Minutes */}
      <FieldRow>
        {hideMinutesOption ? (
          // Only show end date picker without radio buttons
          <>
            <FieldLabel>{formatMessage(scheduleMessages.ScheduleCondition.endDate)}</FieldLabel>
            <DatePicker
              value={condition.endDate ? moment(condition.endDate) : null}
              onChange={handleEndDateChange}
              disabledDate={date =>
                date.isBefore(moment(condition.startDate), 'day') || date.isAfter(limits.maxEndDate, 'day')
              }
              disabled={isDisabled}
              style={{ width: '100%' }}
            />
            <HelpText type="secondary">
              {formatMessage(scheduleMessages.ScheduleCondition.endDateRange, {
                start: moment().format('YYYY-MM-DD'),
                end: limits.maxEndDate.format('YYYY-MM-DD'),
              })}
            </HelpText>
          </>
        ) : (
          <Radio.Group value={mode} onChange={e => handleModeChange(e.target.value)} disabled={isDisabled}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* End Date Option */}
              <Radio value="endDate">
                <FieldLabel style={{ display: 'inline' }}>
                  {formatMessage(scheduleMessages.ScheduleCondition.endDate)}
                </FieldLabel>
              </Radio>
              {mode === 'endDate' && (
                <div style={{ marginLeft: 24 }}>
                  <DatePicker
                    value={condition.endDate ? moment(condition.endDate) : null}
                    onChange={handleEndDateChange}
                    disabledDate={date =>
                      date.isBefore(moment(condition.startDate), 'day') || date.isAfter(limits.maxEndDate, 'day')
                    }
                    disabled={isDisabled}
                    style={{ width: '100%' }}
                  />
                  <HelpText type="secondary">
                    {formatMessage(scheduleMessages.ScheduleCondition.endDateRange, {
                      start: moment().format('YYYY-MM-DD'),
                      end: limits.maxEndDate.format('YYYY-MM-DD'),
                    })}
                  </HelpText>
                </div>
              )}

              {/* Total Lessons Option */}
              <Radio value="totalLessons">
                <FieldLabel style={{ display: 'inline' }}>
                  {formatMessage(scheduleMessages.ScheduleCondition.scheduledLessons)}
                </FieldLabel>
              </Radio>
              {mode === 'totalLessons' && (
                <div style={{ marginLeft: 24 }}>
                  <InputNumber
                    value={condition.totalMinutes ? Math.floor(condition.totalMinutes / 50) : undefined}
                    onChange={handleTotalLessonsChange}
                    min={0}
                    max={maxLessons}
                    disabled={isDisabled}
                    style={{ width: '100%' }}
                    addonAfter="堂"
                  />
                  <HelpText type="secondary">
                    {formatMessage(scheduleMessages.ScheduleCondition.scheduledLessonsLimit, {
                      limit: maxLessons,
                    })}
                  </HelpText>
                  {condition.totalMinutes && condition.totalMinutes > limits.maxMinutes && (
                    <Typography.Text type="danger" style={{ fontSize: 12 }}>
                      {formatMessage(scheduleMessages.ScheduleCondition.exceededLimit)}
                    </Typography.Text>
                  )}
                </div>
              )}
            </Space>
          </Radio.Group>
        )}
      </FieldRow>

      {/* Excluded Dates */}
      <FieldRow>
        <FieldLabel>{formatMessage(scheduleMessages.ScheduleCondition.excludedDates)}</FieldLabel>
        <DatePicker
          value={null}
          onChange={handleAddExcludedDate}
          disabled={isDisabled}
          style={{ width: '100%' }}
          placeholder="選擇日期新增"
          disabledDate={date => {
            // Disable dates before start date
            return date.isBefore(moment(condition.startDate), 'day')
          }}
        />
        {condition.excludedDates.length > 0 && (
          <ExcludedDateTags>
            {condition.excludedDates.map((date, index) => (
              <Tag key={index} closable onClose={() => handleRemoveExcludedDate(date)}>
                {moment(date).format('YYYY-MM-DD')}
              </Tag>
            ))}
          </ExcludedDateTags>
        )}
      </FieldRow>

      {/* Exclude Holidays */}
      <FieldRow>
        <Checkbox
          checked={condition.excludeHolidays}
          onChange={e => handleExcludeHolidaysChange(e.target.checked)}
          disabled={isDisabled}
        >
          {formatMessage(scheduleMessages.ScheduleCondition.excludeHolidays)}
        </Checkbox>
        {!condition.excludeHolidays && (
          <WarningText>{formatMessage(scheduleMessages.ScheduleCondition.holidayWarning)}</WarningText>
        )}
      </FieldRow>
    </PanelCard>
  )
}

export default ScheduleConditionPanel
