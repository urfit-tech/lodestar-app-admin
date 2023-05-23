import { defineMessages } from 'react-intl'

const libraryMessages = {
  '*': defineMessages({
    download: { id: 'library.*.startedAt', defaultMessage: '下載' },
    downloadFile: { id: 'library.*.downloadFile', defaultMessage: '下載檔案' },
    finish: { id: 'library.*.finish', defaultMessage: '處理完成' },
    systemErrorText: { id: 'library.*.systemErrorText', defaultMessage: '發生錯誤，請聯繫客服人員' },
  }),
  VideoLibraryItem: defineMessages({
    preview: { id: 'library.VideoLibraryItem.preview', defaultMessage: '預覽' },
    reUpload: { id: 'library.VideoLibraryItem.reUpload', defaultMessage: '重新上傳' },
    chooseFile: { id: 'library.VideoLibraryItem.chooseFile', defaultMessage: '選擇檔案' },
    manageCaption: { id: 'library.VideoLibraryItem.manageCaption', defaultMessage: '管理字幕' },
    uploadCaptions: { id: 'library.VideoLibraryItem.uploadCaptions', defaultMessage: '上傳字幕' },
    uploadedCaptions: { id: 'library.VideoLibraryItem.uploadedCaptions', defaultMessage: '已上傳字幕' },
    delete: { id: 'library.VideoLibraryItem.delete', defaultMessage: '刪除檔案' },
    duration: { id: 'library.VideoLibraryItem.duration', defaultMessage: '內容時長（分鐘）' },
    chooseCaptionLanguage: { id: 'library.VideoLibraryItem.chooseCaptionLanguage', defaultMessage: '選擇字幕語系' },
    downloadingText: { id: 'library.VideoLibraryItem.downloadingText', defaultMessage: '處理中，請稍候...' },
    expiredDate: { id: 'library.VideoLibraryItem.expiredDate', defaultMessage: '請於 {expiredDate} 前下載' },
    downloadFileError: {
      id: 'library.VideoLibraryItem.downloadFileError',
      defaultMessage: '此檔案無法下載，請聯絡客服人員',
    },
  }),
}
export default libraryMessages
