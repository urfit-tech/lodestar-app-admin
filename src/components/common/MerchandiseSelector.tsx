import { Select } from 'antd'
import React from 'react'
import { useMerchandiseCollection } from '../../hooks/merchandise'

const MerchandiseSelector: React.FC<{
  value?: string
  onChange?: (value: string) => void
}> = ({ value, onChange }) => {
  const { loadingMerchandises, merchandises } = useMerchandiseCollection(false)

  return (
    <Select<string> mode="multiple" loading={loadingMerchandises} value={value} onChange={onChange}>
      {merchandises.map(merchandise => (
        <Select.Option key={merchandise.id} value={merchandise.id}>
          {merchandise.title}
        </Select.Option>
      ))}
    </Select>
  )
}

export default MerchandiseSelector
