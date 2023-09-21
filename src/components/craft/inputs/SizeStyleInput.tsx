import { Form, InputNumber, Select } from 'antd'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import craftMessages from '../translation'

export const extractNumber = (string?: string) =>
  string?.match(/\d+/g)?.[0] ? Number(string.match(/\d+/g)?.[0]) : undefined

export const extractSizeUnit = (string?: string) => string?.match(/px|%|rem|em|vw|vh/g)?.[0]

export type SizeStyle = Pick<CSSObject, 'width' | 'height' | 'backgroundImage'>
type imgProps = {
  width: number
  height: number
  aspectRatio: number
  gcd: number
  widthAspect: number
  heightAspect: number
}
type SizeStyleInputProps = {
  value?: SizeStyle
  imgProps: imgProps
  isImgAutoHeight: boolean
  onChange?: (value: SizeStyle) => void
}

const SizeStyleInput: React.VFC<SizeStyleInputProps> = ({ value, imgProps, isImgAutoHeight, onChange }) => {
  const { formatMessage } = useIntl()

  return (
    <>
      <Form.Item label={formatMessage(craftMessages['*'].width)}>
        <InputNumber
          value={value?.width === undefined ? imgProps.width : extractNumber(value?.width?.toString())}
          min={0}
          onChange={v => {
            let newHeight = 0
            if (typeof v === 'number') {
              let newGcd = v / imgProps.widthAspect
              newHeight = imgProps.heightAspect * newGcd
            }
            let originalHeight = value?.height === undefined ? imgProps.height : value?.height
            onChange?.({
              ...value,
              width: Number(v) + (extractSizeUnit(value?.width?.toString()) || 'px'),
              height: isImgAutoHeight
                ? Number(newHeight) + (extractSizeUnit(value?.width?.toString()) || 'px')
                : originalHeight,
            })
          }}
        />
        <Select
          defaultValue="px"
          value={extractSizeUnit(value?.width?.toString())}
          onChange={v =>
            onChange?.({
              ...value,
              width: extractNumber(value?.width?.toString()) + v,
            })
          }
          style={{ width: '70px' }}
        >
          <Select.Option value="px">px</Select.Option>
          <Select.Option value="%">%</Select.Option>
          <Select.Option value="rem">rem</Select.Option>
          <Select.Option value="em">em</Select.Option>
          <Select.Option value="vw">vw</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label={formatMessage(craftMessages.SizeStyleInput.height)}>
        <InputNumber
          value={value?.width !== undefined ? extractNumber(value?.height?.toString()) : imgProps.height}
          min={0}
          disabled={isImgAutoHeight}
          onChange={v =>
            onChange?.({
              ...value,
              height: Number(v) + (extractSizeUnit(value?.height?.toString()) || 'px'),
            })
          }
        />
        <Select
          defaultValue="px"
          value={extractSizeUnit(value?.height?.toString())}
          disabled={isImgAutoHeight}
          onChange={v => onChange?.({ ...value, height: extractNumber(value?.height?.toString()) + v })}
          style={{ width: '70px' }}
        >
          <Select.Option value="px">px</Select.Option>
          <Select.Option value="%">%</Select.Option>
          <Select.Option value="rem">rem</Select.Option>
          <Select.Option value="em">em</Select.Option>
          <Select.Option value="vh">vh</Select.Option>
        </Select>
      </Form.Item>
    </>
  )
}

export default SizeStyleInput
