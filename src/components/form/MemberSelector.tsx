import { gql, useQuery } from '@apollo/client'
import { Spin } from 'antd'
import Select, { SelectProps } from 'antd/lib/select'
import React, { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { MemberOptionProps } from '../../types/member'
import { AvatarImage } from '../common/Image'
import formMessages from './translation'

export const StyledText = styled.span`
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
`
export const StyledTextSecondary = styled.span`
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

export const InhibitInputMemberSelector: React.FC<
  SelectProps<string | string[]> & {
    allowedPermissions?: string[]
    isAllowAddUnregistered?: boolean
    setIsUnregistered?: React.Dispatch<React.SetStateAction<boolean>>
  }
> = ({ value, onChange, allowedPermissions, isAllowAddUnregistered, setIsUnregistered, onSelect }) => {
  const { formatMessage } = useIntl()
  const [search, setSearch] = useState(value || '')
  const condition: hasura.GET_ALL_MEMBER_PUBLIC_COLLECTIONVariables['condition'] = allowedPermissions
    ? {
        member_permissions: { permission_id: { _in: allowedPermissions } },
        _or: [
          { name: { _ilike: `%${Array.isArray(search) ? search[0] : search}%` } },
          { username: { _ilike: `%${Array.isArray(search) ? search[0] : search}%` } },
          { email: { _ilike: `%${Array.isArray(search) ? search[0] : search}%` } },
        ],
      }
    : {
        _or: [
          { name: { _ilike: `%${Array.isArray(search) ? search[0] : search}%` } },
          { username: { _ilike: `%${Array.isArray(search) ? search[0] : search}%` } },
          { email: { _ilike: `%${Array.isArray(search) ? search[0] : search}%` } },
        ],
      }
  const { members } = useAllMemberCollection(condition)

  const handleSearch = (value: string) => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }

    timeout = setTimeout(() => {
      setSearch(value.trim())
    }, 300)
  }

  return (
    <Select<string | string[]>
      style={{ width: '100%' }}
      showSearch
      value={value}
      defaultActiveFirstOption={false}
      showArrow={false}
      filterOption={false}
      onChange={(value, option) => onChange?.(value, option)}
      onSelect={(value, option) => {
        if (
          isAllowAddUnregistered &&
          (members.length === 0 || members.find(v => v.name === option.name || v.id === value)?.status === 'invited')
        ) {
          setIsUnregistered?.(true)
        } else {
          setIsUnregistered?.(false)
        }
        onSelect?.(value, option)
      }}
      onSearch={handleSearch}
      notFoundContent={null}
      allowClear
      onClear={() => {
        setSearch('')
        setIsUnregistered?.(false)
      }}
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
            <StyledTextSecondary>
              {member.status === 'invited' ? ` (${formatMessage(formMessages.MemberSelector.memberIsInvited)}) ` : null}
              {member.email}
            </StyledTextSecondary>
          </div>
        </Select.Option>
      ))}
    </Select>
  )
}

export const AllMemberSelector: React.FC<
  SelectProps<string | string[]> & {
    allowedPermissions?: string[]
    isAllowAddUnregistered?: boolean
    onMemberStatus?: (value: string | null) => void
  }
> = ({ value, onChange, allowedPermissions, isAllowAddUnregistered, onMemberStatus, onSelect }) => {
  const { formatMessage } = useIntl()
  const [search, setSearch] = useState(value || '')
  const condition: hasura.GET_ALL_MEMBER_PUBLIC_COLLECTIONVariables['condition'] = allowedPermissions
    ? {
        member_permissions: { permission_id: { _in: allowedPermissions } },
        _or: [
          { id: { _ilike: `%${Array.isArray(search) ? search[0] : search}%` } },
          { name: { _ilike: `%${Array.isArray(search) ? search[0] : search}%` } },
          { username: { _ilike: `%${Array.isArray(search) ? search[0] : search}%` } },
          { email: { _ilike: `%${Array.isArray(search) ? search[0] : search}%` } },
        ],
      }
    : {
        _or: [
          { id: { _ilike: `%${Array.isArray(search) ? search[0] : search}%` } },
          { name: { _ilike: `%${Array.isArray(search) ? search[0] : search}%` } },
          { username: { _ilike: `%${Array.isArray(search) ? search[0] : search}%` } },
          { email: { _ilike: `%${Array.isArray(search) ? search[0] : search}%` } },
        ],
      }
  const { loading, members } = useAllMemberCollection(condition)

  const { data: existingMembers } = useQuery<hasura.GET_SINGLE_MEMBER_PUBLIC, hasura.GET_SINGLE_MEMBER_PUBLICVariables>(
    gql`
      query GET_SINGLE_MEMBER_PUBLIC($search: String!) {
        member_public(
          where: {
            _or: [
              { id: { _ilike: $search } }
              { name: { _ilike: $search } }
              { username: { _ilike: $search } }
              { email: { _ilike: $search } }
            ]
          }
          limit: 10
        ) {
          id
        }
      }
    `,
    { variables: { search: `%${Array.isArray(search) ? search[0] : search}%` } },
  )

  const handleSearch = (value: string) => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }

    timeout = setTimeout(() => {
      setSearch(value.trim())
    }, 300)
  }

  return (
    <Select<string | string[]>
      style={{ width: '100%' }}
      showSearch
      value={loading ? `${formatMessage(formMessages['*'].loading)}...` : value}
      notFoundContent={() => <Spin />}
      defaultActiveFirstOption={false}
      showArrow={false}
      filterOption={false}
      onChange={(value, option) => onChange?.(value, option)}
      onSelect={(value, option) => {
        if (isAllowAddUnregistered && members.length === 0) {
          onMemberStatus?.('unregistered')
        } else {
          onMemberStatus?.(members.find(member => member.id === value)?.status || null)
        }
        onSelect?.(value, option)
      }}
      onSearch={handleSearch}
      allowClear
      onClear={() => {
        setSearch('')
        onMemberStatus?.(null)
      }}
    >
      {isAllowAddUnregistered &&
      search !== '' &&
      members.length === 0 &&
      existingMembers?.member_public.length === 0 ? (
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
              ({formatMessage(formMessages.MemberSelector.memberIsUnregistered)})
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
            <StyledTextSecondary>
              {member.status === 'invited' ? ` (${formatMessage(formMessages.MemberSelector.memberIsInvited)}) ` : null}
              {member.email}
            </StyledTextSecondary>
          </div>
        </Select.Option>
      ))}
    </Select>
  )
}

const useAllMemberCollection = (condition: hasura.GET_ALL_MEMBER_PUBLIC_COLLECTIONVariables['condition']) => {
  const { data, loading, error } = useQuery<
    hasura.GET_ALL_MEMBER_PUBLIC_COLLECTION,
    hasura.GET_ALL_MEMBER_PUBLIC_COLLECTIONVariables
  >(
    gql`
      query GET_ALL_MEMBER_PUBLIC_COLLECTION($condition: member_public_bool_exp!) {
        member_public(where: $condition, limit: 10) {
          id
          picture_url
          name
          username
          email
          status
        }
      }
    `,
    { variables: { condition } },
  )

  const members = useMemo<MemberOptionProps[]>(() => {
    return (
      data?.member_public.map(member => ({
        id: member.id || '',
        avatarUrl: member.picture_url || null,
        name: member.name || member.username || '',
        username: member.username || '',
        email: member.email || '',
        status: member.status,
      })) || []
    )
  }, [data?.member_public])

  return {
    loading,
    members,
    error,
  }
}

export default MemberSelector
