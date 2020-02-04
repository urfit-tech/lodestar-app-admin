import { Button, Icon, Input, InputNumber, Select } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { promotionMessages } from '../../helpers/translation'

type PlanType = 'coupon' | 'voucher'
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
  const { formatMessage } = useIntl()

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
        {formatMessage(promotionMessages.label.create)}{' '}
        {planType === 'coupon'
          ? formatMessage(promotionMessages.term.couponCodes)
          : formatMessage(promotionMessages.term.voucherCodes)}
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
  const { formatMessage } = useIntl()

  return (
    <div className="d-flex align-items-center">
      <Input.Group compact className="mr-2">
        <Select value={value.type} onChange={(key: PlanCodeType) => onChange({ ...value, type: key })}>
          <Select.Option value="random">{formatMessage(promotionMessages.ui.random)}</Select.Option>
          <Select.Option value="custom">{formatMessage(promotionMessages.ui.custom)}</Select.Option>
        </Select>

        <InputNumber
          style={{ width: '20%' }}
          placeholder={formatMessage(promotionMessages.term.amount)}
          value={value.count}
          onChange={count => count && onChange({ ...value, count })}
          formatter={v => `${v} ${formatMessage(promotionMessages.label.unit)}`}
          parser={v => (v && parseInt(v.replace(` ${formatMessage(promotionMessages.label.unit)}`, ''))) || 0}
        />

        {value.type === 'custom' && (
          <Input
            style={{ width: '50%' }}
            value={value.code || ''}
            onChange={e => onChange({ ...value, code: e.target.value })}
            placeholder={`${formatMessage(promotionMessages.ui.custom)} ${
              planType === 'coupon'
                ? formatMessage(promotionMessages.term.couponCodes)
                : formatMessage(promotionMessages.term.voucherCodes)
            }`}
          />
        )}
      </Input.Group>

      <Icon type="delete" onClick={onDelete} />
    </div>
  )
}

export default React.forwardRef(PlanCodeSelector)
