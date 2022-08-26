import { defineMessages } from 'react-intl'

const programMessages = {
  '*': defineMessages({
    save: { id: 'program.*.save', defaultMessage: '儲存' },
    cancel: { id: 'program.*.cancel', defaultMessage: '取消' },
    isRequired: { id: 'program.*.isRequired', defaultMessage: '*此欄位必填' },
    exerciseTitle: { id: 'program.*.exerciseTitle', defaultMessage: '標題' },
    deleteContent: { id: 'program.*.deleteContent', defaultMessage: '刪除內容' },
    notifyUpdate: { id: 'program.*.notifyUpdate', defaultMessage: '通知內容更新' },
    successfullySaved: { id: 'program.*.successfullySaved', defaultMessage: '儲存成功' },
    fetchDataError: { id: 'program.*.fetchDataError', defaultMessage: '讀取錯誤' },
    nothingIsChange: { id: 'program.*.nothingIsChange', defaultMessage: '無修改項目' },
  }),
  ProgramCollectionSelector: defineMessages({
    recentWatched: { id: 'program.ProgramCollectionSelector.recentWatched', defaultMessage: '依最後觀看時間' },
    publishedAt: { id: 'program.ProgramCollectionSelector.publishedAt', defaultMessage: '依上架日期' },
    currentPrice: { id: 'program.ProgramCollectionSelector.currentPrice', defaultMessage: '依產品價錢' },
    custom: { id: 'program.ProgramCollectionSelector.newest', defaultMessage: '自訂項目' },
    ruleOfSort: { id: 'program.ProgramCollectionSelector.ruleOfSort', defaultMessage: '排序規則' },
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
  DisplayModeSelector: defineMessages({
    conceal: { id: 'program.DisplayModeSelector.conceal', defaultMessage: '隱藏' },
    trial: { id: 'program.DisplayModeSelector.trial', defaultMessage: '試看' },
    loginToTrial: { id: 'program.DisplayModeSelector.loginToTrial', defaultMessage: '登入試看' },
    payToWatch: { id: 'program.DisplayModeSelector.payToWatch', defaultMessage: '付費觀看' },
  }),
  ProgramContentAdminItem: defineMessages({
    privatePractice: { id: 'program.ProgramContentAdminItem.privatePractice', defaultMessage: '私密作業' },
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
}

export default programMessages
