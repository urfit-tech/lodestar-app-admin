import { Form, InputNumber, Select } from 'antd'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import craftMessages from '../translation'

export type SizeStyle = Pick<CSSObject, 'width' | 'height' | 'backgroundImage'>
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
            let newHeight
            if (isImgAutoHeight && currentWidthUnit === currentHeightUnit && currentHeightUnit === 'px') {
              newHeight = `${Number(v) / imgProps.originalImage.ratio}${currentHeightUnit}`
            } else if (isFullScreenImage && currentWidthUnit === currentHeightUnit && currentHeightUnit === '%') {
              newHeight = '100%'
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
          value={height}
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
              height: `${Number(v).toFixed(0)}${heightUnit}`,
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
