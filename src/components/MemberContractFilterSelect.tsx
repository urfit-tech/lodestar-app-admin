import { DatePicker, Select } from 'antd'
import { commonMessages } from 'lodestar-app-admin/src/helpers/translation'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { memberContractMessages } from '../helpers/translation'

const StyledSelect = styled(Select)`
  width: 140px;
`

const MemberContractFilterSelect: React.FC<{ className?: string }> = ({ className }) => {
  const { formatMessage } = useIntl()
  return (
    <div className={className}>
      <StyledSelect className="mr-2">
        <Select.Option value={''}>{formatMessage(memberContractMessages.status.all)}</Select.Option>
        <Select.Option value={''}>{formatMessage(memberContractMessages.status.pendingApproval)}</Select.Option>
        <Select.Option value={''}>{formatMessage(memberContractMessages.status.approvedApproval)}</Select.Option>
        <Select.Option value={''}>{formatMessage(memberContractMessages.status.applyRefund)}</Select.Option>
        <Select.Option value={''}>{formatMessage(commonMessages.ui.cancel)}</Select.Option>
      </StyledSelect>
      <StyledSelect>
        <Select.Option value={''}>{formatMessage(memberContractMessages.label.agreedAt)}</Select.Option>
        <Select.Option value={''}>{formatMessage(memberContractMessages.label.serviceStartedAt)}</Select.Option>
        <Select.Option value={''}>{formatMessage(memberContractMessages.label.approvedApprovalAt)}</Select.Option>
        <Select.Option value={''}>{formatMessage(memberContractMessages.status.applyRefund)}</Select.Option>
        <Select.Option value={''}>{formatMessage(memberContractMessages.label.loanCancelAt)}</Select.Option>
        <Select.Option value={''}>{formatMessage(memberContractMessages.label.revokedAt)}</Select.Option>
      </StyledSelect>
      <DatePicker.RangePicker />
    </div>
  )
}

export default MemberContractFilterSelect
