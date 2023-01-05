import { useQuery } from '@apollo/react-hooks'
import Select, { SelectProps } from 'antd/lib/select'
import gql from 'graphql-tag'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { MemberOptionProps } from '../../types/member'
import { AvatarImage } from '../common/Image'
import formMessages from './translation'

const StyledText = styled.span`
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledTextSecondary = styled.span`
  color: var(--gray-dark);
  letter-spacing: 0.2px;
`

const MemberSelector: React.FC<{
  members: MemberOptionProps[]
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  onSelect?: SelectProps<string[]>['onSelect']
  disabled?: boolean
  allowClear?: boolean
  mode?: SelectProps<string[]>['mode']
  maxTagCount?: SelectProps<string[]>['maxTagCount']
}> = ({ members, value, onChange, onSelect, disabled, allowClear = false, mode, maxTagCount }) => {
  const { formatMessage } = useIntl()

  return (
    <Select<string | string[]>
      mode={mode}
      placeholder={formatMessage(formMessages.MemberSelector.memberSelect)}
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
      maxTagCount={maxTagCount}
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

let timeout: NodeJS.Timeout | null

export const AllMemberSelector: React.FC<
  SelectProps<string | string[]> & {
    isAllowAddUnregistered?: boolean
    setIsUnregistered?: React.Dispatch<React.SetStateAction<boolean>>
  }
> = ({ value, onChange, isAllowAddUnregistered, setIsUnregistered, onSelect }) => {
  const { formatMessage } = useIntl()
  const [search, setSearch] = useState(value || '')
  const { members } = useAllMemberCollection(Array.isArray(search) ? search[0] : search)

  const handleSearch = (value: string) => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }

    timeout = setTimeout(() => {
      setSearch(value)
    }, 300)
  }

  useEffect(() => {
    if (isAllowAddUnregistered && search && members.length === 0 && !members.find(v => v.email === search)) {
      setIsUnregistered?.(true)
    }
  }, [isAllowAddUnregistered, setIsUnregistered, members, search])

  return (
    <Select<string | string[]>
      showSearch
      value={value}
      defaultActiveFirstOption={false}
      showArrow={false}
      filterOption={false}
      onChange={(value, option) => onChange?.(value, option)}
      onSelect={onSelect}
      onSearch={handleSearch}
      notFoundContent={null}
      allowClear
      onClear={() => {
        setSearch('')
        setIsUnregistered?.(false)
      }}
    >
      {isAllowAddUnregistered &&
      ((search !== '' && members.length === 0 && !members.find(v => v.email === search)) ||
        members.find(v => v.email === search)?.status === 'invited') ? (
        <Select.Option
          key="unknown"
          value={Array.isArray(search) ? search[0] : search}
          title={Array.isArray(search) ? search[0] : search}
          data-source={`${Array.isArray(search) ? search[0] : search}} 'unknown' 'unknown' ${
            Array.isArray(search) ? search[0] : search
          }`}
          data-email={Array.isArray(search) ? search[0] : search}
        >
          <div className="d-flex align-items-center justify-content-start">
            <AvatarImage size="28px" className="mr-2 flex-shrink-0" />
            <StyledText className="mr-2">{Array.isArray(search) ? search[0] : search}</StyledText>
            <StyledTextSecondary>
              (
              {members.find(v => v.email === search)?.status === 'invited'
                ? formatMessage(formMessages.MemberSelector.memberIsInvited)
                : formatMessage(formMessages.MemberSelector.memberIsUnregistered)}
              )
            </StyledTextSecondary>
          </div>
        </Select.Option>
      ) : null}

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

const useAllMemberCollection = (search: string) => {
  const { data, loading, error } = useQuery<hasura.GET_ALL_MEMBER_COLLECTION>(
    gql`
      query GET_ALL_MEMBER_COLLECTION($search: String!) {
        member(
          where: {
            _or: [
              { id: { _ilike: $search } }
              { name: { _ilike: $search } }
              { username: { _ilike: $search } }
              { email: { _ilike: $search } }
            ]
          }
          limit: 100
        ) {
          id
          picture_url
          name
          username
          email
          status
        }
      }
    `,
    { variables: { search: `%${search}%` } },
  )

  const members: MemberOptionProps[] =
    data?.member.map(member => ({
      id: member.id,
      avatarUrl: member.picture_url,
      name: member.name || member.username,
      username: member.username,
      email: member.email,
      status: member.status,
    })) || []

  return {
    loading,
    members,
    error,
  }
}

export default MemberSelector
