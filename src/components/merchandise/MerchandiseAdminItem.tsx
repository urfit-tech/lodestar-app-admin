import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { currencyFormatter } from '../../helpers'
import EmptyCover from '../../images/default/empty-cover.png'
import { MerchandisePreviewProps } from '../../types/merchandise'
import { CustomRatioImage } from '../common/Image'

const StyledWrapper = styled.div`
  margin-bottom: 0.75rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
`
const StyledTitle = styled.div`
  overflow: hidden;
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
  white-space: nowrap;
  text-overflow: ellipsis;
`
const StyledPriceLabel = styled.div`
  width: 12rem;
  letter-spacing: 0.2px;
  color: ${props => props.theme['@primary-color']};
`

const StyledQuantityLabel = styled.div`
  width: 7rem;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
`

const MerchandiseAdminItem: React.FC<MerchandisePreviewProps> = ({
  id,
  coverUrl,
  title,
  minPrice,
  maxPrice,
  currencyId,
  // soldQuantity,
}) => {
  const { settings } = useApp()
  const coinUnit = settings['coin.unit']
  return (
    <Link to={`/merchandises/${id}`}>
      <StyledWrapper className="d-flex align-items-center justify-content-between p-3">
        <div className="flex-grow-1 d-flex align-items-center justify-content-start">
          <CustomRatioImage width="56px" ratio={1} src={coverUrl || EmptyCover} shape="rounded" className="mr-3" />
          <StyledTitle>{title}</StyledTitle>
        </div>
        <StyledPriceLabel className="flex-shrink-0">
          {currencyFormatter(minPrice, currencyId, coinUnit)} ~ {currencyFormatter(maxPrice, currencyId, coinUnit)}
        </StyledPriceLabel>
        {/* {<StyledQuantityLabel className="flex-shrink-0">{soldQuantity}</StyledQuantityLabel>} */}
      </StyledWrapper>
    </Link>
  )
}

export default MerchandiseAdminItem
