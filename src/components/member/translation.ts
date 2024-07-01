import { defineMessages } from 'react-intl'

const memberMessages = {
  '*': defineMessages({
    cancel: { id: 'memberMessages.*.cancel', defaultMessage: '取消' },
    confirm: { id: 'memberMessages.*.confirm', defaultMessage: '確認' },
  }),
  MemberNoteTranscriptModal: defineMessages({
    transcript: { id: 'memberMessages.MemberNoteTranscriptModal.transcript', defaultMessage: 'Transcript' },
    transcriptText1: {
      id: 'memberMessages.MemberNoteTranscriptModal.transcriptText1',
      defaultMessage: '確定要轉換為逐字稿嗎?',
    },
    transcriptText2: {
      id: 'memberMessages.MemberNoteTranscriptModal.transcriptText2',
      defaultMessage: '執行後將會需要一些時間進行轉換',
    },
    transcriptError: { id: 'memberMessages.MemberNoteTranscriptModal.transcriptError', defaultMessage: '逐字稿轉換失敗' },
  }),
}
export default memberMessages
