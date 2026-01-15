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
      defaultMessage: '{name} uploaded successfully!',
    },
    uploadFail: {
      id: 'member.MemberImportModal.uploadFail',
      defaultMessage: '{name} upload failed!',
    },
    importResultNotification: {
      id: 'member.MemberImportModal.importResultNotification',
      defaultMessage: 'Import results will be sent by email',
    },
  }),
  MemberNoteAdminItem: defineMessages({
    note: {
      id: 'member.MemberNoteAdminItem.note',
      defaultMessage: 'Note',
    },
  }),
  label: defineMessages({
    openTimeSettings: { id: 'member.label.openTimeSettings', defaultMessage: 'Open time settings' },
    eventSchedule: { id: 'member.label.eventSchedule', defaultMessage: 'Event schedule' },
    eventOld: { id: 'member.label.eventOld', defaultMessage: 'Event schedule (old)' },
  }),
  ui: defineMessages({
    setOpenTime: { id: 'member.ui.setOpenTime', defaultMessage: 'Set open time' },
    editOpenTime: { id: 'member.ui.editOpenTime', defaultMessage: 'Edit open time' },
    removeOpenTime: { id: 'member.ui.removeOpenTime', defaultMessage: 'Remove open time' },
    weeklyRepeat: { id: 'member.ui.weeklyRepeat', defaultMessage: 'Weekly repeat' },
    repeatUntil: { id: 'member.ui.repeatUntil', defaultMessage: 'Repeat until' },
    repeatUntilHint: { id: 'member.ui.repeatUntilHint', defaultMessage: 'If no date is selected, the system defaults to permanent repeat' },
    noOpenTime: { id: 'member.ui.noOpenTime', defaultMessage: 'No open time' },
    remove: { id: 'member.ui.remove', defaultMessage: 'Remove' },
    cancelRemoveMode: { id: 'member.ui.cancelRemoveMode', defaultMessage: 'Cancel remove mode' },
    removeThisWeek: { id: 'member.ui.removeThisWeek', defaultMessage: 'Remove this week only' },
    removeUntilDate: { id: 'member.ui.removeUntilDate', defaultMessage: 'Remove until specified date' },
    removeAll: { id: 'member.ui.removeAll', defaultMessage: 'Remove all' },
    pastOpenTimeHint: { id: 'member.ui.pastOpenTimeHint', defaultMessage: 'Past open times will not be removed' },
    confirmRemove: { id: 'member.ui.confirmRemove', defaultMessage: 'Confirm remove' },
    cancel: { id: 'member.ui.cancel', defaultMessage: 'Cancel' },
    confirm: { id: 'member.ui.confirm', defaultMessage: 'Confirm' },
    selectDate: { id: 'member.ui.selectDate', defaultMessage: 'Select date' },
    addSlot: { id: 'member.ui.addSlot', defaultMessage: 'Add time slot' },
    removeSlot: { id: 'member.ui.removeSlot', defaultMessage: 'Remove time slot' },
    copyToAll: { id: 'member.ui.copyToAll', defaultMessage: 'Copy to all days' },
    copySuccess: { id: 'member.ui.copySuccess', defaultMessage: 'Copied to all days' },
    copyConflictWarning: { id: 'member.ui.copyConflictWarning', defaultMessage: 'The following time slots have conflicts and were skipped: {conflicts}' },
    cancelDeleteMode: { id: 'member.ui.cancelDeleteMode', defaultMessage: 'Cancel remove mode' },
    viewMonth: { id: 'member.ui.viewMonth', defaultMessage: 'Month' },
    viewWeek: { id: 'member.ui.viewWeek', defaultMessage: 'Week' },
    viewDay: { id: 'member.ui.viewDay', defaultMessage: 'Day' },
    today: { id: 'member.ui.today', defaultMessage: 'Today' },
  }),
}
export default memberMessages
