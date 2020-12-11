import React from 'react'
import { CouponPlanProps } from '../../types/checkout'
import CouponPlanAdminCard from '../checkout/CouponPlanAdminCard'
import CouponPlanDescriptionScopeBlock from '../checkout/CouponPlanDescriptionScopeBlock'

const MemberCouponAdminBlock: React.FC<{
  couponPlans: (CouponPlanProps & {
    productIds: string[]
  })[]
}> = ({ couponPlans }) => {
  return (
    <>
      {/* <Tabs> */}
      <div className="row">
        {couponPlans.map(v => (
          <div className="col-6 mb-3">
            <CouponPlanAdminCard
              couponPlan={v}
              renderDescription={() => (
                <CouponPlanDescriptionScopeBlock
                  constraint={v.constraint}
                  type={v.type}
                  amount={v.amount}
                  scope={v.scope}
                  productIds={v.productIds}
                />
              )}
            />
          </div>
        ))}
      </div>
      {/* </Tabs> */}
    </>
  )
}

export default MemberCouponAdminBlock
