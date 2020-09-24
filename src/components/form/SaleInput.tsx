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
  timerVisible?: boolean
} | null

const SaleInput: React.FC<{
  currencyId?: string
  timer?: boolean
  value?: SaleProps
  onChange?: (value: SaleProps) => void
}> = ({ value, onChange, currencyId, timer = false }) => {
  const { formatMessage } = useIntl()
  const [active, setActive] = useState(!!value?.soldAt)
  const [timerVisible, setTimerVisible] = useState(!!value?.timerVisible)

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
          <CurrencyInput
            noLabel
            currencyId={currencyId}
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
            showTime={{ format: 'HH:mm', defaultValue: moment('23:59:00', 'HH:mm:ss') }}
            showToday={false}
            placeholder={formatMessage(commonMessages.label.salePriceEndTime)}
            value={value?.soldAt ? moment(value.soldAt) : null}
            onChange={date =>
              onChange &&
              onChange({
                price: value?.price || 0,
                soldAt: date?.startOf('minute').toDate() || null,
                timerVisible: !!value?.timerVisible,
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
        {timer && (
          <Form.Item className="mb-0">
            <Checkbox
              checked={timerVisible}
              onChange={e => {
                setTimerVisible(e.target.checked)
                onChange &&
                  onChange({
                    price: value?.price || 0,
                    soldAt: value?.soldAt || new Date(),
                    timerVisible: e.target.checked,
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
