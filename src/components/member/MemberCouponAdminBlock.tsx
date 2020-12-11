import { Tabs } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { promotionMessages } from '../../helpers/translation'
import { CouponPlanProps } from '../../types/checkout'
import CouponPlanAdminCard from '../checkout/CouponPlanAdminCard'
import CouponPlanDescriptionScopeBlock from '../checkout/CouponPlanDescriptionScopeBlock'

const MemberCouponAdminBlock: React.FC<{
  couponPlans: (CouponPlanProps & {
    couponStatus: {
      outdated: boolean
      used: boolean
    }
    productIds: string[]
  })[]
}> = ({ couponPlans }) => {
  const { formatMessage } = useIntl()

  const tabContents = [
    {
      key: 'available',
      tab: formatMessage(promotionMessages.status.available),
      couponPlans: couponPlans.filter(v => !v.couponStatus.outdated && !v.couponStatus.used),
    },
    {
      key: 'notYet',
      tab: formatMessage(promotionMessages.status.notYet),
      couponPlans: couponPlans.filter(v => v.startedAt && v.startedAt.getTime() > Date.now() && !v.couponStatus.used),
    },
    {
      key: 'expired',
      tab: formatMessage(promotionMessages.status.unavailable),
      couponPlans: couponPlans.filter(v => (v.endedAt && v.endedAt.getTime() < Date.now()) || v.couponStatus.used),
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
