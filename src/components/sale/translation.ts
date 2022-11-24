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
  OrderDetailDrawer: defineMessages({
    orderDetail: { id: 'sale.OrderDetailDrawer.orderDetail', defaultMessage: '訂單詳情' },
    orderInfo: { id: 'sale.OrderDetailDrawer.orderInfo', defaultMessage: '訂單資訊' },
    otherInfo: { id: 'sale.OrderDetailDrawer.otherInfo', defaultMessage: '其他資訊' },
    invoiceInfo: { id: 'sale.OrderDetailDrawer.invoiceInfo', defaultMessage: '發票資訊' },
    paymentInfo: { id: 'sale.OrderDetailDrawer.paymentInfo', defaultMessage: '交易紀錄' },
  }),
  OrderCard: defineMessages({
    orderId: { id: 'sale.OrderCard.orderId', defaultMessage: '訂單編號' },
    orderCreatedAt: { id: 'sale.OrderCard.orderCreatedAt', defaultMessage: '訂單建立' },
    nameAndEmail: { id: 'sale.OrderCard.nameAndEmail', defaultMessage: '姓名 / Email' },
    totalPrice: { id: 'sale.OrderCard.totalPrice', defaultMessage: '訂單總額' },
    orderProductItem: { id: 'sale.OrderCard.orderProductItem', defaultMessage: '產品項目' },
    orderDiscountItem: { id: 'sale.OrderCard.orderDiscountItem', defaultMessage: '折抵項目' },
  }),
  OrderOtherInfoCard: defineMessages({
    country: { id: 'sale.OrderOtherInfoCard.country', defaultMessage: '國家' },
    orderLogExecutor: {
      id: 'sale.OrderOtherInfoCard.orderLogExecutor',
      defaultMessage: '承辦人與分潤',
    },
    referrer: { id: 'sale.OrderOtherInfoCard.referrer', defaultMessage: '推薦人' },
    sharingCode: { id: 'sale.OrderOtherInfoCard.sharingCode', defaultMessage: '推廣網址' },
    sharingNote: { id: 'sale.OrderOtherInfoCard.sharingNote', defaultMessage: '推廣用途' },
    giftPlan: { id: 'sale.OrderOtherInfoCard.giftPlan', defaultMessage: '贈品項目' },
    recipientName: { id: 'sale.OrderOtherInfoCard.recipientName', defaultMessage: '收件人' },
    recipientPhone: { id: 'sale.OrderOtherInfoCard.recipientPhone', defaultMessage: '收件電話' },
    recipientAddress: { id: 'sale.OrderOtherInfoCard.recipientAddress', defaultMessage: '收件地址' },
  }),
  InvoiceCard: defineMessages({
    invoiceStatus: { id: 'sale.InvoiceCard.invoiceStatus', defaultMessage: '發票狀態' },
    invoiceNumber: { id: 'sale.InvoiceCard.invoiceNumber', defaultMessage: '發票編號' },
    invoiceIssuedAt: { id: 'sale.InvoiceCard.invoiceIssuedAt', defaultMessage: '發票開立時間' },
    invoiceName: { id: 'sale.InvoiceCard.invoiceName', defaultMessage: '發票姓名' },
    invoicePhone: { id: 'sale.InvoiceCard.invoicePhone', defaultMessage: '發票電話' },
    invoiceEmail: { id: 'sale.InvoiceCard.invoiceEmail', defaultMessage: '聯絡信箱' },
    invoiceTarget: { id: 'sale.InvoiceCard.invoiceTarget', defaultMessage: '發票對象' },
    donationCode: { id: 'sale.InvoiceCard.donationCode', defaultMessage: '發票捐贈碼' },
    invoiceCarrier: { id: 'sale.InvoiceCard.invoiceCarrier', defaultMessage: '發票載具' },
    uniformNumber: { id: 'sale.InvoiceCard.uniformNumber', defaultMessage: '發票統編' },
    uniformTitle: { id: 'sale.InvoiceCard.uniformTitle', defaultMessage: '發票抬頭' },
    invoiceAddress: { id: 'sale.InvoiceCard.invoiceAddress', defaultMessage: '發票地址' },
    invoiceSuccess: { id: 'sale.InvoiceCard.invoiceSuccess', defaultMessage: '開立成功' },
    invoiceFailed: { id: 'sale.InvoiceCard.invoiceFailed', defaultMessage: '開立失敗 {errorCode}' },
    invoicePending: { id: 'sale.InvoiceCard.invoicePending', defaultMessage: '未開立電子發票' },
  }),
  PaymentCard: defineMessages({
    paymentStatus: { id: 'sale.PaymentCard.paymentStatus', defaultMessage: '交易狀態' },
    paidAt: { id: 'sale.PaymentCard.paidAt', defaultMessage: '付款時間' },
    paymentNo: { id: 'sale.PaymentCard.paymentNo', defaultMessage: '交易編號' },
    price: { id: 'sale.PaymentCard.price', defaultMessage: '金額' },
    gateway: { id: 'sale.PaymentCard.gateway', defaultMessage: '交易渠道' },
  }),
}

export default saleMessages
