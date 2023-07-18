import { defineMessages } from 'react-intl'

const voucherMessages = {
  '*': defineMessages({
    cancel: { id: 'voucher.*.cancel', defaultMessage: '取消' },
    confirm: { id: 'voucher.*.confirm', defaultMessage: '確定' },
    isRequired: { id: 'voucher.*.isRequired', defaultMessage: '請輸入{field}' },
  }),
  VoucherPlanCard: defineMessages({
    fromNow: { id: 'voucher.VoucherPlanCard.fromNow', defaultMessage: '即日起' },
    forever: { id: 'voucher.VoucherPlanCard.forever', defaultMessage: '無使用期限' },
    exchangeItemsNumber: {
      id: 'voucher.VoucherPlanCard.exchangeItemsNumber',
      defaultMessage: '可兌換 {number} 個項目',
    },
    exchangedCount: {
      id: 'voucher.VoucherPlanCard.exchangedCount',
      defaultMessage: '{exchanged}/{total} 張',
    },
    pinCode: {
      id: 'voucher.VoucherPlanCard.pinCode',
      defaultMessage: 'PIN碼：{pinCode}',
    },
  }),
  VoucherPlanAdminModal: defineMessages({
    voucherCodes: { id: 'voucher.VoucherPlanAdminModal.voucherCodes', defaultMessage: '兌換碼' },
    voucherCategory: { id: 'voucher.VoucherPlanAdminModal.VoucherCategory', defaultMessage: '兌換分類' },
    errorVoucherCodes: {
      id: 'voucher.VoucherPlanAdminModal.errorVoucherCodes',
      defaultMessage: '至少一組兌換碼',
    },
    voucherPlanTitle: {
      id: 'voucher.VoucherPlanAdminModal.voucherPlanTitle',
      defaultMessage: '兌換方案名稱',
    },
    exchangeItemsAmount: {
      id: 'voucher.VoucherPlanAdminModal.exchangeItemsAmount',
      defaultMessage: '兌換項目數量',
    },
    errorExchangeItemsAmount: {
      id: 'voucher.VoucherPlanAdminModal.errorExchangeItemsAmount',
      defaultMessage: '數量至少為 1',
    },
    exchangeItems: {
      id: 'voucher.VoucherPlanAdminModal.exchangeItems',
      defaultMessage: '兌換項目',
    },
    errorExchangeItems: {
      id: 'voucher.VoucherPlanAdminModal.errorExchangeItems',
      defaultMessage: '至少選一個兌換項目',
    },
    isTransferable: {
      id: 'voucher.VoucherPlanAdminModal.isTransferable',
      defaultMessage: '允許用戶自行轉贈',
    },
    isSaleable: {
      id: 'voucher.VoucherPlanAdminModal.isSaleable',
      defaultMessage: '可銷售（每份）',
    },
    successfullySaved: {
      id: 'voucher.VoucherPlanAdminModal.successfullySaved',
      defaultMessage: '儲存成功',
    },
    successfullyCreated: {
      id: 'voucher.VoucherPlanAdminModal.successfullyCreated',
      defaultMessage: '建立成功',
    },
    duplicateVoucherCode: {
      id: 'voucher.VoucherPlanAdminModal.duplicateVoucherCode',
      defaultMessage: '該兌換碼已被使用',
    },
    availableDateRange: {
      id: 'voucher.VoucherPlanAdminModal.availableDateRange',
      defaultMessage: '有效期限',
    },
    startedAt: { id: 'voucher.VoucherPlanAdminModal.startedAt', defaultMessage: '開始時間' },
    endedAt: { id: 'voucher.VoucherPlanAdminModal.endedAt', defaultMessage: '結束時間' },
    description: {
      id: 'voucher.VoucherPlanAdminModal.description',
      defaultMessage: '使用限制與描述',
    },
    optional: { id: 'voucher.VoucherPlanAdminModal.optional', defaultMessage: '非必填' },
    exchangePinCode: {
      id: 'voucher.VoucherPlanAdminModal.exchangePinCode',
      defaultMessage: '需使用 PIN 碼兌換',
    },
    pinCodePlaceholder: {
      id: 'voucher.VoucherPlanAdminModal.pinCodePlaceholder',
      defaultMessage: '請設定 4 - 6 碼數字',
    },
  }),
}

export default voucherMessages
