import { Button, Divider } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { currencyFormatter, dateFormatter } from '../../helpers'
import { commonMessages, promotionMessages } from '../../helpers/translation'
import { CouponPlanProps } from '../../types/checkout'
import AdminCard from '../admin/AdminCard'
import CouponPlanDescriptionModal from './CouponPlanDescriptionModal'

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
const CouponPlanAdminCard: React.FC<{
  couponPlan: CouponPlanProps & {
    productIds: string[]
  }
  isAvailable?: boolean
  renderDescription?: () => React.ReactNode
  renderCount?: () => React.ReactNode
  renderEditDropdown?: () => React.ReactNode
}> = ({ couponPlan, isAvailable, renderDescription, renderCount, renderEditDropdown }) => {
  const { formatMessage } = useIntl()
  const [modalVisible, setModalVisible] = useState(false)

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
          ? formatMessage(promotionMessages.label.constraintAmount, {
              amount: currencyFormatter(couponPlan.constraint),
            })
          : formatMessage(promotionMessages.label.withoutConstraintAmount)}
        {couponPlan.type === 'cash'
          ? formatMessage(promotionMessages.label.price, {
              amount: currencyFormatter(couponPlan.amount),
            })
          : couponPlan.type === 'percent'
          ? formatMessage(promotionMessages.label.ratio, { amount: couponPlan.amount })
          : null}
      </StyledText>

      <StyledPeriod className="mt-2">
        <span>
          {couponPlan.startedAt ? dateFormatter(couponPlan.startedAt) : formatMessage(promotionMessages.label.fromNow)}
        </span>
        <span className="m-1">-</span>
        <span>
          {couponPlan.endedAt ? dateFormatter(couponPlan.endedAt) : formatMessage(promotionMessages.label.forever)}
        </span>
      </StyledPeriod>

      <Divider className="mt-3" />

      <div className="d-flex align-items-center justify-content-between">
        <StyledButton type="link" onClick={() => setModalVisible(true)}>
          {formatMessage(commonMessages.ui.detail)}
        </StyledButton>
        <div className="flex-grow-1">{renderCount?.()}</div>
        {renderEditDropdown?.()}
      </div>

      {modalVisible && (
        <CouponPlanDescriptionModal
          couponPlan={couponPlan}
          visible={modalVisible}
          renderContent={() => renderDescription?.()}
          onCancel={() => setModalVisible(false)}
        />
      )}
    </StyledAdminCard>
  )
}

export default CouponPlanAdminCard
