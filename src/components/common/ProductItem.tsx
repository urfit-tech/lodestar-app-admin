import { Typography } from 'antd'
import React from 'react'
import styled from 'styled-components'
import EmptyCover from '../../images/default/empty-cover.png'
import { ProductTypeLabel } from '../../schemas/general'
import { ProgramPlanPeriodType } from '../../schemas/program'
import { CustomRatioImage } from './Image'
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
  productType?: string
  coverUrl?: string | null
  listPrice: number
  salePrice?: number
  discountDownPrice?: number
  periodAmount?: number
  periodType?: ProgramPlanPeriodType
  variant?: 'default' | 'simple' | 'cartItem' | 'checkout'
}
const ProductItem: React.FC<ProductItemProps> = ({
  id,
  title,
  productType,
  coverUrl,
  listPrice,
  salePrice,
  discountDownPrice,
  periodAmount,
  periodType,
  variant,
}) => {
  switch (variant) {
    case 'simple':
      return (
        <>
          <StyledTitle level={2} ellipsis={{ rows: 2 }} className="flex-grow-1 m-0 mr-5">
            {title}
          </StyledTitle>
          <StyledCoverImage src={coverUrl || EmptyCover} alt={id} className="flex-shrink-0" />
        </>
      )
    case 'cartItem':
      return (
        <>
          <CustomRatioImage
            width="4rem"
            ratio={2 / 3}
            src={coverUrl || EmptyCover}
            shape="rounded"
            className="flex-shrink-0 mr-3"
          />
          <Typography.Paragraph ellipsis={{ rows: 2 }} className="flex-grow-1 m-0">
            {title}
          </Typography.Paragraph>
        </>
      )
    case 'checkout':
      return (
        <>
          <div className="d-flex align-items-center justify-content-between">
            <StyledTitle level={2} ellipsis={{ rows: 2 }} className="flex-grow-1 m-0 mr-5">
              {title}
            </StyledTitle>
            <CustomRatioImage
              width="64px"
              ratio={3 / 4}
              src={coverUrl || EmptyCover}
              shape="rounded"
              className="flex-shrink-0"
            />
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
      <CustomRatioImage
        width="64px"
        ratio={3 / 4}
        src={coverUrl || EmptyCover}
        shape="rounded"
        className="flex-shrink-0 mr-3"
      />
      <Typography.Paragraph ellipsis={{ rows: 2 }} className="flex-grow-1 m-0 mr-5">
        {title}
      </Typography.Paragraph>
      <StyledMeta className="mr-5">
        {productType && ProductTypeLabel[productType] ? ProductTypeLabel[productType] : '未知'}
      </StyledMeta>
    </>
  )
}

export default ProductItem
