import Icon, { EditOutlined, FileAddOutlined, MoreOutlined } from '@ant-design/icons'
import { Button, Dropdown, Menu, Tabs } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminPageTitle } from '../../components/admin'
import CouponPlanAdminCard from '../../components/checkout/CouponPlanAdminCard'
import CouponPlanAdminModal from '../../components/checkout/CouponPlanAdminModal'
import CouponPlanDescriptionTabs from '../../components/checkout/CouponPlanDescriptionTabs'
import AdminLayout from '../../components/layout/AdminLayout'
import { commonMessages, promotionMessages } from '../../helpers/translation'
import { useCouponPlanCollection } from '../../hooks/checkout'
import { ReactComponent as DiscountIcon } from '../../images/icon/discount.svg'

const StyledCount = styled.span`
  color: var(--gray-dark);
  padding: 2px 6px;
  font-size: 14px;
  line-height: 1.57;
  letter-spacing: 0.4px;
`

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
      <AdminPageTitle className="mb-4">
        <Icon component={() => <DiscountIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.coupons)}</span>
      </AdminPageTitle>

      <CouponPlanAdminModal
        renderTrigger={({ setVisible }) => (
          <Button type="primary" onClick={() => setVisible(true)} className="mb-5" icon={<FileAddOutlined />}>
            {formatMessage(promotionMessages.ui.createCouponPlan)}
          </Button>
        )}
        icon={<FileAddOutlined />}
        title={formatMessage(promotionMessages.ui.createCouponPlan)}
        onRefetch={refetchCouponPlans}
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
                    renderDescription={
                      <CouponPlanDescriptionTabs
                        couponPlanId={couponPlan.id}
                        title={couponPlan.title}
                        description={couponPlan.description}
                        constraint={couponPlan.constraint}
                        type={couponPlan.type}
                        amount={couponPlan.amount}
                        scope={couponPlan.scope}
                        productIds={couponPlan.productIds}
                      />
                    }
                    renderCount={
                      <StyledCount>
                        {formatMessage(promotionMessages.text.sentUsedCount, {
                          total: couponPlan.count,
                          exchanged: couponPlan.count - couponPlan.remaining,
                          used: couponPlan.used,
                        })}
                      </StyledCount>
                    }
                    renderEditDropdown={
                      <Dropdown
                        placement="bottomRight"
                        trigger={['click']}
                        overlay={
                          <Menu>
                            <Menu.Item>
                              <CouponPlanAdminModal
                                renderTrigger={({ setVisible }) => (
                                  <span onClick={() => setVisible(true)}>{formatMessage(commonMessages.ui.edit)}</span>
                                )}
                                icon={<EditOutlined />}
                                title={formatMessage(promotionMessages.ui.editCouponPlan)}
                                couponPlan={couponPlan}
                                onRefetch={refetchCouponPlans}
                              />
                            </Menu.Item>
                          </Menu>
                        }
                      >
                        <MoreOutlined />
                      </Dropdown>
                    }
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
