import { Card } from 'antd'
import { CardProps } from 'antd/lib/card'
import PriceLabel from 'lodestar-app-element/src/components/labels/PriceLabel'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { dateFormatter } from '../../helpers'
import { CouponProps } from '../../types/checkout'
import couponMessages from './translation'

const CouponCard: React.FC<
  CardProps & {
    coupon: CouponProps
  }
> = ({ coupon, ...cardProps }) => {
  const { formatMessage } = useIntl()
  const { settings } = useApp()

  return (
    <Card {...cardProps}>
      <div style={{ fontSize: '20px', fontWeight: 'bold', paddingBottom: '12px' }}>
        {coupon.couponCode?.couponPlan.title}
      </div>
      <div>
        {coupon.couponCode?.couponPlan.constraint
          ? formatMessage(couponMessages.CouponCard.full, {
              amount: <PriceLabel listPrice={coupon.couponCode.couponPlan.constraint} />,
            })
          : formatMessage(couponMessages.CouponCard.discountDirectly)}
        {coupon.couponCode?.couponPlan.type === 'cash'
          ? formatMessage(couponMessages.CouponCard.amount, {
              amount: <PriceLabel listPrice={coupon.couponCode.couponPlan.amount} />,
            })
          : coupon.couponCode?.couponPlan.type === 'percent'
          ? formatMessage(couponMessages.CouponCard.proportion, { amount: coupon.couponCode.couponPlan.amount })
          : null}
      </div>
      <div>
        {coupon.couponCode?.couponPlan.startedAt
          ? dateFormatter(coupon.couponCode.couponPlan.startedAt)
          : formatMessage(couponMessages.CouponCard.fromNow)}
        {settings['coupon.hide_expired_at_back_stage'] !== 'true' &&
          ` ~ ${
            coupon.couponCode.couponPlan.endedAt
              ? dateFormatter(coupon.couponCode.couponPlan.endedAt)
              : formatMessage(couponMessages.CouponCard.noPeriod)
          }`}
      </div>
    </Card>
  )
}

export default CouponCard
