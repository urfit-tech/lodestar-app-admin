import { ExclamationCircleFilled } from '@ant-design/icons'
import { Checkbox, DatePicker, Form } from 'antd'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import CurrencyInput from './CurrencyInput'

const messages = defineMessages({
  label: { id: 'common.label.timerVisible', defaultMessage: '顯示倒數計時器' },
})

const StyledIcon = styled(ExclamationCircleFilled)`
  color: #ff7d62;
`

export type SaleProps = {
  price: number
  soldAt: Date | null
  isTimerVisible?: boolean
} | null

const SaleInput: React.FC<{
  currencyId?: string
  value?: SaleProps
  onChange?: (value: SaleProps) => void
  noPrice?: boolean
  withTimer?: boolean
}> = ({ value, onChange, currencyId, noPrice, withTimer }) => {
  const { formatMessage } = useIntl()
  const [active, setActive] = useState(!!value?.soldAt)
  const [isTimerVisible, setIsTimerVisible] = useState(!!value?.isTimerVisible)

  return (
    <div>
      <Checkbox
        checked={active}
        className="mb-2"
        onChange={e => {
          setActive(e.target.checked)
          onChange?.(
            e.target.checked
              ? {
                  price: 0,
                  soldAt: moment().add(1, 'hour').startOf('hour').toDate(),
                  isTimerVisible,
                }
              : null,
          )
        }}
      >
        {formatMessage(commonMessages.label.salePrice)}
      </Checkbox>

      <div className={active ? 'pl-3' : 'd-none'}>
        {!noPrice && (
          <Form.Item className="d-inline-block mb-0 mr-3">
            <CurrencyInput
              currencyId={currencyId}
              value={value?.price || 0}
              onChange={price =>
                onChange &&
                onChange({
                  ...value,
                  price: typeof price === 'number' ? price : 0,
                  soldAt: value?.soldAt || null,
                })
              }
            />
          </Form.Item>
        )}
        <Form.Item className="d-inline-block mb-0 mr-3">
          <DatePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm', defaultValue: moment('23:59:00', 'HH:mm:ss') }}
            showToday={false}
            placeholder={formatMessage(commonMessages.label.salePriceEndTime)}
            value={value?.soldAt ? moment(value.soldAt) : null}
            onChange={date =>
              onChange &&
              onChange({
                ...value,
                price: value?.price || 0,
                soldAt: date?.startOf('minute').toDate() || null,
              })
            }
          />
        </Form.Item>
        {value?.soldAt && moment(value.soldAt).isBefore(moment()) ? (
          <Form.Item className="d-inline-block mb-0">
            <StyledIcon className="mr-1" />
            <span>{formatMessage(commonMessages.status.outdated)}</span>
          </Form.Item>
        ) : null}
        {withTimer && (
          <Form.Item className="mb-0">
            <Checkbox
              checked={isTimerVisible}
              onChange={e => {
                setIsTimerVisible(e.target.checked)
                onChange?.({
                  price: value?.price || 0,
                  soldAt: value?.soldAt || new Date(),
                  isTimerVisible: e.target.checked,
                })
              }}
            >
              {formatMessage(messages.label)}
            </Checkbox>
          </Form.Item>
        )}
      </div>
    </div>
  )
}

export default SaleInput
