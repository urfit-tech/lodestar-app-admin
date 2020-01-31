import { defineMessages } from 'react-intl'

export const commonMessages = defineMessages({
  uiComma: {
    id: 'common.ui.comma',
    defaultMessage: '、',
  },
  uiPrint: {
    id: 'common.ui.print',
    defaultMessage: '列印',
  },
  uiCreate: {
    id: 'common.ui.create',
    defaultMessage: '建立',
  },
  uiCancel: {
    id: 'common.ui.cancel',
    defaultMessage: '取消',
  },
  uiTitle: {
    id: 'common.ui.title',
    defaultMessage: '名稱',
  },
  uiCategory: {
    id: 'common.ui.category',
    defaultMessage: '類別',
  },
  uiStartedAt: {
    id: 'common.ui.started',
    defaultMessage: '開始時間',
  },
  uiEndedAt: {
    id: 'common.ui.endedAt',
    defaultMessage: '結束時間',
  },
  uiConfirm: {
    id: 'common.ui.confirm',
    defaultMessage: '確定',
  },
  uiEdit: {
    id: 'common.ui.edit',
    defaultMessage: '編輯',
  },
  uiListPrice: {
    id: 'common.ui.listPrice',
    defaultMessage: '定價',
  },

  warningTitle: {
    id: 'common.warning.title',
    defaultMessage: '請輸入名稱',
  },
  warningStartedAt: {
    id: 'common.warning.startedAt',
    defaultMessage: '請選擇開始時間',
  },
  warningEndedAt: {
    id: 'common.warning.endedAt',
    defaultMessage: '請選擇結束時間',
  },

  adminSelectInstructor: {
    id: 'common.admin.selectInstructor',
    defaultMessage: '選擇老師',
  },
})

export const errorMessages = defineMessages({
  dataFetching: {
    id: 'error.data.fetching',
    defaultMessage: '載入失敗',
  },
})

export const activityMessages = defineMessages({
  statusHolding: {
    id: 'activity.status.holding',
    defaultMessage: '正在舉辦',
  },
  statusFinished: {
    id: 'activity.status.finished',
    defaultMessage: '已結束',
  },
  statusDraft: {
    id: 'activity.status.draft',
    defaultMessage: '未上架',
  },
  statusPreSale: {
    id: 'activity.status.preSale',
    defaultMessage: '尚未販售',
  },
  statusSoldOut: {
    id: 'activity.status.soldOut',
    defaultMessage: '已售完',
  },
  statusClosed: {
    id: 'activity.status.closed',
    defaultMessage: '已截止',
  },
  statusSelling: {
    id: 'activity.status.selling',
    defaultMessage: '販售中',
  },
  statusAboutToStart: {
    id: 'activity.status.aboutToStart',
    defaultMessage: '即將舉行',
  },
  statusStarted: {
    id: 'activity.status.started',
    defaultMessage: '活動開始',
  },

  uiParticipantsList: {
    id: 'activity.ui.participantsList',
    defaultMessage: '參與名單',
  },
  uiDownloadParticipantsList: {
    id: 'activity.ui.downloadParticipantsList',
    defaultMessage: '下載名單',
  },
  uiSession: {
    id: 'activity.ui.session',
    defaultMessage: '場次',
  },
  uiTicketPlan: {
    id: 'activity.ui.ticketPlan',
    defaultMessage: '票券方案',
  },
  uiThreshold: {
    id: 'activity.ui.threshold',
    defaultMessage: '最少',
  },
  uiCreateSession: {
    id: 'activity.ui.createSession',
    defaultMessage: '建立場次',
  },
  uiCreateTicketPlan: {
    id: 'activity.ui.createTicketPlan',
    defaultMessage: '建立方案',
  },
  uiAddTicketPlan: {
    id: 'activity.ui.addTicketPlan',
    defaultMessage: '加入票券方案',
  },
  uiSelectSession: {
    id: 'activity.ui.selectSession',
    defaultMessage: '選擇場次',
  },

  warningLocation: {
    id: 'activity.warning.location',
    defaultMessage: '請輸入地址',
  },
  warningTicketTitle: {
    id: 'activity.warning.ticketTitle',
    defaultMessage: '請輸入票券名稱',
  },

  sessionTitle: {
    id: 'activity.session.title',
    defaultMessage: '場次名稱',
  },
  sessionLocation: {
    id: 'activity.session.location',
    defaultMessage: '地址',
  },
  sessionThreshold: {
    id: 'activity.session.threshold',
    defaultMessage: '最少人數',
  },

  ticketIncludedSessions: {
    id: 'activity.ticket.includedSessions',
    defaultMessage: '包含場次',
  },
  ticketDescription: {
    id: 'activity.ticket.description',
    defaultMessage: '備註說明',
  },
  ticketSellingRange: {
    id: 'activity.ticket.sellingRage',
    defaultMessage: '售票時間',
  },
  ticketTitle: {
    id: 'activity.ticket.title',
    defaultMessage: '票券名稱',
  },
  ticketPublishedOrNot: {
    id: 'activity.ticket.publishedOrNot',
    defaultMessage: '是否開賣',
  },
  ticketIsPublished: {
    id: 'activity.ticket.isPublished',
    defaultMessage: '發售，活動上架後立即開賣',
  },
  ticketNotPublished: {
    id: 'activity.ticket.notPublished',
    defaultMessage: '停售，該票券暫停對外銷售，並從購票頁中隱藏',
  },
  ticketStartedAt: {
    id: 'activity.ticket.startedAt',
    defaultMessage: '售票開始時間',
  },
  ticketEndedAt: {
    id: 'activity.ticket.endedAt',
    defaultMessage: '售票結束時間',
  },
  ticketCount: {
    id: 'activity.ticket.count',
    defaultMessage: '張數限制',
  },

  eventCreateSuccessfully: {
    id: 'activity.event.createSuccessfully',
    defaultMessage: '成功建立活動',
  },
  eventCreateFailed: {
    id: 'activity.event.createFailed',
    defaultMessage: '建立活動失敗',
  },
})
