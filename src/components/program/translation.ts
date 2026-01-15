import { defineMessages } from 'react-intl'

const programMessages = {
  '*': defineMessages({
    save: { id: 'program.*.save', defaultMessage: 'Save' },
    cancel: { id: 'program.*.cancel', defaultMessage: 'Cancel' },
    confirm: { id: 'program.*.confirm', defaultMessage: 'Confirm' },
    add: { id: 'program.*.add', defaultMessage: 'Add' },
    on: { id: 'program.*.on', defaultMessage: 'ON' },
    off: { id: 'program.*.off', defaultMessage: 'OFF' },
    isRequired: { id: 'program.*.isRequired', defaultMessage: '*This field is required' },
    exerciseTitle: { id: 'program.*.exerciseTitle', defaultMessage: 'Title' },
    deleteContent: { id: 'program.*.deleteContent', defaultMessage: 'Delete content' },
    notifyUpdate: { id: 'program.*.notifyUpdate', defaultMessage: 'Notify content update' },
    pinnedStatus: { id: 'program.*.pinnedStatus', defaultMessage: 'Pinned' },
    successfullySaved: { id: 'program.*.successfullySaved', defaultMessage: 'saved successfully' },
    fetchDataError: { id: 'program.*.fetchDataError', defaultMessage: 'Load error' },
    nothingIsChange: { id: 'program.*.nothingIsChange', defaultMessage: 'No changes' },
    contentPlan: { id: 'program.*.contentPlan', defaultMessage: 'Content Plan' },
    videoContent: { id: 'program.*.videoContent', defaultMessage: 'Video content' },
    articleContent: { id: 'program.*.articleContent', defaultMessage: 'Article content' },
    audioContent: { id: 'program.*.audioContent', defaultMessage: 'Audio content' },
    ebook: { id: 'program.*.ebook', defaultMessage: 'E-book' },
    contentTitle: { id: 'program.*.contentTitle', defaultMessage: 'Title' },
    description: { id: 'program.*.description', defaultMessage: 'Content' },
    uploadAudioFile: { id: 'program.*.uploadAudioFile', defaultMessage: 'Upload audio file' },
    perpetualPlan: { id: 'program.*.perpetualPlan', defaultMessage: 'Perpetual plan' },
    periodPlan: { id: 'program.*.periodPlan', defaultMessage: 'Period plan' },
  }),
  ProgramCollectionSelector: defineMessages({
    recentWatched: { id: 'program.ProgramCollectionSelector.recentWatched', defaultMessage: 'By last watched time' },
    publishedAt: { id: 'program.ProgramCollectionSelector.publishedAt', defaultMessage: 'By published date' },
    currentPrice: { id: 'program.ProgramCollectionSelector.currentPrice', defaultMessage: 'By product price' },
    custom: { id: 'program.ProgramCollectionSelector.newest', defaultMessage: 'Custom items' },
    ruleOfSort: { id: 'program.ProgramCollectionSelector.ruleOfSort', defaultMessage: 'Default sort' },
    choiceData: { id: 'program.ProgramCollectionSelector.choiceData', defaultMessage: 'Select data' },
    sort: { id: 'program.ProgramCollectionSelector.sort', defaultMessage: 'Sort method' },
    sortAsc: { id: 'program.ProgramCollectionSelector.sortAsc', defaultMessage: 'Ascending' },
    sortDesc: { id: 'program.ProgramCollectionSelector.sortDesc', defaultMessage: 'Descending' },
    displayAmount: { id: 'program.ProgramCollectionSelector.displayAmount', defaultMessage: 'Display amount' },
    defaultCategoryId: { id: 'program.ProgramCollectionSelector.defaultCategoryId', defaultMessage: 'Default category' },
    defaultTagName: { id: 'program.ProgramCollectionSelector.defaultTagName', defaultMessage: 'Default tag' },
    dataDisplay: { id: 'program.ProgramCollectionSelector.dataDisplay', defaultMessage: 'Data display' },
    addItem: { id: 'program.ProgramCollectionSelector.addItem', defaultMessage: 'Add item' },
  }),
  ProgramPackageSelector: defineMessages({
    allProgramPackage: { id: 'program.ProgramPackageSelector.allProgramPackage', defaultMessage: 'All program packages' },
  }),
  ProgramPlanAdminModal: defineMessages({
    productLevel: { id: 'program.ProgramPlanAdminModal.productLevel', defaultMessage: 'Plan level' },
    isPublished: { id: 'program.ProgramPlanAdminModal.isPublished', defaultMessage: 'Show plan' },
    published: { id: 'program.ProgramPlanAdminModal.published', defaultMessage: 'Published, available for sale immediately after launch' },
    unpublished: { id: 'program.ProgramPlanAdminModal.unpublished', defaultMessage: 'Unpublished, this plan is suspended from external sales and hidden' },
    isParticipantsVisible: {
      id: 'program.ProgramPlanAdminModal.isParticipantsVisible',
      defaultMessage: 'Participants visible',
    },
    visible: { id: 'program.ProgramPlanAdminModal.visible', defaultMessage: 'visible' },
    invisible: { id: 'program.ProgramPlanAdminModal.invisible', defaultMessage: 'invisible' },
    subscriptionPlan: { id: 'program.ProgramPlanAdminModal.subscriptionPlan', defaultMessage: 'Subscription plan' },
    permissionType: { id: 'program.ProgramPlanAdminModal.permissionType', defaultMessage: 'Select content viewing permission' },
    availableForPastContent: {
      id: 'program.ProgramPlanAdminModal.availableForPastContent',
      defaultMessage: 'Can view past and future content of specified plan',
    },
    unavailableForPastContent: {
      id: 'program.ProgramPlanAdminModal.unavailableForPastContent',
      defaultMessage: 'Can only view future content of specified plan',
    },
    availableForAllContent: {
      id: 'program.ProgramPlanAdminModal.availableForAllContent',
      defaultMessage: 'Can view all program content',
    },
    subscriptionPeriodType: { id: 'program.ProgramPlanAdminModal.subscriptionPeriodType', defaultMessage: 'Subscription period' },
    programExpirationNotice: {
      id: 'program.ProgramPlanAdminModal.programExpirationNotice',
      defaultMessage: 'Program expiration notice',
    },
    planDescription: { id: 'program.ProgramPlanAdminModal.planDescription', defaultMessage: 'Plan description' },
    planTitle: { id: 'program.ProgramPlanAdminModal.planTitle', defaultMessage: 'Plan title' },
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
    conceal: { id: 'program.DisplayModeSelector.conceal', defaultMessage: 'Hidden' },
    trial: { id: 'program.DisplayModeSelector.trial', defaultMessage: 'Trial' },
    audioTrial: { id: 'program.DisplayModeSelector.audioTrial', defaultMessage: 'Audio trial' },
    loginToTrial: { id: 'program.DisplayModeSelector.loginToTrial', defaultMessage: 'Login to trial' },
    loginToAudioTrial: { id: 'program.DisplayModeSelector.loginToAudioTrial', defaultMessage: 'Login to audio trial' },
    payToWatch: { id: 'program.DisplayModeSelector.payToWatch', defaultMessage: 'Pay to watch' },
    payToListen: { id: 'program.DisplayModeSelector.payToListen', defaultMessage: 'Pay to listen' },
  }),
  ProgramContentAdminItem: defineMessages({
    privatePractice: { id: 'program.ProgramContentAdminItem.privatePractice', defaultMessage: 'Private practice' },
  }),
  ProgramContentAdminModal: defineMessages({
    ebookFile: {
      id: 'program.ProgramContentAdminModal.ebookFile',
      defaultMessage: 'E-book file',
    },
    uploadEbookFileTips: {
      id: 'program.ProgramContentAdminModal.uploadEbookFileTips',
      defaultMessage: 'Only EPUB 3 format files are accepted',
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
      defaultMessage: 'Are you sure you want to delete this content? This action cannot be undone',
    },
    uploadFile: { id: 'program.ProgramContentAdminModal.uploadFile', defaultMessage: 'Upload file' },
    audioFile: { id: 'program.ProgramContentAdminModal.audioFile', defaultMessage: 'Audio File' },
    contentPlan: { id: 'program.ProgramContentAdminModal.contentPlan', defaultMessage: 'Applicable plan' },
    uploadVideo: { id: 'program.ProgramContentAdminModal.uploadVideo', defaultMessage: 'Upload video' },
    uploadCaption: { id: 'program.ProgramContentAdminModal.uploadCaption', defaultMessage: 'Upload caption' },
    duration: { id: 'program.ProgramContentAdminModal.duration', defaultMessage: 'Content duration (minutes)' },
    uploadMaterial: { id: 'program.ProgramContentAdminModal.uploadMaterial', defaultMessage: 'Upload material' },
  }),
  PracticeAdminModal: defineMessages({
    contentPlan: { id: 'program.PracticeAdminModal.contentPlan', defaultMessage: 'Content Plan' },
    practice: { id: 'program.PracticeAdminModal.practice', defaultMessage: 'Practice' },
    deletePracticeWarning: {
      id: 'program.PracticeAdminModal.deletePracticeWarning',
      defaultMessage: 'This will delete all data related to this practice and cannot be undone. Are you sure you want to delete?',
    },
    practicePrivateTips: {
      id: 'program.PracticeAdminModal.practicePrivateTips',
      defaultMessage: 'After checking, students will only be able to see their own work',
    },
    practiceFileSizeTips: {
      id: 'program.PracticeAdminModal.practiceFileSizeTips',
      defaultMessage: 'Single file size should not exceed 5GB',
    },
  }),
  ExerciseAdminModal: defineMessages({
    exerciseSetting: { id: 'program.ExerciseAdminModal.exerciseSetting', defaultMessage: 'Exercise settings' },
    basicSetting: { id: 'program.ExerciseAdminModal.basicSetting', defaultMessage: 'Basic settings' },
    questionSetting: { id: 'program.ExerciseAdminModal.questionSetting', defaultMessage: 'Question settings' },
    deleteExerciseWarning: {
      id: 'program.ExerciseAdminModal.deleteExerciseWarning',
      defaultMessage: 'This will delete all data related to this exercise and cannot be undone. Are you sure you want to delete?',
    },
  }),
  IndividualExamTimeLimitModal: defineMessages({
    extendedValidity: {
      id: 'program.IndividualExamTimeLimitModal.extendedValidity',
      defaultMessage: 'Extend exam period for specific members',
    },
    expiredAt: { id: 'program.IndividualExamTimeLimitModal.expiredAt', defaultMessage: 'Expiry date' },
    editIndividualTimeLimit: {
      id: 'program.IndividualExamTimeLimitModal.editIndividualTimeLimit',
      defaultMessage: 'Edit individual validity period',
    },
    addMember: { id: 'program.IndividualExamTimeLimitModal.addMember', defaultMessage: 'Add member' },
  }),
  ExamBasicForm: defineMessages({
    examinableTime: { id: 'program.ExamBasicForm.examinableTime', defaultMessage: 'Limited exam period' },
    examinableTimeTip: {
      id: 'program.ExamBasicForm.examinableTimeTip',
      defaultMessage: 'After purchase: Must complete exam within specified days after purchase\nSpecified time: Must complete exam within specified time range',
    },
    countDownAnswerTime: {
      id: 'program.ExamBasicForm.countDownAnswerTime',
      defaultMessage: 'Total answer time limit (countdown)',
    },
    unlimitedPeriod: {
      id: 'program.ExamBasicForm.unlimitedPeriod',
      defaultMessage: 'Unlimited period',
    },
    bought: {
      id: 'program.ExamBasicForm.bought',
      defaultMessage: 'After purchase',
    },
    limitedPeriod: {
      id: 'program.ExamBasicForm.limited',
      defaultMessage: 'Specified time',
    },
    day: {
      id: 'program.ExamBasicForm.day',
      defaultMessage: 'day',
    },
    hour: {
      id: 'program.ExamBasicForm.hour',
      defaultMessage: 'hour',
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
  ExternalLinkForm: defineMessages({
    title: { id: 'program.ExternalLinkForm.title', defaultMessage: 'Examination paper name' },
    links: { id: 'program.ExternalLinkForm.links', defaultMessage: 'Test Links' },
    examLink: { id: 'program.ExternalLinkForm.examLink', defaultMessage: 'Exam Link' },
    typeLabel: { id: 'program.ExternalLinkForm.typeLabel', defaultMessage: 'Type' },
    linkLabel: { id: 'program.ExternalLinkForm.linkLabel', defaultMessage: 'Link' },
    programPackageCompleteRatio: {
      id: 'program.ExternalLinkForm.programPackageCompleteRatio',
      defaultMessage: 'Eligibility for admission (view the total progress of the course)',
    },
    isOn: {
      id: 'program.ExternalLinkForm.isOn',
      defaultMessage: 'Usage status',
    },
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
    externalLinkContent: {
      id: 'program.ProgramContentSectionAdminCard.externalLinkContent',
      defaultMessage: 'External Link Content',
    },
    expandChapter: {
      id: 'program.ProgramContentSectionAdminCard.expandChapter',
      defaultMessage: '展開章節',
    },
  }),
  PriceDescriptionItem: defineMessages({
    priceDescription: {
      id: 'program.PriceDescriptionItem.priceDescription',
      defaultMessage: 'Price description',
    },
  }),
  ListPriceItem: defineMessages({
    listPriceCircumfix: { id: 'program.ListPriceItem.listPriceCircumfix', defaultMessage: '定價前後綴詞' },
    listPricePrefix: { id: 'program.ListPriceItem.listPricePrefix', defaultMessage: '定價前綴詞' },
    listPriceSuffix: { id: 'program.ListPriceItem.listPriceSuffix', defaultMessage: '定價後綴詞' },
  }),
}

export default programMessages
