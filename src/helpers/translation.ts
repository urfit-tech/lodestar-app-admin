// { id: '', defaultMessage: '' },

import { defineMessages } from 'react-intl'

export const commonMessages = {
  ui: defineMessages({
    comma: { id: 'common.ui.comma', defaultMessage: '、' },
    print: { id: 'common.ui.print', defaultMessage: '列印' },
    create: { id: 'common.ui.create', defaultMessage: '建立' },
    cancel: { id: 'common.ui.cancel', defaultMessage: '取消' },
    confirm: { id: 'common.ui.confirm', defaultMessage: '確定' },
    edit: { id: 'common.ui.edit', defaultMessage: '編輯' },
    detail: { id: 'common.ui.detail', defaultMessage: '詳情' },
    delete: { id: 'common.ui.delete', defaultMessage: '刪除' },
    login: { id: 'common.ui.login', defaultMessage: '登入' },
    logout: { id: 'common.ui.logout', defaultMessage: '登出' },
    loginAndRegister: { id: 'common.ui.loginAndRegister', defaultMessage: '登入 / 註冊' },
    register: { id: 'common.ui.register', defaultMessage: '註冊' },
    or: { id: 'common.ui.or', defaultMessage: '或' },
    registerNow: { id: 'common.ui.registerNow', defaultMessage: '立即註冊' },
    facebookLogin: { id: 'common.ui.facebookLogin', defaultMessage: 'Facebook 登入/註冊' },
    googleLogin: { id: 'common.ui.googleLogin', defaultMessage: 'Google 登入/註冊' },
    save: { id: 'common.ui.save', defaultMessage: '儲存' },
    reply: { id: 'common.ui.reply', defaultMessage: '回覆' },
    search: { id: 'common.ui.search', defaultMessage: '查詢' },
    reset: { id: 'common.ui.reset', defaultMessage: '重置' },
    buyNow: { id: 'common.ui.buyNow', defaultMessage: '立即購買' },
    goToCart: { id: 'common.ui.goToCart', defaultMessage: '前往購物車' },
    addToCart: { id: 'common.ui.addToCart', defaultMessage: '加入購物車' },
    trial: { id: 'common.ui.trial', defaultMessage: '試看' },
    cancelPublishing: { id: 'common.ui.cancelPublishing', defaultMessage: '取消發佈' },
    publish: { id: 'common.ui.publish', defaultMessage: '立即發佈' },
    addInstructor: { id: 'common.ui.addInstructor', defaultMessage: '新增講師' },
    add: { id: 'common.ui.add', defaultMessage: '新增' },
    cancelOrder: { id: 'common.ui.cancelOrder', defaultMessage: '取消訂單' },
    retryPayment: { id: 'common.ui.retryPayment', defaultMessage: '重新付款' },
    checkInvoice: { id: 'common.ui.checkInvoice', defaultMessage: '查看收據' },
  }),
  label: defineMessages({
    selectInstructor: { id: 'common.label.selectInstructor', defaultMessage: '選擇老師' },
    title: { id: 'common.label.title', defaultMessage: '名稱' },
    category: { id: 'common.label.category', defaultMessage: '類別' },
    startedAt: { id: 'common.label.startedAt', defaultMessage: '開始時間' },
    endedAt: { id: 'common.label.endedAt', defaultMessage: '結束時間' },
    listPrice: { id: 'common.label.listPrice', defaultMessage: '定價' },
    email: { id: 'common.label.email', defaultMessage: '信箱' },
    phone: { id: 'common.label.phone', defaultMessage: '手機' },
    accountNameOrEmail: { id: 'common.label.username', defaultMessage: '使用者名稱或 Email' },
    password: { id: 'common.label.password', defaultMessage: '密碼' },
    forgotPassword: { id: 'common.label.forgotPassord', defaultMessage: '忘記密碼？' },
    notMember: { id: 'common.label.notMember', defaultMessage: '還不是會員嗎？' },
    alreadyMember: { id: 'common.label.alreadyMember', defaultMessage: '已經是是會員嗎？' },
    goToLogin: { id: 'common.label.goToLogin', defaultMessage: '前往登入' },
    optional: { id: 'common.label.optional', defaultMessage: '非必填' },
    day: { id: 'common.label.day', defaultMessage: '天' },
    week: { id: 'common.label.week', defaultMessage: '週' },
    month: { id: 'common.label.month', defaultMessage: '月' },
    year: { id: 'common.label.year', defaultMessage: '年' },
    program: { id: 'common.label.program', defaultMessage: '單次課程' },
    programPlan: { id: 'common.label.programPlan', defaultMessage: '訂閱方案' },
    programContent: { id: 'common.label.programContent', defaultMessage: '課程內容' },
    card: { id: 'common.label.card', defaultMessage: '會員卡' },
    activityTicket: { id: 'common.label.activityTicket', defaultMessage: '實體活動' },
    merchandise: { id: 'common.label.merchandise', defaultMessage: '商品' },
    unknowProduct: { id: 'common.label.unknowProduct', defaultMessage: '未知類別' },
    cannotRecover: { id: 'common.label.cannotRecover', defaultMessage: '此動作無法復原' },
    sellingStatus: { id: 'common.label.sellingStatus', defaultMessage: '販售狀態' },
    periodType: { id: 'common.label.periodType', defaultMessage: '訂閱週期' },
    salePrice: { id: 'common.label.salePrice', defaultMessage: '優惠價' },
    salePriceEndTime: { id: 'common.label.salePriceEndTime', defaultMessage: '優惠截止日期' },
    account: { id: 'common.label.account', defaultMessage: '帳號' },
    avatar: { id: 'common.label.avatar', defaultMessage: '頭像' },
    name: { id: 'common.label.name', defaultMessage: '名稱' },
    creatorTitle: { id: 'common.label.creatorTitle', defaultMessage: '稱號' },
    speciality: { id: 'common.label.speciality', defaultMessage: '專長' },
    shortDescription: { id: 'common.label.meta', defaultMessage: '簡述' },
    introduction: { id: 'common.label.introduction', defaultMessage: '介紹' },
    video: { id: 'common.label.video', defaultMessage: '影片' },
    caption: { id: 'common.label.caption', defaultMessage: '字幕' },
    outdated: { id: 'common.label.outdated', defaultMessage: '已過期' },
    discountDownPrice: { id: 'common.label.discountDownPrice', defaultMessage: '首期折扣' },
    unavailableSelling: { id: 'common.label.unavailableSelling', defaultMessage: '暫不販售' },
    roleAdmin: { id: 'common.label.roleAdmin', defaultMessage: '身份管理' },
    totalPrice: { id: 'common.label.totalPrice', defaultMessage: '總金額' },
    orderLogId: { id: 'common.label.orderLogId', defaultMessage: '訂單編號' },
    orderLogDate: { id: 'common.label.orderLogDate', defaultMessage: '訂單日期' },
    orderLogPrice: { id: 'common.label.orderLogPrice', defaultMessage: '訂單金額' },
    orderLogStatus: { id: 'common.label.orderLogStatue', defaultMessage: '訂單狀態' },
    memberName: { id: 'common.label.memberName', defaultMessage: '姓名' },
  }),
  term: defineMessages({
    instructor: { id: 'common.term.instructor', defaultMessage: '老師' },
    price: { id: 'common.term.price', defaultMessage: '售價' },
    teachingAssistant: { id: 'common.term.teachingAssistant', defaultMessage: '助教' },
  }),
  text: defineMessages({
    shortDescriptionPlaceholder: { id: 'common.text.shortDescriptionPlaceholder', defaultMessage: '30 字以內' },
    dueDate: { id: 'common.text.dueDate', defaultMessage: '{date} 到期' },
    totalCount: { id: 'common.text.totalCount', defaultMessage: '共 {count} 筆' },
  }),
  event: defineMessages({
    successfullySaved: { id: 'common.event.successfullySaved', defaultMessage: '儲存成功' },
    loading: { id: 'common.event.loading', defaultMessage: '載入中' },
  }),
  status: defineMessages({
    orderSuccess: { id: 'common.status.orderSuccess', defaultMessage: '已完成' },
    orderUnpaid: { id: 'common.status.orderUnpaid', defaultMessage: '待付款' },
    orderRefund: { id: 'common.status.orderRefund', defaultMessage: '已退款' },
    orderFailed: { id: 'common.status.orderFailed', defaultMessage: '付款失敗' },
  }),
}

export const errorMessages = {
  data: defineMessages({
    fetch: { id: 'error.data.fetch', defaultMessage: '載入失敗' },
  }),
  route: defineMessages({
    notFound: { id: 'error.route.notFound', defaultMessage: '無此路徑' },
  }),
  form: defineMessages({
    isRequired: { id: 'error.form.isRequired', defaultMessage: '請輸入{field}' },
    accountNameOrEmail: { id: 'error.form.accountNameOrEmail', defaultMessage: '請輸入使用者名稱或 Email' },
    account: { id: 'error.form.account', defaultMessage: '請輸入使用者名稱' },
    emailFormat: { id: 'error.form.emailFormat', defaultMessage: 'Email 格式錯誤' },
    couponCodes: { id: 'error.form.codes', defaultMessage: '至少一組折扣碼' },
    issueContent: { id: 'error.form.issueContent', defaultMessage: '請輸入回覆內容' },
    selectInstructor: { id: 'error.form.selectInstructor', defaultMessage: '請輸入帳號 或 Email' },
    date: { id: 'error.form.date', defaultMessage: '請選擇日期' },
    voucherCodes: { id: 'error.form.voucherCodes', defaultMessage: '至少一組兌換碼' },
    exchangeItemsAmount: { id: 'error.form.exchangeItemsAmount', defaultMessage: '數量至少為 1' },
    exchangeItems: { id: 'error.form.exchangeItems', defaultMessage: '至少選一個兌換項目' },
  }),
  event: defineMessages({
    failedFacebookLogin: { id: 'error.event.failedFacebookLogin', defaultMessage: '無法從 Facebook 登入/註冊' },
    failedGoogleLogin: { id: 'error.event.failedGoogleLogin', defaultMessage: '無法從 Google 登入/註冊' },
  }),
}

export const activityMessages = {
  term: defineMessages({
    session: { id: 'activity.term.session', defaultMessage: '場次' },
    sessionTitle: { id: 'common.label.sessionTitle', defaultMessage: '場次名稱' },
    location: { id: 'activity.term.location', defaultMessage: '地址' },
    threshold: { id: 'activity.term.threshold', defaultMessage: '最少人數' },
    includingSessions: { id: 'activity.term.includingSessions', defaultMessage: '包含場次' },
    description: { id: 'activity.term.description', defaultMessage: '備註說明' },
    sellingTime: { id: 'activity.term.sellingTime', defaultMessage: '售票時間' },
    ticketPlan: { id: 'activity.term.ticketPlan', defaultMessage: '票券方案' },
    ticketPlanTitle: { id: 'activity.term.ticketPlanTitle', defaultMessage: '票券名稱' },
  }),
  ui: defineMessages({
    threshold: { id: 'activity.ui.threshold', defaultMessage: '最少' },
    createSession: { id: 'activity.ui.createSession', defaultMessage: '建立場次' },
    addTicketPlan: { id: 'activity.ui.addTicketPlan', defaultMessage: '加入票券方案' },
    createTicketPlan: { id: 'activity.ui.createTicketPlan', defaultMessage: '建立方案' },
  }),
}

export const appointmentMessages = {
  term: defineMessages({
    period: { id: 'appointment.term.period', defaultMessage: '時段' },
    planTitle: { id: 'appointment.term.planTitle', defaultMessage: '方案名稱' },
  }),
  status: defineMessages({
    finished: { id: 'appointment.status.finished', defaultMessage: '已結束' },
  }),
}

export const promotionMessages = {
  term: defineMessages({
    couponPlanTitle: { id: 'promotion.term.couponPlanTitle', defaultMessage: '折價方案名稱' },
    couponCode: { id: 'promotion.term.couponCode', defaultMessage: '折扣代碼' },
    voucherCode: { id: 'promotion.term.voucherCode', defaultMessage: '兌換代碼' },
    couponCodes: { id: 'promotion.term.couponCodes', defaultMessage: '折扣碼' },
    voucherCodes: { id: 'promotion.term.voucherCodes', defaultMessage: '兌換碼' },
    amount: { id: 'promotion.term.amount', defaultMessage: '數量' },
    discount: { id: 'promotion.term.discount', defaultMessage: '折抵額度' },
    description: { id: 'promotion.term.description', defaultMessage: '使用限制與描述' },
    priceType: { id: 'promotion.term.priceType', defaultMessage: '折扣金額' },
    ratioType: { id: 'promotion.term.ratioType', defaultMessage: '折扣比例' },
    dollar: { id: 'promotion.term.dollar', defaultMessage: '元' },
    voucherPlanTitle: { id: 'promotion.term.voucherPlanTitle', defaultMessage: '兌換方案名稱' },
  }),
  ui: defineMessages({
    editCouponPlan: { id: 'promotion.ui.editCouponPlan', defaultMessage: '編輯折價方案' },
    editVoucherPlan: { id: 'promotion.ui.editVoucherPlan', defaultMessage: '編輯兌換方案' },
    random: { id: 'promotion.ui.random', defaultMessage: '隨機' },
    custom: { id: 'promotion.ui.custom', defaultMessage: '自訂' },
    useNow: { id: 'promotion.ui.useNow', defaultMessage: '立即使用' },
    exchange: { id: 'promotion.ui.exchange', defaultMessage: '兌換' },
    addVoucher: { id: 'promotion.ui.addVoucher', defaultMessage: '新增兌換券' },
    createVoucherPlan: { id: 'promotion.ui.createVoucherPlan', defaultMessage: '建立兌換方案' },
  }),
  label: defineMessages({
    constraintAmount: { id: 'promotion.label.constraintAmount', defaultMessage: '消費滿 {amount} 折抵' },
    withoutConstraintAmount: { id: 'promotion.label.withoutConstraintAmount', defaultMessage: '直接折抵' },
    fromNow: { id: 'promotion.label.fromNow', defaultMessage: '即日起' },
    forever: { id: 'promotion.label.forever', defaultMessage: '無使用期限' },
    price: { id: 'promotion.label.price', defaultMessage: '金額 {amount} 元' },
    ratio: { id: 'promotion.label.ratio', defaultMessage: '比例 {amount}%' },
    constraint: { id: 'promotion.label.constraint', defaultMessage: '消費需達' },
    discountHelp: { id: 'promotion.label.disountHelp', defaultMessage: '折抵方式為比例時，額度範圍為 0 - 100Ｆ' },
    availableDateRange: { id: 'promotion.label.availableDateRange', defaultMessage: '有效期限' },
    unit: { id: 'promotion.label.unit', defaultMessage: '張' },
    create: { id: 'promotion.label.create', defaultMessage: '新增' },
  }),
  text: defineMessages({
    exchangeItemsNumber: { id: 'promotion.text.exchangeItemsNumber', defaultMessage: '可兌換 {number} 個項目' },
    exchangeNotation: {
      id: 'promotion.text.exchangeNotation',
      defaultMessage: '兌換券為一次使用後失效，請一次兌換完畢',
    },
    enterVoucherCode: { id: 'promotion.text.enterVoucherCode', defaultMessage: '輸入兌換碼' },
    exchangedCount: { id: 'promotion.text.exchangedCount', defaultMessage: '{exchanged}/{total} 張' },
  }),
  status: defineMessages({
    available: { id: 'promotion.status.available', defaultMessage: '可使用' },
    unavailable: { id: 'promotion.status.unavailable', defaultMessage: '已失效' },
  }),
}

export const membershipCardMessages = {
  label: defineMessages({
    selectMembershipCard: { id: 'membershipCard.label.selectMembershipCard', defaultMessage: '選擇會員卡' },
  }),
}

export const programMessages = {
  status: defineMessages({
    issueOpen: { id: 'program.status.issueOpen', defaultMessage: '解決中' },
    issueSolved: { id: 'program.status.issueSolved', defaultMessage: '已解決' },
  }),
  label: defineMessages({
    programTitle: { id: 'program.label.programTitle', defaultMessage: '課程名稱' },
    planTitle: { id: 'program.label.planTitle', defaultMessage: '方案名稱' },
    allProgram: { id: 'program.label.allProgram', defaultMessage: '全部課程' },
  }),
  text: defineMessages({
    enrolledSubscriptionCount: { id: 'program.text.enrolledCount', defaultMessage: '已訂閱 {count} 人' },
    enrolledPerpetualCount: { id: 'program.text.enrolledPerpetualCount', defaultMessage: '已售 {count} 人' },
  }),
}

export const podcastMessages = {
  ui: defineMessages({
    subscribe: { id: 'podcast.ui.subscribe', defaultMessage: '訂閱頻道' },
  }),
  status: defineMessages({
    published: { id: 'podcast.status.published', defaultMessage: '已發佈' },
    notPublished: { id: 'podcast.status.notPublished', defaultMessage: '未發佈' },
  }),
  label: defineMessages({
    status: { id: 'podcast.label.status', defaultMessage: '狀態' },
    salesCount: { id: 'podcast.label.salesCount', defaultMessage: '購買' },
  }),
  term: defineMessages({
    podcastPlan: { id: 'podcast.term.podcastPlan', defaultMessage: '廣播頻道訂閱方案' },
  }),
}

// { id: '', defaultMessage: '' },
