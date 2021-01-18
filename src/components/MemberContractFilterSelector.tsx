import { DatePicker, Select } from 'antd'
import moment from 'moment'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { memberContractMessages } from '../helpers/translation'
import { DateRangeType, StatusType } from '../types'

const StyledSelect = styled(Select)`
  width: 140px;
`

const MemberContractFilterSelector: React.FC<{
  dateRangeType: DateRangeType
  startedAt: Date | null
  endedAt: Date | null
  onSetStatus?: (status: StatusType) => void
  onSetDateRangeType?: (dateType: DateRangeType) => void
  onSetRange?: (time: { startedAt: Date | null; endedAt: Date | null }) => void
  className?: string
}> = ({ dateRangeType, startedAt, endedAt, onSetStatus, onSetDateRangeType, onSetRange, className }) => {
  const { formatMessage } = useIntl()
  return (
    <div className={className}>
      <StyledSelect defaultValue={dateRangeType} onSelect={value => onSetDateRangeType?.(value as DateRangeType)}>
        <Select.Option value={'agreed_at'}>{formatMessage(memberContractMessages.label.agreedAt)}</Select.Option>
        <Select.Option value={'started_at'}>
          {formatMessage(memberContractMessages.label.serviceStartedAt)}
        </Select.Option>
        {/* <Select.Option value={'approvedAt'}>
          {formatMessage(memberContractMessages.label.approvedApprovalAt)}
        </Select.Option>
        <Select.Option value={'refundAppliedAt'}>
          {formatMessage(memberContractMessages.status.applyRefund)}
        </Select.Option>
        <Select.Option value={'loanCanceledAt'}>
          {formatMessage(memberContractMessages.label.loanCancelAt)}
        </Select.Option> */}
        <Select.Option value={'revoked_at'}>{formatMessage(memberContractMessages.label.revokedAt)}</Select.Option>
      </StyledSelect>
      <DatePicker.RangePicker
        defaultValue={[moment(startedAt), moment(endedAt)]}
        onChange={time => {
          const [startedAt, endedAt] = time?.map(v => v?.toDate() || null) || [null, null]
          onSetRange?.({
            startedAt,
            endedAt,
          })
        }}
      />
    </div>
  )
}

export default MemberContractFilterSelector
