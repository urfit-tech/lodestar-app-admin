import { Form, InputNumber } from 'antd'
import { defineMessages, useIntl } from 'react-intl'

const labelMessages = defineMessages({
  columns: { id: 'common.ui.columns', defaultMessage: '欄數' },
  gutter: { id: 'common.ui.gutter', defaultMessage: '間距' },
  gap: { id: 'common.ui.gap', defaultMessage: '行距' },
})
const messages = defineMessages({
  mobileCollection: { id: 'common.ui.mobileCollection', defaultMessage: '手機' },
  tabletCollection: { id: 'common.ui.tabletCollection', defaultMessage: '平板' },
  desktopCollection: { id: 'common.ui.desktopCollection', defaultMessage: '電腦' },
})
export type ResponsiveInputValue = [number | null, number | null, number | null]
const ResponsiveInput: React.VFC<{
  label: keyof typeof labelMessages
  value?: ResponsiveInputValue
  onChange?: (value: ResponsiveInputValue) => void
}> = ({ label, value, onChange }) => {
  const { formatMessage } = useIntl()
  return (
    <div>
      <div className="d-flex">
        <Form.Item label={formatMessage(messages.mobileCollection) + formatMessage(labelMessages[label])}>
          <InputNumber
            value={Number(value?.[0])}
            onChange={v => onChange?.([Number(v) || null, Number(value?.[1]) || null, Number(value?.[2]) || null])}
          />
        </Form.Item>
        <Form.Item label={formatMessage(messages.tabletCollection) + formatMessage(labelMessages[label])}>
          <InputNumber
            value={Number(value?.[1])}
            onChange={v => onChange?.([Number(value?.[0]) || null, Number(v) || null, Number(value?.[2]) || null])}
          />
        </Form.Item>
        <Form.Item label={formatMessage(messages.desktopCollection) + formatMessage(labelMessages[label])}>
          <InputNumber
            value={Number(value?.[2])}
            onChange={v => onChange?.([Number(value?.[0]) || null, Number(value?.[1]) || null, Number(v) || null])}
          />
        </Form.Item>
      </div>
    </div>
  )
}

export default ResponsiveInput
