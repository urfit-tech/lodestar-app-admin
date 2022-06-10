import { defineMessages } from 'react-intl'

const pageMessages = {
  '*': defineMessages({
    edit: { id: 'page.*.edit', defaultMessage: '編輯' },
    showMore: {
      id: 'page.*.showMore',
      defaultMessage: '顯示更多',
    },
    fetchDataError: {
      id: 'page.*.fetchDataError',
      defaultMessage: '讀取錯誤',
    },
    program: { id: 'page.*.program', defaultMessage: '課程' },
    programPackage: { id: 'page.*.programPackage', defaultMessage: '課程組合' },
    all: { id: 'page.*.all', defaultMessage: '全部' },
    selectedCategory: { id: 'page.*.selectedCategory', defaultMessage: '指定分類' },
    member: { id: 'page.*.member', defaultMessage: '會員' },
    date: { id: 'page.*.date', defaultMessage: '日期' },
    selectedMember: { id: 'page.*.selectedMember', defaultMessage: '指定會員' },
    property: { id: 'page.*.property', defaultMessage: '自訂欄位' },
    enrolledMember: {
      id: 'page.*.enrolledMember',
      defaultMessage: '擁有權益的會員',
    },
    chooseMember: { id: 'page.*.chooseMember', defaultMessage: '選擇會員' },
    memberName: { id: 'page.*.memberName', defaultMessage: '姓名' },
    memberEmail: { id: 'page.*.memberEmail', defaultMessage: 'Email' },
    programContentTitle: {
      id: 'page.*.programContentTitle',
      defaultMessage: '單元名稱',
    },
    programContentSectionTitle: {
      id: 'page.*.programContentSectionTitle',
      defaultMessage: '章節名稱',
    },
    programTitle: { id: 'page.*.programTitle', defaultMessage: '課程名稱' },
  }),
  ProjectAdminPage: defineMessages({
    settings: { id: 'project.*.settings', defaultMessage: '專案設定' },
    projectIntroduction: { id: 'project.*.projectIntroduction', defaultMessage: '專案介紹' },
  }),
  ProjectFundingPage: defineMessages({
    projectTitle: { id: 'project.*.projectTitle', defaultMessage: '專案名稱' },
    sponsor: { id: 'project.*.sponsor', defaultMessage: '發起者' },
    unnamedProject: { id: 'project.*.unnamedProject', defaultMessage: '未命名專案' },
  }),
  ProjectPreOrderPage: defineMessages({
    projectTitle: { id: 'project.*.projectTitle', defaultMessage: '專案名稱' },
    sponsor: { id: 'project.*.sponsor', defaultMessage: '發起者' },
    unnamedProject: { id: 'project.*.unnamedProject', defaultMessage: '未命名專案' },
  }),
  ProgramProgressCollectionAdminPage: defineMessages({
    programProgress: { id: 'page.ProgramProgressCollectionAdminPage.programProgress', defaultMessage: '學習進度' },
  }),
  ProgramProcessBlock: defineMessages({
    chooseProgramCategory: {
      id: 'page.ProgramProcessBlock.chooseProgramCategory',
      defaultMessage: '選擇課程分類',
    },
    chooseProgram: { id: 'page.ProgramProcessBlock.chooseProgram', defaultMessage: '選擇課程' },
    allPrograms: { id: 'page.ProgramProcessBlock.allPrograms', defaultMessage: '全部課程' },
    selectedProgram: { id: 'page.ProgramProcessBlock.selectedProgram', defaultMessage: '指定課程' },
    allMembers: { id: 'page.ProgramProcessBlock.allMembers', defaultMessage: '全部會員' },
    chooseProperty: { id: 'page.ProgramProcessBlock.chooseProperty', defaultMessage: '選擇欄位' },
    containKeyword: { id: 'page.ProgramProcessBlock.containKeyword', defaultMessage: '關鍵字包含' },
    categories: { id: 'page.ProgramProcessBlock.categories', defaultMessage: '課程分類' },
    programContentType: {
      id: 'page.ProgramProcessBlock.programContentType',
      defaultMessage: '單元類型',
    },
    programContentDuration: {
      id: 'page.ProgramProcessBlock.programContentDuration',
      defaultMessage: '單元時長(分)',
    },
    watchedDuration: { id: 'page.ProgramProcessBlock.watchedDuration', defaultMessage: '學習時間(分)' },
    watchedPercentage: {
      id: 'page.ProgramProcessBlock.watchedPercentage',
      defaultMessage: '學習進度',
    },
    firstWatchedAt: { id: 'page.ProgramProcessBlock.firstWatchedAt', defaultMessage: '初次觀看時間' },
    lastWatchedAt: { id: 'page.ProgramProcessBlock.lastWatchedAt', defaultMessage: '最後觀看時間' },
    totalPercentage: { id: 'page.ProgramProcessBlock.totalPercentage', defaultMessage: '總課程完成率' },
    exerciseStatus: { id: 'pageProgramProgressCollectionAdminPage.exerciseStatus', defaultMessage: '測驗狀態' },
    exercisePassed: { id: 'pageProgramProgressCollectionAdminPage.exercisePassed', defaultMessage: '通過' },
    exerciseFailed: { id: 'pageProgramProgressCollectionAdminPage.exerciseFailed', defaultMessage: '未通過' },
    exerciseScores: { id: 'page.ProgramProcessBlock.exerciseScores', defaultMessage: '測驗分數' },
    exercisePassedAt: {
      id: 'page.ProgramProcessBlock.exercisePassedAt',
      defaultMessage: '測驗通過時間',
    },
    practices: { id: 'page.ProgramProcessBlock.practices', defaultMessage: '作業' },
    learningDuration: { id: 'page.ProgramProcessBlock.learningDuration', defaultMessage: '學習時數' },
    learningProgress: { id: 'page.ProgramProcessBlock.learningProgress', defaultMessage: '學習進度' },
    exportProgramProgress: {
      id: 'page.ProgramProcessBlock.exportProgramProgress',
      defaultMessage: '匯出學習進度',
    },
    lastUpdatedAtText: {
      id: 'page.ProgramProcessBlock.lastUpdatedAtText',
      defaultMessage: '計算累計到此日期的進度',
    },
  }),
  AppointmentPeriodCollectionAdminPage: defineMessages({
    allInstructors: { id: 'page.AppointmentPeriodCollectionAdminPage.allInstructors', defaultMessage: '全部老師' },
    emptyAppointment: {
      id: 'page.AppointmentPeriodCollectionAdminPage.emptyAppointment',
      defaultMessage: '目前還沒有任何預約',
    },
    dateRangeWarning: {
      id: 'page.AppointmentPeriodCollectionAdminPage.dateRangeWarning',
      defaultMessage: '請選擇時間區間一個月以內',
    },
  }),
  ProgramPackageProcessBlock: defineMessages({
    selectedProgramPackage: { id: 'page.selectedProgramPackage', defaultMessage: '指定課程組合' },
    chooseProgramPackageCategory: {
      id: 'page.ProgramPackageProcessBlock.chooseProgramPackageCategory',
      defaultMessage: '選擇課程組合分類',
    },
    selectedPackageCategory: {
      id: 'page.ProgramPackageProcessBlock.selectedPackageCategory',
      defaultMessage: '指定組合分類',
    },
    allProgramPackage: {
      id: 'page.ProgramPackageProcessBlock.allProgramPackage',
      defaultMessage: '全部課程組合',
    },
    chooseProgramPackage: { id: 'page.ProgramProcessBlock.chooseProgramPackage', defaultMessage: '選擇課程' },
    instructorName: {
      id: 'page.ProgramProcessBlock.instructorName',
      defaultMessage: '講師名稱',
    },
    minutes: {
      id: 'page.ProgramProcessBlock.minutes',
      defaultMessage: '分鐘數',
    },
    programPackageTitle: {
      id: 'page.ProgramPackageProcessBlock.programPackageTitle',
      defaultMessage: '課程組合名稱',
    },
    programPackageCategories: {
      id: 'page.ProgramPackageProcessBlock.programPackageCategories',
      defaultMessage: '課程組合分類',
    },
    rangePickText: {
      id: 'page.ProgramPackageProcessBlock.rangePickText',
      defaultMessage: '計算此日期區間的學習狀況',
    },
  }),
}

// fundingTerm: { id: 'project.*.fundingTerm', defaultMessage: '募資條件' },
// participantsAmount: { id: 'project.*.participantsAmount', defaultMessage: '參與人數' },
// projectCountdownTimer: { id: 'project.*.projectCountdownTimer', defaultMessage: '專案倒數' },
// projectCover: { id: 'project.*.projectCover', defaultMessage: '專案封面' },
// projectAbstract: { id: 'project.*.projectAbstract', defaultMessage: '專案摘要' },
// projectContent: { id: 'project.*.projectContent', defaultMessage: '專案內容' },
// expireAt: { id: 'project.*.expireAt', defaultMessage: '截止日' },
// sortProject: { id: 'project.*.sortProject', defaultMessage: '專案排序' },
// sortProjectPlan: { id: 'project.*.sortProjectPlan', defaultMessage: '方案排序' },
// editProject: { id: 'project.*.editProject', defaultMessage: '編輯方案' },
// noProject: { id: 'project.*.noProject', defaultMessage: '尚未有任何專案' },
// soldOutProjectCount: { id: 'project.*.soldOutProjectCount', defaultMessage: '已售 {count}' },

export default pageMessages
