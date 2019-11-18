import { Card } from 'antd'
import { CardProps } from 'antd/lib/card'
import React from 'react'
import { InferType } from 'yup'
import { currencyFormatter, dateFormatter } from '../../helpers'
import { couponSchema } from '../../schemas/coupon'

type CouponCardProps = CardProps & {
  coupon: InferType<typeof couponSchema>
}
const CouponCard: React.FC<CouponCardProps> = ({ coupon, ...cardProps }) => {
  return (
    <Card {...cardProps}>
      <div style={{ fontSize: '20px', fontWeight: 'bold', paddingBottom: '12px' }}>
        {coupon.couponCode.couponPlan.title}
      </div>
      <div>
        {coupon.couponCode.couponPlan.constraint
          ? `消費滿 ${currencyFormatter(coupon.couponCode.couponPlan.constraint)} 折抵`
          : `直接折抵`}
        {coupon.couponCode.couponPlan.type === 1
          ? `金額 ${currencyFormatter(coupon.couponCode.couponPlan.amount)} 元`
          : coupon.couponCode.couponPlan.type === 2
          ? `比例 ${coupon.couponCode.couponPlan.amount}%`
          : null}
      </div>
      <div>
        {coupon.couponCode.couponPlan.startedAt ? dateFormatter(coupon.couponCode.couponPlan.startedAt) : '即日起'}
        {' ~ '}
        {coupon.couponCode.couponPlan.endedAt ? dateFormatter(coupon.couponCode.couponPlan.endedAt) : '無使用期限'}
      </div>
    </Card>
  )
}

export default CouponCard
