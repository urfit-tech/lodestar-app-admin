import { defineMessages } from 'react-intl'

const appointmentMessages = {
  '*': defineMessages({
    detail: { id: 'appointmentMessages.*.detail', defaultMessage: '詳情' },
    appointmentIssueAndResult: { id: 'appointmentMessages.*.appointmentIssueAndResult', defaultMessage: '提問紀錄單' },
    appointmentConfigureMeetingRoom: {
      id: 'appointmentMessages.*.appointmentConfigureMeetingRoom',
      defaultMessage: 'Configure a meeting room',
    },
    fetchDataError: {
      id: 'appointmentMessages.*.fetchDataError',
      defaultMessage: '讀取錯誤',
    },
    create: { id: 'appointmentMessages.*.create', defaultMessage: '建立' },
    cancel: { id: 'appointmentMessages.*.cancel', defaultMessage: '取消' },
  }),
  AppointmentPeriodCard: defineMessages({
    meetingLinkNotSet: {
      id: 'appointmentMessages.AppointmentPeriodCard.meetingLinkNotSet',
      defaultMessage: '尚未設定會議連結',
    },
    finished: { id: 'appointmentMessages.AppointmentPeriodCard.finished', defaultMessage: '已結束' },
    appointmentText: {
      id: 'appointment.AppointmentPeriodCard.appointmentText',
      defaultMessage: '{name} 已預約你的「{title}」',
    },
    addToCalendar: { id: 'appointment.AppointmentPeriodCard.addToCalendar', defaultMessage: '加入行事曆' },
    joinMeeting: { id: 'appointment.AppointmentPeriodCard.joinMeeting', defaultMessage: '進入會議' },
    appointmentCanceledAt: {
      id: 'appointment.AppointmentPeriodCard.appointmentCanceledAt',
      defaultMessage: '已於 {time} 取消預約',
    },
    periodDurationAtMost: {
      id: 'appointment.AppointmentPeriodCard.periodDurationAtMost',
      defaultMessage: '諮詢一次 {duration} 分鐘為限',
    },
    cancelAppointment: { id: 'appointment.AppointmentPeriodCard.cancelAppointment', defaultMessage: '取消預約' },
    rescheduleAppointment: {
      id: 'appointment.AppointmentPeriodCard.rescheduleAppointment',
      defaultMessage: '更換時段',
    },
    notRescheduleAppointmentPeriod: {
      id: 'appointment.AppointmentPeriodCard.notRescheduleAppointmentPeriod',
      defaultMessage: '無可更換的時段',
    },
    rescheduleOriginScheduled: {
      id: 'appointment.AppointmentPeriodCard.rescheduleOriginScheduled',
      defaultMessage: '原時段',
    },
    rescheduled: {
      id: 'appointment.AppointmentPeriodCard.rescheduled',
      defaultMessage: '更換為：',
    },
    rescheduleSuccess: {
      id: 'appointment.AppointmentPeriodCard.rescheduleSuccess',
      defaultMessage: '更換成功',
    },
    rescheduleSuccessAppointmentPlanTitle: {
      id: 'appointment.AppointmentPeriodCard.rescheduleSuccessAppointmentPlanTitle',
      defaultMessage: '{title} 已更換時段為',
    },
    rescheduleAppointmentPlanTitle: {
      id: 'appointment.AppointmentPeriodCard.rescheduleAppointmentPlanTitle',
      defaultMessage: '更換時段：{title}',
    },
    rescheduleConfirm: { id: 'appointment.AppointmentPeriodCard.rescheduleConfirm', defaultMessage: '確定更換' },
    rescheduleCancel: { id: 'appointment.AppointmentPeriodCard.rescheduleCancel', defaultMessage: '重選時段' },
    confirm: { id: 'appointment.AppointmentPeriodCard.confirm', defaultMessage: '好' },
    notYetConfigured: {
      id: 'appointment.AppointmentPeriodCard.notYetConfigured',
      defaultMessage: 'not yet configured',
    },
    downloadMeetingRecord: {
      id: 'appointment.AppointmentPeriodCard.downloadMeetingRecord',
      defaultMessage: '下載錄影',
    },
  }),
  AppointmentDetailModal: defineMessages({
    email: { id: 'appointmentMessages.AppointmentDetailModal.email', defaultMessage: '信箱' },
    phone: { id: 'appointmentMessages.AppointmentDetailModal.phone', defaultMessage: '電話' },
    orderUpdatedTime: {
      id: 'appointmentMessages.AppointmentDetailModal.orderUpdatedTime',
      defaultMessage: '訂單更新日期',
    },
    canceledReason: { id: 'appointmentMessages.AppointmentDetailModal.canceledReason', defaultMessage: '取消原因' },
  }),
  AppointmentIssueAndResultModal: defineMessages({
    appointmentIssue: {
      id: 'appointmentMessages.AppointmentIssueAndResultModal.appointmentIssue',
      defaultMessage: '學員提問',
    },
    appointmentDate: {
      id: 'appointmentMessages.AppointmentIssueAndResultModal.appointmentDate',
      defaultMessage: '諮詢日期',
    },
    appointmentResult: {
      id: 'appointmentMessages.AppointmentIssueAndResultModal.appointmentResult',
      defaultMessage: '諮詢重點紀錄',
    },
    appointmentResultNotation: {
      id: 'appointmentMessages.AppointmentIssueAndResultModal.appointmentResultNotation',
      defaultMessage: '※此紀錄不會公開給學員看到',
    },
  }),
  AppointmentCancelModal: defineMessages({
    confirmCancelAlert: {
      id: 'appointmentMessages.AppointmentCancelModal.confirmCancelAlert',
      defaultMessage: '確定要取消預約嗎？',
    },
    confirmCancelNotation: {
      id: 'appointmentMessages.AppointmentCancelModal.confirmCancelNotation',
      defaultMessage: '取消預約後將會寄送通知給諮詢老師，並重新開放此時段，若需退費請主動聯繫平台。',
    },
    canceledReason: {
      id: 'appointmentMessages.AppointmentCancelModal.canceledReason',
      defaultMessage: '取消原因',
    },
    cancelSuccess: {
      id: 'appointmentMessages.AppointmentCancelModal.cancelSuccess',
      defaultMessage: 'Cancellation successful',
    },
  }),
  AppointmentConfigureMeetingRoomModal: defineMessages({
    meetingLink: {
      id: 'appointmentMessages.AppointmentCancelModal.meetingLink',
      defaultMessage: 'meeting link',
    },
  }),
  AppointmentBasicForm: defineMessages({
    defaultMeetGateWay: {
      id: 'appointmentMessages.AppointmentBasicForm.defaultMeetGateWay',
      defaultMessage: '預設會議系統',
    },
  }),
  AppointmentPeriodItem: defineMessages({
    booked: { id: 'appointment.AppointmentPeriodItem.booked', defaultMessage: '已預約' },
    bookable: { id: 'appointment.AppointmentPeriodItem.bookable', defaultMessage: '可預約' },
    meetingIsFull: { id: 'appointment.AppointmentPeriodItem.meetingIsFull', defaultMessage: '已無會議室' },
    closed: { id: 'appointment.AppointmentPeriodItem.closed', defaultMessage: '已關閉' },
  }),
  AppointmentPlanScheduleCreationModal: defineMessages({
    createPeriod: { id: 'appointment.AppointmentPlanScheduleCreationModal.createPeriod', defaultMessage: '建立時段' },
    duplicatePeriodError: {
      id: 'appointment.AppointmentPlanScheduleCreationModal.duplicatePeriodError',
      defaultMessage: '已有重複的時段',
    },
    timezone: {
      id: 'appointment.AppointmentPlanScheduleCreationModal.timezone',
      defaultMessage: '時間以 {city} (GMT{timezone}) 顯示',
    },
    startedAt: { id: 'appointment.AppointmentPlanScheduleCreationModal.startedAt', defaultMessage: '開始時間' },
    selectStartedAt: {
      id: 'appointment.AppointmentPlanScheduleCreationModal.selectStartedAt',
      defaultMessage: '選擇起始時間',
    },
    periodType: { id: 'appointment.AppointmentPlanScheduleCreationModal.periodType', defaultMessage: '訂閱週期' },
    day: { id: 'appointment.AppointmentPlanScheduleCreationModal.day', defaultMessage: '天' },
    week: { id: 'appointment.AppointmentPlanScheduleCreationModal.week', defaultMessage: '週' },
    month: { id: 'appointment.AppointmentPlanScheduleCreationModal.month', defaultMessage: '月' },
    successfullyCreated: {
      id: 'appointment.AppointmentPlanScheduleCreationModal.successfullyCreated',
      defaultMessage: '建立成功',
    },
  }),
  AppointmentScheduleImportModal: defineMessages({
    noAvailableSchedule: {
      id: 'appointment.AppointmentScheduleImportModal.noAvailableSchedule',
      defaultMessage: '沒有可匯入的時段',
    },
    repeatEveryDay: {
      id: 'appointment.AppointmentScheduleImportModal.repeatEveryDay',
      defaultMessage: '重複週期：每日',
    },
    repeatEveryWeek: {
      id: 'appointment.AppointmentScheduleImportModal.repeatEveryWeek',
      defaultMessage: '重複週期：每週',
    },
    repeatEveryMonth: {
      id: 'appointment.AppointmentScheduleImportModal.repeatEveryMonth',
      defaultMessage: '重複週期：每月',
    },
    repeatEveryYear: {
      id: 'appointment.AppointmentScheduleImportModal.repeatEveryYear',
      defaultMessage: '重複週期：每年',
    },
    isExisted: { id: 'appointment.AppointmentScheduleImportModal.isExisted', defaultMessage: '已匯入' },
    import: { id: 'appointment.AppointmentScheduleImportModal.import', defaultMessage: '匯入' },
    importPeriod: { id: 'appointment.AppointmentScheduleImportModal.importPeriod', defaultMessage: '匯入時段' },
    selectPlan: { id: 'appointment.AppointmentScheduleImportModal.selectPlan', defaultMessage: '選擇方案' },
    scheduleImportNotation: {
      id: 'appointment.AppointmentScheduleImportModal.scheduleImportNotation',
      defaultMessage: '將你在其他方案設定的時段複製更新到此方案',
    },
    selectImportedSchedule: {
      id: 'appointment.AppointmentScheduleImportModal.selectedImportedSchedule',
      defaultMessage: '選擇欲匯入的預約方案時段',
    },
  }),
  AppointmentRescheduleModal: defineMessages({
    changePeriodFail: {
      id: 'appointment.AppointmentRescheduleModal.changePeriodFail',
      defaultMessage: '更換時段失敗 ,{error}',
    },
  }),
}
export default appointmentMessages
