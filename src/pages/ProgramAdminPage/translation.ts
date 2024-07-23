import { defineMessages } from 'react-intl'

const ProgramAdminPageMessages = {
  '*': defineMessages({
    save: { id: 'ProgramAdminPage.*.save', defaultMessage: '存檔' },
    cancel: { id: 'ProgramAdminPage.*.cancel', defaultMessage: '取消' },
    confirm: { id: 'ProgramAdminPage.*.confirm', defaultMessage: '確定' },
    successfullySaved: { id: 'ProgramAdminPage.*.successfullySaved', defaultMessage: '儲存成功' },
    previewIntroduction: { id: 'ProgramAdminPage.*.previewIntroduction', defaultMessage: '預覽簡介' },
    previewContent: { id: 'ProgramAdminPage.*.previewContent', defaultMessage: '預覽內容' },
    programCover: { id: 'ProgramAdminPage.*.programCover', defaultMessage: '課程封面' },
    preview: { id: 'ProgramAdminPage.*.preview', defaultMessage: '預覽' },
    programContent: { id: 'ProgramAdminPage.*.programContent', defaultMessage: '課程內容' },
    programSettings: { id: 'ProgramAdminPage.*.programSettings', defaultMessage: '課程設定' },
    otherSettings: { id: 'ProgramAdminPage.*.otherSettings', defaultMessage: 'Other settings' },
    basicSettings: { id: 'ProgramAdminPage.*.basicSettings', defaultMessage: '基本設定' },
    programIntroduction: { id: 'ProgramAdminPage.*.programIntroduction', defaultMessage: '課程介紹' },
    salesPlan: { id: 'ProgramAdminPage.*.salesPlan', defaultMessage: '銷售方案' },
    sharingCode: { id: 'ProgramAdminPage.*.sharingCode', defaultMessage: '推廣網址' },
    sharingCodeDescription: {
      id: 'ProgramAdminPage.*.sharingCodeDescription',
      defaultMessage:
        '1. 當學生由你所設定的「推廣網址」進入購買，該筆訂單將標記為由推廣網址下單。\n2. 刪除或修改將會直接取代並失效原本的網址，因此網址公開推廣曝光後，不建議再做刪除或修改。',
    },
    roleAdmin: { id: 'ProgramAdminPage.*.roleAdmin', defaultMessage: '身份管理' },
    publishSettings: { id: 'ProgramAdminPage.*.publishSettings', defaultMessage: '發佈設定' },
    approvalHistory: { id: 'ProgramAdminPage.*.approvalHistory', defaultMessage: '審核紀錄' },
    pendingApproval: { id: 'ProgramAdminPage.*.pendingApproval', defaultMessage: '審核中' },
    rejectedApproval: { id: 'ProgramAdminPage.*.rejectedApproval', defaultMessage: '審核失敗' },
    programCoverDescription: {
      id: 'ProgramAdminPage.*.programCoverDescription',
      defaultMessage: '若皆為同一張圖，只需上傳「預設」即可。',
    },
  }),
  ProgramCoverForm: defineMessages({
    default: { id: 'ProgramAdminPage.ProgramCoverForm.default', defaultMessage: '預設' },
    mobile: { id: 'ProgramAdminPage.ProgramCoverForm.mobile', defaultMessage: '手機版' },
    thumbnail: { id: 'ProgramAdminPage.ProgramCoverForm.thumbnail', defaultMessage: '縮圖' },
    defaultImageTips: {
      id: 'ProgramAdminPage.ProgramCoverForm.defaultImageTips',
      defaultMessage: '建議圖片尺寸：1200*675px',
    },
    defaultVideoTips: {
      id: 'ProgramAdminPage.ProgramCoverForm.defaultVideoTips',
      defaultMessage: '建議影片大小：200MB',
    },
    thumbnailImageTips: {
      id: 'ProgramAdminPage.ProgramCoverForm.thumbnailImageTips',
      defaultMessage: '建議圖片尺寸：600*338px',
    },
    showOriginSize: {
      id: 'ProgramAdminPage.ProgramCoverForm.showOriginSize',
      defaultMessage: '以原圖尺寸顯示',
    },
    notUploaded: {
      id: 'ProgramAdminPage.ProgramCoverForm.notUploaded',
      defaultMessage: '*尚未上傳',
    },
    uploaded: {
      id: 'ProgramAdminPage.ProgramCoverForm.uploaded',
      defaultMessage: 'The file has been uploaded',
    },
  }),
  ProgramApprovalHistory: defineMessages({
    sentApproval: { id: 'ProgramAdminPage.ProgramApprovalHistory.sentApproval', defaultMessage: '{date} 送審' },
    advisement: { id: 'ProgramAdminPage.ProgramApprovalHistory.advisement', defaultMessage: '官方建議' },
    canceledApproval: { id: 'ProgramAdminPage.ProgramApprovalHistory.canceledApproval', defaultMessage: '取消送審' },
    approvedApproval: { id: 'ProgramAdminPage.ProgramApprovalHistory.approvedApproval', defaultMessage: '審核通過' },
  }),
  ProgramBasicForm: defineMessages({
    programTitle: { id: 'ProgramAdminPage.ProgramBasicForm.programTitle', defaultMessage: '課程名稱' },
    category: { id: 'ProgramAdminPage.ProgramBasicForm.category', defaultMessage: '分類' },
    tag: { id: 'ProgramAdminPage.ProgramBasicForm.tag', defaultMessage: '標籤' },
    languages: { id: 'ProgramAdminPage.ProgramBasicForm.languages', defaultMessage: '顯示語系' },
    programLayoutTemplate: {
      id: 'ProgramAdminPage.ProgramBasicForm.programLayoutTemplate',
      defaultMessage: 'Switch Program Template',
    },
    locale: {
      id: 'ProgramAdminPage.ProgramBasicForm.locale',
      defaultMessage: '當前台為指定語系時才會顯示，若不選擇全語系皆顯示',
    },
    isIntroductionSectionVisible: {
      id: 'ProgramAdminPage.ProgramBasicForm.isIntroductionSectionVisible',
      defaultMessage: '簡介章節',
    },
    sectionVisible: {
      id: 'ProgramAdminPage.ProgramBasicForm.sectionVisible',
      defaultMessage: '控制購買前是否能看到所有章節內容名稱',
    },
    displayAllSection: { id: 'ProgramAdminPage.ProgramBasicForm.displayAllSection', defaultMessage: '顯示所有章節' },
    displayTrial: { id: 'ProgramAdminPage.ProgramBasicForm.displayTrial', defaultMessage: '僅顯示試看章節' },
    isIssuesOpen: { id: 'ProgramAdminPage.ProgramBasicForm.isIssuesOpen', defaultMessage: '問題討論' },
    active: { id: 'ProgramAdminPage.ProgramBasicForm.active', defaultMessage: '開啟' },
    closed: { id: 'ProgramAdminPage.ProgramBasicForm.closed', defaultMessage: '關閉' },
    isEnrolledCountVisible: {
      id: 'ProgramAdminPage.*.isEnrolledCountVisible',
      defaultMessage: '購買人數',
    },
    displayHeader: { id: 'ProgramAdminPage.ProgramBasicForm.displayHeader', defaultMessage: 'display header' },
    displayFooter: { id: 'ProgramAdminPage.ProgramBasicForm.displayFooter', defaultMessage: 'display footer' },
    display: { id: 'ProgramAdminPage.ProgramBasicForm.display', defaultMessage: 'display' },
    hide: { id: 'ProgramAdminPage.ProgramBasicForm.hide', defaultMessage: 'hide' },
  }),
  ProgramOtherForm: defineMessages({
    expectedStartDate: {
      id: 'ProgramAdminPage.ProgramOtherForm.expectedStartDate',
      defaultMessage: 'Expected start date',
    },
    expectedDuration: {
      id: 'ProgramAdminPage.ProgramOtherForm.expectedDuration',
      defaultMessage: 'Expected duration(min)',
    },
    expectedSections: { id: 'ProgramAdminPage.ProgramOtherForm.expectedSections', defaultMessage: 'Expected sections' },
    completeRelease: { id: 'ProgramAdminPage.ProgramOtherForm.completeRelease', defaultMessage: 'Complete release' },
  }),
  ProgramPlanAdminBlock: defineMessages({
    perpetualPlan: { id: 'ProgramAdminPage.ProgramPlanAdminBlock.perpetualPlan', defaultMessage: '永久方案' },
    periodPlan: { id: 'ProgramAdminPage.ProgramPlanAdminBlock.periodPlan', defaultMessage: '限時方案' },
    subscriptionPlan: { id: 'ProgramAdminPage.ProgramPlanAdminBlock.subscriptionPlan', defaultMessage: '訂閱方案' },
  }),
  ProgramPublishBlock: defineMessages({
    noProgramAbstract: {
      id: 'ProgramAdminPageMessages.ProgramPublishBlock.noProgramAbstract',
      defaultMessage: '尚未填寫課程摘要',
    },
    noProgramDescription: {
      id: 'ProgramAdminPageMessages.ProgramPublishBlock.noProgramDescription',
      defaultMessage: '尚未填寫課程敘述',
    },
    noProgramContent: {
      id: 'ProgramAdminPageMessages.ProgramPublishBlock.noProgramContent',
      defaultMessage: '尚未新增任何內容',
    },
    noPrice: { id: 'ProgramAdminPageMessages.ProgramPublishBlock.noPrice', defaultMessage: '尚未訂定售價' },
    invalidExercise: {
      id: 'ProgramAdminPageMessages.ProgramPublishBlock.invalidExercise',
      defaultMessage: '未完成測驗',
    },
    publiclyPublished: {
      id: 'ProgramAdminPageMessages.ProgramPublishBlock.publiclyPublished',
      defaultMessage: '已公開發佈',
    },
    isPubliclyPublishedNotation: {
      id: 'ProgramAdminPageMessages.ProgramPublishBlock.isPubliclyPublishedNotation',
      defaultMessage: '現在你的課程已公開發佈，此課程會出現在頁面上。',
    },
    privatelyPublished: {
      id: 'ProgramAdminPageMessages.ProgramPublishBlock.privatelyPublished',
      defaultMessage: '已私密發佈',
    },
    isPrivatelyPublishedNotation: {
      id: 'ProgramAdminPageMessages.ProgramPublishBlock.isPrivatelyPublishedNotation',
      defaultMessage: '你的課程已經私密發佈，此課程不會出現在頁面上，學生僅能透過連結進入瀏覽。',
    },
    unpublished: { id: 'ProgramAdminPageMessages.ProgramPublishBlock.unpublished', defaultMessage: '尚未發佈' },
    isUnpublishedNotation: {
      id: 'ProgramAdminPageMessages.ProgramPublishBlock.isUnpublishedNotation',
      defaultMessage: '因你的課程未發佈，此課程並不會顯示在頁面上，學生也不能購買此課程。',
    },
    notComplete: { id: 'ProgramAdminPageMessages.ProgramPublishBlock.notComplete', defaultMessage: '尚有未完成項目' },
    notCompleteNotation: {
      id: 'ProgramAdminPageMessages.ProgramPublishBlock.notCompleteNotation',
      defaultMessage: '請填寫以下必填資料，填寫完畢即可由此發佈',
    },
    notApprovedNotation: {
      id: 'ProgramAdminPageMessages.ProgramPublishBlock.notYetApplyNotation',
      defaultMessage: '因課程未審核通過，並不會顯示在頁面上',
    },
    checkNotation: {
      id: 'ProgramAdminPageMessages.ProgramPublishBlock.checkNotation',
      defaultMessage: '請檢查課程資訊與內容是否符合平台規範。',
    },
    notYetApproval: { id: 'ProgramAdminPageMessages.ProgramPublishBlock.notYetApproval', defaultMessage: '尚未審核' },
    approved: { id: 'ProgramAdminPageMessages.ProgramPublishBlock.approved', defaultMessage: '審核通過，未發佈' },
    unpublishingTitle: { id: 'common.text.unpublishingTitle', defaultMessage: '確定要取消發佈？' },
    unpublishingWarning: {
      id: 'ProgramAdminPageMessages.ProgramPublishBlock.unpublishingWarning',
      defaultMessage: '課程將下架且不會出現在課程列表，已購買的學生仍然可以看到課程內容。',
    },
    jumpTo: { id: 'ProgramAdminPageMessages.ProgramPublishBlock.jumpTo', defaultMessage: '前往填寫' },
    cancelPublishing: {
      id: 'ProgramAdminPageMessages.ProgramPublishBlock.cancelPublishing',
      defaultMessage: '取消發佈',
    },
    apply: { id: 'ProgramAdminPageMessages.ProgramPublishBlock.apply', defaultMessage: '立即送審' },
    cancel: { id: 'ProgramAdminPageMessages.ProgramPublishBlock.cancel', defaultMessage: '取消送審' },
    reject: { id: 'ProgramAdminPageMessages.ProgramPublishBlock.reject', defaultMessage: '退回案件' },
    approve: { id: 'ProgramAdminPageMessages.ProgramPublishBlock.approve', defaultMessage: '審核通過' },
    reApply: { id: 'ProgramAdminPageMessages.ProgramPublishBlock.reApply', defaultMessage: '重新送審' },
    publishConfirmation: {
      id: 'ProgramAdminPageMessages.ProgramPublishBlock.publishConfirmation',
      defaultMessage: '確定發佈',
    },
    back: { id: 'ProgramAdminPageMessages.ProgramPublishBlock.back', defaultMessage: '返回' },
    confirmPrivatelyPublishedTitle: {
      id: 'ProgramAdminPageMessages.ProgramPublishBlock.confirmPrivatelyPublishedTitle',
      defaultMessage: '確定要設為私密發佈？',
    },
    confirmPrivatelyPublishedNotation: {
      id: 'ProgramAdminPageMessages.ProgramPublishBlock.confirmPrivatelyPublishedNotation',
      defaultMessage: '課程將不會出現在列表，僅以私下提供連結的方式販售課程。',
    },
    send: { id: 'ProgramAdminPageMessages.ProgramPublishBlock.send', defaultMessage: '送出' },
    applyModalTitle: { id: 'ProgramAdminPageMessages.ProgramPublishBlock.applyModalTitle', defaultMessage: '送審備註' },
    rejectModalTitle: {
      id: 'ProgramAdminPageMessages.ProgramPublishBlock.rejectModalTitle',
      defaultMessage: '退回案件',
    },
    applyDescription: {
      id: 'ProgramAdminPageMessages.ProgramPublishBlock.applyDescription',
      defaultMessage: '備註(非必填)',
    },
    rejectDescription: {
      id: 'ProgramAdminPageMessages.ProgramPublishBlock.rejectDescription',
      defaultMessage: '退件原因',
    },
  }),
  ProgramRoleAdminPane: defineMessages({
    programOwner: { id: 'ProgramAdminPageMessages.ProgramRoleAdminPane.programOwner', defaultMessage: '課程負責人' },
    instructor: { id: 'ProgramAdminPageMessages.ProgramRoleAdminPane.instructor', defaultMessage: '老師' },
    addInstructor: { id: 'ProgramAdminPageMessages.ProgramRoleAdminPane.addInstructor', defaultMessage: '新增講師' },
    add: { id: 'ProgramAdminPageMessages.ProgramRoleAdminPane.add', defaultMessage: '新增' },
    selectInstructor: {
      id: 'ProgramAdminPageMessages.ProgramRoleAdminPane.selectInstructor',
      defaultMessage: '選擇老師',
    },
  }),
  ProgramSharingCodeAdminForm: defineMessages({
    code: { id: 'ProgramAdminPageMessages.ProgramSharingCodeAdminForm.code', defaultMessage: '設定網址' },
    codeIsRequired: {
      id: 'ProgramAdminPageMessages.ProgramSharingCodeAdminForm.codeIsRequired',
      defaultMessage: '未填寫設定網址',
    },
    duplicatedCodesWarning: {
      id: 'ProgramAdminPageMessages.ProgramSharingCodeAdminForm.duplicatedCodesWarning',
      defaultMessage: '推廣網址不可重複',
    },
    note: { id: 'ProgramAdminPageMessages.ProgramSharingCodeAdminForm.note', defaultMessage: '用途備註' },
    copiedToClipboard: {
      id: 'ProgramAdminPageMessages.ProgramSharingCodeAdminForm.copiedToClipboard',
      defaultMessage: '已複製到剪貼簿',
    },
    copy: { id: 'ProgramAdminPageMessages.ProgramSharingCodeAdminForm.copy', defaultMessage: '複製' },
    addUrl: { id: 'ProgramAdminPageMessages.ProgramSharingCodeAdminForm.addUrl', defaultMessage: '新增網址' },
  }),
  ProgramStructureAdminBlock: defineMessages({
    createBlock: { id: 'ProgramAdminPageMessages.ProgramStructureAdminBlock.createBlock', defaultMessage: '新增區塊' },
  }),
  ProgramStructureAdminModal: defineMessages({
    sortProgram: { id: 'ProgramAdminPageMessages.ProgramStructureAdminBlock.sortProgram', defaultMessage: '課程排序' },
    contentSorting: {
      id: 'ProgramAdminPageMessages.ProgramStructureAdminBlock.contentSorting',
      defaultMessage: '內容排序',
    },
  }),
  ProgramAdditionalSettingsForm: defineMessages({
    expectedSections: {
      id: 'ProgramAdminPageMessages.ProgramAdditionalSettingsForm.expectedSections',
      defaultMessage: 'Expected sections',
    },
    completeRelease: {
      id: 'ProgramAdminPageMessages.ProgramAdditionalSettingsForm.completeRelease',
      defaultMessage: 'Complete release',
    },
    expectedStartDate: {
      id: 'ProgramAdminPageMessages.ProgramAdditionalSettingsForm.expectedStartDate',
      defaultMessage: 'Expected start date',
    },
    expectedDuration: {
      id: 'ProgramAdminPageMessages.ProgramAdditionalSettingsForm.expectedDuration',
      defaultMessage: 'Expected duration(min)',
    },
    bookSubTitle: {
      id: 'ProgramAdminPageMessages.ProgramAdditionalSettingsForm.bookSubTitle',
      defaultMessage: 'Book Sub Title',
    },
    bookInformation: {
      id: 'ProgramAdminPageMessages.ProgramAdditionalSettingsForm.bookInformation',
      defaultMessage: 'Book Information',
    },
    contentInformation: {
      id: 'ProgramAdminPageMessages.ProgramAdditionalSettingsForm.contentInformation',
      defaultMessage: 'Content Information',
    },
  }),
}

export default ProgramAdminPageMessages
