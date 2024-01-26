import { defineMessages } from 'react-intl'

export const salesLeadDeliveryPageMessages = {
  salesLeadDeliveryPage: defineMessages({
    salesLeadDelivery: { id: 'page.salesLeadDeliveryPage.salesLeadDelivery', defaultMessage: '名單派發' },
    filterSalesLead: { id: 'page.salesLeadDeliveryPage.filterSalesLead', defaultMessage: '篩選名單' },
    deliveryConfirm: { id: 'page.salesLeadDeliveryPage.deliveryConfirm', defaultMessage: '確認派發' },
    deliveryResult: { id: 'page.salesLeadDeliveryPage.deliveryResult', defaultMessage: '派發結果' },
    originalManager: { id: 'page.salesLeadDeliveryPage.originalManager', defaultMessage: '原承辦人' },
    field: { id: 'page.salesLeadDeliveryPage.field', defaultMessage: '領域' },
    starRangeIsNull: { id: 'page.salesLeadDeliveryPage.starRangeIsNull', defaultMessage: '沒有星等的人' },
    starRange: { id: 'page.salesLeadDeliveryPage.starRange', defaultMessage: '星等' },
    notCalled: { id: 'page.salesLeadDeliveryPage.notCalled', defaultMessage: '無撥打紀錄' },
    notAnswered: { id: 'page.salesLeadDeliveryPage.notAnswered', defaultMessage: '無接通紀錄' },
    marketingActivity: { id: 'page.salesLeadDeliveryPage.marketingActivity', defaultMessage: '行銷活動' },
    adMaterials: { id: 'page.salesLeadDeliveryPage.adMaterials', defaultMessage: '廣告素材' },
    createdAtRange: { id: 'page.salesLeadDeliveryPage.createdAtRange', defaultMessage: '名單建立日期' },
    assignedAtRange: { id: 'page.salesLeadDeliveryPage.assignedAtRange', defaultMessage: '名單派發日期' },
    nextStep: { id: 'page.salesLeadDeliveryPage.nextStep', defaultMessage: '下一步' },
    expectedDeliveryAmount: {
      id: 'page.salesLeadDeliveryPage.expectedDeliveryAmount',
      defaultMessage: '預計派發名單數',
    },
    deliverSalesLead: { id: 'page.salesLeadDeliveryPage.deliverSalesLead', defaultMessage: '派發名單' },
    deliverSuccessfully: { id: 'page.salesLeadDeliveryPage.deliverSuccessfully', defaultMessage: '派發名單成功' },
    deliverFailed: { id: 'page.salesLeadDeliveryPage.deliverFailed', defaultMessage: '名單派發失敗' },
    delivering: { id: 'page.salesLeadDeliveryPage.delivering', defaultMessage: '派發名單中' },
    deliveredCount: { id: 'page.salesLeadDeliveryPage.deliveredCount', defaultMessage: '已派發 {count} 筆名單' },
    deliveringMessage: { id: 'page.salesLeadDeliveryPage.deliveringMessage', defaultMessage: '正在派發名單中，請稍等' },
    deliverAgain: { id: 'page.salesLeadDeliveryPage.deliverAgain', defaultMessage: '再次派發' },
    exactMatch: { id: 'page.salesLeadDeliveryPage.exactMatch', defaultMessage: '完全匹配' },
    lastCalledRange: { id: 'page.salesLeadDeliveryPage.lastCalledRange', defaultMessage: '上次撥打日期' },
    lastAnsweredRange: { id: 'page.salesLeadDeliveryPage.lastContactRange', defaultMessage: '上次接通日期' },
    completedLead: {
      id: 'page.salesLeadDeliveryPage.completedLead',
      defaultMessage: 'completed lead ',
    },
    closedLead: { id: 'page.salesLeadDeliveryPage.closedLead', defaultMessage: 'closed Lead ' },
    recycledLead: { id: 'page.salesLeadDeliveryPage.recycledLead', defaultMessage: 'recycled Lead ' },
    contained: { id: 'page.salesLeadDeliveryPage.contained', defaultMessage: 'contained ' },
    onlyFilter: { id: 'page.salesLeadDeliveryPage.onlyFilter', defaultMessage: 'only filter ' },
    excluded: { id: 'page.salesLeadDeliveryPage.excluded', defaultMessage: 'excluded ' },
    closedRange: { id: 'page.salesLeadDeliveryPage.closedRange', defaultMessage: 'closed date range' },
  }),
  salesLeadLimitConfirmationModelPage: defineMessages({
    exceededLimitTitle: {
      id: 'page.salesLeadDeliveryPage.exceededLimitTitle',
      defaultMessage: '已超出名單上限',
    },
    dispatchTargetInfo: {
      id: 'page.salesLeadDeliveryPage.dispatchTargetInfo',
      defaultMessage: '派發對象 {managerName}（{managerEmail}），目前已持有 {currentHoldingsCount} 筆名單',
    },
    dispatchConfirmation: {
      id: 'page.salesLeadDeliveryPage.dispatchConfirmation',
      defaultMessage: '你預計再派發 {anticipatedDispatchCount} 筆名單給他，派發後將會超出上限數量，總計達到 {totalAfterDispatch} 筆，確定要派發嗎？',
    },
    dispatchButton: {
      id: 'page.salesLeadDeliveryPage.dispatchButton',
      defaultMessage: '派發',
    },
    backButton: {
      id: 'page.salesLeadDeliveryPage.backButton',
      defaultMessage: '返回',
    },
  })
}
