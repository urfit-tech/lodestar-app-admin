import { Typography } from 'antd'
import React from 'react'
import styled from 'styled-components'
import EmptyCover from '../../images/default/empty-cover.png'
import { ProductTypeLabel } from '../../schemas/general'
import { ProgramPlanPeriodType } from '../../schemas/program'
import PriceLabel from './PriceLabel'

const StyledCoverImage = styled.img`
  width: 64px;
  height: 48px;
  min-height: 1px;
  border-radius: 4px;
  object-fit: cover;
  object-position: center;
`
const StyledTitle = styled(Typography.Title)`
  && {
    color: var(--gray-darker);
    font-size: 20px;
    font-weight: bold;
    line-height: 1.3;
    letter-spacing: 0.77px;
  }
`
const StyledMeta = styled.div`
  white-space: nowrap;
`

export type ProductItemProps = {
  id: string
  title: string
  type: string
  coverUrl?: string
  listPrice: number
  salePrice?: number
  discountDownPrice?: number
  periodAmount?: number
  periodType?: ProgramPlanPeriodType
  variant?: string
}
const ProductItem: React.FC<ProductItemProps> = ({
  id,
  title,
  type,
  coverUrl,
  listPrice,
  salePrice,
  discountDownPrice,
  periodAmount,
  periodType,
  variant,
}) => {
  if (variant === 'checkout') {
    return (
      <>
        <div className="d-flex align-items-center justify-content-between">
          <StyledTitle level={2} ellipsis={{ rows: 2 }} className="flex-grow-1 m-0 mr-5">
            {title}
          </StyledTitle>
          <StyledCoverImage src={coverUrl || EmptyCover} alt={id} className="flex-shrink-0" />
        </div>
        <PriceLabel
          listPrice={listPrice}
          salePrice={salePrice}
          downPrice={discountDownPrice}
          periodAmount={periodAmount}
          periodType={periodType}
        />
      </>
    )
  }

  return (
    <>
      <StyledCoverImage src={coverUrl || EmptyCover} alt={id} className="flex-shrink-0 mr-3" />
      <Typography.Paragraph ellipsis={{ rows: 2 }} className="flex-grow-1 m-0 mr-5">
        {title}
      </Typography.Paragraph>
      <StyledMeta className="mr-5">{ProductTypeLabel[type] || '未知'}</StyledMeta>
    </>
  )
}

export default ProductItem
