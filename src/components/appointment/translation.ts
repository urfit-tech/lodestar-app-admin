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
  }),
  AppointmentPeriodCard: defineMessages({
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
    cancelAppointment: { id: 'appointment.AppointmentPeriodCard.cancelAppointment', defaultMessage: '取消預約' },
    notYetConfigured: {
      id: 'appointment.AppointmentPeriodCard.notYetConfigured',
      defaultMessage: 'not yet configured',
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
  }),
  AppointmentConfigureMeetingRoomModal: defineMessages({
    meetingLink: {
      id: 'appointmentMessages.AppointmentCancelModal.meetingLink',
      defaultMessage: 'meeting link',
    },
  }),
}
export default appointmentMessages
