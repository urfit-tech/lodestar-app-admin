import { Spin, Typography } from 'antd'
import PriceLabel from 'lodestar-app-element/src/components/labels/PriceLabel'
import { ProductType } from 'lodestar-app-element/src/types/product'
import moment from 'moment'
import React from 'react'
import { useIntl } from 'react-intl'
import styled, { css } from 'styled-components'
import ProductTypeLabel from '../../components/common/ProductTypeLabel'
import { currencyFormatter, desktopViewMixin } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useEstimator, useSimpleProduct } from '../../hooks/data'
import EmptyCover from '../../images/default/empty-cover.png'
import { CustomRatioImage } from './Image'

const StyledCoverImage = styled.img`
  width: 64px;
  height: 48px;
  min-height: 1px;
  border-radius: 4px;
  object-fit: cover;
  object-position: center;
`
const StyledContentBlock = styled.div`
  ${desktopViewMixin(css`
    display: flex;
    align-items: center;
    justify-content: space-between;
  `)}
`
const StyledProductType = styled.div`
  color: var(--gray-dark);
  font-size: 12px;
  letter-spacing: 0.6px;
`
const StyledProductTitle = styled.div`
  color: var(--gray-darker);
  line-height: 1.5;
  letter-spacing: 0.2px;
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
const StyledPeriod = styled.div`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: var(--gray-dark);
`
const StyledMeta = styled.span`
  margin-top: 0.5rem;
  min-width: 4.5rem;
  white-space: nowrap;

  ${desktopViewMixin(css`
    margin-top: 0;
    text-align: right;
  `)}
`
const StyledHighlight = styled.div`
  color: ${props => props.theme['@primary-color']};
  font-size: 14px;
  letter-spacing: 0.18px;
  margin-top: 8px;
`
const StyledListLabelBLock = styled.div`
  width: 5rem;
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
`
const StyledListTitleBlock = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
`

const ProductItem: React.FC<{
  id: string
  startedAt?: Date
  variant?: 'default' | 'simple' | 'cartProduct' | 'simpleCartProduct' | 'checkout' | 'coupon-product' | 'estimator'
  quantity?: number
}> = ({ id, startedAt, variant, quantity }) => {
  const { formatMessage } = useIntl()
  const [productType, targetId] = id.split('_') as [ProductType, string]
  let { target } = useSimpleProduct(targetId, { startedAt, quantity })
  const { target: estimator } = useEstimator(targetId, { startedAt, quantity }) // customized
  if (!target && !estimator) {
    if (variant === 'coupon-product' || variant === 'estimator') {
      return <Spin size="small" className="d-block" />
    }

    return <Spin size="large" />
  }

  const {
    title,
    coverUrl,
    listPrice,
    salePrice,
    discountDownPrice,
    periodAmount,
    periodType,
    endedAt,
    isSubscription,
  } = target || {}

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
    case 'estimator': // customized
      return (
        <div className="d-flex mb-1">
          <StyledListLabelBLock className="flex-shrink-0">
            <ProductTypeLabel productType={productType} />
          </StyledListLabelBLock>
          <StyledListTitleBlock className="flex-grow-1">{estimator?.title}</StyledListTitleBlock>
        </div>
      )
    case 'coupon-product':
      return (
        <div className="d-flex mb-1">
          <StyledListLabelBLock className="flex-shrink-0">
            <ProductTypeLabel productType={productType} />
          </StyledListLabelBLock>
          <StyledListTitleBlock className="flex-grow-1">{title}</StyledListTitleBlock>
        </div>
      )
    case 'cartProduct':
      return (
        <div className="flex-grow-1 d-flex align-items-center justify-content-start">
          <CustomRatioImage
            width="5rem"
            ratio={2 / 3}
            src={coverUrl || EmptyCover}
            shape="rounded"
            className="flex-shrink-0 mr-3"
          />
          <StyledContentBlock className="flex-grow-1 mr-2">
            <Typography.Paragraph ellipsis={{ rows: 2 }} className="flex-grow-1 mb-0 mr-2">
              {title}
              {typeof quantity === 'number' ? ` * ${quantity}` : ''}
            </Typography.Paragraph>
            <StyledMeta className="mr-2 d-none d-md-block">
              <ProductTypeLabel productType={productType} />
            </StyledMeta>
            <StyledMeta>{currencyFormatter((salePrice || listPrice || 0) * (quantity || 1))}</StyledMeta>
          </StyledContentBlock>
        </div>
      )
    case 'simpleCartProduct':
      return (
        <div className="d-flex align-items-center justify-content-between">
          <CustomRatioImage
            width="4rem"
            ratio={2 / 3}
            src={coverUrl || EmptyCover}
            shape="rounded"
            className="flex-shrink-0 mr-3"
          />
          <div className="flex-grow-1">
            <Typography.Paragraph ellipsis={{ rows: 2 }} className="mb-0">
              {title}
              {typeof quantity === 'number' ? ` * ${quantity}` : ''}
            </Typography.Paragraph>
            <StyledMeta className="text-left">
              {currencyFormatter((salePrice || listPrice || 0) * (quantity || 1))}
            </StyledMeta>
          </div>
        </div>
      )
    case 'checkout':
      return (
        <>
          <div className="d-flex align-items-center justify-content-between">
            <StyledTitle level={2} ellipsis={{ rows: 2 }} className="flex-grow-1 m-0 mr-5">
              <span>{title}</span>
              {!!startedAt && !!endedAt && (
                <StyledPeriod className="mt-2">{`${moment(startedAt).format('HH:mm')} - ${moment(endedAt).format(
                  'HH:mm',
                )}`}</StyledPeriod>
              )}
            </StyledTitle>
            <CustomRatioImage
              width="88px"
              ratio={3 / 4}
              src={coverUrl || EmptyCover}
              shape="rounded"
              className="flex-shrink-0"
            />
          </div>
          {typeof listPrice == 'number' && (
            <PriceLabel
              listPrice={listPrice}
              salePrice={salePrice}
              downPrice={discountDownPrice}
              periodType={isSubscription === undefined && periodType ? periodType : undefined}
              periodAmount={isSubscription === undefined && periodType ? periodAmount : undefined}
            />
          )}
          {isSubscription === false && periodType && (
            <StyledHighlight className="mb-3">
              {formatMessage(commonMessages.text.availableForLimitTime, {
                amount: periodAmount,
                unit:
                  periodType === 'D'
                    ? formatMessage(commonMessages.unit.day)
                    : periodType === 'W'
                    ? formatMessage(commonMessages.unit.week)
                    : periodType === 'M'
                    ? formatMessage(commonMessages.label.monthWithQuantifier)
                    : periodType === 'Y'
                    ? formatMessage(commonMessages.unit.year)
                    : formatMessage(commonMessages.label.unknownPeriod),
              })}
            </StyledHighlight>
          )}
        </>
      )
  }

  return (
    <div className="d-flex align-items-center justify-content-start">
      <CustomRatioImage
        width="64px"
        ratio={3 / 4}
        src={coverUrl || EmptyCover}
        shape="rounded"
        className="flex-shrink-0 mr-3"
      />
      <div className="flex-grow-1">
        <StyledProductType>
          <ProductTypeLabel productType={productType} />
        </StyledProductType>

        <StyledProductTitle>{title}</StyledProductTitle>
      </div>
    </div>
  )
}

export default ProductItem
