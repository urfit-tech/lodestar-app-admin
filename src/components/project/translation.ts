import { defineMessages } from 'react-intl'

const projectMessages = {
  '*': defineMessages({
    projectTitle: { id: 'project.*.projectTitle', defaultMessage: 'Project title' },
    sponsor: { id: 'project.*.sponsor', defaultMessage: 'Sponsor' },
    settings: { id: 'project.*.settings', defaultMessage: 'Project settings' },
    projectIntroduction: { id: 'project.*.projectIntroduction', defaultMessage: 'Project introduction' },
    fundingTerm: { id: 'project.*.fundingTerm', defaultMessage: 'Funding conditions' },
    participantsAmount: { id: 'project.*.participantsAmount', defaultMessage: 'Participants' },
    projectCountdownTimer: { id: 'project.*.projectCountdownTimer', defaultMessage: 'Project countdown' },
    unnamedProject: { id: 'project.*.unnamedProject', defaultMessage: 'Unnamed project' },
    projectCover: { id: 'project.*.projectCover', defaultMessage: 'Project cover' },
    projectAbstract: { id: 'project.*.projectAbstract', defaultMessage: 'Project abstract' },
    projectContent: { id: 'project.*.projectContent', defaultMessage: 'Project content' },
    expireAt: { id: 'project.*.expireAt', defaultMessage: 'Deadline' },
    sortProject: { id: 'project.*.sortProject', defaultMessage: 'Project sort' },
    sortProjectPlan: { id: 'project.*.sortProjectPlan', defaultMessage: 'Plan sort' },
    editProject: { id: 'project.*.editProject', defaultMessage: 'Edit plan' },
    noProject: { id: 'project.*.noProject', defaultMessage: 'No projects yet' },
    soldOutProjectCount: { id: 'project.*.soldOutProjectCount', defaultMessage: 'Sold {count}' },
    portfolioTitle: { id: 'project.*.portfolioTitle', defaultMessage: 'Title' },
    noMarkedPortfolio: { id: 'project.*.noMarkedPortfolio', defaultMessage: 'No marked portfolio' },
  }),
  ProjectPlanAdminModal: defineMessages({
    deliverables: { id: 'project.ProjectPlanAdminModal.deliverables', defaultMessage: 'Deliverables' },
    isPublished: { id: 'project.ProjectPlanAdminModal.isPublished', defaultMessage: 'On sale' },
    published: { id: 'project.ProjectPlanAdminModal.published', defaultMessage: 'Published, available for sale immediately after project launch' },
    unPublished: {
      id: 'project.ProjectPlanAdminModal.unPublished',
      defaultMessage: 'Unpublished, this plan is suspended from external sales and hidden from the project',
    },
    isParticipantsVisible: { id: 'project.ProjectPlanAdminModal.isParticipantsVisible', defaultMessage: 'Purchase count' },
    planDescription: { id: 'project.ProjectPlanAdminModal.planDescription', defaultMessage: 'Plan description' },
    saveProjectPlan: { id: 'project.ProjectPlanAdminModal.saveProjectPlan', defaultMessage: 'Save plan' },
    showOriginSize: {
      id: 'project.ProjectPlanAdminModal.showOriginSize',
      defaultMessage: 'Display at original size',
    },
    notUploaded: {
      id: 'project.ProjectPlanAdminModal.notUploaded',
      defaultMessage: '*Not uploaded yet',
    },
  }),
  ProjectPlanCard: defineMessages({
    onSale: { id: 'project.ProjectPlanCard.onSale', defaultMessage: 'On sale' },
    notSale: { id: 'project.ProjectPlanCard.notSale', defaultMessage: 'Discontinued' },
    sku: { id: 'project.ProjectPlanCard.sku', defaultMessage: 'SKU' },
    skuSetting: { id: 'project.ProjectPlanCard.skuSetting', defaultMessage: 'Set SKU' },
  }),
  ProjectPlanProductSelector: defineMessages({
    sku: { id: 'project.ProjectPlanProductSelector.sku', defaultMessage: 'SKU' },
    recognizePrice: { id: 'project.ProjectPlanProductSelector.recognizePrice', defaultMessage: 'Recognized amount' },
    addDeliverables: { id: 'project.ProjectPlanProductSelector.addDeliverables', defaultMessage: 'Add item' },
  }),
  ProjectIntroForm: defineMessages({
    introductionDefaultNotice: {
      id: 'project.ProjectIntroForm.introductionDefaultNotice',
      defaultMessage: 'Default content displayed on mobile and desktop',
    },
    introductionDesktopNotice: {
      id: 'project.ProjectIntroForm.introductionDesktopNotice',
      defaultMessage: 'Priority content displayed on desktop, can be left empty if same as default',
    },
    showOriginSize: {
      id: 'project.ProjectIntroForm.showOriginSize',
      defaultMessage: 'Display at original size',
    },
    notUploaded: {
      id: 'project.ProjectIntroForm.notUploaded',
      defaultMessage: '*Not uploaded yet',
    },
  }),
  ProjectBasicForm: defineMessages({
    tag: { id: 'project.ProjectBasicForm.tag', defaultMessage: 'Tag' },
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
