import { CSSObject } from 'styled-components'
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
  return (
    <>
      {props.space && (
        <SpaceStyleInput
          value={{ margin: props.value?.margin, padding: props.value?.padding }}
          onChange={value => props.onChange?.({ ...props.value, ...value })}
        />
      )}
      {props.border && (
        <BorderStyleInput
          value={{ borderColor: props.value?.borderColor }}
          onChange={value => props.onChange?.({ ...props.value, ...value })}
        />
      )}
      {props.background && (
        <BackgroundStyleInput
          value={{ background: props.value?.background }}
          onChange={value => props.onChange?.({ ...props.value, ...value })}
        />
      )}
      {props.typography && (
        <TypographyStyleInput
          value={{
            fontSize: props.value?.fontSize,
          }}
        />
      )}
      {props.position && <PositionStyleInput />}
    </>
  )
}

export default CustomStyleInput
