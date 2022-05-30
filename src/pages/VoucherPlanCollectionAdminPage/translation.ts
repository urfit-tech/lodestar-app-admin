import { defineMessages } from 'react-intl'

const VoucherPlanCollectionAdminPageMessages = {
  '*': defineMessages({
    cancel: { id: 'VoucherPlanCollectionAdminPage.*.cancel', defaultMessage: '取消' },
    confirm: { id: 'VoucherPlanCollectionAdminPage.*.confirm', defaultMessage: '確定' },
    isRequired: { id: 'VoucherPlanCollectionAdminPage.*.isRequired', defaultMessage: '請輸入{field}' },
    create: { id: 'VoucherPlanCollectionAdminPage.*.create', defaultMessage: '建立' },
    available: { id: 'VoucherPlanCollectionAdminPage.*.available', defaultMessage: '可使用' },
    unavailable: { id: 'VoucherPlanCollectionAdminPage.*.unavailable', defaultMessage: '已失效' },
    vouchers: { id: 'VoucherPlanCollectionAdminPage.*.voucherPlans', defaultMessage: '兌換方案' },
    createVoucherPlan: { id: 'VoucherPlanCollectionAdminPage.*.createVoucherPlan', defaultMessage: '建立兌換方案' },
  }),
  VoucherPlanCollectionBlock: defineMessages({
    edit: { id: 'VoucherPlanCollectionAdminPage.VoucherPlanCollectionBlock.edit', defaultMessage: '編輯' },
    fetch: { id: 'VoucherPlanCollectionAdminPage.VoucherPlanCollectionBlock.fetch', defaultMessage: '讀取錯誤' },
    showMore: { id: 'VoucherPlanCollectionAdminPage.VoucherPlanCollectionBlock.showMore', defaultMessage: '顯示更多' },
    editVoucherPlan: {
      id: 'VoucherPlanCollectionAdminPage.VoucherPlanCollectionBlock.ditVoucherPlan',
      defaultMessage: '編輯兌換方案',
    },
  }),
  VoucherPlanAdminModal: defineMessages({
    voucherCodes: { id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.voucherCodes', defaultMessage: '兌換碼' },
    errorVoucherCodes: {
      id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.errorVoucherCodes',
      defaultMessage: '至少一組兌換碼',
    },
    voucherPlanTitle: {
      id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.voucherPlanTitle',
      defaultMessage: '兌換方案名稱',
    },
    exchangeItemsAmount: {
      id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.exchangeItemsAmount',
      defaultMessage: '兌換項目數量',
    },
    errorExchangeItemsAmount: {
      id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.errorExchangeItemsAmount',
      defaultMessage: '數量至少為 1',
    },
    exchangeItems: {
      id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.exchangeItems',
      defaultMessage: '兌換項目',
    },
    errorExchangeItems: {
      id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.exchangeItems',
      defaultMessage: '至少選一個兌換項目',
    },
    isTransferable: {
      id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.isTransferable',
      defaultMessage: '允許用戶自行轉贈',
    },
    isSaleable: {
      id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.isSaleable',
      defaultMessage: '可銷售（每份）',
    },
    successfullySaved: {
      id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.successfullySaved',
      defaultMessage: '儲存成功',
    },
    successfullyCreated: {
      id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.successfullyCreated',
      defaultMessage: '建立成功',
    },
    duplicateVoucherCode: {
      id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.duplicateVoucherCode',
      defaultMessage: '該兌換碼已被使用',
    },
    availableDateRange: {
      id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.availableDateRange',
      defaultMessage: '有效期限',
    },
    startedAt: { id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.startedAt', defaultMessage: '開始時間' },
    endedAt: { id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.endedAt', defaultMessage: '結束時間' },
    description: {
      id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.description',
      defaultMessage: '使用限制與描述',
    },
    optional: { id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.optional', defaultMessage: '非必填' },
    fromNow: { id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.fromNow', defaultMessage: '即日起' },
    forever: { id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.forever', defaultMessage: '無使用期限' },
    exchangeItemsNumber: {
      id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.exchangeItemsNumber',
      defaultMessage: '可兌換 {number} 個項目',
    },
    exchangedCount: {
      id: 'VoucherPlanCollectionAdminPage.VoucherPlanAdminModal.exchangedCount',
      defaultMessage: '{exchanged}/{total} 張',
    },
  }),
}
export default VoucherPlanCollectionAdminPageMessages
