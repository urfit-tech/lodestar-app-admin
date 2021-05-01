import { defineMessages } from 'react-intl'

export const memberContractMessages = {
  menu: defineMessages({
    memberContracts: { id: 'common.menu.memberContracts', defaultMessage: '合約資料管理' },
  }),
  ui: defineMessages({
    join: { id: 'memberContract.ui.join', defaultMessage: '加入' },
    downloadProofOfEnrollment: { id: 'memberContract.ui.downloadProofOfEnrollment', defaultMessage: '下載證明' },
    reupload: { id: 'memberContract.reupload', defaultMessage: '重新上傳' },
  }),
  label: defineMessages({
    agreedAt: { id: 'memberContract.label.agreedAt', defaultMessage: '簽署日期' },
    revokedAt: { id: 'memberContract.label.revokedAt', defaultMessage: '解約日期' },
    status: { id: 'memberContract.label.status', defaultMessage: '狀態' },
    serviceStartedAt: { id: 'memberContract.label.serviceStartedAt', defaultMessage: '服務開始' },
    contractCreator: { id: 'memberContract.label.contractCreator', defaultMessage: '合約建立者' },

    studentName: { id: 'memberContract.label.studentName', defaultMessage: '學員姓名' },
    product: { id: 'memberContract.label.product', defaultMessage: '產品' },
    paymentMethod: { id: 'memberContract.label.paymentMethod', defaultMessage: '付款方式' },
    remarks: { id: 'memberContract.label.remarks', defaultMessage: '備註' },
    revenueShare: { id: 'memberContract.label.remarks', defaultMessage: '業務分潤' },

    proofOfEnrollment: { id: 'memberContract.label.proofOfEnrollment', defaultMessage: '學生證明' },
    agreed: { id: 'memberContract.label.agreed', defaultMessage: '已簽約' },
    revoked: { id: 'memberContract.label.revoked', defaultMessage: '已解約' },
    memberContract: { id: 'memberContract.label.memberContract', defaultMessage: '合約資料' },
    memberContractId: { id: 'memberContract.label.memberContractId', defaultMessage: '合約編號' },

    purchasedItem: { id: 'memberContract.label.purchasedItemId', defaultMessage: '購買項目' },
    appointmentCreator: { id: 'memberContract.label.appointmentCreator', defaultMessage: '指定業師' },
    referralMember: { id: 'memberContract.label.referralMember', defaultMessage: '推薦人' },
    servicePeriod: { id: 'memberContract.label.servicePeriod', defaultMessage: '服務期間' },
    approvedAt: { id: 'memberContract.label.approvedAt', defaultMessage: '審核通過日期' },

    approvedApprovalAt: { id: 'memberContract.label.approvedApprovalAt', defaultMessage: '核准時間' },
    loanCancelAt: { id: 'memberContract.label.loanCancelAt', defaultMessage: '取消日期' },
    refundApply: { id: 'memberContract.label.refundApply', defaultMessage: '提出退費' },
    refundApplyAt: { id: 'memberContract.label.refundApplyAt', defaultMessage: '提出退費日期' },
    payment: { id: 'memberContract.label.payment', defaultMessage: '付款' },

    installmentPlan: { id: 'memberContract.label.installmentPlan', defaultMessage: '期數' },
    paymentNumber: { id: 'memberContract.label.paymentNumber', defaultMessage: '金流編號' },
    note: { id: 'memberContract.label.note', defaultMessage: '備註' },
    executors: { id: 'memberContract.label.executors', defaultMessage: '承辦人' },
    appointment: { id: 'memberContract.label.appointment', defaultMessage: '諮詢' },

    price: { id: 'memberContract.label.price', defaultMessage: '金額' },
    coins: { id: 'memberContract.label.coins', defaultMessage: '代幣' },
  }),
  status: defineMessages({
    all: { id: 'memberContract.status.all', defaultMessage: '所有狀態' },
    applyRefund: { id: 'memberContract.status.applyRefund', defaultMessage: '提出退費' },
    pendingApproval: { id: 'memberContract.status.pendingApproval', defaultMessage: '審核中' },
    approvedApproval: { id: 'memberContract.status.approvedApproval', defaultMessage: '審核通過' },
    contractTermination: { id: 'memberContract.status.contractTermination', defaultMessage: '解約' },
  }),
}

export const salesMessages = {
  label: defineMessages({
    salesCall: { id: 'sales.label.salesCall', defaultMessage: '業務撥打' },
    salesStatus: { id: 'sales.label.salesStatus', defaultMessage: '業務狀況' },
    autoStartCalls: { id: 'sales.label.autoStartCalls', defaultMessage: '自動撥號' },
    potentials: { id: 'sales.label.potentials', defaultMessage: '待開發' },
    keepInTouch: { id: 'sales.label.keepInTouch', defaultMessage: '開發中' },
    deals: { id: 'sales.label.deals', defaultMessage: '已成交' },
    revoked: { id: 'sales.label.revoked', defaultMessage: '已退款' },
    rejected: { id: 'sales.label.rejected', defaultMessage: '已拒絕' },
    studentName: { id: 'sales.label.studentName', defaultMessage: '學員姓名' },
    tel: { id: 'sales.label.tel', defaultMessage: '電話' },
    lastContactAt: { id: 'sales.label.lastContactAt', defaultMessage: '最近聯繫時間' },
    lastTask: { id: 'sales.label.lastTask', defaultMessage: '最近待辦' },
    serviceEndedAt: { id: 'sales.label.serviceEndedAt', defaultMessage: '服務截止時間' },
    productItem: { id: 'sales.label.productItem', defaultMessage: '產品項目' },
  }),
}
