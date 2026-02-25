import { defineMessages } from 'react-intl'

const formMessages = {
  '*': defineMessages({
    startedAt: { id: 'form.*.startedAt', defaultMessage: 'Start date' },
    endedAt: { id: 'form.*.endedAt', defaultMessage: 'End date' },
    loading: { id: 'form.*.loading', defaultMessage: 'Loading' },
  }),
  PermissionInput: defineMessages({
    backstage: { id: 'form.PermissionInput.backstage', defaultMessage: 'Backend permissions' },
    sales: { id: 'form.PermissionInput.sales', defaultMessage: 'Sales management' },
    program: { id: 'form.PermissionInput.program', defaultMessage: 'Online courses' },
    coupon: { id: 'form.PermissionInput.coupon', defaultMessage: 'Coupon plans' },
    memberAdmin: { id: 'form.PermissionInput.memberAdmin', defaultMessage: 'Member management' },
    appAdmin: { id: 'form.PermissionInput.appAdmin', defaultMessage: 'Website management' },
    mediaLibrary: { id: 'form.PermissionInput.mediaLibrary', defaultMessage: 'Media library' },
    programPackage: { id: 'form.PermissionInput.programPackage', defaultMessage: 'Program packages' },
    programProgress: { id: 'form.PermissionInput.programProgress', defaultMessage: 'Learning progress' },
    appointment: { id: 'form.PermissionInput.appointment', defaultMessage: 'Appointment service' },
    activity: { id: 'form.PermissionInput.activity', defaultMessage: 'Activity' },
    blog: { id: 'form.PermissionInput.post', defaultMessage: 'Media articles' },
    merchandise: { id: 'form.PermissionInput.merchandise', defaultMessage: 'E-commerce management' },
    craft: { id: 'form.PermissionInput.craftPage', defaultMessage: 'Page management' },
    voucher: { id: 'form.PermissionInput.voucher', defaultMessage: 'Voucher plans' },
    bonus: { id: 'form.PermissionInput.bonus', defaultMessage: 'Bonus deduction' },
    task: { id: 'form.PermissionInput.task', defaultMessage: 'Task management' },
    memberNote: { id: 'form.PermissionInput.memberNote', defaultMessage: 'Contact records' },
    project: { id: 'form.PermissionInput.project', defaultMessage: 'Project management' },
    contract: { id: 'form.PermissionInput.contract', defaultMessage: 'Contract management' },
    analysis: { id: 'form.PermissionInput.analysis', defaultMessage: 'Data analysis' },
    salesLead: { id: 'form.PermissionInput.salesLead', defaultMessage: 'Lead distribution' },
    salesManagement: { id: 'form.PermissionInput.salesManagement', defaultMessage: 'Sales management' },
    customScript: { id: 'form.PermissionInput.customScript', defaultMessage: 'Custom script' },
    report: { id: 'form.PermissionInput.report', defaultMessage: 'Report analysis' },
    certificate: { id: 'form.PermissionInput.certificate', defaultMessage: 'Certificate' },
    announcement: { id: 'form.PermissionInput.announcement', defaultMessage: 'Announcement' },
  }),
  PermissionGroup: defineMessages({
    // backstage
    BACKSTAGE_ENTER: { id: 'form.PermissionGroup.BACKSTAGE_ENTER', defaultMessage: 'Can access backend' },

    // sales
    SALES_READ: { id: 'form.PermissionGroup.SALES_READ', defaultMessage: '查看所有訂單' },
    SALES_EXPORT: { id: 'form.PermissionGroup.SALES_EXPORT', defaultMessage: '匯出所有訂單' },
    SALES_RECORDS_ADMIN: { id: 'form.PermissionGroup.SALES_RECORDS_ADMIN', defaultMessage: '查看所有銷售紀錄' },
    GROSS_SALES_NORMAL: { id: 'form.PermissionGroup.GROSS_SALES_NORMAL', defaultMessage: '查看個人銷售總額' },
    SALES_RECORDS_NORMAL: { id: 'form.PermissionGroup.SALES_RECORDS_NORMAL', defaultMessage: '查看個人銷售紀錄' },
    GROSS_SALES_ADMIN: { id: 'form.PermissionGroup.GROSS_SALES_ADMIN', defaultMessage: '查看所有銷售總額' },
    SALES_RECORDS_DETAILS: { id: 'form.PermissionGroup.SALES_RECORDS_DETAILS', defaultMessage: '查看消費者細項' },
    MODIFY_MEMBER_ORDER_EQUITY: {
      id: 'form.PermissionGroup.MODIFY_MEMBER_ORDER_EQUITY',
      defaultMessage: '調整會員訂單權益功能',
    },
    MODIFY_MEMBER_ORDER_STATUS: {
      id: 'form.PermissionGroup.MODIFY_MEMBER_ORDER_STATUS',
      defaultMessage: '調整會員訂單狀態功能',
    },
    MODIFY_MEMBER_PAYMENT_STATUS: {
      id: 'form.PermissionGroup.MODIFY_MEMBER_PAYMENT_STATUS',
      defaultMessage: '調整會員交易狀態功能',
    },
    READ_GROUP_SALES_ALL:{id: 'form.PermissionGroup.READ_GROUP_SALES_ALL', defaultMessage: 'Read same permission group data' },

    // program
    PROGRAM_ADMIN: { id: 'form.PermissionGroup.PROGRAM_ADMIN', defaultMessage: '所有課程管理功能' },
    PROGRAM_NORMAL: { id: 'form.PermissionGroup.PROGRAM_NORMAL', defaultMessage: '個人課程管理功能' },
    PROGRAM_READ: { id: 'form.PermissionGroup.PROGRAM_READ', defaultMessage: '查看課程' },
    PROGRAM_WRITE: { id: 'form.PermissionGroup.PROGRAM_WRITE', defaultMessage: '編寫課程' },
    PROGRAM_DELETE: { id: 'form.PermissionGroup.PROGRAM_DELETE', defaultMessage: '刪除課程' },
    PROGRAM_APPROVE: { id: 'form.PermissionGroup.PROGRAM_APPROVE', defaultMessage: '審核/退回課程' },
    PROGRAM_PUBLISH: { id: 'form.PermissionGroup.PROGRAM_PUBLISH', defaultMessage: '發布/下架課程' },
    PROGRAM_ISSUE_ADMIN: { id: 'form.PermissionGroup.PROGRAM_ISSUE_ADMIN', defaultMessage: '所有課程問題功能' },
    PROGRAM_ISSUE_NORMAL: { id: 'form.PermissionGroup.PROGRAM_ISSUE_NORMAL', defaultMessage: '個人課程問題功能' },
    PROGRAM_ISSUE_READ: { id: 'form.PermissionGroup.PROGRAM_ISSUE_READ', defaultMessage: '查看課程問題' },
    PROGRAM_ISSUE_WRITE: { id: 'form.PermissionGroup.PROGRAM_ISSUE_WRITE', defaultMessage: '編寫課程問題' },
    PROGRAM_ISSUE_DELETE: { id: 'form.PermissionGroup.PROGRAM_ISSUE_DELETE', defaultMessage: '刪除課程問題' },
    PROGRAM_CATEGORY_ADMIN: { id: 'form.PermissionGroup.PROGRAM_CATEGORY_ADMIN', defaultMessage: '所有課程分類功能' },
    PROGRAM_CATEGORY_READ: { id: 'form.PermissionGroup.PROGRAM_CATEGORY_READ', defaultMessage: '查看課程分類' },
    PROGRAM_CATEGORY_WRITE: { id: 'form.PermissionGroup.PROGRAM_CATEGORY_WRITE', defaultMessage: '編寫課程分類' },
    PROGRAM_CATEGORY_DELETE: { id: 'form.PermissionGroup.PROGRAM_CATEGORY_DELETE', defaultMessage: '刪除課程分類' },

    // program_package
    PROGRAM_PACKAGE_ADMIN: { id: 'form.PermissionGroup.PROGRAM_PACKAGE_ADMIN', defaultMessage: '所有課程組合功能' },
    PROGRAM_PACKAGE_TEMPO_DELIVERY_ADMIN: {
      id: 'form.PermissionGroup.PROGRAM_PACKAGE_TEMPO_DELIVERY_ADMIN',
      defaultMessage: '所有節奏交付功能',
    },
    PROGRAM_PACKAGE_CATEGORY_ADMIN: {
      id: 'form.PermissionGroup.PROGRAM_PACKAGE_CATEGORY_ADMIN',
      defaultMessage: '所有課程組合分類功能',
    },

    PROGRAM_PACKAGE_READ: { id: 'form.PermissionGroup.PROGRAM_PACKAGE_READ', defaultMessage: '查看課程組合' },
    PROGRAM_PACKAGE_WRITE: { id: 'form.PermissionGroup.PROGRAM_PACKAGE_WRITE', defaultMessage: '編寫課程組合' },
    PROGRAM_PACKAGE_PUBLISH: {
      id: 'form.PermissionGroup.PROGRAM_PACKAGE_PUBLISH',
      defaultMessage: '發布/下架課程組合',
    },
    PROGRAM_PACKAGE_CATEGORY_READ: { id: 'form.PermissionGroup.PROGRAM_CATEGORY_READ', defaultMessage: '查看課程分類' },
    PROGRAM_PACKAGE_CATEGORY_WRITE: {
      id: 'form.PermissionGroup.PROGRAM_CATEGORY_WRITE',
      defaultMessage: '編寫課程分類',
    },
    PROGRAM_PACKAGE_CATEGORY_DELETE: {
      id: 'form.PermissionGroup.PROGRAM_CATEGORY_DELETE',
      defaultMessage: '刪除課程分類',
    },

    // program_progress
    PROGRAM_PROGRESS_READ: { id: 'form.PermissionGroup.PROGRAM_PROGRESS_READ', defaultMessage: '所有學習進度功能' },
    PROGRAM_PROGRESS_EXPORT: { id: 'form.PermissionGroup.PROGRAM_PROGRESS_EXPORT', defaultMessage: '匯出課程進度' },

    // appointment
    APPOINTMENT_PLAN_ADMIN: { id: 'form.PermissionGroup.APPOINTMENT_PLAN_ADMIN', defaultMessage: '所有預約方案功能' },
    APPOINTMENT_READ: { id: 'form.PermissionGroup.APPOINTMENT_READ', defaultMessage: '查看預約方案' },
    APPOINTMENT_WRITE: { id: 'form.PermissionGroup.APPOINTMENT_WRITE', defaultMessage: '編寫預約方案' },
    APPOINTMENT_DELETE: { id: 'form.PermissionGroup.APPOINTMENT_DELETE', defaultMessage: '刪除預約方案' },
    APPOINTMENT_PUBLISH: { id: 'form.PermissionGroup.APPOINTMENT_PUBLISH', defaultMessage: '發布預約方案' },
    APPOINTMENT_PERIOD_ADMIN: {
      id: 'form.PermissionGroup.APPOINTMENT_PERIOD_ADMIN',
      defaultMessage: '所有預約紀錄功能',
    },
    APPOINTMENT_PERIOD_WRITE: { id: 'form.PermissionGroup.APPOINTMENT_PERIOD_WRITE', defaultMessage: '編寫預約時段' },
    APPOINTMENT_PERIOD_DELETE: { id: 'form.PermissionGroup.APPOINTMENT_PERIOD_DELETE', defaultMessage: '刪除預約時段' },
    APPOINTMENT_HISTORY_READ: { id: 'form.PermissionGroup.APPOINTMENT_HISTORY', defaultMessage: '查看預約紀錄' },
    APPOINTMENT_PLAN_NORMAL: { id: 'form.PermissionGroup.APPOINTMENT_PLAN_NORMAL', defaultMessage: '個人預約方案功能' },
    APPOINTMENT_PERIOD_NORMAL: {
      id: 'form.PermissionGroup.APPOINTMENT_PERIOD_NORMAL',
      defaultMessage: '個人預約紀錄功能',
    },

    // activity
    ACTIVITY_ADMIN: { id: 'form.PermissionGroup.ACTIVITY_ADMIN', defaultMessage: '所有活動功能' },
    ACTIVITY_NORMAL: { id: 'form.PermissionGroup.ACTIVITY_NORMAL', defaultMessage: '個人活動功能' },
    ACTIVITY_CATEGORY_ADMIN: { id: 'form.PermissionGroup.ACTIVITY_CATEGORY_ADMIN', defaultMessage: '所有活動分類功能' },

    ACTIVITY_READ: { id: 'form.PermissionGroup.ACTIVITY_READ', defaultMessage: '查看實體活動' },
    ACTIVITY_ENROLLMENT_READ: {
      id: 'form.PermissionGroup.ACTIVITY_ENROLLMENT_READ',
      defaultMessage: '查看活動報名名單',
    },
    ACTIVITY_WRITE: { id: 'form.PermissionGroup.ACTIVITY_WRITE', defaultMessage: '編寫活動' },
    ACTIVITY_SESSION_WRITE: { id: 'form.PermissionGroup.ACTIVITY_SESSION_WRITE', defaultMessage: '編寫活動場次' },
    ACTIVITY_TICKET_WRITE: { id: 'form.PermissionGroup.ACTIVITY_TICKET_WRITE', defaultMessage: '編寫活動票卷' },
    ACTIVITY_PUBLISHED: { id: 'form.PermissionGroup.ACTIVITY_PUBLISHED', defaultMessage: '發布實體活動' },
    ACTIVITY_CATEGORY_READ: { id: 'form.PermissionGroup.ACTIVITY_CATEGORY_READ', defaultMessage: '查看活動分類' },
    ACTIVITY_CATEGORY_WRITE: { id: 'form.PermissionGroup.ACTIVITY_CATEGORY_WRITE', defaultMessage: '編寫活動分類' },
    ACTIVITY_CATEGORY_DELETE: { id: 'form.PermissionGroup.ACTIVITY_CATEGORY_DELETE', defaultMessage: '刪除活動分類' },

    // blog
    POST_ADMIN: { id: 'form.PermissionGroup.POST_ADMIN', defaultMessage: '所有文章管理功能' },
    POST_NORMAL: { id: 'form.PermissionGroup.POST_NORMAL', defaultMessage: '個人文章管理功能' },
    POST_CATEGORY_ADMIN: { id: 'form.PermissionGroup.POST_CATEGORY_ADMIN', defaultMessage: '所有文章分類功能' },
    POST_READ: { id: 'form.PermissionGroup.POST_READ', defaultMessage: '查看文章' },
    POST_VIEWS_READ: { id: 'form.PermissionGroup.POST_VIEWS_READ', defaultMessage: '查看文章瀏覽數' },
    POST_WRITE: { id: 'form.PermissionGroup.POST_WRITE', defaultMessage: '編寫文章' },
    POST_AUTHOR_WRITE: { id: 'form.PermissionGroup.POST_AUTHOR_WRITE', defaultMessage: '更改文章作者' },
    POST_DELETE: { id: 'form.PermissionGroup.POST_DELETE', defaultMessage: '刪除文章' },
    POST_PUBLISH: { id: 'form.PermissionGroup.POST_PUBLISH', defaultMessage: '發佈文章' },
    POST_CATEGORY_READ: { id: 'form.PermissionGroup.POST_CATEGORY_READ', defaultMessage: '查看文章分類' },
    POST_CATEGORY_WRITE: { id: 'form.PermissionGroup.POST_CATEGORY_WRITE', defaultMessage: '編寫文章分類' },
    POST_CATEGORY_DELETE: { id: 'form.PermissionGroup.POST_CATEGORY_DELETE', defaultMessage: '刪除文章分類' },

    // coupon
    COUPON_PLAN_ADMIN: { id: 'form.PermissionGroup.COUPON_PLAN_ADMIN', defaultMessage: '所有折價方案功能' },
    COUPON_PLAN_ADMIN_VIEW: { id: 'form.PermissionGroup.COUPON_PLAN_ADMIN_VIEW', defaultMessage: '檢視折價方案' },
    COUPON_PLAN_ADMIN_EDIT: { id: 'form.PermissionGroup.COUPON_PLAN_ADMIN_EDIT', defaultMessage: '新增與編輯折價方案' },
    COUPON_PLAN_ADMIN_DELETE: { id: 'form.PermissionGroup.COUPON_PLAN_ADMIN_DELETE', defaultMessage: '刪除折價方案' },
    COUPON_PLAN_NORMAL: { id: 'form.PermissionGroup.COUPON_PLAN_NORMAL', defaultMessage: '個人折價方案功能' },
    COUPON_PLAN_READ: { id: 'form.PermissionGroup.COUPON_PLAN_READ', defaultMessage: '查看折價方案' },
    COUPON_PLAN_WRITE: { id: 'form.PermissionGroup.COUPON_PLAN_WRITE', defaultMessage: '編寫折價方案' },
    COUPON_CODE_EXPORT: { id: 'form.PermissionGroup.COUPON_CODE_EXPORT', defaultMessage: '匯出折扣碼' },

    // voucher
    VOUCHER_CATEGORY_ADMIN: { id: 'form.PermissionGroup.VOUCHER_CATEGORY_ADMIN', defaultMessage: '所有兌換分類功能' },
    VOUCHER_PLAN_ADMIN: { id: 'form.PermissionGroup.VOUCHER_PLAN_ADMIN', defaultMessage: '所有兌換方案功能' },
    VOUCHER_PLAN_ADMIN_VIEW: { id: 'form.PermissionGroup.VOUCHER_PLAN_ADMIN_VIEW', defaultMessage: '檢視兌換方案' },
    VOUCHER_PLAN_ADMIN_EDIT: {
      id: 'form.PermissionGroup.VOUCHER_PLAN_ADMIN_EDIT',
      defaultMessage: '新增與編輯兌換方案',
    },
    VOUCHER_PLAN_ADMIN_DELETE: { id: 'form.PermissionGroup.VOUCHER_PLAN_ADMIN_DELETE', defaultMessage: '刪除兌換方案' },
    VOUCHER_PLAN_NORMAL: { id: 'form.PermissionGroup.VOUCHER_PLAN_NORMAL', defaultMessage: '個人兌換方案功能' },
    VOUCHER_PLAN_READ: { id: 'form.PermissionGroup.VOUCHER_PLAN_READ', defaultMessage: '查看兌換方案' },
    VOUCHER_PLAN_WRITE: { id: 'form.PermissionGroup.VOUCHER_PLAN_WRITE', defaultMessage: '編寫兌換方案' },
    VOUCHER_CODE_EXPORT: { id: 'form.PermissionGroup.VOUCHER_CODE_EXPORT', defaultMessage: '匯出兌換碼' },

    // coin
    COIN_ADMIN: { id: 'form.PermissionGroup.COIN_ADMIN', defaultMessage: '所有代幣紀錄功能' },
    RECLAIM_COIN: { id: 'form.PermissionGroup.RECLAIM_COIN', defaultMessage: 'Reclaim coin' },

    // member
    MEMBER_ADMIN: { id: 'form.PermissionGroup.MEMBER_ADMIN', defaultMessage: '所有會員列表功能' },
    MEMBER_PROPERTY_ADMIN: { id: 'form.PermissionGroup.MEMBER_PROPERTY_ADMIN', defaultMessage: '所有自訂欄位功能' },
    MEMBER_PHONE_ADMIN: { id: 'form.PermissionGroup.MEMBER_PHONE_ADMIN', defaultMessage: '檢視電話欄位' },
    MEMBER_PROGRAM_TIMETABLE_EDIT: {
      id: 'form.PermissionGroup.MEMBER_PROGRAM_TIMETABLE_EDIT',
      defaultMessage: '編輯會員課表',
    },
    MEMBER_PROGRAM_TIMETABLE_VIEW: {
      id: 'form.PermissionGroup.MEMBER_PROGRAM_TIMETABLE_VIEW',
      defaultMessage: '查看會員課表',
    },
    MEMBER_STAR_ADMIN: { id: 'form.PermissionGroup.MEMBER_STAR_ADMIN', defaultMessage: '檢視星等欄位' },
    MEMBER_CATEGORY_ADMIN: { id: 'form.PermissionGroup.MEMBER_CATEGORY_ADMIN', defaultMessage: '所有會員分類功能' },
    MEMBER_MANAGER_ADMIN: { id: 'form.PermissionGroup.MEMBER_MANAGER_ADMIN', defaultMessage: '指派承辦人功能' },
    MEMBER_CONTRACT_VIEW: { id: 'form.PermissionGroup.MEMBER_CONTRACT_VIEW', defaultMessage: '顯示合約功能' },
    MEMBER_CONTRACT_INSERT: { id: 'form.PermissionGroup.MEMBER_CONTRACT_INSERT', defaultMessage: '建立合約功能' },
    MEMBER_CONTRACT_REVOKE: { id: 'form.PermissionGroup.MEMBER_CONTRACT_REVOKE', defaultMessage: '解除合約功能' },
    MEMBER_ATTENDANT: { id: 'form.PermissionGroup.MEMBER_ATTENDANT', defaultMessage: '打卡功能' },
    SALES_CALL_ADMIN: { id: 'form.PermissionGroup.SALES_CALL_ADMIN', defaultMessage: '檢視業務專區' },
    MEMBER_EMAIL_EDIT: { id: 'form.PermissionGroup.MEMBER_EMAIL_EDIT', defaultMessage: '編輯信箱' },
    MEMBER_USERNAME_EDIT: { id: 'form.PermissionGroup.MEMBER_USERNAME_EDIT', defaultMessage: '編輯帳號' },
    MEMBER_CREATE: { id: 'form.PermissionGroup.MEMBER_CREATE', defaultMessage: '添加會員' },
    CHECK_MEMBER_PAGE_PROGRAM_INFO: {
      id: 'form.PermissionGroup.CHECK_MEMBER_PAGE_PROGRAM_INFO',
      defaultMessage: '查看會員主頁課程資訊',
    },
    CHECK_MEMBER_PAGE_PROJECT_INFO: {
      id: 'form.PermissionGroup.CHECK_MEMBER_PAGE_PROJECT_INFO',
      defaultMessage: '查看會員主頁專案資訊',
    },
    CHECK_MEMBER_PAGE_ACTIVITY_INFO: {
      id: 'form.PermissionGroup.CHECK_MEMBER_PAGE_ACTIVITY_INFO',
      defaultMessage: '查看會員主頁活動資訊',
    },
    CHECK_MEMBER_PAGE_PODCAST_INFO: {
      id: 'form.PermissionGroup.CHECK_MEMBER_PAGE_PODCAST_INFO',
      defaultMessage: '查看會員主頁廣播資訊',
    },
    CHECK_MEMBER_PAGE_APPOINTMENT_INFO: {
      id: 'form.PermissionGroup.CHECK_MEMBER_PAGE_APPOINTMENT_INFO',
      defaultMessage: '查看會員主頁預約資訊',
    },
    CHECK_MEMBER_PAGE_MERCHANDISE_INFO: {
      id: 'form.PermissionGroup.CHECK_MEMBER_PAGE_MERCHANDISE_INFO',
      defaultMessage: '查看會員主頁商品紀錄',
    },
    CHECK_MEMBER_ORDER: { id: 'form.PermissionGroup.CHECK_MEMBER_ORDER', defaultMessage: '查看會員訂單紀錄' },
    CHECK_MEMBER_COIN: { id: 'form.PermissionGroup.CHECK_MEMBER_COIN', defaultMessage: '查看會員代幣紀錄' },
    CHECK_MEMBER_HISTORY: { id: 'form.PermissionGroup.CHECK_MEMBER_HISTORY', defaultMessage: '查看會員歷程紀錄' },

    // member_note
    MEMBER_NOTE_ADMIN: { id: 'form.PermissionGroup.MEMBER_NOTE_ADMIN', defaultMessage: '聯絡紀錄管理功能' },
    VIEW_ALL_MEMBER_NOTE: { id: 'form.PermissionGroup.VIEW_ALL_MEMBER_NOTE', defaultMessage: '檢視所有聯絡紀錄' },
    EDIT_DELETE_ALL_MEMBER_NOTE: {
      id: 'form.PermissionGroup.EDIT_DELETE_ALL_MEMBER_NOTE',
      defaultMessage: '編輯/刪除所有聯絡紀錄',
    },
    VIEW_MEMBER_NOTE_TRANSCRIPT: {
      id: 'form.PermissionGroup.VIEW_MEMBER_NOTE_TRANSCRIPT',
      defaultMessage: 'View member note transcript',
    },
    MEMBER_COUPON_PLAN_VIEW: {
      id: 'form.PermissionGroup.MEMBER_COUPON_PLAN_VIEW',
      defaultMessage: '查看會員折價券資訊',
    },
    MEMBER_VOUCHER_PLAN_VIEW: {
      id: 'form.PermissionGroup.MEMBER_VOUCHER_PLAN_VIEW',
      defaultMessage: '查看會員兌換券資訊',
    },
    MEMBER_NOTE_VIEW_EDIT: {
      id: 'form.PermissionGroup.MEMBER_NOTE_VIEW_EDIT',
      defaultMessage: 'View and edit member notes',
    },

    // task
    TASK_ADMIN: { id: 'form.PermissionGroup.TASK_ADMIN', defaultMessage: '所有待辦清單功能' },
    TASK_CATEGORY_ADMIN: { id: 'form.PermissionGroup.TASK_CATEGORY_ADMIN', defaultMessage: '所有待辦分類功能' },
    TASK_CREATED_AT_WRITE: { id: 'form.PermissionGroup.TASK_CREATED_AT_WRITE', defaultMessage: '設定待辦建立日期' },
    TASK_READ_GROUP_ALL: {id: 'form.PermissionGroup.TASK_READ_GROUP_ALL', defaultMessage: '讀取同權限組資料' },

    // app_setting
    APP_SETTING_ADMIN: { id: 'form.PermissionGroup.APP_SETTING_ADMIN', defaultMessage: '參數設定' },
    APP_SECRET_ADMIN: { id: 'form.PermissionGroup.APP_SECRET_ADMIN', defaultMessage: '金鑰設定' },
    APP_BASIC_ADMIN: { id: 'form.PermissionGroup.APP_BASIC_ADMIN', defaultMessage: '基本設定' },
    APP_TMP_PASSWORD_ADMIN: { id: 'form.PermissionGroup.APP_TMP_PASSWORD_ADMIN', defaultMessage: '臨時密碼申請' },

    // project
    PROJECT_ADMIN: { id: 'form.PermissionGroup.PROJECT_ADMIN', defaultMessage: '所有專案功能' },
    PROJECT_FUNDING_ADMIN: { id: 'form.PermissionGroup.PROJECT_FUNDING_ADMIN', defaultMessage: '募資專案功能' },
    PROJECT_PRE_ORDER_ADMIN: { id: 'form.PermissionGroup.PROJECT_PRE_ORDER_ADMIN', defaultMessage: '預購專案功能' },
    PROJECT_ON_SALE_ADMIN: { id: 'form.PermissionGroup.PROJECT_ON_SALE_ADMIN', defaultMessage: '促銷專案功能' },
    PROJECT_CATEGORY_ADMIN: { id: 'form.PermissionGroup.PROJECT_CATEGORY_ADMIN', defaultMessage: '專案分類功能' },
    PROJECT_NORMAL: { id: 'form.PermissionGroup.PROJECT_NORMAL', defaultMessage: '個人專案功能' },
    PROJECT_FUNDING_NORMAL: { id: 'form.PermissionGroup.PROJECT_FUNDING_NORMAL', defaultMessage: '個人募資專案功能' },
    PROJECT_PRE_ORDER_NORMAL: {
      id: 'form.PermissionGroup.PROJECT_PRE_ORDER_NORMAL',
      defaultMessage: '個人預購專案功能',
    },
    PROJECT_PORTFOLIO_ADMIN: { id: 'form.PermissionGroup.PROJECT_PORTFOLIO_ADMIN', defaultMessage: '所有作品專案功能' },
    PROJECT_PORTFOLIO_NORMAL: {
      id: 'form.PermissionGroup.PROJECT_PORTFOLIO_NORMAL',
      defaultMessage: '個人作品專案功能',
    },
    PROJECT_ROLE_ADMIN: { id: 'form.PermissionGroup.PROJECT_ROLE_ADMIN', defaultMessage: '角色管理' },

    // practice
    MATERIAL_AUDIT_LOG_ADMIN: {
      id: 'form.PermissionGroup.MATERIAL_AUDIT_LOG_ADMIN',
      defaultMessage: '查看教材異動紀錄',
    },
    PRACTICE_ADMIN: { id: 'form.PermissionGroup.PRACTICE_ADMIN', defaultMessage: '所有作業功能' },
    PRACTICE_NORMAL: { id: 'form.PermissionGroup.PRACTICE_NORMAL', defaultMessage: '個人作業功能' },
    // contract
    CONTRACT_VALUE_VIEW_ADMIN: {
      id: 'form.PermissionGroup.CONTRACT_VALUE_VIEW_ADMIN',
      defaultMessage: '檢視所有的合約',
    },
    CONTRACT_VALUE_VIEW_NORMAL: {
      id: 'form.PermissionGroup.CONTRACT_VALUE_VIEW_NORMAL',
      defaultMessage: '檢視自己建立的合約',
    },
    CONTRACT_APPROVED_AT_EDIT: {
      id: 'form.PermissionGroup.CONTRACT_APPROVED_AT_EDIT',
      defaultMessage: '編輯審核通過日期',
    },
    CONTRACT_CANCELED_AT_EDIT: { id: 'form.PermissionGroup.CONTRACT_CANCELED_AT_EDIT', defaultMessage: '編輯取消日期' },
    CONTRACT_REFUND_AT_EDIT: { id: 'form.PermissionGroup.CONTRACT_REFUND_AT_EDIT', defaultMessage: '編輯提出退費日期' },
    CONTRACT_PAYMENT_METHOD_EDIT: {
      id: 'form.PermissionGroup.CONTRACT_PAYMENT_METHOD_EDIT',
      defaultMessage: '編輯付款方式',
    },
    CONTRACT_INSTALLMENT_PLAN_EDIT: {
      id: 'form.PermissionGroup.CONTRACT_INSTALLMENT_PLAN_EDIT',
      defaultMessage: '編輯付款期數',
    },
    CONTRACT_PAYMENT_NUMBER_EDIT: {
      id: 'form.PermissionGroup.CONTRACT_PAYMENT_NUMBER_EDIT',
      defaultMessage: '編輯金流編號',
    },
    CONTRACT_NOTE_EDIT: { id: 'form.PermissionGroup.CONTRACT_NOTE_EDIT', defaultMessage: '編輯備註' },
    CONTRACT_REVENUE_SHARING_EDIT: {
      id: 'form.PermissionGroup.CONTRACT_REVENUE_SHARING_EDIT',
      defaultMessage: '編輯與新增業務分潤',
    },
    CONTRACT_ATTACHMENT_EDIT: { id: 'form.PermissionGroup.CONTRACT_ATTACHMENT_EDIT', defaultMessage: '編輯上傳檔案' },
    CONTRACT_RECOGNIZE_PERFORMANCE_EDIT: {
      id: 'form.PermissionGroup.CONTRACT_RECOGNIZE_PERFORMANCE_EDIT',
      defaultMessage: '編輯績效金額',
    },
    READ_GROUP_CONTRACT_ALL: { id: 'form.PermissionGroup.READ_GROUP_CONTRACT_ALL', defaultMessage: '讀取同權限組資料' },

    // craft
    CRAFT_PAGE_ADMIN: { id: 'form.PermissionGroup.CRAFT_PAGE_ADMIN', defaultMessage: '所有頁面模組功能' },
    CRAFT_PAGE_NORMAL: { id: 'form.PermissionGroup.CRAFT_PAGE_NORMAL', defaultMessage: '個人頁面模組功能' },
    CRAFT_MENU_ADMIN: { id: 'form.PermissionGroup.CRAFT_MENU_ADMIN', defaultMessage: '頁面模組選單' },

    // media_library
    MEDIA_LIBRARY_ADMIN: { id: 'form.PermissionGroup.MEDIA_LIBRARY_ADMIN', defaultMessage: '所有媒體庫功能' },

    // analysis
    ANALYSIS_ADMIN: { id: 'form.PermissionGroup.ANALYSIS_ADMIN', defaultMessage: '所有數據分析功能' },

    // sales
    SALES_PERFORMANCE_ADMIN: { id: 'form.PermissionGroup.SALES_PERFORMANCE_ADMIN', defaultMessage: '所有業績總表' },
    SALES_VIEW_SAME_DEPARTMENT_PERFORMANCE_ADMIN: {
      id: 'form.PermissionGroup.SALES_VIEW_SAME_DEPARTMENT_PERFORMANCE_ADMIN',
      defaultMessage: '查看同機構業績',
    },
    SALES_VIEW_SAME_DIVISION_PERFORMANCE_ADMIN: {
      id: 'form.PermissionGroup.SALES_VIEW_SAME_DIVISION_PERFORMANCE_ADMIN',
      defaultMessage: '查看同組別業績',
    },

    // sales_lead
    SALES_LEAD_ADMIN: { id: 'form.PermissionGroup.SALES_LEAD_ADMIN', defaultMessage: '所有名單撥打功能' },
    SALES_LEAD_NORMAL: { id: 'form.PermissionGroup.SALES_LEAD_NORMAL', defaultMessage: '個人名單撥打管理功能' },
    SALES_LEAD_DELIVERY_ADMIN: { id: 'form.PermissionGroup.SALES_LEAD_DELIVERY_ADMIN', defaultMessage: '名單分派功能' },
    SALES_LEAD_SELECTOR_ADMIN: {
      id: 'form.PermissionGroup.SALES_LEAD_SELECTOR_ADMIN',
      defaultMessage: '名單撥打選擇器功能',
    },
    SALES_MEMBER_LIST_RECYCLE: {
      id: 'form.PermissionGroup.SALES_MEMBER_LIST_RECYCLE',
      defaultMessage: '名單回收功能',
    },
    SALES_MEMBER_LIST_DELETE: {
      id: 'form.PermissionGroup.SALES_MEMBER_LIST_DELETE',
      defaultMessage: '名單刪除功能',
    },
    SALES_MEMBER_LIST_MULTIPLE_MISSED: {
      id: 'form.PermissionGroup.SALES_MEMBER_LIST_MULTIPLE_MISSED',
      defaultMessage: '名單多次未接功能',
    },
    SALES_LEAD_SAME_DIVISION_SELECTOR: {
      id: 'form.PermissionGroup.SALES_LEAD_SAME_DIVISION_SELECTOR',
      defaultMessage: '同組別名單撥打選擇器功能',
    },
    SALES_LEAD_SAME_PERMISSION_GROUP_SELECTOR: {
      id: 'form.PermissionGroup.SALES_LEAD_SAME_PERMISSION_GROUP_SELECTOR',
      defaultMessage: '同權限組名單撥打選擇器功能',
    },

    // merchandise
    MERCHANDISE_ADMIN: { id: 'form.PermissionGroup.MERCHANDISE_ADMIN', defaultMessage: '所有電商管理' },
    MERCHANDISE_CATEGORY_ADMIN: {
      id: 'form.PermissionGroup.MERCHANDISE_CATEGORY_ADMIN',
      defaultMessage: '所有電商分類功能',
    },
    MERCHANDISE_NORMAL: { id: 'form.PermissionGroup.MERCHANDISE_NORMAL', defaultMessage: '個人電商管理' },
    SHIPPING_ADMIN: { id: 'form.PermissionGroup.SHIPPING_ADMIN', defaultMessage: '所有出貨管理' },
    SHIPPING_NORMAL: { id: 'form.PermissionGroup.SHIPPING_NORMAL', defaultMessage: '個人出貨管理' },

    // permissionGroup
    PERMISSION_GROUP_ADMIN: {
      id: 'form.PermissionGroup.PERMISSION_GROUP_ADMIN',
      defaultMessage: '權限組管理功能',
    },

    // podcast
    PODCAST_ALBUM_ADMIN: {
      id: 'form.PermissionGroup.PODCAST_ALBUM_ADMIN',
      defaultMessage: '音頻專輯管理',
    },
    PODCAST_ALBUM_CATEGORY_ADMIN: {
      id: 'form.PermissionGroup.PODCAST_ALBUM_CATEGORY_ADMIN',
      defaultMessage: '音頻專輯分類功能',
    },
    PODCAST_ADMIN: {
      id: 'form.PermissionGroup.PODCAST_ADMIN',
      defaultMessage: '所有音頻管理',
    },
    PODCAST_PROGRAM_CATEGORY_ADMIN: {
      id: 'form.PermissionGroup.PODCAST_PROGRAM_CATEGORY_ADMIN',
      defaultMessage: '音頻分類功能',
    },
    // customScript
    CUSTOM_SCRIPT_ADMIN: {
      id: 'form.PermissionGroup.CUSTOM_SCRIPT_ADMIN',
      defaultMessage: '自訂腳本功能',
    },

    // report
    REPORT_ADMIN: {
      id: 'form.PermissionGroup.REPORT_ADMIN',
      defaultMessage: '所有報表功能',
    },
    REPORT_VIEW: {
      id: 'form.PermissionGroup.REPORT_VIEW',
      defaultMessage: '查看報表',
    },

    // certificate
    CERTIFICATE_ADMIN: {
      id: 'form.PermissionGroup.CERTIFICATE_ADMIN',
      defaultMessage: '證書管理',
    },

    // announcement
    ANNOUNCEMENT_ADMIN: {
      id: 'form.PermissionGroup.ANNOUNCEMENT_ADMIN',
      defaultMessage: '公告管理',
    },
    ANNOUNCEMENT_VIEW: {
      id: 'form.PermissionGroup.ANNOUNCEMENT_VIEW',
      defaultMessage: '檢視公告',
    },
  }),
  GiftPlanInput: defineMessages({
    pleaseSelectAGiftPlan: { id: 'form.GiftPlanInput.pleaseSelectAGiftPlan', defaultMessage: 'Please select a gift plan' },
    noGiftPlan: { id: 'form.GiftPlanInput.noGiftPlan', defaultMessage: 'No gift' },
    hasGiftPlan: { id: 'form.GiftPlanInput.hasGiftPlan', defaultMessage: 'Has gift' },
    whetherProvideGift: { id: 'form.GiftPlanInput.whetherProvideGift', defaultMessage: 'Whether to provide gift' },
    selectGiftPlan: { id: 'form.GiftPlanInput.selectGiftPlan', defaultMessage: 'Select gift plan' },
    pleaseCreateGiftPlan: { id: 'form.GiftPlanInput.pleaseCreateGiftPlan', defaultMessage: 'Please create a gift plan' },
  }),
  MemberSelector: defineMessages({
    memberSelect: { id: 'form.MemberSelector.memberSelect', defaultMessage: 'Please enter username or Email' },
    memberIsUnregistered: { id: 'form.MemberSelector.memberIsUnregistered', defaultMessage: 'Not a registered member' },
    memberIsInvited: { id: 'form.MemberSelector.memberIsInvited', defaultMessage: 'Member invitation pending' },
  }),
  ProductSelector: defineMessages({
    generalPhysicalMerchandiseSpec: {
      id: 'form.ProductSelector.generalPhysicalMerchandiseSpec',
      defaultMessage: 'General physical product specification',
    },
    generalVirtualMerchandiseSpec: {
      id: 'form.ProductSelector.generalVirtualMerchandiseSpec',
      defaultMessage: 'General virtual product specification',
    },
    customizedPhysicalMerchandiseSpec: {
      id: 'form.ProductSelector.customizedPhysicalMerchandiseSpec',
      defaultMessage: 'Customized physical product specification',
    },
    customizedVirtualMerchandiseSpec: {
      id: 'form.ProductSelector.customizedVirtualMerchandiseSpec',
      defaultMessage: 'Customized virtual product specification',
    },
  }),
  SaleInput: defineMessages({
    salePricePrefix: { id: 'form.SaleInput.salePricePrefix', defaultMessage: 'Sale price prefix' },
    salePriceSuffix: { id: 'form.SaleInput.salePriceSuffix', defaultMessage: 'Sale price suffix' },
    countdownTimerVisible: { id: 'form.SaleInput.countdownTimerVisible', defaultMessage: 'Show countdown timer' },
    salePrice: { id: 'form.SaleInput.salePrice', defaultMessage: 'Sale price' },
    salePriceCircumfix: {
      id: 'form.SaleInput.salePriceCircumfix',
      defaultMessage: 'Sale price prefix and suffix',
    },
    salePriceEndTime: { id: 'form.SaleInput.salePriceEndTime', defaultMessage: 'Discount expiration date' },
    outdated: { id: 'form.SaleInput.outdated', defaultMessage: 'Expired' },
    priceDescription: { id: 'form.SaleInput.priceDescription', defaultMessage: 'Price description' },
  }),
  PermissionGroupSelector: defineMessages({
    selectPermissionGroup: {
      id: 'form.PermissionGroupSelector.selectPermissionGroup',
      defaultMessage: 'Please select permission group',
    },
  }),
}
export default formMessages
