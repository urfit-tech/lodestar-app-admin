import { Form, InputNumber, Select } from 'antd'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import craftMessages from '../translation'

export type SizeStyle = Pick<CSSObject, 'width' | 'height' | 'backgroundImage'>
type SizeStyleInputProps = {
  value?: SizeStyle
  aspectRatio: number
  width: number
  height: number
  widthUnit: 'px' | '%'
  heightUnit: 'px' | '%'
  isImageAutoHeight: boolean
  isFullScreenImage: boolean
  onWidthChange?: (value: number) => void
  onHeightChange?: (value: number) => void
  onWidthUnitChange?: (value: 'px' | '%') => void
  onHeightUnitChange?: (value: 'px' | '%') => void
  onIsImageAutoHeightChange?: (value: boolean) => void
  onIsFullScreenImageChange?: (value: boolean) => void
  onChange?: (value: SizeStyle) => void
}

const SizeStyleInput: React.VFC<SizeStyleInputProps> = ({
  value,
  aspectRatio,
  width,
  height,
  widthUnit,
  heightUnit,
  isImageAutoHeight,
  isFullScreenImage,
  onWidthChange,
  onHeightChange,
  onWidthUnitChange,
  onHeightUnitChange,
  onIsImageAutoHeightChange,
  onIsFullScreenImageChange,
  onChange,
}) => {
  const { formatMessage } = useIntl()

  return (
    <>
      <Form.Item label={formatMessage(craftMessages['*'].width)}>
        <InputNumber
          disabled={isFullScreenImage}
          value={width}
          min={0}
          onChange={v => {
            let newHeight
            if (isImageAutoHeight && widthUnit === heightUnit && heightUnit === 'px') {
              const ratioHeight = Number((Number(v) / aspectRatio).toFixed(0))
              onHeightChange?.(ratioHeight)
              newHeight = ratioHeight
            } else if (isFullScreenImage && widthUnit === heightUnit && heightUnit === '%') {
              onHeightChange?.(100)
              newHeight = 100
            } else {
              newHeight = height
            }
            onWidthChange?.(Number(Number(v).toFixed(0)))
            onChange?.({
              ...value,
              width: `${Number(v).toFixed(0)}${widthUnit}`,
              height: `${newHeight}${heightUnit}`,
            })
          }}
        />
        <Select
          defaultValue="px"
          disabled={(isImageAutoHeight && widthUnit === 'px') || (isFullScreenImage && widthUnit === '%')}
          value={widthUnit}
          onChange={v => {
            if (v !== widthUnit) {
              if (v === 'px') {
                onIsFullScreenImageChange?.(false)
              } else if (v === '%') {
                onIsImageAutoHeightChange?.(false)
              }
              onWidthUnitChange?.(v)
            }
            onChange?.({ ...value, width: v === '%' && width > 100 ? '100%' : width + v })
          }
          }
          style={{ width: '70px' }}
        >
          <Select.Option value="px">px</Select.Option>
          <Select.Option value="%">%</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label={formatMessage(craftMessages.SizeStyleInput.height)}>
        <InputNumber
          value={height}
          min={0}
          disabled={isImageAutoHeight || isFullScreenImage}
          onChange={v => {
            onHeightChange?.(Number(Number(v).toFixed(0)))
            onChange?.({
              ...value,
              height: `${Number(v).toFixed(0)}${heightUnit}`,
            })
          }}
        />
        <Select
          defaultValue="px"
          disabled={(isImageAutoHeight && widthUnit === 'px') || (isFullScreenImage && widthUnit === '%')}
          value={heightUnit}
          onChange={v => {
            if (v !== heightUnit) {
              if (v === 'px') {
                onIsFullScreenImageChange?.(false)
              } else if (v === '%') {
                onIsImageAutoHeightChange?.(false)
              }
              onHeightUnitChange?.(v)
            }
            onChange?.({ ...value, height: v === '%' && height > 100 ? '100%' : height + v })
          }
          }
          style={{ width: '70px' }}
        >
          <Select.Option value="px">px</Select.Option>
          <Select.Option value="%">%</Select.Option>
        </Select>
      </Form.Item>
    </>
  )
}

export default SizeStyleInput
