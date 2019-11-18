import { Input, InputNumber, Select } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { InferType } from 'yup'
import { couponPlanTypeSchema } from '../../schemas/coupon'

const StyledGroup = styled(Input.Group)`
  .ant-select-selection--single .ant-select-selection__rendered {
    margin-right: 32px;
  }
`

type CouponPlanType = InferType<typeof couponPlanTypeSchema>
const CouponPlanDiscountSelector: React.FC<{
  value?: { type: CouponPlanType; amount: number }
  onChange?: (value: { type: CouponPlanType; amount: number }) => void
}> = ({ value, onChange }, ref) => {
  return (
    <div ref={ref}>
      {value ? (
        <StyledGroup compact>
          <Select value={value.type} onChange={(type: CouponPlanType) => onChange && onChange({ ...value, type })}>
            <Select.Option value={1}>折扣金額</Select.Option>
            <Select.Option value={2}>折扣比例</Select.Option>
          </Select>
          <InputNumber
            style={{ width: '40%' }}
            formatter={v => `${v} ${value.type === 1 ? '元' : '%'}`}
            parser={v => (v && parseFloat(v.replace(' 元', '').replace(' %', ''))) || 0}
            placeholder="額度"
            value={value.amount}
            onChange={amount => amount && onChange && onChange({ ...value, amount })}
          />
        </StyledGroup>
      ) : null}
    </div>
  )
}

export default React.forwardRef(CouponPlanDiscountSelector)
