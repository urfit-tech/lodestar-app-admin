import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { Checkbox, DatePicker, InputNumber } from 'antd'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'

const StyledIcon = styled(ExclamationCircleFilled)`
  color: #ff7d62;
`

type SaleProps = {
  price: number
  soldAt: Date | null
} | null

const SaleInput: React.FC<{
  value?: SaleProps
  onChange?: (value: SaleProps) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const [active, setActive] = useState(!!value?.soldAt)

  return (
    <div>
      <Checkbox
        checked={active}
        onChange={e => {
          setActive(e.target.checked)
          onChange &&
            onChange(
              e.target.checked
                ? {
                    price: 0,
                    soldAt: moment().add(1, 'hour').startOf('hour').toDate(),
                  }
                : null,
            )
        }}
      >
        {formatMessage(commonMessages.term.salePrice)}
      </Checkbox>

      <div className={active ? '' : 'd-none'}>
        <Form.Item className="d-inline-block mb-0 mr-3">
          <InputNumber
            min={0}
            formatter={price => `NT$ ${price}`}
            parser={price => (price ? price.replace(/\D/g, '') : '')}
            value={value?.price || 0}
            onChange={price =>
              onChange &&
              onChange({
                price: typeof price === 'number' ? price : 0,
                soldAt: value?.soldAt || null,
              })
            }
          />
        </Form.Item>
        <Form.Item className="d-inline-block mb-0 mr-3">
          <DatePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm' }}
            showToday={false}
            placeholder={formatMessage(commonMessages.label.salePriceEndTime)}
            value={value?.soldAt ? moment(value.soldAt) : null}
            onChange={date =>
              onChange &&
              onChange({
                price: value?.price || 0,
                soldAt: date?.startOf('minute').toDate() || null,
              })
            }
          />
        </Form.Item>
        {value?.soldAt && moment(value.soldAt).isBefore(moment()) ? (
          <div className="d-inline-block">
            <StyledIcon className="mr-1" />
            <span>{formatMessage(commonMessages.label.outdated)}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default SaleInput
