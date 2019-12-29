import { useQuery } from '@apollo/react-hooks'
import { Button, Icon, Tabs, Typography } from 'antd'
import gql from 'graphql-tag'
import { reverse } from 'ramda'
import React from 'react'
import CouponPlanAdminCard from '../../../components/checkout/CouponPlanAdminCard'
import CouponPlanAdminModal from '../../../components/checkout/CouponPlanAdminModal'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import { ReactComponent as DiscountIcon } from '../../../images/icon/discount.svg'
import types from '../../../types'

const CouponPlanCollectionAdminPage = () => {
  const { loading, error, data } = useQuery<
    types.GET_COUPON_PLAN_COLLECTION,
    types.GET_COUPON_PLAN_COLLECTIONVariables
  >(GET_COUPON_PLAN_COLLECTION, {
    variables: { appId: localStorage.getItem('kolable.app.id') || '' },
  })

  const couponPlans =
    loading || error || !data
      ? []
      : data.coupon_plan.map(value => {
          const [count, remaining] =
            value.coupon_codes_aggregate.aggregate && value.coupon_codes_aggregate.aggregate.sum
              ? [
                  value.coupon_codes_aggregate.aggregate.sum.count || 0,
                  value.coupon_codes_aggregate.aggregate.sum.remaining || 0,
                ]
              : [0, 0]

          return {
            id: value.id,
            title: value.title,
            amount: value.amount,
            scope: value.scope || '',
            type: value.type,
            constraint: value.constraint,
            startedAt: value.started_at && new Date(value.started_at),
            endedAt: value.ended_at && new Date(value.ended_at),
            description: value.description,
            count,
            remaining,

            available: remaining > 0 && (value.ended_at ? new Date(value.ended_at).getTime() > Date.now() : true),
          }
        })

  return (
    <OwnerAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon component={() => <DiscountIcon />} className="mr-3" />
        <span>折價方案</span>
      </Typography.Title>

      <CouponPlanAdminModal
        renderTrigger={({ setVisible }) => (
          <Button type="primary" onClick={() => setVisible(true)} className="mb-4" icon="file-add">
            建立折價方案
          </Button>
        )}
        icon={<Icon type="file-add" />}
        title="新增折價方案"
      />

      <Tabs>
        <Tabs.TabPane key="live" tab="可使用">
          <CouponCollectionBlock couponPlans={couponPlans.filter(couponPlan => couponPlan.available)} />
        </Tabs.TabPane>
        <Tabs.TabPane key="outdated" tab="已失效">
          <CouponCollectionBlock couponPlans={couponPlans.filter(couponPlan => !couponPlan.available)} />
        </Tabs.TabPane>
      </Tabs>
    </OwnerAdminLayout>
  )
}

const CouponCollectionBlock: React.FC<{
  couponPlans: {
    id: string
    title: string
    amount: number
    scope: string
    type: number
    constraint: number
    startedAt: Date | null
    endedAt: Date | null
    description: string | null
    count: number
    remaining: number
    available: boolean
  }[]
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

const GET_COUPON_PLAN_COLLECTION = gql`
  query GET_COUPON_PLAN_COLLECTION($appId: String!) {
    coupon_plan(where: { coupon_codes: { app_id: { _eq: $appId } } }) {
      id
      title
      amount
      scope
      type
      constraint
      started_at
      ended_at
      description
      coupon_codes_aggregate {
        aggregate {
          sum {
            count
            remaining
          }
        }
      }
    }
  }
`

export default CouponPlanCollectionAdminPage
