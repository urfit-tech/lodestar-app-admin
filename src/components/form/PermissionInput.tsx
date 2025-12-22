import { gql, useQuery } from '@apollo/client'
import { Checkbox, Divider, Spin } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { groupBy, prop, sortBy, uniq } from 'ramda'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import formMessages from './translation'

const messages = defineMessages({
  all: { id: 'permission.label.all', defaultMessage: '所有權限' },
})

const StyledBlock = styled.div`
  padding: 1rem;
  border: solid 1px var(--gray);
  border-radius: 2px;
`

const PermissionInput: React.FC<{
  fixOptions?: string[]
  uncheckedOptions?: string[]
  value?: string[]
  onChange?: (value: string[]) => void
}> = ({ fixOptions = [], value, onChange, uncheckedOptions = [] }) => {
  const { formatMessage } = useIntl()
  const { enabledModules, settings } = useApp()
  const { loadingPermissions, permissions: allPermissions } = usePermissionCollection()

  if (loadingPermissions) {
    return <Spin />
  }

  const permissionGroups = groupBy(permission => permission.group, allPermissions)
  const enabledGroups: {
    [groupId in keyof typeof formMessages.PermissionInput]: boolean
  } = {
    backstage: true,
    sales: true,
    program: true,
    coupon: true,
    memberAdmin: true,
    appAdmin: true,
    mediaLibrary: true,
    programPackage: !!enabledModules.program_package,
    programProgress: !!enabledModules.learning_statistics,
    appointment: !!enabledModules.appointment,
    activity: !!enabledModules.activity,
    blog: !!enabledModules.blog,
    merchandise: !!enabledModules.merchandise,
    craft: !!enabledModules.craft_page,
    voucher: !!enabledModules.voucher,
    bonus: !!enabledModules.coin,
    task: !!enabledModules.member_task,
    memberNote: !!enabledModules.member_note,
    project: !!enabledModules.project,
    contract: !!enabledModules.contract,
    analysis: !!enabledModules.analysis,
    customScript: !!enabledModules.customScript,
    salesLead: settings['custom.permission_group.salesLead'] === '1',
    salesManagement: settings['custom.permission_group.salesManagement'] === '1',
    report: !!enabledModules.report,
    certificate: !!enabledModules.certificate,
    announcement: !!enabledModules.announcement,
  }

  return (
    <div className="row">
      <div className="col-12 mb-4 ">
        <Checkbox
          checked={allPermissions
            .filter(permission => !uncheckedOptions.includes(permission.id))
            .every(permission => value?.includes(permission.id))}
          onChange={e =>
            onChange?.(
              e.target.checked
                ? uniq([
                    ...fixOptions,
                    ...allPermissions.map(permission => permission.id).filter(id => !uncheckedOptions.includes(id)),
                  ])
                : fixOptions,
            )
          }
        >
          {formatMessage(messages.all)}
        </Checkbox>
      </div>

      {Object.keys(enabledGroups)
        .filter(groupId => enabledGroups[groupId as keyof typeof enabledGroups])
        .map(groupId => (
          <div key={groupId} className="col-md-4 col-12 mb-3">
            <PermissionGroup
              label={
                formMessages.PermissionInput[groupId as keyof typeof formMessages.PermissionInput]
                  ? formatMessage(formMessages.PermissionInput[groupId as keyof typeof formMessages.PermissionInput])
                  : groupId
              }
              options={sortBy(prop('id'))(permissionGroups?.[groupId] || []).map(permission => permission.id)}
              fixedOptions={fixOptions}
              uncheckedOptions={uncheckedOptions}
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
  uncheckedOptions?: string[] // 接收這個參數
  value?: string[]
  onChange?: (value: string[]) => void
}> = ({ label, options, fixedOptions, uncheckedOptions, value, onChange }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const otherValue = value?.filter(v => !options.includes(v)) || []

  const enabledPermissions: {
    [permissionId: string]: boolean
  } = {
    PRACTICE_ADMIN: !!enabledModules.practice,
    MEMBER_ATTENDANT: !!enabledModules.attend,
    MEMBER_CONTRACT_INSERT: !!enabledModules.contract,
    MEMBER_CONTRACT_REVOKE: !!enabledModules.contract,
    SALES_CALL_ADMIN: !!enabledModules.member_assignment,
  }

  return (
    <StyledBlock>
      <Checkbox
        // 群組全選狀態：檢查是否全選時，也要把強制 unchecked 的排掉
        checked={options.filter(opt => !uncheckedOptions?.includes(opt)).every(option => value?.includes(option))}
        onChange={e =>
          onChange?.(
            e.target.checked
              ? [
                  ...otherValue,
                  // 按下群組全選時，只加入「非 uncheckedOptions」的項目
                  ...options.filter(opt => !uncheckedOptions?.includes(opt)),
                ]
              : [...otherValue, ...(fixedOptions || [])],
          )
        }
      >
        {label}
      </Checkbox>
      <Divider className="my-3" />
      <div className="pl-3">
        {/* 【這裡改動】：強制過濾 value，確保 uncheckedOptions 在視覺上永遠是未勾選 */}
        <Checkbox.Group
          value={value?.filter(v => !uncheckedOptions?.includes(v))}
          onChange={value => onChange && onChange([...otherValue, ...(value as string[])])}
        >
          {options
            .filter(option => enabledPermissions[option] ?? true)
            .map(option => (
              <div key={option}>
                <Checkbox
                  value={option}
                  // 這裡控制它變灰色 (Disabled)
                  disabled={fixedOptions?.includes(option) || uncheckedOptions?.includes(option)}
                >
                  {formMessages.PermissionGroup[option as keyof typeof formMessages.PermissionGroup]
                    ? formatMessage(formMessages.PermissionGroup[option as keyof typeof formMessages.PermissionGroup])
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
  const { loading, error, data, refetch } = useQuery<hasura.GET_PERMISSION>(gql`
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
