import { defineMessages } from 'react-intl'

const libraryMessages = {
  '*': defineMessages({
    download: { id: 'library.*.startedAt', defaultMessage: '下載' },
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
  }),
}
export default libraryMessages
