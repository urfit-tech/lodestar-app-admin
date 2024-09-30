import { Spin } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { useManagers } from '../../hooks/sales'
import MemberSelector from '../form/MemberSelector'
import commonMessages from './translation'

const ManagerInput: React.FC<{
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}> = ({ value, onChange, disabled }) => {
  const { currentMemberId } = useAuth()
  const { managers, loading, error } = useManagers()
  const { formatMessage } = useIntl()

  if (!currentMemberId || loading) {
    return <Spin />
  }

  if (error || !managers) {
    return <div>{formatMessage(commonMessages.ManagerInput.loadError)}</div>
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
