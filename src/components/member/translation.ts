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
}
export default memberMessages
