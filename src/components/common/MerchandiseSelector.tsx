import { Select } from 'antd'
import React from 'react'
import { useMerchandiseCollection } from '../../hooks/merchandise'

type MerchandiseSelectorProps = {
  value?: string
  onChange?: (value: string) => void
}

const MerchandiseSelector: React.FC<MerchandiseSelectorProps> = ({ value, onChange }, ref) => {
  const { loadingMerchandises, merchandises } = useMerchandiseCollection(false)

  return (
    <Select ref={ref} mode="multiple" loading={loadingMerchandises} value={value} onChange={onChange}>
      {merchandises.map(merchandise => (
        <Select.Option key={merchandise.id}>{merchandise.title}</Select.Option>
      ))}
    </Select>
  )
}

export default React.forwardRef(MerchandiseSelector)
