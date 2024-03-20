import { Skeleton, Tabs } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { promotionMessages } from '../../helpers/translation'
import { useCouponCollection } from '../../hooks/coupon'
import { CouponProps } from '../../types/checkout'
import CouponPlanAdminCard from './CouponPlanAdminCard'
import CouponPlanDescriptionScopeBlock from './CouponPlanDescriptionScopeBlock'

const MemberCouponAdminBlock: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { loading, error, data: coupons } = useCouponCollection(memberId)
  if (loading || error) {
    return <Skeleton active />
  }

  return <CouponCollectionTabs coupons={coupons} />
}

const CouponCollectionTabs: React.FC<{
  coupons: CouponProps[]
}> = ({ coupons }) => {
  const { formatMessage } = useIntl()
  const { permissions } = useAuth()

  const tabContents = [
    {
      key: 'available',
      tab: formatMessage(promotionMessages.status.available),
      couponPlans: coupons.filter(v => !v.status.outdated && !v.status.used).map(w => w.couponCode?.couponPlan),
      isAvailable: true,
    },
    {
      key: 'notYet',
      tab: formatMessage(promotionMessages.status.notYet),
      couponPlans: coupons
        .filter(
          v =>
            v.couponCode?.couponPlan.startedAt &&
            v.couponCode?.couponPlan.startedAt.getTime() > Date.now() &&
            !v.status.used,
        )
        .map(w => w.couponCode?.couponPlan),
      isAvailable: false,
    },
    {
      key: 'expired',
      tab: formatMessage(promotionMessages.status.unavailable),
      couponPlans: coupons
        .filter(
          v =>
            (v.couponCode?.couponPlan.endedAt && v.couponCode?.couponPlan.endedAt.getTime() < Date.now()) ||
            v.status.used,
        )
        .map(w => w.couponCode?.couponPlan),
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
