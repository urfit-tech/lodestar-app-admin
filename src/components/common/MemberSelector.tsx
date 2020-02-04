import { Select } from 'antd'
import React, { forwardRef } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { AvatarImage } from './Image'

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
  memberSelect: { id: 'error.form.memberSelect', defaultMessage: '請輸入帳號 或 Email' },
})

export type MemberOptionProps = {
  id: string
  avatarUrl?: string | null
  name?: string
  username: string
  email?: string
}
const MemberSelector: React.FC<{
  members: MemberOptionProps[]
  value?: string
  onChange?: (value: string | null) => void
  disabled?: boolean
}> = ({ members, value, onChange, disabled }, ref) => {
  const { formatMessage } = useIntl()

  return (
    <Select<string | null>
      ref={ref}
      showSearch
      placeholder={formatMessage(messages.memberSelect)}
      value={value}
      onChange={value => onChange && onChange(value)}
      optionLabelProp="title"
      optionFilterProp="data-source"
      style={{ width: '100%' }}
      disabled={disabled}
    >
      {members.map(member => (
        <Select.Option
          key={member.id}
          value={member.id}
          title={member.name || member.username}
          data-source={`${member.id} ${member.name} ${member.username} ${member.email}`}
        >
          <div className="d-flex align-items-center justify-content-start">
            <AvatarImage size={28} src={member.avatarUrl} className="mr-2" />
            <StyledText className="mr-2">{member.name}</StyledText>
            <StyledTextSecondary>{member.username}</StyledTextSecondary>
          </div>
        </Select.Option>
      ))}
    </Select>
  )
}

export default forwardRef(MemberSelector)
