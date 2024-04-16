import { Checkbox, Collapse, Input, } from 'antd'
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
  const [isImageAutoHeight, setIsImageAutoHeight] = useState(props.customStyle?.isImageAutoHeight === 'true' ? true : false)
  const [isFullScreenImage, setIsFullScreenImage] = useState(props.customStyle?.isFullScreenImage === 'true' ? true : false)
  const [imgWidth, setImgWidth] = useState(props.customStyle?.width ? extractSizeNumber(props.customStyle?.width.toString()) || 0 : 0)
  const [imgHeight, setImgHeight] = useState(props.customStyle?.height ? extractSizeNumber(props.customStyle?.height.toString()) || 0 : 0)
  const [imgWidthUnit, setImgWidthUnit] = useState<Unit>(extractSizeUnit(props.customStyle?.width?.toString()) as Unit || 'px')
  const [imgHeightUnit, setImgHeightUnit] = useState<Unit>(extractSizeUnit(props.customStyle?.height?.toString()) as Unit || 'px')
  const [aspectRatio, setAspectRatio] = useState(0)
  console.log(props)
  useEffect(() => {
    setImgWidth(props.customStyle?.width ? extractSizeNumber(props.customStyle?.width.toString()) || 0 : 0)
    setImgHeight(props.customStyle?.height ? extractSizeNumber(props.customStyle?.height.toString()) || 0 : 0)
    setImgWidthUnit(extractSizeUnit(props.customStyle?.width?.toString()) as Unit || 'px')
    setImgHeightUnit(extractSizeUnit(props.customStyle?.height?.toString()) as Unit || 'px')
    setIsImageAutoHeight(props.customStyle?.isImageAutoHeight === 'true' ? true : false)
    setIsFullScreenImage(props.customStyle?.isFullScreenImage === 'true' ? true : false)
    setAspectRatio(Number(((typeof props?.width === 'number' ? props?.width : extractSizeNumber(props?.width)) / (typeof props?.height === 'number' ? props?.height : extractSizeNumber(props?.height))).toFixed(2)))
  }, [props.customStyle, device, props?.width, props?.height])


  const handleChange = () => {
    form.validateFields()
  }

  return (
    <Form form={form} layout="vertical" colon={false} requiredMark={false} onChange={handleChange}>
      <SizeStyleInput
        value={props.customStyle}
        aspectRatio={aspectRatio}
        width={imgWidth}
        height={imgHeight}
        widthUnit={imgWidthUnit}
        heightUnit={imgHeightUnit}
        isImageAutoHeight={isImageAutoHeight}
        isFullScreenImage={isFullScreenImage}
        onWidthChange={setImgWidth}
        onHeightChange={setImgHeight}
        onWidthUnitChange={setImgWidthUnit}
        onHeightUnitChange={setImgHeightUnit}
        onIsImageAutoHeightChange={setIsImageAutoHeight}
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
          disabled={!(extractSizeUnit(props.customStyle?.width?.toString()) === 'px' && extractSizeUnit(props.customStyle?.height?.toString()) === 'px')}
          checked={isImageAutoHeight}
          onChange={e => {
            setIsImageAutoHeight(!isImageAutoHeight)
            const newHeight = e.target.checked ? (imgWidth / aspectRatio).toFixed(0) : imgHeight
            onPropsChange?.({
              ...props,
              customStyle: {
                ...props.customStyle,
                isImageAutoHeight: e.target.checked ? 'true' : 'false',
                isFullScreenImage: e.target.checked ? 'false' : props.customStyle?.isFullScreenImage,
                height: `${newHeight}${imgHeightUnit}`,
              },
            })
          }}
        >
          {formatMessage(craftMessages.ImageSettings.autoImageHeight)}
        </Checkbox>
      </Form.Item>

      <Form.Item>
        <Checkbox
          disabled={!(extractSizeUnit(props.customStyle?.width?.toString()) === '%' && extractSizeUnit(props.customStyle?.height?.toString()) === '%')}
          checked={isFullScreenImage}
          onChange={e => {
            setIsFullScreenImage(!isFullScreenImage)
            onPropsChange?.({
              ...props,
              customStyle: {
                ...props.customStyle,
                isFullScreenImage: e.target.checked ? 'true' : 'false',
                isImageAutoHeight: e.target.checked ? 'false' : props.customStyle?.isImageAutoHeight,
                width: e.target.checked ? '100%' : `${imgWidth}%` || '100%',
                height: e.target.checked ? '100%' : `${imgHeight}%` || '100%',
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
        <BackgroundStyleInput
          value={props.customStyle}
          onChange={value =>
            onPropsChange?.({ ...props, ...value })
          }
        />
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
    </Form >
  )
}

export default ImageSettings
