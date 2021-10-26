import { Form } from 'antd'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { craftPageMessages } from '../../../helpers/translation'
import { CraftSettingLabel } from '../settings/CraftSettings'
import BackgroundStyleInput from './BackgroundStyleInput'
import BorderStyleInput from './BorderStyleInput'
import PositionStyleInput from './PositionStyleInput'
import SpaceStyleInput from './SpaceStyleInput'
import TypographyStyleInput from './TypographyStyleInput'

type CustomStyleInputProps = {
  space?: boolean
  border?: boolean
  background?: boolean
  typography?: boolean
  position?: boolean
  value?: CSSObject
  onChange?: (value: CSSObject) => void
}
const CustomStyleInput: React.VFC<CustomStyleInputProps> = props => {
  const { formatMessage } = useIntl()
  return (
    <>
      {props.space && (
        <Form.Item label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.spaceStyle)}</CraftSettingLabel>}>
          <SpaceStyleInput
            value={{ margin: props.value?.margin, padding: props.value?.padding }}
            onChange={value => props.onChange?.({ ...props.value, ...value })}
          />
        </Form.Item>
      )}
      {props.border && (
        <Form.Item label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.borderStyle)}</CraftSettingLabel>}>
          <BorderStyleInput
            value={{
              borderWidth: props.value?.borderWidth,
              borderStyle: props.value?.borderStyle,
              borderColor: props.value?.borderColor,
              borderRadius: props.value?.borderRadius,
            }}
            onChange={value => props.onChange?.({ ...props.value, ...value })}
          />
        </Form.Item>
      )}
      {props.background && (
        <Form.Item
          label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.backgroundStyle)}</CraftSettingLabel>}
        >
          <BackgroundStyleInput
            value={{ background: props.value?.background }}
            onChange={value => props.onChange?.({ ...props.value, ...value })}
          />
        </Form.Item>
      )}
      {props.typography && (
        <Form.Item
          label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.typographyStyle)}</CraftSettingLabel>}
        >
          <TypographyStyleInput
            value={{
              fontSize: props.value?.fontSize,
            }}
          />
        </Form.Item>
      )}
      {props.position && <PositionStyleInput />}
    </>
  )
}

export default CustomStyleInput
