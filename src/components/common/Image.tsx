import styled, { css } from 'styled-components'
import DefaultAvatar from '../../images/default/avatar.svg'

export type AvatarImageProps = {
  src?: string | null
  size?: string | number
  shape?: 'circle' | 'square'
}
export const AvatarImage = styled.div<AvatarImageProps>`
  ${props => {
    if (typeof props.size === 'number') {
      return css`
        width: ${props.size}px;
        height: ${props.size}px;
      `
    }

    return css`
      width: ${props.size || '2rem'};
      height: ${props.size || '2rem'};
    `
  }}
  background-color: #ccc;
  background-image: url(${props => props.src || DefaultAvatar});
  background-size: cover;
  background-position: center;
  border-radius: ${props => (props.shape === 'square' ? '4px' : '50%')};
`

export const CustomRatioImage = styled.div<{ width: string; ratio: number; src: string; shape?: 'rounded' }>`
  padding-top: calc(${props => props.width} * ${props => props.ratio});
  width: ${props => props.width};
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  ${props => (props.shape === 'rounded' ? 'border-radius: 4px;' : '')}
`
