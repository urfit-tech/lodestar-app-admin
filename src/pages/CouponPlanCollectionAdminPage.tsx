import Icon, { EditOutlined, FileAddOutlined, MoreOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Button, Dropdown, Menu, Skeleton, Tabs } from 'antd'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminPageTitle } from '../components/admin'
import CouponPlanAdminCard from '../components/coupon/CouponPlanAdminCard'
import CouponPlanAdminModal from '../components/coupon/CouponPlanAdminModal'
import CouponPlanDescriptionTabs from '../components/coupon/CouponPlanDescriptionTabs'
import AdminLayout from '../components/layout/AdminLayout'
import hasura from '../hasura'
import { DiscountIcon } from '../images/icon'
import { CouponPlanProps } from '../types/checkout'
import ForbiddenPage from './ForbiddenPage'
import pageMessages from './translation'

const StyledCount = styled.span`
  color: var(--gray-dark);
  padding: 2px 6px;
  font-size: 14px;
  line-height: 1.57;
  letter-spacing: 0.4px;
`

const CouponPlanCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { permissions } = useAuth()
  const { couponPlans, loadingCouponPlans, refetchCouponPlans } = useSimpleCouponPlanCollection()

  const tabContents = [
    {
      key: 'available',
      tab: formatMessage(pageMessages.CouponPlanCollectionAdminPage.available),
      couponPlans: couponPlans.filter(
        couponPlan =>
          (!couponPlan.startedAt || couponPlan.startedAt.getTime() <= Date.now()) &&
          (!couponPlan.endedAt || couponPlan.endedAt.getTime() >= Date.now()),
      ),
    },
    {
      key: 'notYet',
      tab: formatMessage(pageMessages.CouponPlanCollectionAdminPage.notYet),
      couponPlans: couponPlans.filter(
        couponPlan => couponPlan.startedAt && couponPlan.startedAt.getTime() > Date.now(),
      ),
    },
    {
      key: 'unavailable',
      tab: formatMessage(pageMessages.CouponPlanCollectionAdminPage.unavailable),
      couponPlans: couponPlans.filter(couponPlan => couponPlan.endedAt && couponPlan.endedAt.getTime() < Date.now()),
    },
  ]

  if (!permissions.COUPON_PLAN_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <DiscountIcon />} className="mr-3" />
        <span>{formatMessage(pageMessages.CouponPlanCollectionAdminPage.coupons)}</span>
      </AdminPageTitle>

      <CouponPlanAdminModal
        renderTrigger={({ setVisible }) => (
          <Button type="primary" onClick={() => setVisible(true)} className="mb-5" icon={<FileAddOutlined />}>
            {formatMessage(pageMessages.CouponPlanCollectionAdminPage.createCouponPlan)}
          </Button>
        )}
        icon={<FileAddOutlined />}
        title={formatMessage(pageMessages.CouponPlanCollectionAdminPage.createCouponPlan)}
        onRefetch={refetchCouponPlans}
      />

      <Tabs defaultActiveKey="available">
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={tabContent.tab}>
            <div className="row">
              {loadingCouponPlans ? (
                <Skeleton active />
              ) : (
                tabContent.couponPlans.map(couponPlan => (
                  <div key={couponPlan.id} className="col-12 col-md-6 mb-3">
                    <CouponPlanAdminCard
                      couponPlan={couponPlan}
                      isAvailable={tabContent.key === 'available'}
                      // isAvailable={couponPlan.available}
                      renderDescription={({ productIds }) => (
                        <CouponPlanDescriptionTabs
                          couponPlanId={couponPlan.id}
                          title={couponPlan.title}
                          description={couponPlan.description}
                          constraint={couponPlan.constraint}
                          type={couponPlan.type}
                          amount={couponPlan.amount}
                          scope={couponPlan.scope}
                          productIds={productIds}
                        />
                      )}
                      renderCount={
                        <></>
                        // <StyledCount>
                        //   {formatMessage(promotionMessages.text.sentUsedCount, {
                        //     total: couponPlan.count,
                        //     exchanged: couponPlan.count - couponPlan.remaining,
                        //     // FIXME: disable used count because query too heavy
                        //     // used: couponPlan.used,
                        //   })}
                        // </StyledCount>
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
                                    <span onClick={() => setVisible(true)}>
                                      {formatMessage(pageMessages['*'].edit)}
                                    </span>
                                  )}
                                  icon={<EditOutlined />}
                                  title={formatMessage(pageMessages.CouponPlanCollectionAdminPage.editCouponPlan)}
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
                ))
              )}
            </div>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

// FIXME: remove this in the future
const useSimpleCouponPlanCollection = () => {
  const app = useApp()

  const { loading, error, data, refetch } = useQuery<
    hasura.GET_SIMPLE_COUPON_PLAN_COLLECTION,
    hasura.GET_SIMPLE_COUPON_PLAN_COLLECTIONVariables
  >(
    gql`
      query GET_SIMPLE_COUPON_PLAN_COLLECTION($appId: String!) {
        coupon_plan(where: { coupon_codes: { app_id: { _eq: $appId } } }, order_by: { updated_at: desc }) {
          id
          title
          amount
          scope
          type
          constraint
          started_at
          ended_at
          description
          coupon_plan_products {
            product_id
          }
        }
      }
    `,
    { variables: { appId: app.id }, context: { important: true } },
  )

  const couponPlans: CouponPlanProps[] =
    loading || error || !data
      ? []
      : data.coupon_plan.map(couponPlan => {
          return {
            id: couponPlan.id,
            title: couponPlan.title,
            description: couponPlan.description,
            scope: couponPlan.scope,
            type: couponPlan.type === 1 ? 'cash' : couponPlan.type === 2 ? 'percent' : null,
            amount: couponPlan.amount,
            constraint: couponPlan.constraint,
            startedAt: couponPlan.started_at ? new Date(couponPlan.started_at) : null,
            endedAt: couponPlan.ended_at ? new Date(couponPlan.ended_at) : null,
            productIds: couponPlan.coupon_plan_products.map(couponPlanProduct => couponPlanProduct.product_id),
          }
        })

  return {
    loadingCouponPlans: loading,
    errorCouponPlans: error,
    couponPlans,
    refetchCouponPlans: refetch,
  }
}

export default CouponPlanCollectionAdminPage
