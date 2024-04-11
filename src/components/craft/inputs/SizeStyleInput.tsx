import { Form, InputNumber, Select } from 'antd'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { convertToPx, extractNumber, extractSizeUnit } from '../../../helpers'
import craftMessages from '../translation'

export type SizeStyle = Pick<CSSObject, 'width' | 'height' | 'backgroundImage'>
type imgProps = {
  width: number
  height: number
  aspectRatio: number
  originalImage: {
    width: string
    height: string
    ratio: number
  }
}
type SizeStyleInputProps = {
  value?: SizeStyle
  imgProps: imgProps
  isImgAutoHeight: boolean
  onRatioChange?: (value: number) => void
  onChange?: (value: SizeStyle) => void
}

const SizeStyleInput: React.VFC<SizeStyleInputProps> = ({
  value,
  imgProps,
  isImgAutoHeight,
  onRatioChange,
  onChange,
}) => {
  const { formatMessage } = useIntl()

  return (
    <>
      <Form.Item label={formatMessage(craftMessages['*'].width)}>
        <InputNumber
          value={value?.width === undefined ? imgProps.width : extractNumber(value?.width?.toString())}
          min={0}
          onChange={v => {
            const currentWidthUnit = extractSizeUnit(value?.width?.toString())
            const currentHeightUnit = extractSizeUnit(value?.height?.toString())
            let newHeight
            if (isImgAutoHeight) {
              newHeight = `${Number(v) / imgProps.originalImage.ratio}${currentHeightUnit}`
            } else if (currentWidthUnit === currentHeightUnit && ['px', 'em', 'vw'].includes(currentWidthUnit)) {
              newHeight = `${convertToPx(v?.toString() || '0px') / imgProps.aspectRatio}${currentHeightUnit}`
            } else {
              newHeight = value?.height
            }
            onChange?.({
              ...value,
              width: `${Number(v).toFixed(0)}${extractSizeUnit(value?.width?.toString()) || 'px'}`,
              height: newHeight,
            })
          }}
        />
        <Select
          defaultValue="px"
          value={extractSizeUnit(value?.width?.toString())}
          onChange={v => onChange?.({ ...value, width: extractNumber(value?.width?.toString()) + v })}
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
          onChange={v => {
            const currentWidthUnit = extractSizeUnit(value?.width?.toString())
            const currentHeightUnit = extractSizeUnit(value?.height?.toString())
            let newWidth
            if (currentWidthUnit === currentHeightUnit && ['px', 'em', 'vh'].includes(currentHeightUnit)) {
              newWidth = `${convertToPx(v?.toString() || '0px') * imgProps.aspectRatio}${currentWidthUnit}`
            } else {
              newWidth = value?.width
            }
            onChange?.({
              ...value,
              width: newWidth,
              height: `${Number(v).toFixed(0)}${extractSizeUnit(value?.height?.toString())}`,
            })
          }}
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
