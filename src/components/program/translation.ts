import { defineMessages } from 'react-intl'

const programMessages = {
  '*': defineMessages({
    save: { id: 'program.*.save', defaultMessage: '儲存' },
    cancel: { id: 'program.*.cancel', defaultMessage: '取消' },
    isRequired: { id: 'program.*.isRequired', defaultMessage: '*此欄位必填' },
    exerciseTitle: { id: 'program.*.exerciseTitle', defaultMessage: '標題' },
    deleteContent: { id: 'program.*.deleteContent', defaultMessage: '刪除內容' },
    notifyUpdate: { id: 'program.*.notifyUpdate', defaultMessage: '通知內容更新' },
    pinnedStatus: { id: 'program.*.pinnedStatus', defaultMessage: '釘選' },
    successfullySaved: { id: 'program.*.successfullySaved', defaultMessage: '儲存成功' },
    fetchDataError: { id: 'program.*.fetchDataError', defaultMessage: '讀取錯誤' },
    nothingIsChange: { id: 'program.*.nothingIsChange', defaultMessage: '無修改項目' },
    contentPlan: { id: 'program.*.contentPlan', defaultMessage: 'Content Plan' },
    videoContent: { id: 'program.*.videoContent', defaultMessage: 'Video content' },
    articleContent: { id: 'program.*.articleContent', defaultMessage: 'Article content' },
    audioContent: { id: 'program.*.audioContent', defaultMessage: 'Audio content' },
    ebook: { id: 'program.*.ebook', defaultMessage: '電子書' },
    contentTitle: { id: 'program.*.contentTitle', defaultMessage: '標題' },
    description: { id: 'program.*.description', defaultMessage: '內容' },
    uploadAudioFile: { id: 'program.*.uploadAudioFile', defaultMessage: 'Upload audio file' },
  }),
  ProgramCollectionSelector: defineMessages({
    recentWatched: { id: 'program.ProgramCollectionSelector.recentWatched', defaultMessage: '依最後觀看時間' },
    publishedAt: { id: 'program.ProgramCollectionSelector.publishedAt', defaultMessage: '依上架日期' },
    currentPrice: { id: 'program.ProgramCollectionSelector.currentPrice', defaultMessage: '依產品價錢' },
    custom: { id: 'program.ProgramCollectionSelector.newest', defaultMessage: '自訂項目' },
    ruleOfSort: { id: 'program.ProgramCollectionSelector.ruleOfSort', defaultMessage: '預設排序' },
    choiceData: { id: 'program.ProgramCollectionSelector.choiceData', defaultMessage: '選擇資料' },
    sort: { id: 'program.ProgramCollectionSelector.sort', defaultMessage: '排序方式' },
    sortAsc: { id: 'program.ProgramCollectionSelector.sortAsc', defaultMessage: '正序' },
    sortDesc: { id: 'program.ProgramCollectionSelector.sortDesc', defaultMessage: '倒序' },
    displayAmount: { id: 'program.ProgramCollectionSelector.displayAmount', defaultMessage: '資料顯示數量' },
    defaultCategoryId: { id: 'program.ProgramCollectionSelector.defaultCategoryId', defaultMessage: '預設分類' },
    defaultTagName: { id: 'program.ProgramCollectionSelector.defaultTagName', defaultMessage: '預設標籤' },
    dataDisplay: { id: 'program.ProgramCollectionSelector.dataDisplay', defaultMessage: '資料顯示' },
    addItem: { id: 'program.ProgramCollectionSelector.addItem', defaultMessage: '新增項目' },
  }),
  ProgramPackageSelector: defineMessages({
    allProgramPackage: { id: 'program.ProgramPackageSelector.allProgramPackage', defaultMessage: '全部課程組合' },
  }),
  ProgramPlanAdminModal: defineMessages({
    productLevel: { id: 'program.ProgramPlanAdminModal.productLevel', defaultMessage: '方案等級' },
    isPublished: { id: 'program.ProgramPlanAdminModal.isPublished', defaultMessage: '是否顯示方案' },
    published: { id: 'program.ProgramPlanAdminModal.published', defaultMessage: '發售，上架後立即開賣' },
    unpublished: { id: 'program.ProgramPlanAdminModal.unpublished', defaultMessage: '停售，此方案暫停對外銷售並隱藏' },
    isParticipantsVisible: {
      id: 'program.ProgramPlanAdminModal.isParticipantsVisible',
      defaultMessage: 'Participants visible',
    },
    visible: { id: 'program.ProgramPlanAdminModal.visible', defaultMessage: 'visible' },
    invisible: { id: 'program.ProgramPlanAdminModal.invisible', defaultMessage: 'invisible' },
    subscriptionPlan: { id: 'program.ProgramPlanAdminModal.subscriptionPlan', defaultMessage: '訂閱付費方案' },
    permissionType: { id: 'program.ProgramPlanAdminModal.permissionType', defaultMessage: '選擇內容觀看權限' },
    availableForPastContent: {
      id: 'program.ProgramPlanAdminModal.availableForPastContent',
      defaultMessage: '可看指定方案過去與未來內容',
    },
    unavailableForPastContent: {
      id: 'program.ProgramPlanAdminModal.unavailableForPastContent',
      defaultMessage: '僅可看指定方案未來內容',
    },
    availableForAllContent: {
      id: 'program.ProgramPlanAdminModal.availableForAllContent',
      defaultMessage: '可看課程所有內容',
    },
    subscriptionPeriodType: { id: 'program.ProgramPlanAdminModal.subscriptionPeriodType', defaultMessage: '訂閱週期' },
    programExpirationNotice: {
      id: 'program.ProgramPlanAdminModal.programExpirationNotice',
      defaultMessage: '課程到期通知',
    },
    planDescription: { id: 'program.ProgramPlanAdminModal.planDescription', defaultMessage: '方案描述' },
    planTitle: { id: 'program.ProgramPlanAdminModal.planTitle', defaultMessage: '方案名稱' },
    identityMembership: {
      id: 'program.ProgramPlanAdminModal.identityMembership',
      defaultMessage: 'Membership card applicable',
    },
    selectMembershipCard: {
      id: 'program.ProgramPlanAdminModal.selectMembershipCard',
      defaultMessage: 'Select membership card',
    },
  }),
  DisplayModeSelector: defineMessages({
    conceal: { id: 'program.DisplayModeSelector.conceal', defaultMessage: '隱藏' },
    trial: { id: 'program.DisplayModeSelector.trial', defaultMessage: '試看' },
    audioTrial: { id: 'program.DisplayModeSelector.audioTrial', defaultMessage: 'Audio trial' },
    loginToTrial: { id: 'program.DisplayModeSelector.loginToTrial', defaultMessage: '登入試看' },
    loginToAudioTrial: { id: 'program.DisplayModeSelector.loginToAudioTrial', defaultMessage: 'Login to audio trial' },
    payToWatch: { id: 'program.DisplayModeSelector.payToWatch', defaultMessage: '付費觀看' },
    payToListen: { id: 'program.DisplayModeSelector.payToListen', defaultMessage: 'Pay to listen' },
  }),
  ProgramContentAdminItem: defineMessages({
    privatePractice: { id: 'program.ProgramContentAdminItem.privatePractice', defaultMessage: '私密作業' },
  }),
  ProgramContentAdminModal: defineMessages({
    ebookFile: {
      id: 'program.ProgramContentAdminModal.ebookFile',
      defaultMessage: '電子書檔案',
    },
    uploadEbookFileTips: {
      id: 'program.ProgramContentAdminModal.uploadEbookFileTips',
      defaultMessage: '只接受符合 EPUB 3 格式檔案',
    },
    ebookTrialPercentageSetting: {
      id: 'program.ProgramContentAdminModal.ebookTrialPercentageSetting',
      defaultMessage: 'Trial Percentage Setting',
    },
    audioFileTips: {
      id: 'program.ProgramContentAdminModal.audioFileTips',
      defaultMessage: 'Accept format: .mp3\nFile size: 250MB',
    },
    deleteContentWarning: {
      id: 'program.ProgramContentAdminModal.deleteContentWarning',
      defaultMessage: '你確定要刪除此內容？此動作無法還原',
    },
    uploadFile: { id: 'program.ProgramContentAdminModal.uploadFile', defaultMessage: '上傳檔案' },
    audioFile: { id: 'program.ProgramContentAdminModal.audioFile', defaultMessage: 'Audio File' },
    contentPlan: { id: 'program.ProgramContentAdminModal.contentPlan', defaultMessage: '適用方案' },
    uploadVideo: { id: 'program.ProgramContentAdminModal.uploadVideo', defaultMessage: '上傳影片' },
    uploadCaption: { id: 'program.ProgramContentAdminModal.uploadCaption', defaultMessage: '上傳字幕' },
    duration: { id: 'program.ProgramContentAdminModal.duration', defaultMessage: '內容時長（分鐘）' },
    uploadMaterial: { id: 'program.ProgramContentAdminModal.uploadMaterial', defaultMessage: '上傳教材' },
  }),
  PracticeAdminModal: defineMessages({
    contentPlan: { id: 'program.PracticeAdminModal.contentPlan', defaultMessage: 'Content Plan' },
    practice: { id: 'program.PracticeAdminModal.practice', defaultMessage: '作業練習' },
    deletePracticeWarning: {
      id: 'program.PracticeAdminModal.deletePracticeWarning',
      defaultMessage: '將刪除所有與此作業相關資料且不可復原，確定要刪除嗎？',
    },
    practicePrivateTips: {
      id: 'program.PracticeAdminModal.practicePrivateTips',
      defaultMessage: '勾選後學員將只能看到自己的作品',
    },
    practiceFileSizeTips: {
      id: 'program.PracticeAdminModal.practiceFileSizeTips',
      defaultMessage: '單檔案大小不超過 5GB',
    },
  }),
  ExerciseAdminModal: defineMessages({
    exerciseSetting: { id: 'program.ExerciseAdminModal.exerciseSetting', defaultMessage: '測驗設定' },
    basicSetting: { id: 'program.ExerciseAdminModal.basicSetting', defaultMessage: '基礎設定' },
    questionSetting: { id: 'program.ExerciseAdminModal.questionSetting', defaultMessage: '題目設定' },
    deleteExerciseWarning: {
      id: 'program.ExerciseAdminModal.deleteExerciseWarning',
      defaultMessage: '將刪除所有與此測驗相關資料且不可復原，確定要刪除嗎？',
    },
  }),
  IndividualExamTimeLimitModal: defineMessages({
    extendedValidity: {
      id: 'program.IndividualExamTimeLimitModal.extendedValidity',
      defaultMessage: '將特定會員延長測驗期間',
    },
    expiredAt: { id: 'program.IndividualExamTimeLimitModal.expiredAt', defaultMessage: '截止日期' },
    editIndividualTimeLimit: {
      id: 'program.IndividualExamTimeLimitModal.editIndividualTimeLimit',
      defaultMessage: '編輯個別效期',
    },
    addMember: { id: 'program.IndividualExamTimeLimitModal.addMember', defaultMessage: '添加會員' },
  }),
  ExamBasicForm: defineMessages({
    examinableTime: { id: 'program.ExamBasicForm.examinableTime', defaultMessage: '限定測驗期間' },
    examinableTimeTip: {
      id: 'program.ExamBasicForm.examinableTimeTip',
      defaultMessage: '購買後：限定購買後幾天內須完成測驗\n指定時間：指定區間內須完成測驗',
    },
    countDownAnswerTime: {
      id: 'program.ExamBasicForm.countDownAnswerTime',
      defaultMessage: '總答題限時 (倒數時間)',
    },
    unlimitedPeriod: {
      id: 'program.ExamBasicForm.unlimitedPeriod',
      defaultMessage: '不限期間',
    },
    bought: {
      id: 'program.ExamBasicForm.bought',
      defaultMessage: '購買後',
    },
    limitedPeriod: {
      id: 'program.ExamBasicForm.limited',
      defaultMessage: '指定時間',
    },
    day: {
      id: 'program.ExamBasicForm.day',
      defaultMessage: '天',
    },
    hour: {
      id: 'program.ExamBasicForm.hour',
      defaultMessage: '小時',
    },
    minute: {
      id: 'program.ExamBasicForm.minute',
      defaultMessage: '分鐘',
    },
    unlimitedTime: {
      id: 'program.ExamBasicForm.unlimitedTime',
      defaultMessage: '不限時',
    },
    limitedTime: {
      id: 'program.ExamBasicForm.limitedTime',
      defaultMessage: '限定時間',
    },
    unAnnounceScore: {
      id: 'program.ExamBasicForm.unAnnounceScore',
      defaultMessage: '不公佈成績',
    },
    canGoBack: {
      id: 'program.ExamBasicForm.canGoBack',
      defaultMessage: '可返回前題',
    },
    canRetry: {
      id: 'program.ExamBasicForm.canRetry',
      defaultMessage: '可重新測驗',
    },
    other: {
      id: 'program.ExamBasicForm.other',
      defaultMessage: '其他',
    },
  }),
  ExamQuestionSettingForm: defineMessages({
    questionSetting: { id: 'program.ExamQuestionSettingForm.questionSetting', defaultMessage: '題目設定' },
    examScore: { id: 'program.ExamQuestionSettingForm.examScore', defaultMessage: '測驗分數' },
    pointPerQuestion: { id: 'program.ExamQuestionSettingForm.pointPerQuestion', defaultMessage: '每題分數' },
    passingScore: { id: 'program.ExamQuestionSettingForm.passingScore', defaultMessage: '及格分數' },
  }),
  ProgramContentSectionAdminCard: defineMessages({
    deleteSectionWarning: {
      id: 'program.ProgramContentSectionAdminCard.deleteSectionWarning',
      defaultMessage: '此區塊內的所有內容將被刪除，此動作無法還原',
    },
    deleteSection: { id: 'program.ProgramContentSectionAdminCard.deleteSection', defaultMessage: 'Delete section' },
    createContent: { id: 'program.ProgramContentSectionAdminCard.createContent', defaultMessage: 'Create content' },
    programPractice: {
      id: 'program.ProgramContentSectionAdminCard.practiceContent',
      defaultMessage: 'Practice content',
    },
    programExercise: {
      id: 'program.ProgramContentSectionAdminCard.programExercise',
      defaultMessage: 'Program exercise',
    },
  }),
}

export default programMessages
