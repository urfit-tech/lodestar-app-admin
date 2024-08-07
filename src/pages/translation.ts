import { defineMessages } from 'react-intl'

const pageMessages = {
  '*': defineMessages({
    delete: { id: 'page.*.delete', defaultMessage: '刪除' },
    save: { id: 'page.*.save', defaultMessage: 'save' },
    cancel: { id: 'page.*.cancel', defaultMessage: 'cancel' },
    hasExpirationDate: { id: 'page.*.hasExpirationDate', defaultMessage: 'expiration date' },
    noExpirationDate: { id: 'page.*.noExpirationDate', defaultMessage: 'no expiration date' },
    basicSettings: { id: 'page.*.basicSettings', defaultMessage: 'basic settings' },
    preview: { id: 'page.*.preview', defaultMessage: 'preview' },
    year: { id: 'page.*.year', defaultMessage: 'year' },
    month: { id: 'page.*.month', defaultMessage: 'month' },
    week: { id: 'page.*.week', defaultMessage: 'week' },
    day: { id: 'page.*.day', defaultMessage: 'day' },
    hour: { id: 'page.*.hour', defaultMessage: 'hour' },
    title: { id: 'page.*.title', defaultMessage: 'title' },
    published: { id: 'page.*.published', defaultMessage: 'published' },
    unpublished: { id: 'page.*.unpublished', defaultMessage: 'unpublished' },
    coupons: { id: 'page.*.couponPlans', defaultMessage: 'coupons' },
    createCouponPlan: { id: 'page.*.createCouponPlan', defaultMessage: 'create coupon plan' },
    editCouponPlan: { id: 'page.*.editCouponPlan', defaultMessage: 'edit coupon plan' },
    notYet: { id: 'page.*.notYet', defaultMessage: 'Not Activated' },
    edit: { id: 'page.*.edit', defaultMessage: 'Edit' },
    showMore: {
      id: 'page.*.showMore',
      defaultMessage: 'Show More',
    },
    fetchDataError: {
      id: 'page.*.fetchDataError',
      defaultMessage: 'fetch data error',
    },
    program: { id: 'page.*.program', defaultMessage: 'program' },
    programPackage: { id: 'page.*.programPackage', defaultMessage: 'program package' },
    all: { id: 'page.*.all', defaultMessage: 'all' },
    selectedCategory: { id: 'page.*.selectedCategory', defaultMessage: 'specific category' },
    member: { id: 'page.*.member', defaultMessage: 'member' },
    date: { id: 'page.*.date', defaultMessage: 'date' },
    selectedMember: { id: 'page.*.selectedMember', defaultMessage: 'specific member' },
    property: { id: 'page.*.property', defaultMessage: 'custom field' },
    enrolledMember: {
      id: 'page.*.enrolledMember',
      defaultMessage: '擁有權益的會員',
    },
    chooseMember: { id: 'page.*.chooseMember', defaultMessage: 'choose member' },
    memberName: { id: 'page.*.memberName', defaultMessage: 'name' },
    memberEmail: { id: 'page.*.memberEmail', defaultMessage: 'Email' },
    programContentTitle: {
      id: 'page.*.programContentTitle',
      defaultMessage: 'content title',
    },
    programContentSectionTitle: {
      id: 'page.*.programContentSectionTitle',
      defaultMessage: 'content section title',
    },
    programTitle: { id: 'page.*.programTitle', defaultMessage: 'program title' },
    create: { id: 'page.*.create', defaultMessage: 'create' },
    available: { id: 'page.*.available', defaultMessage: 'available' },
    unavailable: { id: 'page.*.unavailable', defaultMessage: 'unavailable' },
    vouchers: { id: 'page.*.voucherPlans', defaultMessage: 'voucher' },
    createVoucherPlan: { id: 'page.*.createVoucherPlan', defaultMessage: 'create voucher plan' },
    eligibilityList: { id: 'page.*.eligibilityList', defaultMessage: 'eligibility list' },
    certificateSetting: { id: 'page.*.certificateSetting', defaultMessage: 'certificate setting' },
    venueManagement: { id: 'page.*.venueManagement', defaultMessage: '場地管理' },
    publishSettings: { id: 'page.*.publishSettings', defaultMessage: 'publish settings' },
    successfullySaved: { id: 'page.*.successfullySaved', defaultMessage: 'saved successfully' },
    deleteProductDanger: { id: 'page.*.deleteProductDanger', defaultMessage: '*已購買者在刪除後仍可觀看。' },
    search: { id: 'page.*.search', defaultMessage: '查詢' },
    reset: { id: 'page.*.reset', defaultMessage: '重置' },
    import: { id: 'page.*.import', defaultMessage: '匯入' },
    certificateNumber: { id: 'page.*.certificateNumber', defaultMessage: '證書編號' },
    deliveryDate: { id: 'page.*.deliveryDate', defaultMessage: '發送日' },
    expiryDate: { id: 'page.*.expiryDate', defaultMessage: '到期日' },
    upload: { id: 'page.*.upload', defaultMessage: '上傳' },
    discontinued: { id: 'page.*.discontinued', defaultMessage: '已下架' },
    materialName: { id: 'page.*.materialName', defaultMessage: '教材檔名' },
    downloadedAt: { id: 'page.*.downloadedAt', defaultMessage: '初次下載時間' },
    programCategories: { id: 'page.*.programCategories', defaultMessage: '課程分類' },
    programContentType: {
      id: 'page.*.programContentType',
      defaultMessage: '單元類型',
    },
    view: { id: 'page.*.view', defaultMessage: '查看' },
    allMembers: { id: 'page.*.allMembers', defaultMessage: '全部會員' },
    totalSales: { id: 'page.*.totalSales', defaultMessage: '銷售總額' },
    dollar: { id: 'page.*.dollar', defaultMessage: '元' },
  }),
  ProjectAdminPage: defineMessages({
    settings: { id: 'page.ProjectAdminPage.settings', defaultMessage: '專案設定' },
    projectIntroduction: { id: 'project.ProjectAdminPage.projectIntroduction', defaultMessage: '專案介紹' },
    portfolioContent: { id: 'project.ProjectAdminPage.portfolioContent', defaultMessage: 'Portfolio content' },
    portfolioSettings: { id: 'project.ProjectAdminPage.portfolioSettings', defaultMessage: 'Portfolio settings' },
    portfolioDescription: {
      id: 'project.ProjectAdminPage.portfolioDescription',
      defaultMessage: 'Portfolio description',
    },
    portfolioDescriptionNotice: {
      id: 'project.ProjectAdminPage.portfolioDescriptionNotice',
      defaultMessage:
        'In order to protect the intellectual property rights of creators, it is recommended to indicate the production team of the work, the owner of the copyright of the work, customers, and agents in this field.',
    },
    portfolioAuthorNotice: {
      id: 'project.ProjectAdminPage.portfolioAuthorNotice',
      defaultMessage:
        'Please set the producer (production company/individual creator) of this work. If you cannot find the account of the producer, it is recommended to fill in your own account first.',
    },
    portfolioManagement: { id: 'project.ProjectAdminPage.portfolioManagement', defaultMessage: 'Portfolio management' },
    publishSettings: { id: 'project.ProjectAdminPage.publishSettings', defaultMessage: 'Publish settings' },
    deletePortfolio: { id: 'project.ProjectAdminPage.deletePortfolio', defaultMessage: 'Delete portfolio' },
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
  ProjectPortfolioPage: defineMessages({
    projectTitle: { id: 'page.ProjectPortfolioPage.projectTitle', defaultMessage: 'Title' },
    untitledPortfolio: { id: 'page.ProjectPortfolioPage.untitledPortfolio', defaultMessage: 'Untitled Portfolio' },
    createPortfolio: { id: 'page.ProjectPortfolioPage.createPortfolio', defaultMessage: 'Create portfolio' },
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
    chooseProperty: { id: 'page.ProgramProcessBlock.chooseProperty', defaultMessage: '選擇欄位' },
    containKeyword: { id: 'page.ProgramProcessBlock.containKeyword', defaultMessage: '關鍵字包含' },
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
    exportMaterialAuditLog: {
      id: 'page.ProgramProcessBlock.exportMaterialAuditLog',
      defaultMessage: '匯出教材下載紀錄',
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
  VoucherPlanCollectionAdminPage: defineMessages({
    searchPlaceholder: {
      id: 'page.VoucherPlanCollectionAdminPage.searchPlaceholder',
      defaultMessage: '搜尋兌換代碼或兌換券名稱',
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
  CouponPlanCollectionAdminPage: defineMessages({
    searchPlaceholder: {
      id: 'page.CouponPlanCollectionAdminPage.searchPlaceholder',
      defaultMessage: '搜尋折扣代碼或折價券名稱',
    },
  }),
  CouponCollectionBlock: defineMessages({
    showMore: { id: 'page.CouponCollectionBlock.showMore', defaultMessage: '顯示更多' },
    emptyCouponPlan: {
      id: 'page.CouponCollectionBlock.emptyCouponPlan',
      defaultMessage: '無任何折價方案',
    },
  }),
  QuestionLibraryCollectionPage: defineMessages({
    questionLibraryCollection: {
      id: 'page.QuestionLibraryCollectionPage.questionLibraryCollection',
      defaultMessage: '題庫管理',
    },
    deleteQuestionLibraryMessage: {
      id: 'page.QuestionLibraryCollectionPage.deleteQuestionLibraryMessage',
      defaultMessage: '確定刪除此題庫？',
    },
  }),
  QuestionGroupCollectionPage: defineMessages({
    questionGroupCollection: {
      id: 'page.QuestionGroupCollectionPage.questionGroupCollection',
      defaultMessage: '題組管理',
    },
    deleteQuestionGroupMessage: {
      id: 'page.QuestionGroupCollectionPage.deleteQuestionGroupMessage',
      defaultMessage: '確定刪除此題組？',
    },
  }),
  QuestionLibraryAdminPage: defineMessages({
    questionGroupManagement: {
      id: 'page.QuestionLibraryAdminPage.questionGroupManagement',
      defaultMessage: '題庫管理',
    },
    questionLibrarySettings: {
      id: 'page.QuestionLibraryAdminPage.questionLibrarySettings',
      defaultMessage: '題庫設定',
    },
    noMemberId: { id: 'page.QuestionLibraryAdminPage.noMemberId', defaultMessage: '無使用者ID' },
    deleteQuestionGroupMessage: {
      id: 'page.QuestionLibraryAdminPage.deleteQuestionGroupMessage',
      defaultMessage: '確定刪除此題組？',
    },
  }),
  QuestionLibraryBasicForm: defineMessages({
    title: { id: 'page.QuestionLibraryBasicForm.questionGroupManagement', defaultMessage: '題庫管理' },
  }),
  QuestionGroupAdminPage: defineMessages({
    question: { id: 'page.QuestionGroupAdminPage.question', defaultMessage: '題目' },
    questionTextDescription: {
      id: 'page.QuestionGroupAdminPage.questionTextDescription',
      defaultMessage: '題目文字描述',
    },
    option: { id: 'page.QuestionGroupAdminPage.option', defaultMessage: '選項' },
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
    preview: { id: 'page.CertificateAdminPage.preview', defaultMessage: '預覽' },
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
  CertificatePreviewModal: defineMessages({
    demoName: { id: 'page.CertificatePreviewModal.demoName', defaultMessage: '王大明' },
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
    deleteMemberCertificateWarning: {
      id: 'page.CertificateEligibilityListBlock.deleteMemberCertificateWarning',
      defaultMessage: '你確定要刪除此會員的證書？此動作無法還原',
    },
  }),
  VenueCollectionPage: defineMessages({
    createVenue: { id: 'page.VenueCollectionPage.createVenue', defaultMessage: '新增場地' },
    cols: { id: 'page.VenueCollectionPage.cols', defaultMessage: '總列數' },
    rows: { id: 'page.VenueCollectionPage.rows', defaultMessage: '總行數' },
    seats: { id: 'page.VenueCollectionPage.seats', defaultMessage: '座位數' },
  }),
  VenueAdminPage: defineMessages({
    seatSettings: { id: 'page.VenueAdminPage.seatSettings', defaultMessage: '座位設定' },
    usage: { id: 'page.VenueAdminPage.usage', defaultMessage: '使用情況' },
  }),
  VenueBasicForm: defineMessages({
    venueName: { id: 'page.VenueBasicForm.venueName', defaultMessage: '場地名稱' },
  }),
  VenueSeatSetting: defineMessages({
    rows: { id: 'page.VenueSeatSetting.rows', defaultMessage: '橫的行數' },
    cols: { id: 'page.VenueSeatSetting.cols', defaultMessage: '直的列數' },
    row: { id: 'page.VenueSeatSetting.row', defaultMessage: '橫列' },
    col: { id: 'page.VenueSeatSetting.col', defaultMessage: '直欄' },
    high: { id: 'page.VenueSeatSetting.high', defaultMessage: '高起來' },
    highWord: { id: 'page.VenueSeatSetting.highWord', defaultMessage: '高' },
    walkway: { id: 'page.VenueSeatSetting.walkway', defaultMessage: '走道' },
    blackboardPosition: { id: 'page.VenueSeatSetting.blackboardPosition', defaultMessage: '黑板位置' },
  }),
  VoucherCategoryPage: defineMessages({
    voucherCategory: { id: 'page.VoucherCategoryPage.voucherCategory', defaultMessage: 'Voucher Category' },
  }),
  DuplicatePhoneBlock: defineMessages({
    duplicatedPhoneMemberExist: {
      id: 'page.DuplicatePhoneBlock.duplicatedPhoneMemberExist',
      defaultMessage: '系統存在重複手機的會員',
    },
    duplicatedPhoneMember: {
      id: 'page.DuplicatePhoneBlock.duplicatedPhoneMember',
      defaultMessage: '重複手機的會員',
    },
  }),
  PermissionGroupsDropDownSelector: {
    permissionGroupsSelectorPlaceholder: {
      id: 'page.PermissionGroupsDropDownSelector.permissionGroupsSelectorPlaceholder',
      defaultMessage: '選擇權限組',
    },
  },
  DeactivatePage: defineMessages({
    contactExpiredAndUsageExceeded: {
      id: 'page.DeactivatePage.contactExpiredAndUsageExceeded',
      defaultMessage: '方案已到期且超出用量',
    },
    contactExpiredAndUsageExceededDescription1: {
      id: 'page.DeactivatePage.contactExpiredAndUsageExceededDescription1',
      defaultMessage: '因您尚未進行續約且影片儲存/流量使用量，',
    },
    contactExpiredAndUsageExceededDescription2: {
      id: 'page.DeactivatePage.contactExpiredAndUsageExceededDescription2',
      defaultMessage: '已超過您的方案上限。',
    },
    contactExpiredAndUsageExceededDescription3: {
      id: 'page.DeactivatePage.contactExpiredAndUsageExceededDescription3',
      defaultMessage: '請聯繫 KOLABLE 官方 us@urfit.com.tw，',
    },
    contactExpiredAndUsageExceededDescription4: {
      id: 'page.DeactivatePage.contactExpiredAndUsageExceededDescription4',
      defaultMessage: '洽談續約事宜，逾期將全數刪除站點資料。',
    },
    pleaseUpdatePlan: { id: 'page.DeactivatePage.pleaseUpdatePlan', defaultMessage: '請升級方案' },
    usageExceededAndPleaseUpdatePlan: {
      id: 'page.DeactivatePage.usageExceededAndPleaseUpdatePlan',
      defaultMessage: '超出用量請升級方案',
    },
    usageExceededAndPleaseUpdatePlanDescription1: {
      id: 'page.DeactivatePage.usageExceededAndPleaseUpdatePlanDescription1',
      defaultMessage: '您的影片儲存/流量使用量已超過您的方案上限。',
    },
    usageExceededAndPleaseUpdatePlanDescription2: {
      id: 'page.DeactivatePage.usageExceededAndPleaseUpdatePlanDescription2',
      defaultMessage: '請聯繫 KOLABLE 官方 us@urfit.com.tw，',
    },
    usageExceededAndPleaseUpdatePlanDescription3: {
      id: 'page.DeactivatePage.usageExceededAndPleaseUpdatePlanDescription3',
      defaultMessage: '洽談方案升級。',
    },
    planHadExpired: { id: 'page.DeactivatePage.planHadExpired', defaultMessage: '方案已到期' },
    planHadExpiredDescription1: {
      id: 'page.DeactivatePage.planHadExpiredDescription1',
      defaultMessage: '因您尚未進行續約，網站後台已關閉。',
    },
    planHadExpiredDescription2: {
      id: 'page.DeactivatePage.planHadExpiredDescription2',
      defaultMessage: '請您儘速聯繫 KOLABLE 官方 us@urfit.com.tw，',
    },
    planHadExpiredDescription3: {
      id: 'page.DeactivatePage.planHadExpiredDescription3',
      defaultMessage: '洽談續約事宜。',
    },
  }),
  SalesPage: defineMessages({
    salesAdmin: { id: 'page.SalesPage.salesAdmin', defaultMessage: '銷售管理' },
    import: { id: 'page.SalesPage.import', defaultMessage: '匯入資料' },
    export: { id: 'page.SalesPage.export', defaultMessage: '匯出資料' },
  }),
  MediaLibraryPage: defineMessages({
    maxVideoDuration: { id: 'page.MediaLibraryPage.maxVideoDuration', defaultMessage: '影片儲存' },
    maxVideoWatch: { id: 'page.MediaLibraryPage.maxVideoWatch', defaultMessage: '影片流量' },
    maxVideoDurationUnit: { id: 'page.MediaLibraryPage.maxVideoDurationUnit', defaultMessage: '分鐘' },
    maxVideoWatchUnit: { id: 'page.MediaLibraryPage.maxVideoWatchUnit', defaultMessage: '分鐘' },
  }),
  AppTmpPasswordPage: defineMessages({
    temporaryPasswordRequest: {
      id: 'page.AppTmpPasswordPage.temporaryPasswordRequest',
      defaultMessage: 'Temporary password request',
    },
    requestTemporaryPassword: {
      id: 'page.AppTmpPasswordPage.requestTemporaryPassword',
      defaultMessage: 'Request temporary password',
    },
    applicant: {
      id: 'page.AppTmpPasswordPage.applicant',
      defaultMessage: 'Applicant',
    },
    userEmail: {
      id: 'page.AppTmpPasswordPage.userEmail',
      defaultMessage: 'User email',
    },
    purposeOfApplication: {
      id: 'page.AppTmpPasswordPage.purposeOfApplication',
      defaultMessage: 'Purpose of application',
    },
    tmpPassword: {
      id: 'page.AppTmpPasswordPage.tmpPassword',
      defaultMessage: 'Temporary password',
    },
    expirationDate: {
      id: 'page.AppTmpPasswordPage.expirationDate',
      defaultMessage: 'Expiration Date',
    },
    invalidEmail: {
      id: 'page.AppTmpPasswordPage.invalidEmail',
      defaultMessage: 'Invalid email',
    },
  }),
  ReportCollectionPage: defineMessages({
    pageTitle: { id: 'page.ReportCollectionPage.pageTitle', defaultMessage: '報表分析' },
    addReport: { id: 'page.ReportCollectionPage.addReport', defaultMessage: '新增報表' },
    title: { id: 'page.ReportCollectionPage.title', defaultMessage: '報表名稱' },
    type: { id: 'page.ReportCollectionPage.type', defaultMessage: '報表種類' },
    options: { id: 'page.ReportCollectionPage.options', defaultMessage: '報表設定' },
    viewingPermission: { id: 'page.ReportCollectionPage.viewingPermission', defaultMessage: '觀看權限' },
  }),
  // CraftPageAdminPage
  CraftPageBuilderController: defineMessages({
    desktop: { id: 'page.CraftPageBuilderController.desktop', defaultMessage: 'desktop' },
    tablet: { id: 'page.CraftPageBuilderController.tablet', defaultMessage: 'tablet' },
    mobile: { id: 'page.CraftPageBuilderController.mobile', defaultMessage: 'mobile' },
  }),
  AnnouncementCollectionPage: defineMessages({
    pageTitle: { id: 'page.AnnouncementCollectionPage.pageTitle', defaultMessage: 'Announcement Management' },
    title: { id: 'page.AnnouncementCollectionPage.title', defaultMessage: 'announcement title' },
    addAnnouncement: { id: 'page.AnnouncementCollectionPage.addAnnouncement', defaultMessage: 'Add Announcement' },
    addFailed: { id: 'page.AnnouncementCollectionPage.addFailed', defaultMessage: 'Add Failed' },
    createdTime: { id: 'page.AnnouncementCollectionPage.createdTime', defaultMessage: 'Created Time' },
    periodOfAnnouncement: {
      id: 'page.AnnouncementCollectionPage.periodOfAnnouncement',
      defaultMessage: 'Period of announcement',
    },
    fromNowOn: {
      id: 'page.AnnouncementCollectionPage.fromNowOn',
      defaultMessage: 'From now on',
    },
    unlimitedDate: {
      id: 'page.AnnouncementCollectionPage.unlimitedDate',
      defaultMessage: 'Unlimited Date',
    },
    draftTab: {
      id: 'page.AnnouncementCollectionPage.draftTab',
      defaultMessage: 'draft'
    },
    publishedTab: {
      id: 'page.AnnouncementCollectionPage.publishedTab',
      defaultMessage: 'published'
    }
  }),
  AnnouncementPage: defineMessages({
    announcementSettings: {
      id: 'page.AnnouncementCollectionPage.announcementSettings',
      defaultMessage: 'Announcement Settings',
    },
    readRecords: {
      id: 'page.AnnouncementCollectionPage.readRecords',
      defaultMessage: 'Read Records',
    },
    basicSettings: {
      id: 'page.AnnouncementCollectionPage.basicSettings',
      defaultMessage: 'Basic Settings',
    },
    successfullySaved: {
      id: 'page.AnnouncementCollectionPage.successfullySaved',
      defaultMessage: 'Successfully saved',
    },
    publishSettings: {
      id: 'page.AnnouncementCollectionPage.publishSettings',
      defaultMessage: 'Public Settings',
    },
    displaySettings: {
      id: 'page.AnnouncementCollectionPage.displaySettings',
      defaultMessage: 'Display Settings',
    },
  }),
}

export default pageMessages
