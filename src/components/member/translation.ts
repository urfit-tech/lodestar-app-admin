import { defineMessages } from 'react-intl'

const memberMessages = {
  '*': defineMessages({
    save: { id: 'member.*.save', defaultMessage: 'save' },
    cancel: { id: 'member.*.cancel', defaultMessage: 'cancel' },
    confirm: { id: 'member.*.confirm', defaultMessage: 'confirm' },
    missed: { id: 'member.*.missed', defaultMessage: 'missed' },
    editNote: { id: 'member.*.editNote', defaultMessage: 'edit note' },
    status: { id: 'member.*.status', defaultMessage: 'status' },
    attachment: { id: 'member.*.attachment', defaultMessage: 'call attachment' },
    description: { id: 'member.*.description', defaultMessage: 'remark description' },
  }),
  MemberNoteTranscriptModal: defineMessages({
    numberAttachment: { id: 'member.MemberNoteTranscriptModal.numberAttachment', defaultMessage: 'Call Attachment(s)' },
    transformTranscript: {
      id: 'member.MemberNoteTranscriptModal.transformTranscript',
      defaultMessage: 'Transform Transcript',
    },
    transcript: { id: 'member.MemberNoteTranscriptModal.transcript', defaultMessage: 'Transcript' },
    pending: {
      id: 'member.MemberNoteTranscriptModal.pending',
      defaultMessage: 'Transcription in progress, please wait and refresh to check.',
    },
    failed: { id: 'member.MemberNoteTranscriptModal.failed', defaultMessage: 'transcript failed' },
    transcriptText1: {
      id: 'member.MemberNoteTranscriptModal.transcriptText1',
      defaultMessage: 'Are you sure you want to transcript to verbatim?',
    },
    transcriptText2: {
      id: 'member.MemberNoteTranscriptModal.transcriptText2',
      defaultMessage: 'It will take some time to transcript after execution',
    },
    transcriptError: {
      id: 'member.MemberNoteTranscriptModal.transcriptError',
      defaultMessage: 'transcript failed',
    },
    deleteNote: { id: 'member.MemberNoteTranscriptModal.deleteNote', defaultMessage: 'Delete Note' },
    deleteMemberNoteConfirmation: {
      id: 'member.MemberNoteTranscriptModal.deleteMemberNoteConfirmation',
      defaultMessage: 'Once deleted, the note cannot be recovered. Are you sure you want to delete it?',
    },
  }),
  MemberNoteAdminModal: defineMessages({
    callType: { id: 'member.MemberNoteAdminModal.callType', defaultMessage: 'Call Type' },
    null: { id: 'member.MemberNoteAdminModal.null', defaultMessage: 'none' },
    inbound: { id: 'member.MemberNoteAdminModal.inbound', defaultMessage: 'inbound' },
    outbound: { id: 'member.MemberNoteAdminModal.outbound', defaultMessage: 'outbound' },
    answered: { id: 'member.MemberNoteAdminModal.answered', defaultMessage: 'answered' },
    demo: { id: 'member.MemberNoteAdminModal.demo', defaultMessage: 'demo' },
    duration: { id: 'member.MemberNoteAdminModal.duration', defaultMessage: 'duration' },
    noteForPermission: {
      id: 'member.MemberNoteAdminModal.noteForPermission',
      defaultMessage: 'Note (visible only to those with permission)',
    },
  }),
  MemberImportModal: defineMessages({
    uploadSuccess: {
      id: 'member.MemberImportModal.uploadSuccess',
      defaultMessage: '{name} 上傳成功!',
    },
    uploadFail: {
      id: 'member.MemberImportModal.uploadFail',
      defaultMessage: '{name} 上傳失敗!',
    },
    importResultNotification: {
      id: 'member.MemberImportModal.importResultNotification',
      defaultMessage: '匯入結果將會以信件寄出',
    },
  }),
  MemberNoteAdminItem: defineMessages({
    note: {
      id: 'member.MemberNoteAdminItem.note',
      defaultMessage: '備註',
    },
  }),
  label: defineMessages({
    openTimeSettings: { id: 'member.label.openTimeSettings', defaultMessage: '開放時間設定' },
    eventSchedule: { id: 'member.label.eventSchedule', defaultMessage: '行事管理' },
    eventOld: { id: 'member.label.eventOld', defaultMessage: '行事管理（舊）' },
  }),
  ui: defineMessages({
    setOpenTime: { id: 'member.ui.setOpenTime', defaultMessage: '設定開放時間' },
    editOpenTime: { id: 'member.ui.editOpenTime', defaultMessage: '編輯開放時間' },
    removeOpenTime: { id: 'member.ui.removeOpenTime', defaultMessage: '移除開放時間' },
    weeklyRepeat: { id: 'member.ui.weeklyRepeat', defaultMessage: '每週重複' },
    repeatUntil: { id: 'member.ui.repeatUntil', defaultMessage: '重複至' },
    repeatUntilHint: { id: 'member.ui.repeatUntilHint', defaultMessage: '若不選日期，系統預設為永久重複' },
    noOpenTime: { id: 'member.ui.noOpenTime', defaultMessage: '不開放時間' },
    remove: { id: 'member.ui.remove', defaultMessage: '移除' },
    cancelRemoveMode: { id: 'member.ui.cancelRemoveMode', defaultMessage: '取消移除模式' },
    removeThisWeek: { id: 'member.ui.removeThisWeek', defaultMessage: '只移除本週' },
    removeUntilDate: { id: 'member.ui.removeUntilDate', defaultMessage: '移除至指定日期' },
    removeAll: { id: 'member.ui.removeAll', defaultMessage: '移除全部' },
    pastOpenTimeHint: { id: 'member.ui.pastOpenTimeHint', defaultMessage: '過去的開放時間將不會被移除' },
    confirmRemove: { id: 'member.ui.confirmRemove', defaultMessage: '確認移除' },
    cancel: { id: 'member.ui.cancel', defaultMessage: '取消' },
    confirm: { id: 'member.ui.confirm', defaultMessage: '確認' },
    selectDate: { id: 'member.ui.selectDate', defaultMessage: '選擇日期' },
    addSlot: { id: 'member.ui.addSlot', defaultMessage: '新增時段' },
    removeSlot: { id: 'member.ui.removeSlot', defaultMessage: '刪除時段' },
    copyToAll: { id: 'member.ui.copyToAll', defaultMessage: '複製到所有天' },
    copySuccess: { id: 'member.ui.copySuccess', defaultMessage: '已複製到所有天' },
    copyConflictWarning: { id: 'member.ui.copyConflictWarning', defaultMessage: '以下時段有衝突，已跳過：{conflicts}' },
    cancelDeleteMode: { id: 'member.ui.cancelDeleteMode', defaultMessage: '取消移除模式' },
    viewMonth: { id: 'member.ui.viewMonth', defaultMessage: '月' },
    viewWeek: { id: 'member.ui.viewWeek', defaultMessage: '週' },
    viewDay: { id: 'member.ui.viewDay', defaultMessage: '日' },
    today: { id: 'member.ui.today', defaultMessage: '今天' },
  }),
}
export default memberMessages
