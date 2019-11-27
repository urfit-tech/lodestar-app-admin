import { Icon, Tabs, Typography } from 'antd'
import { reverse } from 'ramda'
import React, { useEffect } from 'react'
import { BooleanParam, useQueryParam } from 'use-query-params'
import { useAuth } from '../../../components/auth/AuthContext'
import CouponAdminCard from '../../../components/checkout/CouponAdminCard'
import CouponInsertionCard from '../../../components/checkout/CouponInsertionCard'
import MemberAdminLayout from '../../../components/layout/MemberAdminLayout'
import { useCouponCollection } from '../../../hooks/data'
import { ReactComponent as TicketIcon } from '../../../images/default/ticket.svg'

const CouponCollectionAdminPage = () => {
  const { currentMemberId } = useAuth()
  const [available, setAvailable] = useQueryParam('available', BooleanParam)
  useEffect(() => {
    available === undefined && setAvailable(true)
  }, [setAvailable, available])
  return (
    <MemberAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon component={() => <TicketIcon />} className="mr-3" />
        <span>折價券</span>
      </Typography.Title>

      <CouponInsertionCard onInsert={() => window.location.reload()} />

      <Tabs
        activeKey={available ? 'available' : 'unavailable'}
        onChange={key => setAvailable(key === 'available')}
        style={{ paddingTop: '40px' }}
      >
        <Tabs.TabPane key="available" tab="可使用">
          {currentMemberId && <CouponCollectionBlock memberId={currentMemberId} available />}
        </Tabs.TabPane>
        <Tabs.TabPane key="unavailable" tab="已失效">
          {currentMemberId && <CouponCollectionBlock memberId={currentMemberId} available={false} />}
        </Tabs.TabPane>
      </Tabs>
    </MemberAdminLayout>
  )
}

const CouponCollectionBlock: React.FC<{
  memberId: string
  available?: boolean
}> = ({ memberId, available }) => {
  const { coupons } = useCouponCollection(memberId)
  return (
    <div className="row">
      {reverse(coupons)
        .filter(coupon => {
          const couponAvailable = !coupon.status.outdated && !coupon.status.used
          return couponAvailable === available
        })
        .map(coupon => (
          <div className="mb-3 col-12 col-md-6" key={coupon.id}>
            <CouponAdminCard coupon={coupon} outdated={!available} />
          </div>
        ))}
    </div>
  )
}

export default CouponCollectionAdminPage
