import { Input, InputNumber, Select } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { CouponPlanType } from '../../types/checkout'
import couponMessages from './translation'

const StyledGroup = styled(Input.Group)`
  .ant-select-selection--single .ant-select-selection__rendered {
    margin-right: 32px;
  }
`

export type CouponPlanDiscountProps = {
  type: CouponPlanType
  amount: number
}

const CouponPlanDiscountSelector: React.FC<{
  value?: CouponPlanDiscountProps
  onChange?: (value: CouponPlanDiscountProps) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()

  return (
    <div>
      {value ? (
        <StyledGroup compact>
          <Select<CouponPlanType> value={value.type} onChange={type => onChange && onChange({ ...value, type })}>
            <Select.Option value="cash">
              {formatMessage(couponMessages.CouponPlanDiscountSelector.priceType)}
            </Select.Option>
            <Select.Option value="percent">
              {formatMessage(couponMessages.CouponPlanDiscountSelector.ratioType)}
            </Select.Option>
          </Select>
          <InputNumber
            style={{ width: '40%' }}
            formatter={v =>
              `${v} ${value.type === 'cash' ? formatMessage(couponMessages.CouponPlanDiscountSelector.dollar) : '%'}`
            }
            parser={v =>
              (v &&
                parseFloat(
                  v
                    .replace(` ${formatMessage(couponMessages.CouponPlanDiscountSelector.dollar)}`, '')
                    .replace(' %', ''),
                )) ||
              0
            }
            value={value.amount}
            onChange={amount => typeof amount === 'number' && onChange && onChange({ ...value, amount })}
          />
        </StyledGroup>
      ) : null}
    </div>
  )
}

export default CouponPlanDiscountSelector
