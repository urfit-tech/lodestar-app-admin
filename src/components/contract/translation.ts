import { defineMessages } from 'react-intl'

const contractMessages = {
  '*': defineMessages({
    product: { id: 'contract.*.product', defaultMessage: 'Product' },
    coin: { id: 'contract.*.coin', defaultMessage: 'Coin' },
    coupon: { id: 'contract.*.coupon', defaultMessage: 'Coupon' },
  }),
  MemberContractInfoModal: defineMessages({
    viewProduct: { id: 'contract.MemberContractInfoModal.viewProduct', defaultMessage: 'view product' },
    startedAt: { id: 'contract.MemberContractInfoModal.startedAt', defaultMessage: 'started at' },
    endedAt: { id: 'contract.MemberContractInfoModal.endedAt', defaultMessage: 'ended at' },
    totalPrice: { id: 'contract.MemberContractInfoModal.totalPrice', defaultMessage: 'total price' },
    productItems: { id: 'contract.MemberContractInfoModal.productItems', defaultMessage: 'product items' },
  }),
}

export default contractMessages
