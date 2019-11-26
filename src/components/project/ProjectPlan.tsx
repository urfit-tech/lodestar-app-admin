import { Button } from 'antd'
import React from 'react'
import ReactPixel from 'react-facebook-pixel'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import ProjectPlanEnrollmentCount from '../../containers/project/ProjectPlanEnrollmentCount'
import { useCart } from '../../hooks/checkout'
import EmptyCover from '../../images/default/empty-cover.png'
import { ProgramPlanPeriodType } from '../../schemas/program'
import settings from '../../settings'
import CheckoutProductModal from '../checkout/CheckoutProductModal'
import PriceLabel from '../common/PriceLabel'
import { BraftContent } from '../common/StyledBraftEditor'

const StyledButton = styled(Button)`
  && {
    margin-top: 20px;
    width: 100%;
  }
`

const StyledWrapper = styled.div`
  background: white;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.2s ease-in-out;

  /* &:hover {
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.2);
  } */
`
const CoverImage = styled.div<{ src: string }>`
  padding-top: calc(100% / 3);
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
`
const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledDescription = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  line-height: 1.57;
  letter-spacing: 0.18px;
`
const StyledAction = styled.div`
  color: var(--black-45);
  font-size: 14px;
  letter-spacing: 0.18px;
`

export type ProjectPlanProps = {
  id: string
  coverUrl: string | null
  title: string
  description: string
  listPrice: number
  salePrice: number | null
  soldAt: Date | null
  discountDownPrice: number
  createAt: Date
  isSubscription: boolean
  periodAmount: number
  periodType: string | null
  isEnrolled?: boolean
  isExpired?: boolean
}
const ProjectPlan: React.FC<ProjectPlanProps> = ({
  id,
  coverUrl,
  title,
  description,
  listPrice,
  salePrice,
  soldAt,
  discountDownPrice,
  createAt,
  isSubscription,
  periodAmount,
  periodType,
  isEnrolled,
  isExpired,
}) => {
  return (
    <StyledWrapper>
      <CoverImage src={coverUrl || EmptyCover} />
      <div className="p-4">
        <StyledTitle className="mb-3">{title}</StyledTitle>

        <div className="mb-3">
          <PriceLabel
            listPrice={listPrice}
            salePrice={soldAt && soldAt.getTime() > Date.now() ? salePrice || 0 : undefined}
            downPrice={isSubscription && discountDownPrice > 0 ? discountDownPrice : undefined}
            periodAmount={periodAmount}
            periodType={periodType ? (periodType as ProgramPlanPeriodType) : undefined}
          />
        </div>

        <StyledDescription className="mb-4">
          <BraftContent>{description}</BraftContent>
        </StyledDescription>

        <StyledAction className="d-flex align-items-center justify-content-between">
          <ProjectPlanEnrollmentCount projectPlanId={id} />
        </StyledAction>
        <div>
          {isExpired ? (
            <span>已結束</span>
          ) : isEnrolled === false ? (
            isSubscription ? (
              <SubscriptionPlanBlock proejctPlanId={id} />
            ) : (
              <PerpetualPlanBlock projectPlanId={id} listPrice={listPrice} salePrice={salePrice} />
            )
          ) : null}
        </div>
      </div>
    </StyledWrapper>
  )
}

const PerpetualPlanBlock: React.FC<{
  projectPlanId: string
  listPrice: number
  salePrice: number | null
}> = ({ projectPlanId, listPrice, salePrice }) => {
  const { history } = useRouter()
  const { addCartProduct, findCartProduct } = useCart()
  const cartProduct = findCartProduct('ProjectPlan', projectPlanId)

  return cartProduct ? (
    <StyledButton
      type="primary"
      size="large"
      onClick={() => {
        history.push(`/cart?type=funding`)
      }}
    >
      <span>前往購物車</span>
    </StyledButton>
  ) : (
    <StyledButton
      type="primary"
      size="large"
      onClick={() => {
        settings.trackingId.fbPixel &&
          ReactPixel.track('AddToCart', {
            value: typeof salePrice === 'number' ? salePrice : listPrice,
            currency: 'TWD',
          })
        addCartProduct('ProjectPlan', projectPlanId)
        history.push(`/cart?type=funding`)
      }}
    >
      <span>立即購買</span>
    </StyledButton>
  )
}

const SubscriptionPlanBlock: React.FC<{
  proejctPlanId: string
}> = ({ proejctPlanId }) => {
  return (
    <CheckoutProductModal
      type="subscription"
      productId={`ProjectPlan_${proejctPlanId}`}
      renderTrigger={({ setVisible }) => (
        <StyledButton type="primary" size="large" onClick={() => setVisible(true)}>
          <span>立即訂閱</span>
        </StyledButton>
      )}
    />
  )
}

export default ProjectPlan
