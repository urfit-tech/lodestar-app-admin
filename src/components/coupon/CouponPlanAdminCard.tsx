import { gql, useQuery } from '@apollo/client'
import { Button, Divider, Modal } from 'antd'
import React, { ReactElement, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { currencyFormatter, dateFormatter } from '../../helpers'
import { CouponPlanProps } from '../../types/checkout'
import AdminCard from '../admin/AdminCard'
import couponMessages from './translation'

const StyledAdminCard = styled(AdminCard)`
  position: relative;

  &::before {
    content: ' ';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #f7f8f8;
    top: 50%;
    transform: translateY(-50%);
    left: -10px;
    z-index: 999;
    box-shadow: inset rgba(0, 0, 0, 0.06) -1px 0px 5px 0px;
  }
  &::after {
    content: ' ';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #f7f8f8;
    top: 50%;
    transform: translateY(-50%);
    right: -10px;
    z-index: 999;
    box-shadow: inset rgba(0, 0, 0, 0.06) 4px 0px 5px 0px;
  }

  .ant-card-head {
    border-bottom: 0;
  }
  .ant-card-head-title {
    padding: 0;
  }
  .ant-card-body {
    padding: 14px 28px 17px 28px;
  }
  .ant-card-bordered {
    border-radius: 0px;
  }
`

const StyledTitle = styled.span`
  display: -webkit-box;
  height: 3.25rem;
  line-height: 1.3;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  letter-spacing: 0.77px;
  font-size: 20px;
  font-weight: bold;
  overflow: hidden;
  white-space: break-spaces;
`
const StyledPriceLabel = styled.span<{ active?: boolean }>`
  color: ${props => (props.active ? props.theme['@primary-color'] : 'var(--gray)')};
  font-size: 24px;
  letter-spacing: 0.2px;
`
const StyledText = styled.span<{ active?: boolean }>`
  padding: 2px 6px;
  color: ${props => (props.active ? props.theme['@primary-color'] : 'var(--gray-dark)')};
  background-color: ${props => (props.active ? props.theme['@processing-color'] : 'var(--gray-lighter)')};
  font-size: 14px;
  line-height: 1.57;
  letter-spacing: 0.4px;
`

const StyledButton = styled(Button)`
  font-size: 14px;
  padding: 0;
  letter-spacing: -1px;
  height: auto;
  padding-right: 24px;
`
const StyledPeriod = styled.div`
  font-size: 14px;
`

const StyledModal = styled(Modal)`
  color: ${props => props.theme['@normal-color']};

  .ant-modal-header {
    border-bottom: 0px solid #e8e8e8;
  }
  .ant-modal-title {
    font-weight: bold;
  }
  .ant-modal-body {
    font-size: 14px;
    line-height: 1.57;
    letter-spacing: 0.18px;
    color: var(--gray-darker);
  }
  .ant-modal-close-x {
    color: #9b9b9b;
  }
`
const StyledModalTitle = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
const CouponPlanAdminCard: React.FC<{
  couponPlan: CouponPlanProps
  isAvailable?: boolean
  renderDescription?: (props: { productIds: string[] }) => ReactElement
  renderCount?: ReactElement
  renderEditDropdown?: ReactElement
  stateCode?: number
}> = ({ couponPlan, isAvailable, renderDescription, renderCount, renderEditDropdown, stateCode }) => {
  const { formatMessage } = useIntl()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const { couponPlanProductIdList, refetchCouponPlanProductIdList } = useCouponPlanProductIds(couponPlan.id)
  const { settings } = useApp()
  useEffect(() => {
    refetchCouponPlanProductIdList()
  }, [stateCode])

  return (
    <StyledAdminCard
      title={
        <div className="d-flex justify-content-between py-4">
          <StyledTitle>{couponPlan.title}</StyledTitle>
          <StyledPriceLabel className="ml-4" active={isAvailable}>
            {couponPlan.type === 'cash'
              ? currencyFormatter(couponPlan.amount)
              : couponPlan.type === 'percent'
              ? `${couponPlan.amount}% off`
              : null}
          </StyledPriceLabel>
        </div>
      }
    >
      <StyledText active={isAvailable}>
        {couponPlan.constraint
          ? formatMessage(couponMessages.CouponPlanAdminCard.constraintAmount, {
              amount: currencyFormatter(couponPlan.constraint),
            })
          : formatMessage(couponMessages.CouponPlanAdminCard.withoutConstraintAmount)}
        {couponPlan.type === 'cash'
          ? formatMessage(couponMessages['*'].price, {
              amount: currencyFormatter(couponPlan.amount),
            })
          : couponPlan.type === 'percent'
          ? formatMessage(couponMessages['*'].ratio, { amount: couponPlan.amount })
          : null}
      </StyledText>

      <StyledPeriod className="mt-2">
        <span>
          {couponPlan.startedAt
            ? dateFormatter(couponPlan.startedAt)
            : formatMessage(couponMessages.CouponPlanAdminCard.fromNow)}
        </span>
        {settings['coupon.hide_expired_at_back_stage'] !== 'true' && (
          <>
            <span className="m-1">-</span>
            <span>
              {couponPlan.endedAt
                ? dateFormatter(couponPlan.endedAt)
                : formatMessage(couponMessages.CouponPlanAdminCard.forever)}
            </span>
          </>
        )}
      </StyledPeriod>

      <Divider className="mt-3" />

      <div className="d-flex align-items-center justify-content-between">
        <StyledButton type="link" onClick={() => setIsModalVisible(true)}>
          {formatMessage(couponMessages.CouponPlanAdminCard.detail)}
        </StyledButton>
        <div className="flex-grow-1">{renderCount}</div>
        {renderEditDropdown}
      </div>
      {isModalVisible && (
        <StyledModal visible title={null} footer={null} onCancel={() => setIsModalVisible(false)}>
          <StyledModalTitle className="mb-3">{couponPlan.title}</StyledModalTitle>
          {renderDescription?.({ productIds: couponPlanProductIdList })}
        </StyledModal>
      )}
    </StyledAdminCard>
  )
}

const useCouponPlanProductIds = (couponPlanId: string) => {
  const { data, refetch } = useQuery<hasura.GET_COUPON_PLAN_PRODUCTS, hasura.GET_COUPON_PLAN_PRODUCTSVariables>(
    gql`
      query GET_COUPON_PLAN_PRODUCTS($couponPlanId: uuid!) {
        coupon_plan_product(where: { coupon_plan_id: { _eq: $couponPlanId } }) {
          id
          product_id
        }
      }
    `,
    { variables: { couponPlanId } },
  )
  const couponPlanProductIdList = data?.coupon_plan_product.map(v => v.product_id) || []
  return {
    couponPlanProductIdList,
    refetchCouponPlanProductIdList: refetch,
  }
}

export default CouponPlanAdminCard
