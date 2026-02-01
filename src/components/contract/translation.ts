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
  MemberContractHistoryModal: defineMessages({
    history: { id: 'contract.ui.history', defaultMessage: '歷史紀錄' },
    snapshotAt: { id: 'contract.ui.snapshotAt', defaultMessage: '快照時間' },
    changedBy: { id: 'contract.ui.changedBy', defaultMessage: '變更者' },
    startedAt: { id: 'contract.ui.startedAt', defaultMessage: '開始時間' },
    endedAt: { id: 'contract.ui.endedAt', defaultMessage: '結束時間' },
    price: { id: 'contract.ui.price', defaultMessage: '價格' },
    productCount: { id: 'contract.ui.productCount', defaultMessage: '產品數量' },
    noHistory: { id: 'contract.text.noHistory', defaultMessage: '尚無歷史紀錄' },
  }),
}

export default contractMessages
