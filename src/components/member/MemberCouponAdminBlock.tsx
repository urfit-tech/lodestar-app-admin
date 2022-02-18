import { Tabs } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { promotionMessages } from '../../helpers/translation'
import { CouponPlanProps } from '../../types/checkout'
import CouponPlanAdminCard from '../coupon/CouponPlanAdminCard'
import CouponPlanDescriptionScopeBlock from '../coupon/CouponPlanDescriptionScopeBlock'

const MemberCouponAdminBlock: React.FC<{
  coupons: {
    status: {
      outdated: boolean
      used: boolean
    }
    couponPlan: CouponPlanProps & {
      productIds: string[]
    }
  }[]
}> = ({ coupons }) => {
  const { formatMessage } = useIntl()

  const tabContents = [
    {
      key: 'available',
      tab: formatMessage(promotionMessages.status.available),
      couponPlans: coupons.filter(v => !v.status.outdated && !v.status.used).map(w => w.couponPlan),
      isAvailable: true,
    },
    {
      key: 'notYet',
      tab: formatMessage(promotionMessages.status.notYet),
      couponPlans: coupons
        .filter(v => v.couponPlan.startedAt && v.couponPlan.startedAt.getTime() > Date.now() && !v.status.used)
        .map(w => w.couponPlan),
      isAvailable: false,
    },
    {
      key: 'expired',
      tab: formatMessage(promotionMessages.status.unavailable),
      couponPlans: coupons
        .filter(v => (v.couponPlan.endedAt && v.couponPlan.endedAt.getTime() < Date.now()) || v.status.used)
        .map(w => w.couponPlan),
      isAvailable: false,
    },
  ]

  return (
    <Tabs>
      {tabContents.map(v => (
        <Tabs.TabPane key={v.key} tab={v.tab}>
          <div className="row">
            {v.couponPlans.map(w => (
              <div className="col-6 mb-3">
                <CouponPlanAdminCard
                  isAvailable={v.isAvailable}
                  couponPlan={w}
                  renderDescription={() => (
                    <CouponPlanDescriptionScopeBlock
                      constraint={w.constraint}
                      type={w.type}
                      amount={w.amount}
                      scope={w.scope}
                      productIds={w.productIds}
                    />
                  )}
                />
              </div>
            ))}
          </div>
        </Tabs.TabPane>
      ))}
    </Tabs>
  )
}

export default MemberCouponAdminBlock
