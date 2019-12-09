import { Select } from 'antd'
import React, { forwardRef } from 'react'
import styled from 'styled-components'
import { AvatarImage } from './Image'

const StyledSelect = styled(Select)`
  width: 100%;
`
const StyledText = styled.span`
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledTextSecondary = styled.span`
  color: var(--gray-dark);
  letter-spacing: 0.2px;
`

export type MemberOptionProps = {
  id: string
  avatarUrl?: string | null
  name?: string
  username: string
  email?: string
}
export type MemberSelectorProps = {
  members: MemberOptionProps[]
  value?: string
  onChange?: (value: string) => void
}
const MemberSelector: React.FC<MemberSelectorProps> = ({ members, value, onChange }, ref) => {
  return (
    <StyledSelect
      ref={ref}
      placeholder="請輸入帳號 或 Email"
      value={value}
      onChange={value => onChange && onChange(value as string)}
      optionLabelProp="title"
      optionFilterProp="data-source"
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
    </StyledSelect>
  )
}

export default forwardRef(MemberSelector)
