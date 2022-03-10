import { Form, InputNumber, Select } from 'antd'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import craftMessages from '../translation'

export const extractNumber = (string?: string) =>
  string?.match(/\d+/g)?.[0] ? Number(string.match(/\d+/g)?.[0]) : undefined

export const extractSizeUnit = (string?: string) => string?.match(/px|%|rem|em/g)?.[0]

export type SizeStyle = Pick<CSSObject, 'width' | 'height'>
type SizeStyleInputProps = {
  value?: SizeStyle
  onChange?: (value: SizeStyle) => void
}
const SizeStyleInput: React.VFC<SizeStyleInputProps> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()

  return (
    <>
      <Form.Item label={formatMessage(craftMessages['*'].width)}>
        <InputNumber
          value={extractNumber(value?.width?.toString())}
          min={0}
          onChange={v =>
            onChange?.({
              ...value,
              width: Number(v) + (extractSizeUnit(value?.width?.toString()) || 'px'),
            })
          }
        />
        <Select
          value={extractSizeUnit(value?.width?.toString())}
          onChange={v => onChange?.({ ...value, width: extractNumber(value?.width?.toString()) + v })}
          style={{ width: '70px' }}
        >
          <Select.Option value="px">px</Select.Option>
          <Select.Option value="%">%</Select.Option>
          <Select.Option value="rem">rem</Select.Option>
          <Select.Option value="em">em</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label={formatMessage(craftMessages.SizeStyleInput.height)}>
        <InputNumber
          value={extractNumber(value?.height?.toString())}
          min={0}
          onChange={v =>
            onChange?.({
              ...value,
              height: Number(v) + (extractSizeUnit(value?.height?.toString()) || 'px'),
            })
          }
        />
        <Select
          value={extractSizeUnit(value?.height?.toString())}
          onChange={v => onChange?.({ ...value, height: extractNumber(value?.height?.toString()) + v })}
          style={{ width: '70px' }}
        >
          <Select.Option value="px">px</Select.Option>
          <Select.Option value="%">%</Select.Option>
          <Select.Option value="rem">rem</Select.Option>
          <Select.Option value="em">em</Select.Option>
        </Select>
      </Form.Item>
    </>
  )
}

export default SizeStyleInput
