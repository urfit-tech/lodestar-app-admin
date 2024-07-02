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
    transcript: { id: 'member.MemberNoteTranscriptModal.transcript', defaultMessage: 'Transcript' },
    pending: { id: 'member.MemberNoteTranscriptModal.pending', defaultMessage: 'transcribing' },
    failed: { id: 'member.MemberNoteTranscriptModal.failed', defaultMessage: 'transcript failed' },
    transcriptText1: {
      id: 'member.MemberNoteTranscriptModal.transcriptText1',
      defaultMessage: '確定要轉換為逐字稿嗎?',
    },
    transcriptText2: {
      id: 'member.MemberNoteTranscriptModal.transcriptText2',
      defaultMessage: '執行後將會需要一些時間進行轉換',
    },
    transcriptError: {
      id: 'member.MemberNoteTranscriptModal.transcriptError',
      defaultMessage: '逐字稿轉換失敗',
    },
    deleteNote: { id: 'member.MemberNoteTranscriptModal.deleteNote', defaultMessage: 'Delete Note' },
    deleteMemberNoteConfirmation: {
      id: 'member.MemberNoteTranscriptModal.deleteMemberNoteConfirmation',
      defaultMessage: '備註一經刪除即不可恢復，確定要刪除嗎？',
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
}
export default memberMessages
