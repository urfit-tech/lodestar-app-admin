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
  value?: string[]
  onChange?: (value: string[]) => void
}> = ({ fixOptions = [], value, onChange }) => {
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
  }

  return (
    <div className="row">
      <div className="col-12 mb-4 ">
        <Checkbox
          checked={allPermissions.every(permission => value?.includes(permission.id))}
          onChange={e =>
            onChange?.(
              e.target.checked ? uniq([...fixOptions, ...allPermissions.map(permission => permission.id)]) : fixOptions,
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
              options={sortBy(prop('id'))(permissionGroups[groupId]).map(permission => permission.id)}
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
        checked={options.every(option => value?.includes(option))}
        onChange={e =>
          onChange?.(e.target.checked ? [...otherValue, ...options] : [...otherValue, ...(fixedOptions || [])])
        }
      >
        {label}
      </Checkbox>
      <Divider className="my-3" />
      <div className="pl-3">
        <Checkbox.Group value={value} onChange={value => onChange && onChange([...otherValue, ...(value as string[])])}>
          {options
            .filter(option => enabledPermissions[option] ?? true)
            .map(option => (
              <div key={option}>
                <Checkbox value={option} disabled={fixedOptions?.includes(option)}>
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
