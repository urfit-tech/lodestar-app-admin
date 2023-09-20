import { Checkbox, Collapse, Input, InputNumber } from 'antd'
import Form from 'antd/lib/form/'
import { useForm } from 'antd/lib/form/Form'
import { ImageProps } from 'lodestar-app-element/src/components/common/Image'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import {
  CraftElementSettings,
  CraftSettingLabel,
  StyledCollapsePanel,
} from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import { AdminHeaderTitle } from '../../admin'
import BackgroundStyleInput from '../inputs/BackgroundStyleInput'
import BorderStyleInput from '../inputs/BorderStyleInput'
import SizeStyleInput, { extractNumber, extractSizeUnit } from '../inputs/SizeStyleInput'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import craftMessages from '../translation'

type FieldValues = {
  url: string
  customStyle: CSSObject
}

const gcd = (width: number, height: number): number => (height === 0 ? width : gcd(height, width % height))

const ImageSettings: CraftElementSettings<ImageProps> = ({ props, onPropsChange }) => {
  const [form] = useForm<FieldValues>()
  const { formatMessage } = useIntl()

  const [isImgAutoHeight, setIsImgAutoHeight] = useState(props.isAutoHeight === undefined ? false : props.isAutoHeight)
  const [imgSrc, setImgSrc] = useState('')
  const [imgWidth, setImgWidth] = useState(0)
  const [imgHeight, setImgHeight] = useState(0)
  const [aspectRatio, setAspectRatio] = useState(0)
  const [imgGcd, setImgGcd] = useState(0)
  const [widthAspect, setWidthAspect] = useState(0)
  const [heightAspect, setHeightAspect] = useState(0)

  if (
    imgSrc === '' &&
    props.customStyle?.backgroundImage !== undefined &&
    props.customStyle?.width !== undefined &&
    props.customStyle?.height !== undefined
  ) {
    let dbImgWidth = typeof props.customStyle?.width === 'string' ? extractNumber(props.customStyle?.width) || 0 : 0
    let dbImgHeight = typeof props.customStyle?.height === 'string' ? extractNumber(props.customStyle?.height) || 0 : 0
    let dbAspectRatio = dbImgHeight / dbImgWidth
    let dbImgGcd = gcd(dbImgWidth, dbImgHeight)
    let widthAspect = dbImgWidth / dbImgGcd
    let heightAspect = dbImgHeight / dbImgGcd
    setImgWidth(dbImgWidth)
    setImgHeight(dbImgHeight)
    setAspectRatio(dbAspectRatio)
    setImgGcd(dbImgGcd)
    setWidthAspect(widthAspect)
    setHeightAspect(heightAspect)
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
      // Ratio
      let urlImgAspectRatio = urlImgHeight / urlImgWidth
      setAspectRatio(urlImgAspectRatio)
      // GCD
      let urlImgGcd = gcd(urlImgWidth, urlImgHeight)
      setImgGcd(urlImgGcd)
      // Aspect
      let widthAspect = urlImgWidth / urlImgGcd
      let heightAspect = urlImgHeight / urlImgGcd
      setWidthAspect(widthAspect)
      setHeightAspect(heightAspect)
      onPropsChange?.({
        ...props,
        width: urlImgWidth,
        height: urlImgHeight,
        widthAspect: widthAspect,
        heightAspect: heightAspect,
        ratio: urlImgAspectRatio,
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
          gcd: imgGcd,
          widthAspect: widthAspect,
          heightAspect: heightAspect,
        }}
        isImgAutoHeight={isImgAutoHeight}
        onChange={value =>
          onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value }, ratio: undefined })
        }
      />
      <Form.Item>
        <Checkbox
          checked={isImgAutoHeight}
          onChange={e => {
            setIsImgAutoHeight(!isImgAutoHeight)
            if (typeof props.customStyle?.width === 'string') {
              const width =
                extractNumber(props?.customStyle?.width) !== undefined ? parseInt(props?.customStyle?.width) : 0
              const newGcd = width / widthAspect
              const newHeight = isImgAutoHeight
                ? props?.customStyle?.height
                : `${heightAspect * newGcd}${
                    extractSizeUnit(props.customStyle.width.toString()) === 'vw'
                      ? 'vh'
                      : extractSizeUnit(props.customStyle.width.toString())
                  }`
              onPropsChange?.({
                ...props,
                ratio: aspectRatio,
                customStyle: { ...props.customStyle, height: newHeight },
                isAutoHeight: !isImgAutoHeight,
              })
            }
          }}
        >
          自動
        </Checkbox>
      </Form.Item>
      <Form.Item label={formatMessage(craftMessages.ImageSettings.ratio)}>
        <InputNumber
          value={props.ratio !== undefined ? props.ratio : aspectRatio}
          disabled={isImgAutoHeight}
          onChange={v => {
            const ratio = Number(v) || undefined
            onPropsChange?.({
              ...props,
              ratio: ratio,
              customStyle: {
                ...props.customStyle,
                height:
                  ratio && props.customStyle?.width
                    ? ratio * (extractNumber(props.customStyle.width.toString()) || 0) +
                      (extractSizeUnit(props.customStyle.width.toString()) || 'px')
                    : props.customStyle?.height,
              },
            })
          }}
        />
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
