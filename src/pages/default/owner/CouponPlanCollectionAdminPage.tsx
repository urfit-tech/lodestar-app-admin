import { Button, Icon, Tabs, Typography } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import CouponPlanAdminCard from '../../../components/checkout/CouponPlanAdminCard'
import CouponPlanAdminModal from '../../../components/checkout/CouponPlanAdminModal'
import AdminLayout from '../../../components/layout/AdminLayout'
import { commonMessages, promotionMessages } from '../../../helpers/translation'
import { useCouponPlanCollection } from '../../../hooks/checkout'
import { ReactComponent as DiscountIcon } from '../../../images/icon/discount.svg'

const CouponPlanCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { couponPlans, refetchCouponPlans } = useCouponPlanCollection()

  const tabContents = [
    {
      key: 'available',
      tab: formatMessage(promotionMessages.status.available),
      couponPlans: couponPlans.filter(couponPlan => couponPlan.available),
    },
    {
      key: 'notYet',
      tab: formatMessage(promotionMessages.status.notYet),
      couponPlans: couponPlans.filter(
        couponPlan => couponPlan.remaining > 0 && couponPlan.startedAt && couponPlan.startedAt.getTime() > Date.now(),
      ),
    },
    {
      key: 'unavailable',
      tab: formatMessage(promotionMessages.status.unavailable),
      couponPlans: couponPlans.filter(
        couponPlan => couponPlan.remaining <= 0 || (couponPlan.endedAt && couponPlan.endedAt.getTime() < Date.now()),
      ),
    },
  ]

  return (
    <AdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon component={() => <DiscountIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.coupons)}</span>
      </Typography.Title>

      <CouponPlanAdminModal
        renderTrigger={({ setVisible }) => (
          <Button type="primary" onClick={() => setVisible(true)} className="mb-5" icon="file-add">
            {formatMessage(promotionMessages.ui.createCouponPlan)}
          </Button>
        )}
        icon={<Icon type="file-add" />}
        title={formatMessage(promotionMessages.ui.createCouponPlan)}
      />

      <Tabs defaultActiveKey="available">
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={tabContent.tab}>
            <div className="row">
              {tabContent.couponPlans.map(couponPlan => (
                <div key={couponPlan.id} className="col-12 col-md-6 mb-3">
                  <CouponPlanAdminCard
                    couponPlan={couponPlan}
                    isAvailable={couponPlan.available}
                    onRefetch={refetchCouponPlans}
                  />
                </div>
              ))}
            </div>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export default CouponPlanCollectionAdminPage
