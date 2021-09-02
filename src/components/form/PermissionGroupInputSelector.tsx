import { Select } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { usePermissionGroup } from '../../hooks/permission'

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

const PermissionGroupInputSelector: React.FC<{
  single?: boolean
  value?: string
  onChange?: (value: string) => void
}> = ({ single, value, onChange }) => {
  const { loading, permissionGroups } = usePermissionGroup()

  return (
    <StyledSelect mode={single ? undefined : 'multiple'} loading={loading} value={value} onChange={onChange}>
      {permissionGroups.map(permissionGroup => (
        <Select.Option key={permissionGroup.id} value={permissionGroup.id} style={{ borderRadius: '4px' }}>
          {permissionGroup.name}
        </Select.Option>
      ))}
    </StyledSelect>
  )
}

export default PermissionGroupInputSelector
