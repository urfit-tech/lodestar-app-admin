import { Select } from 'antd'
import { SelectProps } from 'antd/lib/select'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { MemberOptionProps } from '../../types/member'
import { AvatarImage } from '../common/Image'

const StyledText = styled.span`
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledTextSecondary = styled.span`
  color: var(--gray-dark);
  letter-spacing: 0.2px;
`

const messages = defineMessages({
  memberSelect: { id: 'member.text.memberSelect', defaultMessage: '請輸入帳號或 Email' },
})

const MemberSelector: React.FC<{
  members: MemberOptionProps[]
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  onSelect?: SelectProps<string[]>['onSelect']
  disabled?: boolean
  allowClear?: boolean
  mode?: SelectProps<string[]>['mode']
}> = ({ members, value, onChange, onSelect, disabled, allowClear = false, mode }) => {
  const { formatMessage } = useIntl()

  return (
    <Select<string | string[]>
      mode={mode}
      placeholder={formatMessage(messages.memberSelect)}
      optionLabelProp="title"
      optionFilterProp="data-source"
      value={value}
      onChange={value => onChange && onChange(value)}
      onSelect={onSelect}
      onClear={() => onChange && onChange('')}
      showSearch
      disabled={disabled}
      style={{ width: '100%' }}
      allowClear={allowClear}
    >
      {members.map(member => (
        <Select.Option
          key={member.id}
          value={member.id}
          title={member.name || member.username}
          data-source={`${member.id} ${member.name} ${member.username} ${member.email}`}
          data-email={member.email}
          disabled={member.disabled}
        >
          <div className="d-flex align-items-center justify-content-start">
            <AvatarImage size="28px" src={member.avatarUrl} className="mr-2 flex-shrink-0" />
            <StyledText className="mr-2">{member.name}</StyledText>
            <StyledTextSecondary>{member.email}</StyledTextSecondary>
          </div>
        </Select.Option>
      ))}
    </Select>
  )
}

export default MemberSelector
