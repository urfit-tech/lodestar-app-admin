import styled from 'styled-components'
import DefaultAvatar from '../../images/default/avatar.svg'

export type AvatarImageProps = {
  size: string
  src?: string | null
  shape?: 'circle' | 'square'
}
export const AvatarImage = styled.div<AvatarImageProps>`
  width: ${props => props.size};
  height: ${props => props.size};
  background-color: #ccc;
  background-image: url(${props => props.src || DefaultAvatar});
  background-size: cover;
  background-position: center;
  border-radius: ${props => (props.shape === 'square' ? '4px' : '50%')};
`

export type CustomRatioImageProps = {
  width: string
  ratio: number
  src?: string | null
  shape?: 'default' | 'rounded' | 'circle'
  withShadow?: boolean
}
export const CustomRatioImage = styled.div<CustomRatioImageProps>`
  padding-top: calc(${props => props.width} * ${props => props.ratio});
  width: ${props => props.width};
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  border-radius: ${props => (props.shape === 'rounded' ? '4px' : props.shape === 'circle' ? '50%' : '')};
  ${props => (props.withShadow ? 'box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);' : '')}
`
