import { AvatarProps } from 'antd/lib/avatar'
import styled from 'styled-components'
import DefaultAvatar from '../../images/default/avatar.svg'

export const AvatarImage = styled.div<AvatarProps>`
  width: ${props => (typeof props.size === 'number' ? `${props.size}px` : '2rem')};
  height: ${props => (typeof props.size === 'number' ? `${props.size}px` : '2rem')};
  border-radius: ${props => (props.shape === 'square' ? '4px' : '50%')};
  background-color: #ccc;
  background-image: url(${props => props.src || DefaultAvatar});
  background-size: cover;
  background-position: center;
`

export const FixedRatioImage = styled.div<{ src?: string }>`
  background-size: cover;
  background-position: center;
`

export const CustomRatioImage = styled.div<{ width: string; ratio: number; src: string }>`
  width: ${props => props.width};
  padding-top: ${props => props.ratio * 100}%;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  border-radius: 4px;
`
