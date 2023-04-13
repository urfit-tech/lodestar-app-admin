import { EditOutlined, MoreOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/client'
import { Button, Dropdown, Menu, Skeleton } from 'antd'
import { gql } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { EmptyBlock } from '../../components/admin'
import CouponPlanAdminCard from '../../components/coupon/CouponPlanAdminCard'
import CouponPlanAdminModal from '../../components/coupon/CouponPlanAdminModal'
import CouponPlanDescriptionTabs from '../../components/coupon/CouponPlanDescriptionTabs'
import hasura from '../../hasura'
import { CouponPlanProps } from '../../types/checkout'
import pageMessages from '../translation'

const CouponCollectionBlock: React.VFC<{
  condition: hasura.GET_PREVIEW_COUPON_PLAN_COLLECTIONVariables['condition']
  isAvailable: boolean
  stateCode: number
  onRefetch?: () => void
}> = ({ condition, isAvailable, stateCode, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const { couponPlanPreviews, errorCouponPlans, loadingCouponPlans, refetchCouponPlans, loadMoreCouponPlans } =
    usePreviewCouponPlanCollection(condition)

  useEffect(() => {
    refetchCouponPlans()
  }, [refetchCouponPlans, stateCode])

  if (loadingCouponPlans) return <Skeleton active />

  if (errorCouponPlans) {
    return <div>{formatMessage(pageMessages['*'].fetchDataError)}</div>
  }

  return (
    <>
      {couponPlanPreviews.length === 0 ? (
        <EmptyBlock>{formatMessage(pageMessages.CouponCollectionBlock.emptyCouponPlan)}</EmptyBlock>
      ) : (
        <>
          <div className="row">
            {couponPlanPreviews.map(couponPlan => (
              <div key={couponPlan.id} className="col-12 col-md-6 mb-3">
                <CouponPlanAdminCard
                  couponPlan={couponPlan}
                  isAvailable={isAvailable}
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
                  renderEditDropdown={
                    <Dropdown
                      placement="bottomRight"
                      trigger={['click']}
                      overlay={
                        <Menu>
                          <Menu.Item>
                            <CouponPlanAdminModal
                              renderTrigger={({ setVisible }) => (
                                <span onClick={() => setVisible(true)}>{formatMessage(pageMessages['*'].edit)}</span>
                              )}
                              icon={<EditOutlined />}
                              title={formatMessage(pageMessages['*'].editCouponPlan)}
                              couponPlan={couponPlan}
                              onRefetch={onRefetch}
                            />
                          </Menu.Item>
                        </Menu>
                      }
                    >
                      <MoreOutlined />
                    </Dropdown>
                  }
                  stateCode={stateCode}
                />
              </div>
            ))}

            {loadMoreCouponPlans && (
              <div className="text-center" style={{ width: '100%' }}>
                <Button
                  loading={loading}
                  onClick={() => {
                    setLoading(true)
                    loadMoreCouponPlans()?.finally(() => setLoading(false))
                  }}
                >
                  {formatMessage(pageMessages.CouponCollectionBlock.showMore)}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

const usePreviewCouponPlanCollection = (condition: hasura.GET_PREVIEW_COUPON_PLAN_COLLECTIONVariables['condition']) => {
  const { loading, error, data, refetch, fetchMore } = useQuery<
    hasura.GET_PREVIEW_COUPON_PLAN_COLLECTION,
    hasura.GET_PREVIEW_COUPON_PLAN_COLLECTIONVariables
  >(
    gql`
      query GET_PREVIEW_COUPON_PLAN_COLLECTION($condition: coupon_plan_bool_exp!, $limit: Int!) {
        coupon_plan(where: $condition, order_by: [{ updated_at: desc }, { id: desc }], limit: $limit) {
          id
          title
          amount
          scope
          type
          constraint
          started_at
          ended_at
          updated_at
          description
          coupon_plan_products {
            product_id
          }
        }
        coupon_plan_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
      }
    `,
    { variables: { condition: condition, limit: 100 }, context: { important: true } },
  )

  const couponPlanPreviews: CouponPlanProps[] =
    loading || error || !data
      ? []
      : data.coupon_plan.map(v => {
          return {
            id: v.id,
            title: v.title || '',
            description: v.description || '',
            scope: v.scope,
            type: v.type === 1 ? 'cash' : v.type === 2 ? 'percent' : null,
            amount: v.amount,
            constraint: v.constraint,
            startedAt: v.started_at ? new Date(v.started_at) : null,
            endedAt: v.ended_at ? new Date(v.ended_at) : null,
            productIds: v.coupon_plan_products.map(w => w.product_id),
          }
        })

  const loadMoreCouponPlans =
    (data?.coupon_plan.length || 0) < (data?.coupon_plan_aggregate.aggregate?.count || 0)
      ? () =>
          fetchMore({
            variables: {
              condition: { ...condition, updated_at: { _lt: data?.coupon_plan.slice(-1)[0]?.updated_at } },
              limit: 100,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              return {
                coupon_plan_aggregate: prev.coupon_plan_aggregate,
                coupon_plan: [...prev.coupon_plan, ...fetchMoreResult.coupon_plan],
              }
            },
          })
      : undefined

  return {
    loadingCouponPlans: loading,
    errorCouponPlans: error,
    couponPlanPreviews,
    refetchCouponPlans: refetch,
    loadMoreCouponPlans,
  }
}

export default CouponCollectionBlock
