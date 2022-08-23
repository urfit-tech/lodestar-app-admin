import React from 'react'
import ReactStars from 'react-star-rating-component'
import styled from 'styled-components'
import { ReactComponent as StarGrayIcon } from '../../images/icon/star-gray.svg'
import { ReactComponent as StarIcon } from '../../images/icon/star.svg'

const ReactStarsWrapper = styled(ReactStars)<{ size?: string; pitch?: string }>`
  svg {
    width: ${props => (props.size ? props.size : '1em')};
    height: ${props => (props.size ? props.size : '1em')};
    margin-right: ${props => (props.pitch ? props.pitch : '0.25em')};
  }
`
const RatingInput: React.FC<{
  size?: string
  pitch?: string
  name: string
  value?: number
  onChange?: (value: number) => void
}> = ({ size, pitch, name, value, onChange }) => {
  return (
    <ReactStarsWrapper
      size={size}
      pitch={pitch}
      name={name}
      value={value || 1}
      onStarClick={rating => onChange?.(rating)}
      renderStarIcon={(nextValue, prevValue) => (nextValue > prevValue ? <StarGrayIcon /> : <StarIcon />)}
    />
  )
}

export default RatingInput
