import { Checkbox, Collapse, Input, InputNumber } from 'antd'
import Form from 'antd/lib/form/'
import { useForm } from 'antd/lib/form/Form'
import { ImageProps } from 'lodestar-app-element/src/components/common/Image'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { convertToPx, extractNumber, extractSizeUnit } from '../../../helpers'
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

type FieldValues = {
  url: string
  customStyle: CSSObject
}

const ImageSettings: CraftElementSettings<ImageProps> = ({ props, onPropsChange }) => {
  const [form] = useForm<FieldValues>()
  const { formatMessage } = useIntl()

  const [isImgAutoHeight, setIsImgAutoHeight] = useState(props.customStyle?.isAutoHeight === 'true')
  const [imgSrc, setImgSrc] = useState('')
  const [imgWidth, setImgWidth] = useState(0)
  const [imgHeight, setImgHeight] = useState(0)
  const [aspectRatio, setAspectRatio] = useState(0)
  const [originalImage, setOriginalImage] = useState<{
    width: string
    height: string
    ratio: number
  }>({
    width: '0px',
    height: '0px',
    ratio: 0,
  })

  if (
    imgSrc === '' &&
    props.customStyle?.backgroundImage !== undefined &&
    props.customStyle?.width !== undefined &&
    props.customStyle?.height !== undefined
  ) {
    let dbImgWidth = typeof props.customStyle?.width === 'string' ? extractNumber(props.customStyle?.width) || 0 : 0
    let dbImgHeight = typeof props.customStyle?.height === 'string' ? extractNumber(props.customStyle?.height) || 0 : 0
    setImgWidth(dbImgWidth)
    setImgHeight(dbImgHeight)
    setAspectRatio(dbImgWidth / dbImgHeight)
    setOriginalImage({
      width: props?.width?.toString() || '0px',
      height: props?.height?.toString() || '0px',
      ratio:
        extractSizeUnit(props.width?.toString()) === extractSizeUnit(props.height?.toString())
          ? extractNumber(props.width?.toString()) / extractNumber(props.height?.toString())
          : 3 / 4,
    })
    setImgSrc(props.customStyle.backgroundImage)
  } else if (props.customStyle?.backgroundImage !== undefined && imgSrc !== props.customStyle?.backgroundImage) {
    let urlImg = new Image()
    let regex = /(https?|http|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/gi
    let matchImgUrlArr = props?.customStyle?.backgroundImage?.match(regex)
    urlImg.src =
      matchImgUrlArr !== null && matchImgUrlArr !== undefined && matchImgUrlArr.length > 0 ? matchImgUrlArr[0] : ''
    urlImg.onload = () => {
      let urlImgWidth = urlImg.src !== '' ? urlImg.naturalWidth : 0
      let urlImgHeight = urlImg.src !== '' ? urlImg.naturalHeight : 0
      setImgWidth(urlImgWidth)
      setImgHeight(urlImgHeight)
      setAspectRatio(urlImgHeight / urlImgWidth)
      setOriginalImage({
        width: `${urlImgWidth}px`,
        height: `${urlImgHeight}px`,
        ratio: urlImgWidth / urlImgHeight,
      })
      onPropsChange?.({
        ...props,
        width: urlImgWidth,
        height: urlImgHeight,
        customStyle: {
          ...props.customStyle,
          width: `${urlImgWidth}px`,
          height: `${urlImgHeight}px`,
        },
      })
    }
    setImgSrc(props.customStyle?.backgroundImage)
  }

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
        onRatioChange={setAspectRatio}
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
      {!isImgAutoHeight &&
      extractSizeUnit(props.customStyle?.width?.toString()) ===
        extractSizeUnit(props.customStyle?.height?.toString()) &&
      ['px', 'em', 'vh', 'vw'].includes(extractSizeUnit(props.customStyle?.height?.toString())) ? (
        <Form.Item label={formatMessage(craftMessages.ImageSettings.ratio)}>
          <InputNumber
            min={0}
            value={aspectRatio}
            disabled={isImgAutoHeight}
            onChange={v => {
              const ratio = Number(v)
              setAspectRatio(ratio)
              onPropsChange?.({
                ...props,
                customStyle: {
                  ...props.customStyle,
                  height: extractNumber(props.customStyle?.width?.toString()) / ratio,
                },
              })
            }}
          />
        </Form.Item>
      ) : null}

      {['px', 'em', 'vw'].includes(extractSizeUnit(props.customStyle?.width?.toString())) &&
      ['px', 'em', 'vh'].includes(extractSizeUnit(props.customStyle?.height?.toString())) ? (
        <Form.Item>
          <Checkbox
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
            自動調整圖片寬高
          </Checkbox>
        </Form.Item>
      ) : null}

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
          onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
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
    </Form>
  )
}

export default ImageSettings
