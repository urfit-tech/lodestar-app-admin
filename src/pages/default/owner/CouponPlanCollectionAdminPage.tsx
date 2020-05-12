import { Button, Icon, Tabs, Typography } from 'antd'
import { reverse } from 'ramda'
import React from 'react'
import { useIntl } from 'react-intl'
import CouponPlanAdminCard from '../../../components/checkout/CouponPlanAdminCard'
import CouponPlanAdminModal from '../../../components/checkout/CouponPlanAdminModal'
import AdminLayout from '../../../components/layout/AdminLayout'
import { commonMessages, promotionMessages } from '../../../helpers/translation'
import { useCouponPlanCollection } from '../../../hooks/checkout'
import { ReactComponent as DiscountIcon } from '../../../images/icon/discount.svg'
import { CouponPlanProps } from '../../../types/checkout'

const CouponPlanCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { couponPlans } = useCouponPlanCollection()

  return (
    <AdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon component={() => <DiscountIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.coupons)}</span>
      </Typography.Title>

      <CouponPlanAdminModal
        renderTrigger={({ setVisible }) => (
          <Button type="primary" onClick={() => setVisible(true)} className="mb-4" icon="file-add">
            {formatMessage(promotionMessages.ui.createCouponPlan)}
          </Button>
        )}
        icon={<Icon type="file-add" />}
        title={formatMessage(promotionMessages.ui.createCouponPlan)}
      />

      <Tabs>
        <Tabs.TabPane key="live" tab={formatMessage(promotionMessages.status.available)}>
          <CouponCollectionBlock couponPlans={couponPlans.filter(couponPlan => couponPlan.available)} />
        </Tabs.TabPane>
        <Tabs.TabPane key="outdated" tab={formatMessage(promotionMessages.status.unavailable)}>
          <CouponCollectionBlock couponPlans={couponPlans.filter(couponPlan => !couponPlan.available)} />
        </Tabs.TabPane>
      </Tabs>
    </AdminLayout>
  )
}

const CouponCollectionBlock: React.FC<{
  couponPlans: CouponPlanProps[]
}> = ({ couponPlans }) => {
  return (
    <div className="row">
      {reverse(couponPlans).map(couponPlan => (
        <div key={couponPlan.id} className="col-12 col-md-6 mb-3">
          <CouponPlanAdminCard couponPlan={couponPlan} outdated={!couponPlan.available} />
        </div>
      ))}
    </div>
  )
}

export default CouponPlanCollectionAdminPage
