import ReactStars from 'react-star-rating-component'
import styled from 'styled-components'
import { StarIcon, StarGrayIcon } from '../../images/icon/index'

const ReactStarsWrapper = styled(ReactStars)`
  svg {
    width: 20px;
    height: 20px;
    margin-right: 4px;
  }
`

const StarRating: React.FC<{
  value: number
  onStarClick?: (nextValue: number, prevValue: number, name: string) => void
  onStarHover?: (nextValue: number, prevValue: number, name: string) => void
  onStarHoverOut?: (nextValue: number, prevValue: number, name: string) => void
}> = ({ value, onStarClick, onStarHover, onStarHoverOut }) => {
  return (
    <ReactStarsWrapper
      name="starRating"
      value={value}
      onStarClick={onStarClick}
      onStarHover={onStarHover}
      onStarHoverOut={onStarHoverOut}
      renderStarIcon={(nextValue, prevValue) => (nextValue > prevValue ? <StarGrayIcon /> : <StarIcon />)}
    />
  )
}

export default StarRating
