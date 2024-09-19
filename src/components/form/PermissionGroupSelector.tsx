import { Select } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { usePermissionGroupCollection } from '../../hooks/permission'

const StyledSelect = styled(Select)<{ value?: any; onChange?: any }>`
  width: 100%;

  && .ant-select-selection__choice {
    padding-right: 2rem;
    background: var(--gray-lighter);
    color: var(--gray-darker);
  }

  .ant-select-selection--multiple .ant-select-selection__choice {
    border: none;
    border-radius: 4px;
  }

  .ant-select-selection--multiple .ant-select-selection__choice__remove {
    right: 0.5rem;
    color: #9b9b9b;
  }
`

const PermissionGroupSelector: React.FC<{
  single?: boolean
  value?: string
  onChange?: (value: string) => void
  onClear?: () => void
}> = ({ single, value, onChange, onClear }) => {
  const { loadingPermissionGroups, permissionGroups } = usePermissionGroupCollection()

  return (
    <StyledSelect
      allowClear
      mode={single ? undefined : 'multiple'}
      loading={loadingPermissionGroups}
      value={value}
      onChange={onChange}
      onClear={onClear}
      placeholder="請選擇權限群組"
    >
      {permissionGroups.map(permissionGroup => (
        <Select.Option key={permissionGroup.id} value={permissionGroup.id || ''} style={{ borderRadius: '4px' }}>
          {permissionGroup.name}
        </Select.Option>
      ))}
    </StyledSelect>
  )
}

export default PermissionGroupSelector
