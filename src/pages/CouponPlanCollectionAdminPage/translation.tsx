import { defineMessages } from 'react-intl'

const CouponPlanCollectionAdminPageMessages = {
  '*': defineMessages({
    coupons: { id: 'CouponPlanCollectionAdminPage.*.couponPlans', defaultMessage: '折價方案' },
    createCouponPlan: { id: 'CouponPlanCollectionAdminPage.*.createCouponPlan', defaultMessage: '建立折價方案' },
    editCouponPlan: { id: 'CouponPlanCollectionAdminPage.*.editCouponPlan', defaultMessage: '編輯折價方案' },
    available: { id: 'CouponPlanCollectionAdminPage.*.available', defaultMessage: '可使用' },
    notYet: { id: 'CouponPlanCollectionAdminPage.*.notYet', defaultMessage: '未啟用' },
    unavailable: { id: 'CouponPlanCollectionAdminPage.*.unavailable', defaultMessage: '已失效' },
  }),
  CouponCollectionBlock: defineMessages({
    showMore: { id: 'CouponPlanCollectionAdminPage.CouponCollectionBlock.showMore', defaultMessage: '顯示更多' },
  }),
}
export default CouponPlanCollectionAdminPageMessages
