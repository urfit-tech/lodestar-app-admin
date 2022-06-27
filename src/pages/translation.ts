import { defineMessages } from 'react-intl'

const pageMessages = {
  '*': defineMessages({
    save: { id: 'page.*.save', defaultMessage: '儲存' },
    cancel: { id: 'page.*.cancel', defaultMessage: '取消' },
    hasExpirationDate: { id: 'page.*.hasExpirationDate', defaultMessage: '有效期' },
    noExpirationDate: { id: 'page.*.noExpirationDate', defaultMessage: '無效期' },
    basicSettings: { id: 'page.*.basicSettings', defaultMessage: '基本設定' },
    preview: { id: 'page.*.preview', defaultMessage: '預覽' },
    year: { id: 'page.*.year', defaultMessage: '年' },
    month: { id: 'page.*.year', defaultMessage: '月' },
    week: { id: 'page.*.week', defaultMessage: '週' },
    day: { id: 'page.*.year', defaultMessage: '日' },
    hour: { id: 'page.*.year', defaultMessage: '小時' },
    title: { id: 'page.*.title', defaultMessage: '名稱' },
    published: { id: 'page.*.published', defaultMessage: '已發佈' },
    unpublished: { id: 'page.*.unpublished', defaultMessage: '尚未發佈' },
    coupons: { id: 'page.*.couponPlans', defaultMessage: '折價方案' },
    createCouponPlan: { id: 'page.*.createCouponPlan', defaultMessage: '建立折價方案' },
    editCouponPlan: { id: 'page.*.editCouponPlan', defaultMessage: '編輯折價方案' },
    notYet: { id: 'page.*.notYet', defaultMessage: '未啟用' },
    edit: { id: 'page.*.edit', defaultMessage: '編輯' },
    showMore: {
      id: 'page.*.showMore',
      defaultMessage: '顯示更多',
    },
    fetchDataError: {
      id: 'page.*.fetchDataError',
      defaultMessage: '讀取錯誤',
    },
    program: { id: 'page.*.program', defaultMessage: '課程' },
    programPackage: { id: 'page.*.programPackage', defaultMessage: '課程組合' },
    all: { id: 'page.*.all', defaultMessage: '全部' },
    selectedCategory: { id: 'page.*.selectedCategory', defaultMessage: '指定分類' },
    member: { id: 'page.*.member', defaultMessage: '會員' },
    date: { id: 'page.*.date', defaultMessage: '日期' },
    selectedMember: { id: 'page.*.selectedMember', defaultMessage: '指定會員' },
    property: { id: 'page.*.property', defaultMessage: '自訂欄位' },
    enrolledMember: {
      id: 'page.*.enrolledMember',
      defaultMessage: '擁有權益的會員',
    },
    chooseMember: { id: 'page.*.chooseMember', defaultMessage: '選擇會員' },
    memberName: { id: 'page.*.memberName', defaultMessage: '姓名' },
    memberEmail: { id: 'page.*.memberEmail', defaultMessage: 'Email' },
    programContentTitle: {
      id: 'page.*.programContentTitle',
      defaultMessage: '單元名稱',
    },
    programContentSectionTitle: {
      id: 'page.*.programContentSectionTitle',
      defaultMessage: '章節名稱',
    },
    programTitle: { id: 'page.*.programTitle', defaultMessage: '課程名稱' },
    create: { id: 'page.*.create', defaultMessage: '建立' },
    available: { id: 'page.*.available', defaultMessage: '可使用' },
    unavailable: { id: 'page.*.unavailable', defaultMessage: '已失效' },
    vouchers: { id: 'page.*.voucherPlans', defaultMessage: '兌換方案' },
    createVoucherPlan: { id: 'page.*.createVoucherPlan', defaultMessage: '建立兌換方案' },
    eligibilityList: { id: 'page.*.eligibilityList', defaultMessage: '資格名單' },
    certificateSetting: { id: 'page.*.certificateSetting', defaultMessage: '證書設定' },
    publishSettings: { id: 'page.*.publishSettings', defaultMessage: '發佈設定' },
    successfullySaved: { id: 'page.*.successfullySaved', defaultMessage: '儲存成功' },
    deleteProductDanger: { id: 'page.*.deleteProductDanger', defaultMessage: '*已購買者在刪除後仍可觀看。' },
    search: { id: 'page.*.search', defaultMessage: '查詢' },
    reset: { id: 'page.*.reset', defaultMessage: '重置' },
    import: { id: 'page.*.import', defaultMessage: '匯入' },
    certificateNumber: { id: 'page.*.certificateNumber', defaultMessage: '證書編號' },
    deliveryDate: { id: 'page.*.deliveryDate', defaultMessage: '發送日' },
    expiryDate: { id: 'page.*.expiryDate', defaultMessage: '到期日' },
    upload: { id: 'page.*.upload', defaultMessage: '上傳' },
  }),
  ProjectAdminPage: defineMessages({
    settings: { id: 'page.ProjectAdminPage.settings', defaultMessage: '專案設定' },
    projectIntroduction: { id: 'project.ProjectAdminPage.projectIntroduction', defaultMessage: '專案介紹' },
  }),
  ProjectFundingPage: defineMessages({
    projectTitle: { id: 'page.ProjectFundingPage.projectTitle', defaultMessage: '專案名稱' },
    sponsor: { id: 'page.ProjectFundingPage.sponsor', defaultMessage: '發起者' },
    unnamedProject: { id: 'page.ProjectFundingPage.unnamedProject', defaultMessage: '未命名專案' },
  }),
  ProjectPreOrderPage: defineMessages({
    projectTitle: { id: 'page.ProjectPreOrderPage.projectTitle', defaultMessage: '專案名稱' },
    sponsor: { id: 'page.ProjectPreOrderPage.sponsor', defaultMessage: '發起者' },
    unnamedProject: { id: 'page.ProjectPreOrderPage.unnamedProject', defaultMessage: '未命名專案' },
  }),
  ProgramProgressCollectionAdminPage: defineMessages({
    programProgress: { id: 'page.ProgramProgressCollectionAdminPage.programProgress', defaultMessage: '學習進度' },
  }),
  ProgramProcessBlock: defineMessages({
    chooseProgramCategory: {
      id: 'page.ProgramProcessBlock.chooseProgramCategory',
      defaultMessage: '選擇課程分類',
    },
    chooseProgram: { id: 'page.ProgramProcessBlock.chooseProgram', defaultMessage: '選擇課程' },
    allPrograms: { id: 'page.ProgramProcessBlock.allPrograms', defaultMessage: '全部課程' },
    selectedProgram: { id: 'page.ProgramProcessBlock.selectedProgram', defaultMessage: '指定課程' },
    allMembers: { id: 'page.ProgramProcessBlock.allMembers', defaultMessage: '全部會員' },
    chooseProperty: { id: 'page.ProgramProcessBlock.chooseProperty', defaultMessage: '選擇欄位' },
    containKeyword: { id: 'page.ProgramProcessBlock.containKeyword', defaultMessage: '關鍵字包含' },
    categories: { id: 'page.ProgramProcessBlock.categories', defaultMessage: '課程分類' },
    programContentType: {
      id: 'page.ProgramProcessBlock.programContentType',
      defaultMessage: '單元類型',
    },
    programContentDuration: {
      id: 'page.ProgramProcessBlock.programContentDuration',
      defaultMessage: '單元時長(分)',
    },
    watchedDuration: { id: 'page.ProgramProcessBlock.watchedDuration', defaultMessage: '學習時間(分)' },
    watchedPercentage: {
      id: 'page.ProgramProcessBlock.watchedPercentage',
      defaultMessage: '學習進度',
    },
    firstWatchedAt: { id: 'page.ProgramProcessBlock.firstWatchedAt', defaultMessage: '初次觀看時間' },
    lastWatchedAt: { id: 'page.ProgramProcessBlock.lastWatchedAt', defaultMessage: '最後觀看時間' },
    totalPercentage: { id: 'page.ProgramProcessBlock.totalPercentage', defaultMessage: '總課程完成率' },
    exerciseStatus: { id: 'pageProgramProgressCollectionAdminPage.exerciseStatus', defaultMessage: '測驗狀態' },
    exercisePassed: { id: 'pageProgramProgressCollectionAdminPage.exercisePassed', defaultMessage: '通過' },
    exerciseFailed: { id: 'pageProgramProgressCollectionAdminPage.exerciseFailed', defaultMessage: '未通過' },
    exerciseScores: { id: 'page.ProgramProcessBlock.exerciseScores', defaultMessage: '測驗分數' },
    exercisePassedAt: {
      id: 'page.ProgramProcessBlock.exercisePassedAt',
      defaultMessage: '測驗通過時間',
    },
    practices: { id: 'page.ProgramProcessBlock.practices', defaultMessage: '作業' },
    learningDuration: { id: 'page.ProgramProcessBlock.learningDuration', defaultMessage: '學習時數' },
    learningProgress: { id: 'page.ProgramProcessBlock.learningProgress', defaultMessage: '學習進度' },
    exportProgramProgress: {
      id: 'page.ProgramProcessBlock.exportProgramProgress',
      defaultMessage: '匯出學習進度',
    },
    lastUpdatedAtText: {
      id: 'page.ProgramProcessBlock.lastUpdatedAtText',
      defaultMessage: '計算累計到此日期的進度',
    },
  }),
  AppointmentPeriodCollectionAdminPage: defineMessages({
    allInstructors: { id: 'page.AppointmentPeriodCollectionAdminPage.allInstructors', defaultMessage: '全部老師' },
    emptyAppointment: {
      id: 'page.AppointmentPeriodCollectionAdminPage.emptyAppointment',
      defaultMessage: '目前還沒有任何預約',
    },
    dateRangeWarning: {
      id: 'page.AppointmentPeriodCollectionAdminPage.dateRangeWarning',
      defaultMessage: '請選擇時間區間一個月以內',
    },
  }),
  ProgramPackageProcessBlock: defineMessages({
    selectedProgramPackage: {
      id: 'page.ProgramPackageProcessBlock.selectedProgramPackage',
      defaultMessage: '指定課程組合',
    },
    chooseProgramPackageCategory: {
      id: 'page.ProgramPackageProcessBlock.chooseProgramPackageCategory',
      defaultMessage: '選擇課程組合分類',
    },
    selectedPackageCategory: {
      id: 'page.ProgramPackageProcessBlock.selectedPackageCategory',
      defaultMessage: '指定組合分類',
    },
    allProgramPackage: {
      id: 'page.ProgramPackageProcessBlock.allProgramPackage',
      defaultMessage: '全部課程組合',
    },
    chooseProgramPackage: { id: 'page.ProgramPackageProcessBlock.chooseProgramPackage', defaultMessage: '選擇課程' },
    instructorName: {
      id: 'page.ProgramPackageProcessBlock.instructorName',
      defaultMessage: '講師名稱',
    },
    minutes: {
      id: 'page.ProgramPackageProcessBlock.minutes',
      defaultMessage: '分鐘數',
    },
    programPackageTitle: {
      id: 'page.ProgramPackageProcessBlock.programPackageTitle',
      defaultMessage: '課程組合名稱',
    },
    programPackageCategories: {
      id: 'page.ProgramPackageProcessBlock.programPackageCategories',
      defaultMessage: '課程組合分類',
    },
    rangePickText: {
      id: 'page.ProgramPackageProcessBlock.rangePickText',
      defaultMessage: '計算此日期區間的學習狀況',
    },
  }),
  VoucherPlanCollectionBlock: defineMessages({
    edit: { id: 'page.VoucherPlanCollectionBlock.edit', defaultMessage: '編輯' },
    fetchDataError: {
      id: 'page.VoucherPlanCollectionBlock.fetchDataError',
      defaultMessage: '讀取錯誤',
    },
    showMore: { id: 'page.VoucherPlanCollectionBlock.showMore', defaultMessage: '顯示更多' },
    editVoucherPlan: {
      id: 'page.VoucherPlanCollectionBlock.ditVoucherPlan',
      defaultMessage: '編輯兌換方案',
    },
    emptyVoucherPlan: {
      id: 'page.VoucherPlanCollectionBlock.emptyVoucherPlan',
      defaultMessage: '無任何兌換方案',
    },
  }),
  CouponCollectionBlock: defineMessages({
    showMore: { id: 'page.CouponCollectionBlock.showMore', defaultMessage: '顯示更多' },
    emptyCouponPlan: {
      id: 'page.CouponCollectionBlock.emptyCouponPlan',
      defaultMessage: '無任何折價方案',
    },
  }),
  CertificateCollectionPage: defineMessages({
    createCertificate: { id: 'page.CertificateCollectionPage.createCertificate', defaultMessage: '新增證書' },
  }),
  CertificateAdminPage: defineMessages({
    certificateIntro: { id: 'page.CertificateAdminPage.certificateIntro', defaultMessage: '證書介紹' },
    deleteCertificateDangerText: {
      id: 'page.CertificateAdminPage.deleteCertificateDangerText',
      defaultMessage: '*已收到證書在刪除後仍可觀看。',
    },
  }),
  CertificateBasicForm: defineMessages({
    certificateTitle: { id: 'page.CertificateBasicForm.certificateTitle', defaultMessage: '證書名稱' },
    certificateTemplate: { id: 'page.CertificateBasicForm.CertificateCollectionTable', defaultMessage: '證書樣板' },
    qualification: { id: 'page.CertificateBasicForm.qualification', defaultMessage: '學習時數' },
    expirationDate: { id: 'page.CertificateBasicForm.expirationDate', defaultMessage: '證書效期' },
    certificateTemplateIsRequired: {
      id: 'page.CertificateBasicForm.certificateTemplateIsRequired',
      defaultMessage: 'Please select a template.',
    },
  }),
  CertificateSelector: defineMessages({
    selectTemplate: { id: 'page.CertificateSelector.selectTemplate', defaultMessage: 'select template' },
  }),
  CertificateIntroForm: defineMessages({
    certificateDescription: { id: 'page.CertificateIntroForm.certificateDescription', defaultMessage: '證書描述' },
  }),
  CertificatePublishAdminBlock: defineMessages({
    noCertificateTitle: {
      id: 'page.CertificatePublishAdminBlock.noCertificateTitle',
      defaultMessage: '尚未填寫證書名稱',
    },
    noCertificateTemplate: {
      id: 'page.CertificatePublishAdminBlock.noCertificateTemplate',
      defaultMessage: '尚未選擇證書樣板',
    },
    unPublishedCertificateText: {
      id: 'page.CertificatePublishAdminBlock.unPublishedCertificateText',
      defaultMessage: '你的證書未發佈，此證書並不會顯示在前台。',
    },
    publishedCertificateText: {
      id: 'page.CertificatePublishAdminBlock.publishedCertificateText',
      defaultMessage: '現在你的證書已公開發佈，此證書可公開挑戰。',
    },
  }),
  CertificateEligibilityListBlock: defineMessages({
    permanent: { id: 'page.CertificateEligibilityListBlock.Permanent', defaultMessage: '永久有效' },
    revoke: { id: 'page.CertificateEligibilityListBlock.revoke', defaultMessage: '撤銷' },
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
