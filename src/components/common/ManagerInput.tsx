import { Spin } from 'antd'
import React from 'react'
import { useManagers } from '../../hooks'
import MemberSelector from '../form/MemberSelector'

const ManagerInput: React.FC<{
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}> = ({ value, onChange, disabled }) => {
  const { managers, loading, error } = useManagers()

  if (loading) {
    return <Spin />
  }

  if (error || !managers) {
    return <div>讀取錯誤</div>
  }

  return (
    <MemberSelector
      members={managers}
      value={value}
      onChange={value => typeof value === 'string' && onChange?.(value)}
      disabled={disabled}
    />
  )
}

export default ManagerInput
