import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Input, InputNumber, Select } from 'antd'
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

const PlanCodeSelector: React.FC<{
  planType: PlanType
  value?: PlanCodeProps[]
  onChange?: (value: PlanCodeProps[]) => void
}> = ({ planType, value, onChange }) => {
  const { formatMessage } = useIntl()

  return (
    <div>
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
        icon={<PlusOutlined />}
      >
        {formatMessage(promotionMessages.label.create)}{' '}
        {planType === 'coupon'
          ? formatMessage(promotionMessages.label.couponCodes)
          : formatMessage(promotionMessages.label.voucherCodes)}
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
          placeholder={formatMessage(promotionMessages.label.amount)}
          value={value.count}
          onChange={count => typeof count === 'number' && onChange({ ...value, count })}
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
                ? formatMessage(promotionMessages.label.couponCodes)
                : formatMessage(promotionMessages.label.voucherCodes)
            }`}
          />
        )}
      </Input.Group>

      <DeleteOutlined onClick={onDelete} />
    </div>
  )
}

export default PlanCodeSelector
