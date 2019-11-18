import { Button, Icon, Input, InputNumber, Select } from 'antd'
import React from 'react'

type PlanType = 'coupon' | 'voucher'
const PLAN_TYPE_LABEL: { [key in PlanType]: string } = {
  coupon: '折扣碼',
  voucher: '兌換碼',
}

type PlanCodeType = 'random' | 'custom'
export type PlanCodeProps = {
  type: PlanCodeType
  code: string | null
  count: number
}

type PlanCodeSelectorProps = {
  planType: PlanType
  value?: PlanCodeProps[]
  onChange?: (value: PlanCodeProps[]) => void
}
const PlanCodeSelector: React.FC<PlanCodeSelectorProps> = ({ planType, value, onChange }, ref) => {
  return (
    <div ref={ref}>
      {value &&
        value.map((couponCode, idx) => (
          <PlanCodeInputGroup
            key={idx}
            planType={planType}
            value={couponCode}
            onDelete={() => onChange && onChange([...value.slice(0, idx), ...value.slice(idx + 1)])}
            onChange={updatedCouponCode =>
              onChange && onChange([...value.slice(0, idx), updatedCouponCode, ...value.slice(idx + 1)])
            }
          />
        ))}

      <Button
        style={{ color: '#585858' }}
        onClick={() => onChange && onChange([...(value || []), { type: 'random', code: null, count: 1 }])}
        icon="plus"
      >
        {`新增${PLAN_TYPE_LABEL[planType]}`}
      </Button>
    </div>
  )
}

const PlanCodeInputGroup: React.FC<{
  planType: PlanType
  value: PlanCodeProps
  onChange: (value: PlanCodeProps) => void
  onDelete?: () => void
}> = ({ planType, value, onChange, onDelete }) => {
  return (
    <div className="d-flex align-items-center">
      <Input.Group compact className="mr-2">
        <Select value={value.type} onChange={(key: PlanCodeType) => onChange({ ...value, type: key })}>
          <Select.Option value="random">隨機</Select.Option>
          <Select.Option value="custom">自訂</Select.Option>
        </Select>

        <InputNumber
          style={{ width: '20%' }}
          placeholder="發行數量"
          value={value.count}
          onChange={count => count && onChange({ ...value, count })}
          formatter={v => `${v} 張`}
          parser={v => (v && parseInt(v.replace(' 張', ''))) || 0}
        />

        {value.type === 'custom' && (
          <Input
            style={{ width: '50%' }}
            value={value.code || ''}
            onChange={e => onChange({ ...value, code: e.target.value })}
            placeholder={`自訂${PLAN_TYPE_LABEL[planType]}`}
          />
        )}
      </Input.Group>

      <Icon type="delete" onClick={onDelete} />
    </div>
  )
}

export default React.forwardRef(PlanCodeSelector)
