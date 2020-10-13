import { useQuery } from '@apollo/react-hooks'
import { Checkbox, Divider, Spin } from 'antd'
import gql from 'graphql-tag'
import { groupBy, uniq } from 'ramda'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { permissionMessages } from '../../helpers/translation'
import types from '../../types'

const messages = defineMessages({
  all: { id: 'permission.label.all', defaultMessage: '所有權限' },
  backstage: { id: 'permission.label.backstage', defaultMessage: '後台權限' },
  sales: { id: 'permission.label.sales', defaultMessage: '銷售管理' },
  program: { id: 'permission.label.program', defaultMessage: '線上課程' },
  programPackage: { id: 'permission.label.programPackage', defaultMessage: '課程組合' },
  programProgress: { id: 'permission.label.programProgress', defaultMessage: '學習進度' },
  appointment: { id: 'permission.label.appointment', defaultMessage: '預約服務' },
  activity: { id: 'permission.label.activity', defaultMessage: '線下實體' },
  blog: { id: 'permission.label.post', defaultMessage: '媒體文章' },
  coupon: { id: 'permission.label.coupon', defaultMessage: '折價方案' },
  voucher: { id: 'permission.label.voucher', defaultMessage: '兌換方案' },
  bonus: { id: 'permission.label.bonus', defaultMessage: '紅利折抵' },
  memberAdmin: { id: 'permission.label.memberAdmin', defaultMessage: '會員管理' },
  task: { id: 'permission.label.task', defaultMessage: '任務管理' },
  appAdmin: { id: 'permission.label.appAdmin', defaultMessage: '網站管理' },
})

const StyledBlock = styled.div`
  padding: 1rem;
  border: solid 1px var(--gray);
  border-radius: 2px;
`

const PermissionInput: React.FC<{
  fixOptions?: string[]
  value?: string[]
  onChange?: (value: string[]) => void
}> = ({ fixOptions, value, onChange }) => {
  const { formatMessage } = useIntl()
  const { loadingPermissions, permissions: allPermissions } = usePermissionCollection()

  if (loadingPermissions) {
    return <Spin />
  }

  const permissionGroups = groupBy(permission => permission.group, allPermissions)

  return (
    <div className="row">
      <div className="col-12 mb-4 ">
        <Checkbox
          checked={allPermissions.every(permission => value?.includes(permission.id))}
          onChange={e =>
            onChange &&
            onChange(
              e.target.checked
                ? uniq([...(fixOptions || []), ...allPermissions.map(permission => permission.id)])
                : fixOptions || [],
            )
          }
        >
          {formatMessage(messages.all)}
        </Checkbox>
      </div>
      {Object.keys(permissionGroups).map(groupId => (
        <div key={groupId} className="col-4 mb-3">
          <PermissionGroup
            label={
              messages[groupId as keyof typeof messages]
                ? formatMessage(messages[groupId as keyof typeof messages])
                : groupId
            }
            options={permissionGroups[groupId].map(permission => permission.id)}
            fixedOptions={fixOptions}
            value={value}
            onChange={onChange}
          />
        </div>
      ))}
    </div>
  )
}

const PermissionGroup: React.FC<{
  label: string
  options: string[]
  fixedOptions?: string[]
  value?: string[]
  onChange?: (value: string[]) => void
}> = ({ label, options, fixedOptions, value, onChange }) => {
  const { formatMessage } = useIntl()
  const otherValue = value?.filter(v => !options.includes(v)) || []

  return (
    <StyledBlock>
      <Checkbox
        checked={options.every(option => value?.includes(option))}
        onChange={e =>
          onChange &&
          onChange(e.target.checked ? [...otherValue, ...options] : [...otherValue, ...(fixedOptions || [])])
        }
      >
        {label}
      </Checkbox>
      <Divider className="my-3" />
      <div className="pl-3">
        <Checkbox.Group value={value} onChange={value => onChange && onChange([...otherValue, ...(value as string[])])}>
          {options.map(option => (
            <div key={option}>
              <Checkbox value={option} disabled={fixedOptions?.includes(option)}>
                {permissionMessages[option as keyof typeof permissionMessages]
                  ? formatMessage(permissionMessages[option as keyof typeof permissionMessages])
                  : option}
              </Checkbox>
            </div>
          ))}
        </Checkbox.Group>
      </div>
    </StyledBlock>
  )
}

const usePermissionCollection = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_PERMISSION>(gql`
    query GET_PERMISSION {
      permission {
        id
        group
      }
    }
  `)

  const permissions: {
    id: string
    group: string
  }[] =
    data?.permission.map(v => ({
      id: v.id,
      group: v.group,
    })) || []

  return {
    loadingPermissions: loading,
    errorPermissions: error,
    permissions,
    refetchPermissions: refetch,
  }
}

export default PermissionInput
