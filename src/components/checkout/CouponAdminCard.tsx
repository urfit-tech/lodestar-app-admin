import { Button, Divider } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { InferType } from 'yup'
import { currencyFormatter, dateFormatter } from '../../helpers'
import { commonMessages, promotionMessages } from '../../helpers/translation'
import { couponSchema } from '../../schemas/coupon'
import AdminCard from '../admin/AdminCard'
import CouponDescriptionModal from './CouponDescriptionModal'

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
const StyledTitle = styled.div`
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`
const StyledPriceLabel = styled.span<{ outdated?: boolean }>`
  color: ${props => (props.outdated ? 'var(--gray)' : props.theme['@primary-color'])};
  font-size: 24px;
  letter-spacing: 0.2px;
`
const StyledText = styled.span<{ outdated?: boolean }>`
  padding: 2px 6px;
  color: ${props => (props.outdated ? 'var(--gray-dark)' : props.theme['@primary-color'])};
  background-color: ${props => (props.outdated ? 'var(--gray-lighter)' : props.theme['@processing-color'])};
  font-size: 14px;
  line-height: 1.57;
  letter-spacing: 0.4px;
`

const CouponAdminCard: React.FC<{
  coupon: InferType<typeof couponSchema>
  outdated?: boolean
}> = ({ coupon, outdated }) => {
  const { formatMessage } = useIntl()
  const [visible, setVisible] = useState()

  return (
    <StyledAdminCard
      title={
        <StyledTitle className="d-flex align-items-start justify-content-between py-4">
          <span className="flex-grow-1">{coupon.couponCode.couponPlan.title}</span>
          <StyledPriceLabel className="flex-shrink-0" outdated={outdated}>
            {coupon.couponCode.couponPlan.type === 1
              ? currencyFormatter(coupon.couponCode.couponPlan.amount)
              : coupon.couponCode.couponPlan.type === 2
              ? `${coupon.couponCode.couponPlan.amount}% off`
              : null}
          </StyledPriceLabel>
        </StyledTitle>
      }
    >
      <StyledText outdated={outdated}>
        {coupon.couponCode.couponPlan.constraint
          ? formatMessage(promotionMessages.label.constraintAmount, {
              amount: currencyFormatter(coupon.couponCode.couponPlan.constraint),
            })
          : formatMessage(promotionMessages.label.withoutConstraintAmount)}
        {coupon.couponCode.couponPlan.type === 1
          ? formatMessage(promotionMessages.label.price, {
              amount: currencyFormatter(coupon.couponCode.couponPlan.amount),
            })
          : coupon.couponCode.couponPlan.type === 2
          ? formatMessage(promotionMessages.label.ratio, { amount: coupon.couponCode.couponPlan.amount })
          : null}
      </StyledText>
      <div style={{ fontFamily: 'Roboto', fontSize: '14px', paddingTop: '12px' }}>
        {coupon.couponCode.couponPlan.startedAt
          ? dateFormatter(coupon.couponCode.couponPlan.startedAt)
          : formatMessage(promotionMessages.label.fromNow)}
        {' ~ '}
        {coupon.couponCode.couponPlan.endedAt
          ? dateFormatter(coupon.couponCode.couponPlan.endedAt)
          : formatMessage(promotionMessages.label.forever)}
      </div>

      <Divider style={{ margin: '12px 0px 17px' }} />

      <div className="d-flex align-items-center justify-content-between">
        <Button
          type="link"
          onClick={() => setVisible(true)}
          style={{
            fontSize: '14px',
            padding: 0,
            letterSpacing: '-1px',
            height: 'auto',
          }}
        >
          {formatMessage(commonMessages.ui.detail)}
        </Button>
        <CouponDescriptionModal coupon={coupon} visible={visible} onCancel={() => setVisible(false)} />
      </div>
    </StyledAdminCard>
  )
}

export default CouponAdminCard
