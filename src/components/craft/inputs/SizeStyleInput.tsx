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
  isFullScreenImage: boolean
  onIsImgAutoHeightChange?: (value: boolean) => void
  onIsFullScreenImageChange?: (value: boolean) => void
  onChange?: (value: SizeStyle) => void
}

const SizeStyleInput: React.VFC<SizeStyleInputProps> = ({
  value,
  imgProps,
  isImgAutoHeight,
  isFullScreenImage,
  onIsImgAutoHeightChange,
  onIsFullScreenImageChange,
  onChange,
}) => {
  const { formatMessage } = useIntl()

  return (
    <>
      <Form.Item label={formatMessage(craftMessages['*'].width)}>
        <InputNumber
          disabled={isFullScreenImage}
          value={value?.width === undefined ? imgProps.width : extractNumber(value?.width?.toString())}
          min={0}
          onChange={v => {
            const currentWidthUnit = extractSizeUnit(value?.width?.toString())
            const currentHeightUnit = extractSizeUnit(value?.height?.toString())
            let newHeight
            if (isImgAutoHeight && currentWidthUnit === currentHeightUnit && currentHeightUnit === 'px') {
              newHeight = `${Number(v) / imgProps.originalImage.ratio}${currentHeightUnit}`
            } else if (isFullScreenImage && currentWidthUnit === currentHeightUnit && currentHeightUnit === '%') {
              newHeight = '100%'
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
          disabled={
            (isImgAutoHeight && extractSizeUnit(value?.width?.toString()) === 'px') ||
            (isFullScreenImage && extractSizeUnit(value?.width?.toString()) === '%')
          }
          value={extractSizeUnit(value?.width?.toString())}
          onChange={v => {
            const currentUnit = extractSizeUnit(value?.width?.toString())
            if (v !== currentUnit) {
              if (v === 'px') {
                onIsFullScreenImageChange?.(false)
              } else if (v === '%') {
                onIsImgAutoHeightChange?.(false)
              }
            }
            onChange?.({
              ...value,
              width:
                v === '%' && extractNumber(value?.width?.toString()) > 100
                  ? '100%'
                  : extractNumber(value?.width?.toString()) + v,
            })
          }}
          style={{ width: '70px' }}
        >
          <Select.Option value="px">px</Select.Option>
          <Select.Option value="%">%</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label={formatMessage(craftMessages.SizeStyleInput.height)}>
        <InputNumber
          value={value?.width !== undefined ? extractNumber(value?.height?.toString()) : imgProps.height}
          min={0}
          disabled={isImgAutoHeight || isFullScreenImage}
          onChange={v => {
            const currentWidthUnit = extractSizeUnit(value?.width?.toString())
            const currentHeightUnit = extractSizeUnit(value?.height?.toString())
            let newWidth
            if (isImgAutoHeight && currentWidthUnit === currentHeightUnit && currentHeightUnit === 'px') {
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
          disabled={
            (isImgAutoHeight && extractSizeUnit(value?.width?.toString()) === 'px') ||
            (isFullScreenImage && extractSizeUnit(value?.width?.toString()) === '%')
          }
          value={extractSizeUnit(value?.height?.toString())}
          onChange={v => {
            const currentUnit = extractSizeUnit(value?.height?.toString())
            if (v !== currentUnit) {
              if (v === 'px') {
                onIsFullScreenImageChange?.(false)
              } else if (v === '%') {
                onIsImgAutoHeightChange?.(false)
              }
            }

            onChange?.({
              ...value,
              height:
                v === '%' && extractNumber(value?.height?.toString()) > 100
                  ? '100%'
                  : extractNumber(value?.height?.toString()) + v,
            })
          }}
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
