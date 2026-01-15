import { defineMessages } from 'react-intl'

const voucherMessages = {
  '*': defineMessages({
    cancel: { id: 'voucher.*.cancel', defaultMessage: 'Cancel' },
    confirm: { id: 'voucher.*.confirm', defaultMessage: 'Confirm' },
    isRequired: { id: 'voucher.*.isRequired', defaultMessage: 'Please enter {field}' },
  }),
  VoucherPlanCard: defineMessages({
    fromNow: { id: 'voucher.VoucherPlanCard.fromNow', defaultMessage: 'From now' },
    forever: { id: 'voucher.VoucherPlanCard.forever', defaultMessage: 'No expiration' },
    exchangeItemsNumber: {
      id: 'voucher.VoucherPlanCard.exchangeItemsNumber',
      defaultMessage: 'Can exchange {number} items',
    },
    exchangedCount: {
      id: 'voucher.VoucherPlanCard.exchangedCount',
      defaultMessage: '{exchanged}/{total} vouchers',
    },
    pinCode: {
      id: 'voucher.VoucherPlanCard.pinCode',
      defaultMessage: 'PIN code: {pinCode}',
    },
  }),
  VoucherPlanAdminModal: defineMessages({
    amount: {
      id: 'voucher.VoucherPlanAdminModal.amount',
      defaultMessage: 'vouchers',
    },
    price: {
      id: 'voucher.VoucherPlanAdminModal.price',
      defaultMessage: 'dollar',
    },
    voucherCodes: { id: 'voucher.VoucherPlanAdminModal.voucherCodes', defaultMessage: 'Voucher codes' },
    voucherCategory: { id: 'voucher.VoucherPlanAdminModal.VoucherCategory', defaultMessage: 'Voucher category' },
    errorVoucherCodes: {
      id: 'voucher.VoucherPlanAdminModal.errorVoucherCodes',
      defaultMessage: 'At least one voucher code',
    },
    voucherPlanTitle: {
      id: 'voucher.VoucherPlanAdminModal.voucherPlanTitle',
      defaultMessage: 'Voucher plan name',
    },
    exchangeItemsAmount: {
      id: 'voucher.VoucherPlanAdminModal.exchangeItemsAmount',
      defaultMessage: 'Exchange items amount',
    },
    errorExchangeItemsAmount: {
      id: 'voucher.VoucherPlanAdminModal.errorExchangeItemsAmount',
      defaultMessage: 'Amount must be at least 1',
    },
    exchangeItems: {
      id: 'voucher.VoucherPlanAdminModal.exchangeItems',
      defaultMessage: 'Exchange items',
    },
    errorExchangeItems: {
      id: 'voucher.VoucherPlanAdminModal.errorExchangeItems',
      defaultMessage: 'Select at least one exchange item',
    },
    isTransferable: {
      id: 'voucher.VoucherPlanAdminModal.isTransferable',
      defaultMessage: 'Allow users to transfer',
    },
    isSaleable: {
      id: 'voucher.VoucherPlanAdminModal.isSaleable',
      defaultMessage: 'Saleable (per unit)',
    },
    successfullySaved: {
      id: 'voucher.VoucherPlanAdminModal.successfullySaved',
      defaultMessage: 'Saved successfully',
    },
    successfullyCreated: {
      id: 'voucher.VoucherPlanAdminModal.successfullyCreated',
      defaultMessage: 'Created successfully',
    },
    duplicateVoucherCode: {
      id: 'voucher.VoucherPlanAdminModal.duplicateVoucherCode',
      defaultMessage: 'This voucher code has been used',
    },
    availableDateRange: {
      id: 'voucher.VoucherPlanAdminModal.availableDateRange',
      defaultMessage: 'Validity period',
    },
    startedAt: { id: 'voucher.VoucherPlanAdminModal.startedAt', defaultMessage: 'Start time' },
    endedAt: { id: 'voucher.VoucherPlanAdminModal.endedAt', defaultMessage: 'End time' },
    description: {
      id: 'voucher.VoucherPlanAdminModal.description',
      defaultMessage: 'Usage restrictions and description',
    },
    optional: { id: 'voucher.VoucherPlanAdminModal.optional', defaultMessage: 'Optional' },
    exchangePinCode: {
      id: 'voucher.VoucherPlanAdminModal.exchangePinCode',
      defaultMessage: 'Require PIN code to exchange',
    },
    pinCodePlaceholder: {
      id: 'voucher.VoucherPlanAdminModal.pinCodePlaceholder',
      defaultMessage: 'Please set 4-6 digit number',
    },
    exchangeBonusCoins: {
      id: 'voucher.VoucherPlanAdminModal.exchangeBonusCoins',
      defaultMessage: 'Bonus coins after exchange',
    },
    bonusCoinAmount: {
      id: 'voucher.VoucherPlanAdminModal.bonusCoinAmount',
      defaultMessage: 'Bonus amount',
    },
    bonusCoinsEndedAt: {
      id: 'voucher.VoucherPlanAdminModal.bonusCoinsEndedAt',
      defaultMessage: 'Validity period',
    },
    bonusCoinsPlaceholder: {
      id: 'voucher.VoucherPlanAdminModal.bonusCoinsPlaceholder',
      defaultMessage: 'Bonus coins cannot be 0',
    },
  }),
}

export default voucherMessages
