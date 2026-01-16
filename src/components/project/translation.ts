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
    portfolioTitle: { id: 'project.*.portfolioTitle', defaultMessage: 'Title' },
    noMarkedPortfolio: { id: 'project.*.noMarkedPortfolio', defaultMessage: 'No marked portfolio' },
  }),
  ProjectPlanAdminModal: defineMessages({
    deliverables: { id: 'project.ProjectPlanAdminModal.deliverables', defaultMessage: '交付項目' },
    isPublished: { id: 'project.ProjectPlanAdminModal.isPublished', defaultMessage: '是否開賣' },
    published: { id: 'project.ProjectPlanAdminModal.published', defaultMessage: '發售，專案上架後立即開賣' },
    unPublished: {
      id: 'project.ProjectPlanAdminModal.unPublished',
      defaultMessage: '停售，此方案暫停對外銷售，並從專案中隱藏',
    },
    isParticipantsVisible: { id: 'project.ProjectPlanAdminModal.isParticipantsVisible', defaultMessage: '購買人數' },
    planDescription: { id: 'project.ProjectPlanAdminModal.planDescription', defaultMessage: '方案描述' },
    saveProjectPlan: { id: 'project.ProjectPlanAdminModal.saveProjectPlan', defaultMessage: '儲存方案' },
    showOriginSize: {
      id: 'project.ProjectPlanAdminModal.showOriginSize',
      defaultMessage: '以原圖尺寸顯示',
    },
    notUploaded: {
      id: 'project.ProjectPlanAdminModal.notUploaded',
      defaultMessage: '*尚未上傳',
    },
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
  ProjectIntroForm: defineMessages({
    introductionDefaultNotice: {
      id: 'project.ProjectIntroForm.introductionDefaultNotice',
      defaultMessage: '預設顯示在手機版與電腦版的圖文內容',
    },
    introductionDesktopNotice: {
      id: 'project.ProjectIntroForm.introductionDesktopNotice',
      defaultMessage: '優先顯示在電腦版的圖文內容，若與「預設」一樣可留空',
    },
    showOriginSize: {
      id: 'project.ProjectIntroForm.showOriginSize',
      defaultMessage: '以原圖尺寸顯示',
    },
    notUploaded: {
      id: 'project.ProjectIntroForm.notUploaded',
      defaultMessage: '*尚未上傳',
    },
  }),
  ProjectBasicForm: defineMessages({
    tag: { id: 'project.ProjectBasicForm.tag', defaultMessage: '標籤' },
  }),
  ProjectPortfolioBasicForm: defineMessages({
    tag: { id: 'project.ProjectPortfolioBasicForm.tag', defaultMessage: 'tag' },
  }),
  ProjectPortfolioSettingsForm: defineMessages({
    cover: {
      id: 'project.ProjectPortfolioSettingsForm.cover',
      defaultMessage: 'cover',
    },
    defaultImageTips: {
      id: 'project.ProjectPortfolioSettingsForm.defaultImageTips',
      defaultMessage: 'Recommended image size: 1200*675px',
    },
    defaultVideoTips: {
      id: 'project.ProjectPortfolioSettingsForm.defaultVideoTips',
      defaultMessage: 'If video preview is not show in page, please check video url is correct',
    },
    videoUrl: {
      id: 'project.ProjectPortfolioSettingsForm.videoUrl',
      defaultMessage: 'Portfolio video url',
    },
    hasSameOriginalSource: {
      id: 'project.ProjectPortfolioSettingsForm.hasSameOriginalSource',
      defaultMessage: 'Has same original source',
    },
    hasSameOriginalSourceNoticeTitle: {
      id: 'project.ProjectPortfolioSettingsForm.hasSameOriginalSourceNoticeTitle',
      defaultMessage: 'Possibility of portfolio from the same source:',
    },
    hasSameOriginalSourceNotice1: {
      id: 'project.ProjectPortfolioSettingsForm.hasSameOriginalSourceNotice1',
      defaultMessage:
        '1. Other team members in the portfolio have uploaded, and you can go to the portfolio page to apply for being marked as one of the staff members.',
    },
    hasSameOriginalSourceNotice2: {
      id: 'project.ProjectPortfolioSettingsForm.hasSameOriginalSourceNotice2',
      defaultMessage:
        '(2) The portfolio is likely to have been infringed, and you can report the portfolio and remove it from the shelves.',
    },
    creator: {
      id: 'project.ProjectPortfolioSettingsForm.creator',
      defaultMessage: 'creator: {name}',
    },
  }),
  ProjectPortfolioDescriptionForm: defineMessages({}),
  ProjectCollectionTable: defineMessages({
    title: { id: 'project.ProjectCollectionTable.title', defaultMessage: 'Title' },
    author: { id: 'project.ProjectCollectionTable.author', defaultMessage: 'Author' },
    mark: { id: 'project.ProjectCollectionTable.mark', defaultMessage: 'Mark' },
  }),
  ProjectPublishAdminBlock: defineMessages({
    notCompleteNotation: {
      id: 'project.ProjectPublishAdminBlock.notCompleteNotation',
      defaultMessage: 'Please fill required fields. Once completed, you can publish your project.',
    },
    notCompletePortfolioNotation: {
      id: 'project.ProjectPublishAdminBlock.notCompletePortfolioNotation',
      defaultMessage: 'Please fill required fields. Once completed, you can publish from here.',
    },
    unpublishedNotation: {
      id: 'project.ProjectPublishAdminBlock.unpublishedNotation',
      defaultMessage: 'Your project is not published, it will not show in page.',
    },
    unpublishedPortfolioNotation: {
      id: 'project.ProjectPublishAdminBlock.unpublishedPortfolioNotation',
      defaultMessage: 'Your portfolio is not published, it will not show in page.',
    },
    publishedNotation: {
      id: 'project.ProjectPublishAdminBlock.publishedNotation',
      defaultMessage: 'Your project is published now, it will show in page.',
    },
    publishedPortfolioNotation: {
      id: 'project.ProjectPublishAdminBlock.publishedPortfolioNotation',
      defaultMessage: 'Your portfolio is published now, it will show in page.',
    },
    noTitle: { id: 'project.ProjectPublishAdminBlock.noShopTitle', defaultMessage: 'Project title has not been set' },
    noFundingTerm: { id: 'project.text.noSalePlan', defaultMessage: 'Project sale plan has not been set' },
    noSalePrice: { id: 'project.text.noSalePrice', defaultMessage: 'Sale price has not been set' },
    activateProject: { id: 'project.ProjectPublishAdminBlock.activateShop', defaultMessage: 'Publish' },
    activateNow: { id: 'project.ProjectPublishAdminBlock.activateNow', defaultMessage: 'Publish' },
    closeProject: { id: 'project.ProjectPublishAdminBlock.closeShop', defaultMessage: 'Unpublish' },
    noAuthor: { id: 'project.ProjectPublishAdminBlock.noAuthor', defaultMessage: 'Author has not been set' },
    noVideoUrl: { id: 'project.ProjectPublishAdminBlock.noVideoUrl', defaultMessage: 'Video url has not been set' },
    portfolioUnpublishingWarningText: {
      id: 'project.ProjectPublishAdminBlock.portfolioUnpublishingWarningText',
      defaultMessage: 'Portfolio will unpublish and not display in list',
    },
  }),
  ProjectParticipantBlock: defineMessages({
    participantFieldRequired: {
      id: 'project.ProjectParticipantBlock.participantFieldRequired',
      defaultMessage: 'Please select a participant.',
    },
    occupationFieldRequired: {
      id: 'project.ProjectParticipantBlock.occupationFieldRequired',
      defaultMessage: 'Please select a occupation.',
    },
    participantName: {
      id: 'project.ProjectParticipantBlock.participantName',
      defaultMessage: '參與者姓名',
    },
    enterParticipantNamePlease: {
      id: 'project.ProjectParticipantBlock.enterParticipantNamePlease',
      defaultMessage: '請填寫參與者姓名',
    },
    remainingDays: {
      id: 'project.ProjectParticipantBlock.remainingDays',
      defaultMessage: '(剩 {remainingDays} 天到期)',
    },
    deleteWarnText: {
      id: 'project.ProjectParticipantBlock.deleteWarnText',
      defaultMessage: '刪除不可恢復，確定要刪除嗎？',
    },
    inviteSuccessfully: {
      id: 'project.ProjectParticipantBlock.invitedSuccessfully',
      defaultMessage: '邀請成功',
    },
    invalidEmail: {
      id: 'project.ProjectRejectMarkModal.invalidEmail',
      defaultMessage: '無效的信箱',
    },
    agreeSuccessfully: {
      id: 'project.ProjectRejectMarkModal.agreeSuccessfully',
      defaultMessage: 'Agree successfully',
    },
    rejectSuccessfully: {
      id: 'project.ProjectRejectMarkModal.rejectSuccessfully',
      defaultMessage: 'Reject successfully',
    },
  }),
  ProjectRejectMarkModal: defineMessages({
    rejectMark: {
      id: 'project.ProjectRejectMarkModal.rejectMark',
      defaultMessage: 'Reject Mark',
    },
    reason: {
      id: 'project.ProjectRejectMarkModal.reason',
      defaultMessage: 'Reason',
    },
    pleaseEnterAReasonForRejection: {
      id: 'project.ProjectRejectMarkModal.pleaseEnterAReasonForRejection',
      defaultMessage: 'Please enter a reason for rejection',
    },
    hasRejectedMark: {
      id: 'project.ProjectRejectMarkModal.hasRejectedMark',
      defaultMessage: 'Has rejected mark',
    },
  }),
}

export default projectMessages
