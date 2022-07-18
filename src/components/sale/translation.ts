import { defineMessages } from 'react-intl'

const saleMessages = {
  '*': defineMessages({}),
  SaleCollectionAdminCard: defineMessages({
    openEquity: { id: 'sale.SaleCollectionAdminCard.openEquity', defaultMessage: '開通權益' },
    removeEquity: { id: 'sale.SaleCollectionAdminCard.removeEquity', defaultMessage: '移除權益' },
    remove: { id: 'sale.SaleCollectionAdminCard.remove', defaultMessage: '移除' },
    open: { id: 'sale.SaleCollectionAdminCard.open', defaultMessage: '開通' },
    cancel: { id: 'sale.SaleCollectionAdminCard.cancel', defaultMessage: '取消' },
    updateEquitySuccessfully: {
      id: 'sale.SaleCollectionAdminCard.updateEquitySuccessfully',
      defaultMessage: '權益異動成功',
    },
    deliver: { id: 'sale.SaleCollectionAdminCard.deliver', defaultMessage: '交付' },
    removeEquityWarning: {
      id: 'sale.SaleCollectionAdminCard.removeEquityWarning',
      defaultMessage: '此操作將移除 {productName} 的使用權益，確定要移除嗎？',
    },
    openEquityWarning: {
      id: 'sale.SaleCollectionAdminCard.openEquityWarning',
      defaultMessage: '此操作將開通 {productName} 的使用權益，確定要開通嗎？',
    },
  }),
}

export default saleMessages
