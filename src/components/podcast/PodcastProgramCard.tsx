import React from 'react'
import styled from 'styled-components'
import { currencyFormatter } from '../../helpers'
import EmptyCover from '../../images/default/empty-cover.png'
import { CustomRatioImage } from '../common/Image'
import Responsive, { BREAK_POINT } from '../common/Responsive'

const StyledWrapper = styled.div`
  overflow: hidden;
  background-color: white;
  border-radius: 4px;
  box-shadow: 2px 4px 8px 0 rgba(0, 0, 0, 0.1);
`
const StyledMeta = styled.div`
  padding: 0.75rem;

  @media (min-width: ${BREAK_POINT}px) {
    padding: 1.25rem;
  }
`
const StyledTitle = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 1.5rem;
  height: 1.5em;
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;

  @media (min-width: ${BREAK_POINT}px) {
    -webkit-line-clamp: 2;
    margin-bottom: 2rem;
    height: 3em;
  }
`
const StyledDescription = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  line-height: 16px;
  letter-spacing: 0.4px;

  span:first-child {
    display: none;
  }

  @media (min-width: ${BREAK_POINT}px) {
    line-height: 20px;

    span:first-child {
      display: inline;
    }
  }
`
const StyledPriceLabel = styled.span`
  text-decoration: line-through;

  &:last-child {
    color: ${props => props.theme['@primary-color']};
    text-decoration: none;
  }
`

export type PodcastProgramCardProps = {
  coverUrl?: string | null
  title: string
  meta: string
  salePrice?: number
  listPrice: number
}
const PodcastProgramCard: React.FC<PodcastProgramCardProps> = ({ coverUrl, title, meta, salePrice, listPrice }) => {
  return (
    <StyledWrapper className="d-flex justify-content-between">
      <div className="flex-shrink-0">
        <Responsive.Default>
          <CustomRatioImage width="88px" ratio={1} src={coverUrl || EmptyCover} />
        </Responsive.Default>
        <Responsive.Desktop>
          <CustomRatioImage width="140px" ratio={1} src={coverUrl || EmptyCover} />
        </Responsive.Desktop>
      </div>

      <StyledMeta className="flex-grow-1">
        <StyledTitle>{title}</StyledTitle>

        <StyledDescription className="d-flex justify-content-between">
          <span>{meta}</span>
          <StyledPriceLabel className="flex-grow-1 text-right">{currencyFormatter(listPrice)}</StyledPriceLabel>
          {typeof salePrice === 'number' && (
            <StyledPriceLabel className="ml-2">{currencyFormatter(salePrice)}</StyledPriceLabel>
          )}
        </StyledDescription>
      </StyledMeta>
    </StyledWrapper>
  )
}

export default PodcastProgramCard
