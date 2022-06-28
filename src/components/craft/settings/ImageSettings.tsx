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

  let imgWidth = 0
  let imgHeight = 0
  let aspectRatio = 0
  let imgGcd = 0
  let widthAspect = 0
  let heightAspect = 0

  if (props?.customStyle?.backgroundImage !== undefined) {
    let urlImg = new Image()
    let regex = /(https?|http|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/gi
    let matchImgUrlArr = props?.customStyle?.backgroundImage?.match(regex)
    urlImg.src =
      matchImgUrlArr !== null && matchImgUrlArr !== undefined && matchImgUrlArr.length > 0 ? matchImgUrlArr[0] : ''
    imgWidth = urlImg.src !== '' ? urlImg.width : 0
    imgHeight = urlImg.src !== '' ? urlImg.height : 0
    // Ratio
    aspectRatio = imgHeight / imgWidth
    // GCD
    imgGcd = gcd(imgWidth, imgHeight)
    // Aspect
    widthAspect = imgWidth / imgGcd
    heightAspect = imgHeight / imgGcd
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
            let newHeight = ''
            if (typeof props.customStyle?.width === 'string') {
              let newGcd = Number(props?.customStyle?.width.replace('px', '')) / widthAspect
              newHeight = `${heightAspect * newGcd}px`
              onPropsChange?.({
                ...props,
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
              ratio,
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
        </StyledCollapsePanel>
      </Collapse>
    </Form>
  )
}

export default ImageSettings
