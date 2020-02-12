import { Select } from 'antd'
import Axios from 'axios'
import React, { forwardRef, useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getZoomUserTypeLabel } from '../../helpers'

export type MemberOptionProps = {
  id: string
  avatarUrl?: string | null
  name?: string
  username: string
  email?: string
}
type ZoomUserSelectorProps = {
  value?: string | null
  onChange?: (value: string | null) => void
}
const ZoomUserSelector: React.FC<ZoomUserSelectorProps> = ({ value, onChange }, ref) => {
  const { authToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [zoomUsers, setZoomUsers] = useState<{ id: string; email: string; type: number; bound: boolean }[]>([])
  useEffect(() => {
    if (authToken) {
      setLoading(true)
      Axios.post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/getZoomUserList`, null, {
        headers: { Authorization: 'Bearer ' + authToken },
      })
        .then(({ data }) => setZoomUsers(data))
        .finally(() => setLoading(false))
    }
  }, [authToken])
  return (
    <Select<string | null>
      ref={ref}
      loading={loading}
      disabled={loading}
      allowClear
      showSearch
      placeholder="請選擇 Zoom 使用者"
      value={loading ? null : value}
      onChange={value => onChange && onChange(value)}
      optionFilterProp="data-source"
      style={{ width: '100%' }}
    >
      {zoomUsers.map(user => (
        <Select.Option key={user.id} value={user.id} disabled={user.bound} data-source={user.email}>
          {user.email} | {getZoomUserTypeLabel(user.type)}
        </Select.Option>
      ))}
    </Select>
  )
}

export default forwardRef(ZoomUserSelector)
