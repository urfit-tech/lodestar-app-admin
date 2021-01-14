import { defineMessages } from 'react-intl'

export const memberContractMessages = {
  menu: defineMessages({
    memberContracts: { id: 'common.menu.memberContracts', defaultMessage: '合約資料管理' },
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

    loanCancelAt: { id: 'memberContract.label.loanCancelAt', defaultMessage: '取消日期' },
    refundApplyAt: { id: 'memberContract.label.refundApplyAt', defaultMessage: '提出退費日期' },
    payment: { id: 'memberContract.label.payment', defaultMessage: '付款' },
    installmentPlan: { id: 'memberContract.label.installmentPlan', defaultMessage: '期數' },
    paymentNumber: { id: 'memberContract.label.paymentNumber', defaultMessage: '金流編號' },
    
    note: { id: 'memberContract.label.note', defaultMessage: '備註' },
    executors: { id: 'memberContract.label.executors', defaultMessage: '承辦人' },
  }),
  status: defineMessages({
    applyRefund: { id: 'memberContract.status.applyRefund', defaultMessage: '提出退費' },
    pendingApproval: { id: 'memberContract.status.pendingApproval', defaultMessage: '審核中' },
    approvedApproval: { id: 'memberContract.status.approvedApproval', defaultMessage: '審核通過' },
  }),
}
