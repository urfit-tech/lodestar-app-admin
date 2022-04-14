import { defineMessages } from 'react-intl'

const projectMessages = {
  '*': defineMessages({
    projectTitle: { id: 'project.*.projectTitle', defaultMessage: '專案名稱' },
    sponsor: { id: 'project.*.sponsor', defaultMessage: '發起者' },
    settings: { id: 'project.*.settings', defaultMessage: '專案設定' },
    projectIntroduction: { id: 'project.*.projectIntroduction', defaultMessage: '專案介紹' },
    fundingTerm: { id: 'project.*.fundingTerm', defaultMessage: '募資條件' },
    participantsAmount: { id: 'project.*.participantsAmount', defaultMessage: '參與人數' },
    projectCountdownTimer: { id: 'project.*.projectCountdownTimer', defaultMessage: '專案倒數' },
    unnamedProject: { id: 'project.*.unnamedProject', defaultMessage: '未命名專案' },
    projectCover: { id: 'project.*.projectCover', defaultMessage: '專案封面' },
    projectAbstract: { id: 'project.*.projectAbstract', defaultMessage: '專案摘要' },
    projectContent: { id: 'project.*.projectContent', defaultMessage: '專案內容' },
    expireAt: { id: 'project.*.expireAt', defaultMessage: '截止日' },
    sortProject: { id: 'project.*.sortProject', defaultMessage: '專案排序' },
    sortProjectPlan: { id: 'project.*.sortProjectPlan', defaultMessage: '方案排序' },
    editProject: { id: 'project.*.editProject', defaultMessage: '編輯方案' },
    noProject: { id: 'project.*.noProject', defaultMessage: '尚未有任何專案' },
    soldOutProjectCount: { id: 'project.*.soldOutProjectCount', defaultMessage: '已售 {count}' },
  }),
  ProjectPlanAdminModal: defineMessages({
    deliverables: { id: 'project.ProjectPlanAdminModal.deliverables', defaultMessage: '交付項目' },
  }),
  ProjectPlanCard: defineMessages({
    onSale: { id: 'project.ProjectPlanCard.onSale', defaultMessage: '發售中' },
    notSale: { id: 'project.ProjectPlanCard.notSale', defaultMessage: '已停售' },
    sku: { id: 'project.ProjectPlanCard.sku', defaultMessage: 'SKU' },
    skuSetting: { id: 'project.ProjectPlanCard.skuSetting', defaultMessage: '設定料號' },
  }),
  ProjectPlanProductSelector: defineMessages({
    sku: { id: 'project.ProjectPlanProductSelector.sku', defaultMessage: '料號（SKU）' },
    recognizePrice: { id: 'project.ProjectPlanProductSelector.recognizePrice', defaultMessage: '認列金額' },
    addDeliverables: { id: 'project.ProjectPlanProductSelector.addDeliverables', defaultMessage: '新增項目' },
  }),
}

export default projectMessages
