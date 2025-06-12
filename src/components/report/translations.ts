import { defineMessages } from 'react-intl'

export const reportMessages = {
  ReportAdminModal: defineMessages({
    cancel: { id: 'reportMessages.ReportAdminModal.cancel', defaultMessage: '取消' },
    confirm: { id: 'reportMessages.ReportAdminModal.confirm', defaultMessage: '確定' },
    title: { id: 'reportMessages.ReportAdminModal.title', defaultMessage: '報表名稱' },
    type: { id: 'reportMessages.ReportAdminModal.type', defaultMessage: '報表種類' },
    setting: { id: 'reportMessages.ReportAdminModal.setting', defaultMessage: '報表設定' },
    viewingPermission: { id: 'reportMessages.ReportAdminModal.viewingPermission', defaultMessage: '觀看權限' },
    canViewSelfDataOnly: {
      id: 'reportMessages.ReportAdminModal.canViewSelfDataOnly',
      defaultMessage: 'Only can view Self Data',
    },
    canViewGroupDataOnly: {
      id: 'reportMessages.ReportAdminModal.canViewGroupDataOnly',
      defaultMessage: 'Only can view Group Data',
    },
    existReport: { id: 'reportMessages.ReportAdminModal.existReport', defaultMessage: '已存在相同報表' },
    embedSingleReport: {
      id: 'reportMessages.ReportAdminModal.embedSingleReport',
      defaultMessage: '嵌入單一報表',
    },
    embedDashboard: {
      id: 'reportMessages.ReportAdminModal.embedDashboard',
      defaultMessage: '嵌入儀表板',
    },
  }),
}
