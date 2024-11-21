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
  MemberAdminPage: defineMessages({
    notEnoughCoins: { id: 'page.MemberAdminPage.notEnoughCoins', defaultMessage: 'Coins are not enough!' },
    notEnoughCoinsDescription: {
      id: 'page.MemberAdminPage.notEnoughCoinsDescription',
      defaultMessage: 'Needs {futureCoins} coins. You need {insufficientCoins} coins more.',
    },
    remainingCoins: {
      id: 'page.MemberAdminPage.remainingCoins',
      defaultMessage: 'Still have {remainingCoins} coins.',
    },
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
    temPasswordFailed: {
      id: 'page.AppTmpPasswordPage.temPasswordFailed',
      defaultMessage: '臨時密碼申請錯誤，請確認使用者信箱或權限！',
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
  ReportPage: defineMessages({
    reportHeight: { id: 'page.ReportPage.reportHeight', defaultMessage: '報表高度' },
  }),
  VenueUsageCalendar: defineMessages({
    floor11RoomB01: { id: 'page.VenueUsageCalendar.floor11RoomB01', defaultMessage: '11樓B01' },
    floor11RoomB02: { id: 'page.VenueUsageCalendar.floor11RoomB02', defaultMessage: '11樓B02' },
    floor11RoomB03: { id: 'page.VenueUsageCalendar.floor11RoomB03', defaultMessage: '11樓B03' },
    floor12RoomB01: { id: 'page.VenueUsageCalendar.floor12RoomB01', defaultMessage: '12樓B01' },
    highThreeChineseCamp: { id: 'page.VenueUsageCalendar.highThreeChineseCamp', defaultMessage: '高三國文集中營' },
    highOneMathTrainingClass: {
      id: 'page.VenueUsageCalendar.highOneMathTrainingClass',
      defaultMessage: '高一數學特訓班',
    },
    highTwoEnglishTestClass: {
      id: 'page.VenueUsageCalendar.highTwoEnglishTestClass',
      defaultMessage: '高二英文職考班',
    },
    highFourPhysicsChemLab: {
      id: 'page.VenueUsageCalendar.highFourPhysicsChemLab',
      defaultMessage: '高四理化實驗中心',
    },
    eventStartAlert: {
      id: 'page.VenueUsageCalendar.eventStartAlert',
      defaultMessage: '{eventTitle}於{startTime}開始!',
    },
  }),
  TermsPage: defineMessages({
    termsOfUse: { id: 'page.TermsPage.termsOfUse', defaultMessage: '使用條款' },
    privacyPolicy: { id: 'page.TermsPage.privacyPolicy', defaultMessage: '隱私權條款' },
    privacyScope: { id: 'page.TermsPage.privacyScope', defaultMessage: '隱私權保護政策的適用範圍' },
    privacyScopeContent: {
      id: 'page.TermsPage.privacyScopeContent',
      defaultMessage:
        '隱私權保護政策內容，包括本網站如何處理在您使用網站服務時收集到的個人識別資料。隱私權保護政策不適用於本網站以外的相關連結網站，也不適用於非本網站所委託或參與管理的人員。',
    },
    personalDataCollection: {
      id: 'page.TermsPage.personalDataCollection',
      defaultMessage: '個人資料的蒐集、處理及利用方式',
    },
    personalDataCollectionContent1: {
      id: 'page.TermsPage.personalDataCollectionContent1',
      defaultMessage:
        '當您造訪本網站或使用本網站所提供之功能服務時，我們將視該服務功能性質，請您提供必要的個人資料，並在該特定目的範圍內處理及利用您的個人資料；非經您書面同意，本網站不會將個人資料用於其他用途。',
    },
    personalDataCollectionContent2: {
      id: 'page.TermsPage.personalDataCollectionContent2',
      defaultMessage:
        '於一般瀏覽時，伺服器會自行記錄相關行徑，包括您使用連線設備的IP位址、使用時間、使用的瀏覽器、瀏覽及點選資料記錄等，做為我們增進網站服務的參考依據，此記錄為內部應用，決不對外公佈。',
    },
    externalLinks: { id: 'page.TermsPage.externalLinks', defaultMessage: '網站對外的相關連結' },
    externalLinksContent: {
      id: 'page.TermsPage.externalLinksContent',
      defaultMessage:
        '本網站的網頁提供其他網站的網路連結，您也可經由本網站所提供的連結，點選進入其他網站。但該連結網站不適用本網站的隱私權保護政策，您必須參考該連結網站中的隱私權保護政策。',
    },
    thirdPartyPolicy: { id: 'page.TermsPage.thirdPartyPolicy', defaultMessage: '與第三人共用個人資料之政策' },
    thirdPartyPolicyContent1: {
      id: 'page.TermsPage.thirdPartyPolicyContent1',
      defaultMessage:
        '本網站絕不會提供、交換、出租或出售任何您的個人資料給其他個人、團體、私人企業或公務機關，但有法律依據或合約義務者，不在此限。',
    },
    thirdPartyPolicyContent2: {
      id: 'page.TermsPage.thirdPartyPolicyContent2',
      defaultMessage:
        '{name} 如舉辦任何回饋活動，你所提供給主辦單位的得獎連絡資料，也僅供此活動使用。{name} 不會將活動資料直接交付或售予第三方。如果 {name} 與第三方服務合作，亦應依法要求該第三方遵守 {name} 的會員網站使用對應的約定及隱私權政策，{name} 將會盡全力保障所有會員個人資料的安全性。',
    },
    cookieUsage: { id: 'page.TermsPage.cookieUsage', defaultMessage: 'COOKIE之使用' },
    cookieUsageContent: {
      id: 'page.TermsPage.cookieUsageContent',
      defaultMessage:
        '為了提供您最佳的服務，本網站會在您的電腦中放置並取用我們的Cookie，若您不願接受Cookie的寫入，您可在您使用的瀏覽器功能項中設定隱私權等級為高，即可拒絕Cookie的寫入，但可能會導至網站某些功能無法正常執行。',
    },
    termsOfService: { id: 'page.TermsPage.termsOfService', defaultMessage: '使用者條款' },
    agreementTerms: { id: 'page.TermsPage.agreementTerms', defaultMessage: '同意條款' },
    agreementTermsContent: {
      id: 'page.TermsPage.agreementTermsContent',
      defaultMessage:
        '非常歡迎您使用 {name}（以下簡稱本服務），為了讓您能夠安心使用本網站的各項服務與資訊，特此向您說明本網站的隱私權保護政策，以保障您的權益，應詳細閱讀本條款所有內容。當您使用本服務時，即表示您已閱讀、了解並同意本條款所有內容。此外，因 {name} 提供多種服務，某些服務可能因其特殊之性質而有附加條款，當您開始使用該服務即視為您同意該附加條款或相關規定亦屬本條款之一部份。{name} 有權於任何時間修改或變更本條款內容，建議您隨時注意該修改或變更。當您於任何修改或變更後繼續使用本服務，視為您已閱讀、了解並同意接受該修改或變更內容。如果使⽤者不同意 {name} 對本條款進⾏的修改，請離開 {name} 網站並⽴即停⽌使⽤ {name} 服務。同時，會員應刪除個⼈檔案並註銷會員資格，{name} 亦有權刪除會員個⼈檔案並註銷會員資格。請您詳閱下列內容：',
    },
    registrationObligations: {
      id: 'page.TermsPage.registrationObligations',
      defaultMessage: '註冊義務、帳號密碼及資料保密',
    },
    registrationObligationsContent1: {
      id: 'page.TermsPage.registrationObligationsContent1',
      defaultMessage: '用戶登錄資料須提供使用者本人正確、最新及完整的資料。',
    },
    registrationObligationsContent2: {
      id: 'page.TermsPage.registrationObligationsContent2',
      defaultMessage:
        '用戶登錄資料不得有偽造、不實、冒用等之情事(ex如個人資料及信用卡資料)，一經發現本公司可拒絕其加入用戶資格之權利。並得以暫停或終止其用戶資格，若違反中華民國相關法律，亦將依法追究。',
    },
    registrationObligationsContent3: {
      id: 'page.TermsPage.registrationObligationsContent3',
      defaultMessage:
        '用戶應妥善保管密碼，不可將密碼洩露或提供給他人知道或使用；以同一個用戶身分證字號和密碼使用本服務所進行的所有行為，都將被認為是該用戶本人和密碼持有人的行為。',
    },
    registrationObligationsContent4: {
      id: 'page.TermsPage.registrationObligationsContent4',
      defaultMessage:
        '若使⽤者本人未滿七歲，要由使⽤者的⽗⺟或法定監護⼈申請加⼊會員。若使⽤者已滿七歲未滿⼆⼗歲，則必須在申請加⼊會員之前，請⽗⺟或法定監護⼈閱讀本條款，並得到⽗⺟或監護⼈同意後，才可以申請、註冊及使⽤本網站所提供的服務；當使⽤者滿⼆⼗歲之前使⽤本網站服務，則必須向本公司擔保已取得⽗⺟或監護⼈的同意。',
    },
    termsAndRegulations: { id: 'page.TermsPage.termsAndRegulations', defaultMessage: '使用規定和條約' },
    termsAndRegulationsContent: {
      id: 'page.TermsPage.termsAndRegulationsContent',
      defaultMessage:
        '不論註冊與否，會員及一般使用者在使用本公司所提供之服務時，您應遵守相關法律，並同意不得利用本服務從事侵害他人權利或違法行為，此行為包含但不限於：',
    },
    prohibitedAction1: {
      id: 'page.TermsPage.prohibitedAction1',
      defaultMessage:
        '上載、張貼、公布或傳送任何誹謗、侮辱、具威脅性、攻擊性、不雅、猥褻、不實、違反公共秩序或善良風俗或其他不法之文字、圖片或任何形式的檔案。',
    },
    prohibitedAction2: {
      id: 'page.TermsPage.prohibitedAction2',
      defaultMessage: '侵害他人名譽、隱私權、營業秘密、商標權、著作權、專利權、其他智慧財產權及其他權利。',
    },
    prohibitedAction3: {
      id: 'page.TermsPage.prohibitedAction3',
      defaultMessage: '違反法律、契約或協議所應負之保密義務。',
    },
    prohibitedAction4: {
      id: 'page.TermsPage.prohibitedAction4',
      defaultMessage: '企圖入侵本公司伺服器、資料庫、破解本公司安全機制或其他危害本公司服務提供安全性或穩定性之行為。',
    },
    prohibitedAction5: {
      id: 'page.TermsPage.prohibitedAction5',
      defaultMessage: '從事不法交易行為或張貼虛假不實、引人犯罪之訊息。',
    },
    prohibitedAction6: {
      id: 'page.TermsPage.prohibitedAction6',
      defaultMessage:
        '未經本公司明確授權同意並具書面授權同意證明，不得利用本服務或本網站所提供其他資源，包括但不限於圖文、影音資料庫、編寫製作網頁之軟體等，從事任何商業交易行為，或招攬廣告商或贊助人。',
    },
    prohibitedAction7: {
      id: 'page.TermsPage.prohibitedAction7',
      defaultMessage: '販賣槍枝、毒品、盜版軟體或其他違禁物。',
    },
    prohibitedAction8: {
      id: 'page.TermsPage.prohibitedAction8',
      defaultMessage: '提供賭博資訊或以任何方式引誘他人參與賭博。',
    },
    prohibitedAction9: {
      id: 'page.TermsPage.prohibitedAction9',
      defaultMessage: '濫發廣告訊息、垃圾訊息、連鎖信、違法之多層次傳銷訊息等。',
    },
    prohibitedAction10: {
      id: 'page.TermsPage.prohibitedAction10',
      defaultMessage: '其他 {name} 有正當理由認為不適當之行為。',
    },
    serviceTermination: { id: 'page.TermsPage.serviceTermination', defaultMessage: '暫停或終止服務' },
    serviceTerminationContent1: {
      id: 'page.TermsPage.serviceTerminationContent1',
      defaultMessage:
        '本服務於網站相關軟硬體設備進行更換、升級或維修時，得暫停或中斷本服務。如因維修或不可抗力因素，導致本公司網站服務暫停，暫停的期間造成直接或間接利益之損失，本公司不負損失賠償責任。',
    },
    serviceTerminationContent2: {
      id: 'page.TermsPage.serviceTerminationContent2',
      defaultMessage:
        '如果本服務需有或內含可下載軟體，該軟體可能會在提供新版或新功能時，在您的裝置上自動更新。部分情況下可以讓您調整您的自動更新設定。',
    },
    serviceTerminationContent3: {
      id: 'page.TermsPage.serviceTerminationContent3',
      defaultMessage:
        '您使用本服務之行為若有任何違反法令或本使用條款或危害本公司或第三者權益之虞時，在法律准許範圍內，於通知或未通知之情形下，立即暫時或永久終止您使用本服務之授權。此外，使⽤者同意若本服務之使⽤被中斷或終⽌帳號及相關信息和⽂件被關閉或刪除，{name} 對使⽤者或任何第三⼈均不承擔任何責任。',
    },
    report: { id: 'page.TermsPage.report', defaultMessage: '舉報' },
    reportContent: {
      id: 'page.TermsPage.reportContent',
      defaultMessage: '倘發現任何違反本服務條款之情事，請通知 {name}。',
    },
    refundPolicy: { id: 'page.TermsPage.refundPolicy', defaultMessage: '退費辦法' },
    refundRegulations: { id: 'page.TermsPage.refundRegulations', defaultMessage: '退費規定' },
    refundRegulationsContent1: {
      id: 'page.TermsPage.refundRegulationsContent1',
      defaultMessage:
        '已上架的課程，學員於購買七日之內（含購買當日）認為不符合需求，且未觀看課程者（除試看單元外），可透過「聯繫客服」的方式提出退費申請。',
    },
    refundRegulationsContent2: {
      id: 'page.TermsPage.refundRegulationsContent2',
      defaultMessage: '退費作業僅退回實際花費金額，若原訂單有使用 折價券 折價、或是 點數 折抵購課，皆不予退回。',
    },
    refundMethod: { id: 'page.TermsPage.refundMethod', defaultMessage: '退費方式' },
    refundMethodContent1: {
      id: 'page.TermsPage.refundMethodContent1',
      defaultMessage: '匯款退費：如果您購課時採用ATM轉帳或超商付款，則採匯款退費方式。採匯款退費者須負擔手續費30元。',
    },
    refundMethodContent2: {
      id: 'page.TermsPage.refundMethodContent2',
      defaultMessage: '退費申請流程：請您聯繫客服，將有專人回覆。',
    },
  }),
  SalesPerformancePage: defineMessages({
    departmentPlaceholder: { id: 'page.SalesPerformancePage.departmentPlaceholder', defaultMessage: '機構' },
    groupPlaceholder: { id: 'page.SalesPerformancePage.groupPlaceholder', defaultMessage: '組別' },
    managerPlaceholder: { id: 'page.SalesPerformancePage.managerPlaceholder', defaultMessage: '業務顧問' },
    signedDate: { id: 'page.SalesPerformancePage.signedDate', defaultMessage: '簽署日' },
    approvedDate: { id: 'page.SalesPerformancePage.approvedDate', defaultMessage: '通過日' },
    canceledDate: { id: 'page.SalesPerformancePage.canceledDate', defaultMessage: '取消日' },
    revokedDate: { id: 'page.SalesPerformancePage.revokedDate', defaultMessage: '解約日' },
    consultant: { id: 'page.SalesPerformancePage.consultant', defaultMessage: '顧問' },
    member: { id: 'page.SalesPerformancePage.member', defaultMessage: '學員' },
    orderAmount: { id: 'page.SalesPerformancePage.orderAmount', defaultMessage: '訂單金額' },
    performanceAmount: { id: 'page.SalesPerformancePage.performanceAmount', defaultMessage: '績效金額' },
    products: { id: 'page.SalesPerformancePage.products', defaultMessage: '產品' },
    paymentMethod: { id: 'page.SalesPerformancePage.paymentMethod', defaultMessage: '付款方式' },
    paymentNumber: { id: 'page.SalesPerformancePage.paymentNumber', defaultMessage: '金流編號' },
    notes: { id: 'page.SalesPerformancePage.notes', defaultMessage: '備註' },
    currentPerformance: { id: 'page.SalesPerformancePage.currentPerformance', defaultMessage: '目前績效' },
    underReview: { id: 'page.SalesPerformancePage.underReview', defaultMessage: '審核中' },
    approved: { id: 'page.SalesPerformancePage.approved', defaultMessage: '審核通過' },
    refundApplied: { id: 'page.SalesPerformancePage.refundApplied', defaultMessage: '提出退費' },
    revoked: { id: 'page.SalesPerformancePage.revoked', defaultMessage: '解約' },
    canceled: { id: 'page.SalesPerformancePage.canceled', defaultMessage: '取消' },
  }),
  SalesLeadPage: defineMessages({
    agent: { id: 'page.SalesLeadPage.agent', defaultMessage: '承辦人' },
    agentId: { id: 'page.SalesLeadPage.agentId', defaultMessage: '承辦編號' },
    got: { id: 'page.SalesLeadPage.got', defaultMessage: '喜提' },
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
      defaultMessage: 'draft',
    },
    publishedTab: {
      id: 'page.AnnouncementCollectionPage.publishedTab',
      defaultMessage: 'published',
    },
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
  RecordingPage: defineMessages({
    Unnamed: { id: 'page.RecordingPage.Unnamed', defaultMessage: '未命名' },
  }),
  QuestionGroupDuplicateAdminModal: defineMessages({
    copy: { id: 'page.QuestionGroupDuplicateAdminModal.copy', defaultMessage: '{title} 複製' },
    copyQuestionBank: { id: 'page.QuestionGroupDuplicateAdminModal.copyQuestionBank', defaultMessage: '複製題庫' },
  }),
  QuestionBlock: defineMessages({
    optionContent: { id: 'page.QuestionBlock.optionContent', defaultMessage: '選項內容' },
  }),
  MemberDescriptionBlock: defineMessages({
    goToBackendAndComplete: {
      id: 'page.MemberDescriptionBlock.goToBackendAndComplete',
      defaultMessage: '請去後台 > 會員列表 > 找到學員並將資料填寫完成',
    },
    phone: {
      id: 'page.MemberDescriptionBlock.phone',
      defaultMessage: '學員電話',
    },
    notSet: {
      id: 'page.MemberDescriptionBlock.notSet',
      defaultMessage: '未設定',
    },
    info: { id: 'page.MemberDescriptionBlock.info', defaultMessage: '學生資料' },
    name: { id: 'page.MemberDescriptionBlock.name', defaultMessage: '學員姓名' },
    email: { id: 'page.MemberDescriptionBlock.email', defaultMessage: '學員信箱' },
    paymentNote: { id: 'page.MemberDescriptionBlock.paymentNote', defaultMessage: '付款備註' },
    memberCategory: { id: 'page.MemberDescriptionBlock.memberCategory', defaultMessage: '會員分類' },
    cancel: { id: 'page.MemberDescriptionBlock.cancel', defaultMessage: '取消' },
    save: { id: 'page.MemberDescriptionBlock.save', defaultMessage: '儲存' },
    success: { id: 'page.MemberDescriptionBlock.success', defaultMessage: '更新成功' },
    fail: { id: 'page.MemberDescriptionBlock.fail', defaultMessage: '更新失敗' },
  }),
  MemberContractCreationBlock: defineMessages({
    fillMemberInfo: {
      id: 'page.MemberContractCreationBlock.fillMemberInfo',
      defaultMessage: '學員資料請填寫完整',
    },
    uploadProof: {
      id: 'page.MemberContractCreationBlock.uploadProof',
      defaultMessage: '需上傳證明',
    },
    addContractContent: {
      id: 'page.MemberContractCreationBlock.addContractContent',
      defaultMessage: '請至少要新增一個合約內容',
    },
    selectPaymentMethod: {
      id: 'page.MemberContractCreationBlock.selectPaymentMethod',
      defaultMessage: '請選擇付款方式',
    },
    selectInstallmentPeriod: {
      id: 'page.MemberContractCreationBlock.selectInstallmentPeriod',
      defaultMessage: '請選擇分期期數',
    },
    totalProportionMustBeOne: {
      id: 'page.MemberContractCreationBlock.totalProportionMustBeOne',
      defaultMessage: '承辦人分潤比例加總必須為 1',
    },
    confirmContractCorrectness: {
      id: 'page.MemberContractCreationBlock.confirmContractCorrectness',
      defaultMessage: '請確認合約是否正確？',
    },
    addonProduct: {
      id: 'page.MemberContractCreationBlock.addonProduct',
      defaultMessage: '【加購項目】',
    },
    referralDiscount: {
      id: 'page.MemberContractCreationBlock.referralDiscount',
      defaultMessage: '【介紹折抵】',
    },
    promotionDiscount: {
      id: 'page.MemberContractCreationBlock.promotionDiscount',
      defaultMessage: '【促銷折抵】',
    },
    totalAmount: {
      id: 'page.MemberContractCreationBlock.totalAmount',
      defaultMessage: '合計',
    },
    contractLink: {
      id: 'page.MemberContractCreationBlock.contractLink',
      defaultMessage: '合約連結',
    },
    contractCreateSuccess: {
      id: 'page.MemberContractCreationBlock.contractCreateSuccess',
      defaultMessage: '成功產生合約',
    },
    contractCreateFail: {
      id: 'page.MemberContractCreationBlock.contractCreateFail',
      defaultMessage: '產生合約失敗，請確認資料是否正確。錯誤代碼：',
    },
    orderCreateSuccess: { id: 'page.MemberContractCreationBlock.orderCreateSuccess', defaultMessage: '訂單建立成功' },
    orderCreateFail: { id: 'page.MemberContractCreationBlock.orderCreateFail', defaultMessage: '訂單建立失敗' },
    deposit: { id: 'page.MemberContractCreationBlock.deposit', defaultMessage: '訂金' },
    finalPayment: { id: 'page.MemberContractCreationBlock.finalPayment', defaultMessage: '尾款' },
    tax: { id: 'page.MemberContractCreationBlock.tax', defaultMessage: '稅額' },
    totalAmountWithTax: { id: 'page.MemberContractCreationBlock.totalAmountWithTax', defaultMessage: '總金額(含稅)' },
    copyContractLink: { id: 'page.MemberContractCreationBlock.copyContractLink', defaultMessage: '複製合約連結' },
    copyPaymentLink: { id: 'page.MemberContractCreationBlock.copyPaymentLink', defaultMessage: '複製付款連結' },
    generateContract: { id: 'page.MemberContractCreationBlock.generateContract', defaultMessage: '產生合約' },
    contractOrderLinkCreated: {
      id: 'page.MemberContractCreationBlock.contractOrderLinkCreated',
      defaultMessage: '合約/訂單連結已建立',
    },
  }),
  ContractLayout: defineMessages({
    memberOrderHistory: {
      id: 'page.ContractLayout.memberOrderHistory',
      defaultMessage: '會員訂單紀錄',
    },
  }),
  CertificationUploader: defineMessages({
    uploadProof: {
      id: 'page.CertificationUploader.uploadProof',
      defaultMessage: '上傳證明',
    },
  }),
  LearningOverviewPage: defineMessages({
    totalMemberCount: {
      id: 'page.LearningOverviewPage.totalMemberCount',
      defaultMessage: '所有人數',
    },
    enrolledMemberCount: {
      id: 'page.LearningOverviewPage.enrolledMemberCount',
      defaultMessage: '上課人數',
    },
    exercisedMemberCount: {
      id: 'page.LearningOverviewPage.exercisedMemberCount',
      defaultMessage: '測驗人數',
    },
    passedMemberCount: {
      id: 'page.LearningOverviewPage.passedMemberCount',
      defaultMessage: '通過人數',
    },
    peopleSuffix: {
      id: 'page.LearningOverviewPage.peopleSuffix',
      defaultMessage: '人',
    },
    hoursSuffix: {
      id: 'page.LearningOverviewPage.hoursSuffix',
      defaultMessage: '小時',
    },
    recentLearningCount: {
      id: 'page.LearningOverviewPage.recentLearningCount',
      defaultMessage: '近三十天學習人數',
    },
    recentLearningDuration: {
      id: 'page.LearningOverviewPage.recentLearningDuration',
      defaultMessage: '近三十天學習時數',
    },
    averageCompletionRate: {
      id: 'page.LearningOverviewPage.averageCompletionRate',
      defaultMessage: '平均完課率',
    },
    testPassRate: {
      id: 'page.LearningOverviewPage.testPassRate',
      defaultMessage: '測驗通過率',
    },
    learningCountAndAverageDuration: {
      id: 'page.LearningOverviewPage.learningCountAndAverageDuration',
      defaultMessage: '學習人數與平均時數',
    },
    completionRateDistribution: {
      id: 'page.LearningOverviewPage.completionRateDistribution',
      defaultMessage: '完課率分佈',
    },
    memberStatus: {
      id: 'page.LearningOverviewPage.memberStatus',
      defaultMessage: '學員狀況',
    },
    learningHeat: {
      id: 'page.LearningOverviewPage.learningHeat',
      defaultMessage: '學習熱度',
    },
  }),
  ProgressFunnel: defineMessages({
    conversionRate: {
      id: 'page.ProgressFunnel.conversionRate',
      defaultMessage: '轉化率 {percentage} %',
    },
  }),
  MemberSmsModal: defineMessages({
    send: {
      id: 'page.MemberSmsModal.send',
      defaultMessage: '發送',
    },
  }),
  MemberContractCreationForm: defineMessages({
    selectContractValidity: {
      id: 'page.MemberContractCreationForm.selectContractValidity',
      defaultMessage: '請選擇合約效期',
    },
    contractPeriod: {
      id: 'page.MemberContractCreationForm.contractPeriod',
      defaultMessage: '合約期間',
    },
    contractItem: {
      id: 'page.MemberContractCreationForm.contractItem',
      defaultMessage: '合約項目',
    },
    contractValidity: {
      id: 'page.MemberContractCreationForm.contractValidity',
      defaultMessage: '合約效期',
    },
    serviceStartDate: {
      id: 'page.MemberContractCreationForm.serviceStartDate',
      defaultMessage: '服務開始日',
    },
    serviceEndDate: {
      id: 'page.MemberContractCreationForm.serviceEndDate',
      defaultMessage: '服務結束日',
    },
    contractContent: {
      id: 'page.MemberContractCreationForm.contractContent',
      defaultMessage: '合約內容',
    },
    selectContract: {
      id: 'page.MemberContractCreationForm.selectContract',
      defaultMessage: '請選擇合約',
    },
    itemName: {
      id: 'page.MemberContractCreationForm.itemName',
      defaultMessage: '項目名稱',
    },
    itemPlaceholder: {
      id: 'page.MemberContractCreationForm.itemPlaceholder',
      defaultMessage: '請選擇項目 (搜尋請輸入至少兩個關鍵字)',
    },
    unitPrice: {
      id: 'page.MemberContractCreationForm.unitPrice',
      defaultMessage: '單價',
    },
    quantity: {
      id: 'page.MemberContractCreationForm.quantity',
      defaultMessage: '數量',
    },
    addItem: {
      id: 'page.MemberContractCreationForm.addItem',
      defaultMessage: '新增項目',
    },
    memberStatus: {
      id: 'page.MemberContractCreationForm.memberStatus',
      defaultMessage: '學員身份',
    },
    normal: {
      id: 'page.MemberContractCreationForm.normal',
      defaultMessage: '一般',
    },
    student: {
      id: 'page.MemberContractCreationForm.student',
      defaultMessage: '學生',
    },
    referrer: {
      id: 'page.MemberContractCreationForm.referrer',
      defaultMessage: '介紹人',
    },
    deposit: {
      id: 'page.MemberContractCreationForm.deposit',
      defaultMessage: '訂金',
    },
    deductDeposit: {
      id: 'page.MemberContractCreationForm.deductDeposit',
      defaultMessage: '扣除訂金 $1000',
    },
    appreciationPeriod: {
      id: 'page.MemberContractCreationForm.appreciationPeriod',
      defaultMessage: '鑑賞期',
    },
    useAppreciationPeriod: {
      id: 'page.MemberContractCreationForm.useAppreciationPeriod',
      defaultMessage: '使用鑑賞期',
    },
    paymentMethod: {
      id: 'page.MemberContractCreationForm.paymentMethod',
      defaultMessage: '付款方式',
    },
    selectPaymentMethod: {
      id: 'page.MemberContractCreationForm.selectPaymentMethod',
      defaultMessage: '請選擇付款方式',
    },
    installmentPeriod: {
      id: 'page.MemberContractCreationForm.installmentPeriod',
      defaultMessage: '分期期數',
    },
    selectInstallmentPeriod: {
      id: 'page.MemberContractCreationForm.selectInstallmentPeriod',
      defaultMessage: '請選擇分期期數',
    },
    paymentNumber: {
      id: 'page.MemberContractCreationForm.paymentNumber',
      defaultMessage: '金流編號',
    },
    contractManagerAndProfit: {
      id: 'page.MemberContractCreationForm.contractManagerAndProfit',
      defaultMessage: '承辦人 / 分潤',
    },
    fillContractManager: {
      id: 'page.MemberContractCreationForm.fillContractManager',
      defaultMessage: '請填寫承辦人',
    },
    contractManager: {
      id: 'page.MemberContractCreationForm.contractManager',
      defaultMessage: '承辦人',
    },
    addManager: {
      id: 'page.MemberContractCreationForm.addManager',
      defaultMessage: '加入',
    },
  }),
  LearningRadar: defineMessages({
    completionRate: {
      id: 'page.LearningRadar.completionRate',
      defaultMessage: '完課率',
    },
  }),
}

export default pageMessages
