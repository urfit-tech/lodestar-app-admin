import { defineMessages } from 'react-intl'

const pageMessages = {
  '*': defineMessages({
    edit: { id: 'page.*.edit', defaultMessage: '編輯' },
  }),
  ProjectAdminPage: defineMessages({
    settings: { id: 'project.*.settings', defaultMessage: '專案設定' },
    projectIntroduction: { id: 'project.*.projectIntroduction', defaultMessage: '專案介紹' },
  }),
  ProjectFundingPage: defineMessages({
    projectTitle: { id: 'project.*.projectTitle', defaultMessage: '專案名稱' },
    sponsor: { id: 'project.*.sponsor', defaultMessage: '發起者' },
    unnamedProject: { id: 'project.*.unnamedProject', defaultMessage: '未命名專案' },
  }),
  ProjectPreOrderPage: defineMessages({
    projectTitle: { id: 'project.*.projectTitle', defaultMessage: '專案名稱' },
    sponsor: { id: 'project.*.sponsor', defaultMessage: '發起者' },
    unnamedProject: { id: 'project.*.unnamedProject', defaultMessage: '未命名專案' },
  }),
  CouponPlanCollectionAdminPage: defineMessages({
    coupons: { id: 'common.menu.couponPlans', defaultMessage: '折價方案' },
    createCouponPlan: { id: 'promotion.ui.createCouponPlan', defaultMessage: '建立折價方案' },
    editCouponPlan: { id: 'promotion.ui.editCouponPlan', defaultMessage: '編輯折價方案' },
    available: { id: 'promotion.status.available', defaultMessage: '可使用' },
    notYet: { id: 'promotion.status.notYet', defaultMessage: '未啟用' },
    unavailable: { id: 'promotion.status.unavailable', defaultMessage: '已失效' },
  }),
}

// fundingTerm: { id: 'project.*.fundingTerm', defaultMessage: '募資條件' },
// participantsAmount: { id: 'project.*.participantsAmount', defaultMessage: '參與人數' },
// projectCountdownTimer: { id: 'project.*.projectCountdownTimer', defaultMessage: '專案倒數' },
// projectCover: { id: 'project.*.projectCover', defaultMessage: '專案封面' },
// projectAbstract: { id: 'project.*.projectAbstract', defaultMessage: '專案摘要' },
// projectContent: { id: 'project.*.projectContent', defaultMessage: '專案內容' },
// expireAt: { id: 'project.*.expireAt', defaultMessage: '截止日' },
// sortProject: { id: 'project.*.sortProject', defaultMessage: '專案排序' },
// sortProjectPlan: { id: 'project.*.sortProjectPlan', defaultMessage: '方案排序' },
// editProject: { id: 'project.*.editProject', defaultMessage: '編輯方案' },
// noProject: { id: 'project.*.noProject', defaultMessage: '尚未有任何專案' },
// soldOutProjectCount: { id: 'project.*.soldOutProjectCount', defaultMessage: '已售 {count}' },

export default pageMessages
