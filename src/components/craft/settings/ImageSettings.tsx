import { Checkbox, Collapse, Input } from 'antd'
import Form from 'antd/lib/form/'
import { useForm } from 'antd/lib/form/Form'
import { ImageProps } from 'lodestar-app-element/src/components/common/Image'
import { useContext, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { extractSizeNumber, extractSizeUnit } from '../../../helpers'
import CraftPageBuilderContext from '../../../pages/CraftPageAdminPage/CraftPageBuilderContext'
import {
  CraftElementSettings,
  CraftSettingLabel,
  StyledCollapsePanel,
} from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import { AdminHeaderTitle } from '../../admin'
import BackgroundStyleInput from '../inputs/BackgroundStyleInput'
import BorderStyleInput from '../inputs/BorderStyleInput'
import SizeStyleInput from '../inputs/SizeStyleInput'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import craftMessages from '../translation'

type Unit = 'px' | '%'

type FieldValues = {
  url: string
  customStyle: CSSObject
}

const ImageSettings: CraftElementSettings<ImageProps> = ({ props, onPropsChange }) => {
  const { device } = useContext(CraftPageBuilderContext)
  const [form] = useForm<FieldValues>()
  const { formatMessage } = useIntl()

  const [isImgAutoHeight, setIsImgAutoHeight] = useState(props.customStyle?.isAutoHeight === 'true')
  const [isFullScreenImage, setIsFullScreenImage] = useState(props.customStyle?.isFullScreenImage === 'true')
  const [imgSrc, setImgSrc] = useState('')
  const [imgWidth, setImgWidth] = useState(0)
  const [imgHeight, setImgHeight] = useState(0)
  const [aspectRatio, setAspectRatio] = useState(0)

  useEffect(() => {
    setImgWidth(props.customStyle?.width ? extractSizeNumber(props.customStyle?.width.toString()) || 0 : 0)
    setImgHeight(props.customStyle?.height ? extractSizeNumber(props.customStyle?.height.toString()) || 0 : 0)
    setImgWidthUnit((extractSizeUnit(props.customStyle?.width?.toString()) as Unit) || 'px')
    setImgHeightUnit((extractSizeUnit(props.customStyle?.height?.toString()) as Unit) || 'px')
    setIsImageAutoHeight(props.customStyle?.isAutoHeight === 'true' ? true : false)
    setIsFullScreenImage(props.customStyle?.isFullScreenImage === 'true' ? true : false)
    setAspectRatio(
      Number(
        (
          (typeof props?.width === 'number' ? props?.width : extractSizeNumber(props?.width)) /
          (typeof props?.height === 'number' ? props?.height : extractSizeNumber(props?.height))
        ).toFixed(2),
      ),
    )
  }, [props.customStyle, device, props?.width, props?.height])

  const handleChange = () => {
    form.validateFields()
  }

  return (
    <Form form={form} layout="vertical" colon={false} requiredMark={false} onChange={handleChange}>
      <SizeStyleInput
        value={props.customStyle}
        imgProps={{
          width: imgWidth,
          height: imgHeight,
          aspectRatio: aspectRatio,
          originalImage,
        }}
        isImgAutoHeight={isImgAutoHeight}
        isFullScreenImage={isFullScreenImage}
        onIsImgAutoHeightChange={setIsImgAutoHeight}
        onIsFullScreenImageChange={setIsFullScreenImage}
        onChange={value => {
          onPropsChange?.({
            ...props,
            customStyle: {
              ...props.customStyle,
              ...value,
            },
          })
        }}
      />

      <Form.Item>
        <Checkbox
          disabled={
            !(
              extractSizeUnit(props.customStyle?.width?.toString()) === 'px' &&
              extractSizeUnit(props.customStyle?.height?.toString()) === 'px'
            )
          }
          checked={isImgAutoHeight}
          onChange={e => {
            setIsImgAutoHeight(!isImgAutoHeight)
            const currentWidth = props.customStyle?.width?.toString() || '100px'
            const currentHeight = props.customStyle?.height?.toString() || '100px'
            const currentHeightUnit = extractSizeUnit(currentHeight)
            const newHeight = e.target.checked
              ? `${convertToPx(currentWidth) / originalImage.ratio}${currentHeightUnit}`
              : `${convertToPx(currentWidth) / aspectRatio}${currentHeightUnit}`
            onPropsChange?.({
              ...props,
              customStyle: {
                ...props.customStyle,
                height: newHeight,
                isAutoHeight: e.target.checked ? 'true' : 'false',
              },
            })
          }}
        >
          {formatMessage(craftMessages.ImageSettings.autoImageHeight)}
        </Checkbox>
      </Form.Item>

      <Form.Item>
        <Checkbox
          disabled={
            !(
              extractSizeUnit(props.customStyle?.width?.toString()) === '%' &&
              extractSizeUnit(props.customStyle?.height?.toString()) === '%'
            )
          }
          checked={isFullScreenImage}
          onChange={e => {
            setIsFullScreenImage(!isFullScreenImage)
            onPropsChange?.({
              ...props,
              customStyle: {
                ...props.customStyle,
                isFullScreenImage: e.target.checked ? 'true' : 'false',
                width: e.target.checked ? '100%' : props.customStyle?.width?.toString() || '100%',
                height: e.target.checked ? '100%' : props.customStyle?.height?.toString() || '100%',
              },
            })
          }}
        >
          {formatMessage(craftMessages.ImageSettings.fullScreenImage)}
        </Checkbox>
      </Form.Item>

      <Form.Item>
        <SpaceStyleInput
          value={props.customStyle}
          onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
        />
      </Form.Item>
      <Form.Item>
        <BorderStyleInput
          value={props.customStyle}
          onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
        />
      </Form.Item>
      <Form.Item>
        <BackgroundStyleInput value={props.customStyle} onChange={value => onPropsChange?.({ ...props, ...value })} />
      </Form.Item>

      <Collapse ghost expandIconPosition="right" defaultActiveKey="buttonSetting">
        <StyledCollapsePanel
          key="advancedSetting"
          header={<AdminHeaderTitle>{formatMessage(craftMessages['*'].advancedSetting)}</AdminHeaderTitle>}
        >
          <Form.Item label={<CraftSettingLabel>{formatMessage(craftMessages['*'].className)}</CraftSettingLabel>}>
            <Input
              className="mt-2"
              value={props.className}
              onChange={e => onPropsChange?.({ ...props, className: e.target.value.toString() })}
            />
          </Form.Item>
          <Form.Item label={<CraftSettingLabel>{formatMessage(craftMessages['*'].ariaLabel)}</CraftSettingLabel>}>
            <Input
              className="mt-2"
              value={props.ariaLabel}
              onChange={e =>
                onPropsChange?.({
                  ...props,
                  ariaLabel: e.target.value.toString(),
                })
              }
            />
          </Form.Item>
        </StyledCollapsePanel>
      </Collapse>
    </Form>
  )
}

export default ImageSettings
