import { Form } from 'antd'
import { useIntl } from 'react-intl'
import styled, { CSSObject } from 'styled-components'
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
const StyledFormItem = styled(Form.Item)`
  padding: 12px 24px;
  border-radius: 4px;
  background: #5858581c;
`
const CustomStyleInput: React.VFC<CustomStyleInputProps> = props => {
  const { formatMessage } = useIntl()
  return (
    <>
      {props.space && (
        <StyledFormItem
          label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.spaceStyle)}</CraftSettingLabel>}
        >
          <SpaceStyleInput
            value={{ margin: props.value?.margin, padding: props.value?.padding }}
            onChange={value => props.onChange?.({ ...props.value, ...value })}
          />
        </StyledFormItem>
      )}
      {props.border && (
        <StyledFormItem
          label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.borderStyle)}</CraftSettingLabel>}
        >
          <BorderStyleInput
            value={{
              borderWidth: props.value?.borderWidth,
              borderStyle: props.value?.borderStyle,
              borderColor: props.value?.borderColor,
              borderRadius: props.value?.borderRadius,
            }}
            onChange={value => props.onChange?.({ ...props.value, ...value })}
          />
        </StyledFormItem>
      )}
      {props.background && (
        <StyledFormItem
          label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.backgroundStyle)}</CraftSettingLabel>}
        >
          <BackgroundStyleInput
            value={{ background: props.value?.background }}
            onChange={value => props.onChange?.({ ...props.value, ...value })}
          />
        </StyledFormItem>
      )}
      {props.typography && (
        <StyledFormItem
          label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.typographyStyle)}</CraftSettingLabel>}
        >
          <TypographyStyleInput
            value={{
              color: props.value?.color,
              fontFamily: props.value?.fontFamily,
              fontSize: props.value?.fontSize,
              fontWeight: props.value?.fontWeight,
              lineHeight: props.value?.lineHeight,
              letterSpacing: props.value?.letterSpacing,
              textAlign: props.value?.textAlign,
              fontStyle: props.value?.fontStyle,
            }}
            onChange={value => props.onChange?.({ ...props.value, ...value })}
          />
        </StyledFormItem>
      )}
      {props.position && <PositionStyleInput />}
    </>
  )
}

export default CustomStyleInput
