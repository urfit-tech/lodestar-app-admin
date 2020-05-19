import { Input, InputNumber, Select } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { promotionMessages } from '../../helpers/translation'
import { CouponPlanType } from '../../types/checkout'

const StyledGroup = styled(Input.Group)`
  .ant-select-selection--single .ant-select-selection__rendered {
    margin-right: 32px;
  }
`

type CouponPlanDiscountProps = { type: CouponPlanType; amount: number }

const CouponPlanDiscountSelector: React.FC<{
  value?: CouponPlanDiscountProps
  onChange?: (value: CouponPlanDiscountProps) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()

  return (
    <div>
      {value ? (
        <StyledGroup compact>
          <Select<CouponPlanType>
            value={value.type}
            onChange={(type: CouponPlanType) => onChange && onChange({ ...value, type })}
          >
            <Select.Option value={1}>{formatMessage(promotionMessages.term.priceType)}</Select.Option>
            <Select.Option value={2}>{formatMessage(promotionMessages.term.ratioType)}</Select.Option>
          </Select>
          <InputNumber
            style={{ width: '40%' }}
            formatter={v => `${v} ${value.type === 1 ? formatMessage(promotionMessages.term.dollar) : '%'}`}
            parser={v =>
              (v && parseFloat(v.replace(` ${formatMessage(promotionMessages.term.dollar)}`, '').replace(' %', ''))) ||
              0
            }
            value={value.amount}
            onChange={amount => amount && onChange && onChange({ ...value, amount })}
          />
        </StyledGroup>
      ) : null}
    </div>
  )
}

export default CouponPlanDiscountSelector
