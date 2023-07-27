import Icon from '@ant-design/icons'
import { ProductType } from 'lodestar-app-element/src/types/product'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { currencyFormatter } from '../../helpers'
import { ReactComponent as CheckIcon } from '../../images/icon/check.svg'
import { CouponPlanType } from '../../types/checkout'
import ProductItem from '../common/ProductItem'
import couponMessages from './translation'

const StyledTitle = styled.div`
  margin-bottom: 0.75rem;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
`

const CouponPlanDescriptionScopeBlock: React.FC<{
  constraint: number | null
  type: CouponPlanType | null
  amount: number
  scope: ProductType[]
  productIds: string[]
}> = ({ constraint, type, amount, scope, productIds }) => {
  const { formatMessage } = useIntl()
  return (
    <div>
      <StyledTitle>{formatMessage(couponMessages['*'].rules)}</StyledTitle>
      <div className="mb-4">
        {constraint
          ? formatMessage(couponMessages.CouponPlanDescriptionScopeBlock.constraints, {
              total: currencyFormatter(constraint),
              discount: type === 'cash' ? currencyFormatter(amount) : `${amount}%`,
            })
          : formatMessage(couponMessages.CouponPlanDescriptionScopeBlock.directly, {
              discount: type === 'cash' ? currencyFormatter(amount) : `${amount}%`,
            })}
      </div>

      <StyledTitle>{formatMessage(couponMessages.CouponPlanDescriptionScopeBlock.discountTarget)}</StyledTitle>
      <div className="mb-4">
        {scope === null && <div>{formatMessage(couponMessages.CouponPlanDescriptionScopeBlock.allScope)}</div>}
        {scope?.includes('ProgramPlan') && (
          <div className="mb-2">
            <Icon component={() => <CheckIcon />} className="mr-2" />
            <span>{formatMessage(couponMessages.CouponPlanDescriptionScopeBlock.allProgramPlan)}</span>
          </div>
        )}
        {scope?.includes('ActivityTicket') && (
          <div className="mb-2">
            <Icon component={() => <CheckIcon />} className="mr-2" />
            <span>{formatMessage(couponMessages.CouponPlanDescriptionScopeBlock.allActivityTicket)}</span>
          </div>
        )}
        {scope?.includes('PodcastProgram') && (
          <div className="mb-2">
            <Icon component={() => <CheckIcon />} className="mr-2" />
            <span>{formatMessage(couponMessages.CouponPlanDescriptionScopeBlock.allPodcastProgram)}</span>
          </div>
        )}
        {scope?.includes('PodcastPlan') && (
          <div className="mb-2">
            <Icon component={() => <CheckIcon />} className="mr-2" />
            <span>{formatMessage(couponMessages.CouponPlanDescriptionScopeBlock.allPodcastPlan)}</span>
          </div>
        )}
        {scope?.includes('AppointmentPlan') && (
          <div className="mb-2">
            <Icon component={() => <CheckIcon />} className="mr-2" />
            <span>{formatMessage(couponMessages.CouponPlanDescriptionScopeBlock.allAppointmentPlan)}</span>
          </div>
        )}
        {scope?.includes('MerchandiseSpec') && (
          <div className="mb-2">
            <Icon component={() => <CheckIcon />} className="mr-2" />
            <span>{formatMessage(couponMessages.CouponPlanDescriptionScopeBlock.allMerchandise)}</span>
          </div>
        )}
        {scope?.includes('ProjectPlan') && (
          <div className="mb-2">
            <Icon component={() => <CheckIcon />} className="mr-2" />
            <span>{formatMessage(couponMessages.CouponPlanDescriptionScopeBlock.allProjectPlan)}</span>
          </div>
        )}
        {scope?.includes('ProgramPackagePlan') && (
          <div className="mb-2">
            <Icon component={() => <CheckIcon />} className="mr-2" />
            <span>{formatMessage(couponMessages.CouponPlanDescriptionScopeBlock.allProgramPackagePlan)}</span>
          </div>
        )}
        {productIds && productIds.length > 0 && (
          <>
            <div className="mb-2">
              <Icon component={() => <CheckIcon />} className="mr-2" />
              <span>{formatMessage(couponMessages.CouponPlanDescriptionScopeBlock.otherSpecificProduct)}</span>
            </div>
            <div className="pl-4">
              {productIds.map(productId => (
                <ProductItem
                  key={productId}
                  id={productId}
                  variant={productId.includes('Estimator') ? 'estimator' : 'coupon-product'} // TODO: 以後 estimator 改用 token
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CouponPlanDescriptionScopeBlock
