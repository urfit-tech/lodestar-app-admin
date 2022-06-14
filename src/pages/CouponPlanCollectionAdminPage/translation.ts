import { defineMessages } from 'react-intl'

const CouponPlanCollectionAdminPageMessages = {
  '*': defineMessages({
    coupons: { id: 'CouponPlanCollectionAdminPage.*.couponPlans', defaultMessage: '折價方案' },
    createCouponPlan: { id: 'CouponPlanCollectionAdminPage.*.createCouponPlan', defaultMessage: '建立折價方案' },
    editCouponPlan: { id: 'CouponPlanCollectionAdminPage.*.editCouponPlan', defaultMessage: '編輯折價方案' },
    available: { id: 'CouponPlanCollectionAdminPage.*.available', defaultMessage: '可使用' },
    notYet: { id: 'CouponPlanCollectionAdminPage.*.notYet', defaultMessage: '未啟用' },
    unavailable: { id: 'CouponPlanCollectionAdminPage.*.unavailable', defaultMessage: '已失效' },
    fetchDataError: { id: 'CouponPlanCollectionAdminPage.*.fetchDataError', defaultMessage: '讀取錯誤' },
    edit: { id: 'CouponPlanCollectionAdminPage.*.edit', defaultMessage: '編輯' },
  }),
  CouponCollectionBlock: defineMessages({
    showMore: { id: 'CouponPlanCollectionAdminPage.CouponCollectionBlock.showMore', defaultMessage: '顯示更多' },
    emptyCouponPlan: {
      id: 'CouponPlanCollectionAdminPage.CouponCollectionBlock.emptyCouponPlan',
      defaultMessage: '無任何折價方案',
    },
  }),
}
export default CouponPlanCollectionAdminPageMessages
