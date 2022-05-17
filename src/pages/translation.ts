import { defineMessages } from 'react-intl'

const pageMessages = {
  '*': defineMessages({
    edit: { id: 'page.*.edit', defaultMessage: '編輯' },
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
    all: { id: 'page.ProgramProgressCollectionAdminPage.all', defaultMessage: '全部' },
    selectedCategory: { id: 'page.ProgramProgressCollectionAdminPage.selectedCategory', defaultMessage: '指定分類' },
    chooseProgramCategory: {
      id: 'page.ProgramProgressCollectionAdminPage.chooseProgramCategory',
      defaultMessage: '選擇課程分類',
    },
    program: { id: 'page.ProgramProgressCollectionAdminPage.program', defaultMessage: '課程' },
    chooseProgram: { id: 'page.ProgramProgressCollectionAdminPage.chooseProgram', defaultMessage: '選擇課程' },
    allPrograms: { id: 'page.ProgramProgressCollectionAdminPage.allPrograms', defaultMessage: '全部課程' },
    selectedProgram: { id: 'page.ProgramProgressCollectionAdminPage.selectedProgram', defaultMessage: '指定課程' },
    member: { id: 'page.ProgramProgressCollectionAdminPage.member', defaultMessage: '會員' },
    date: { id: 'page.ProgramProgressCollectionAdminPage.date', defaultMessage: '日期' },
    chooseMember: { id: 'page.ProgramProgressCollectionAdminPage.chooseMember', defaultMessage: '選擇會員' },
    allMembers: { id: 'page.ProgramProgressCollectionAdminPage.allMembers', defaultMessage: '全部會員' },
    selectedMember: { id: 'page.ProgramProgressCollectionAdminPage.selectedMember', defaultMessage: '指定會員' },
    property: { id: 'page.ProgramProgressCollectionAdminPage.property', defaultMessage: '自訂欄位' },
    chooseProperty: { id: 'page.ProgramProgressCollectionAdminPage.chooseProperty', defaultMessage: '選擇欄位' },
    containKeyword: { id: 'page.ProgramProgressCollectionAdminPage.containKeyword', defaultMessage: '關鍵字包含' },
    categories: { id: 'page.ProgramProgressCollectionAdminPage.categories', defaultMessage: '課程分類' },
    programTitle: { id: 'page.ProgramProgressCollectionAdminPage.programTitle', defaultMessage: '課程名稱' },
    programContentSectionTitle: {
      id: 'page.ProgramProgressCollectionAdminPage.programContentSectionTitle',
      defaultMessage: '章節名稱',
    },
    programContentTitle: {
      id: 'page.ProgramProgressCollectionAdminPage.programContentTitle',
      defaultMessage: '單元名稱',
    },
    programContentType: {
      id: 'page.ProgramProgressCollectionAdminPage.programContentType',
      defaultMessage: '單元類型',
    },
    programContentDuration: {
      id: 'page.ProgramProgressCollectionAdminPage.programContentDuration',
      defaultMessage: '單元時長(分)',
    },
    memberName: { id: 'page.ProgramProgressCollectionAdminPage.memberName', defaultMessage: '姓名' },
    memberEmail: { id: 'page.ProgramProgressCollectionAdminPage.memberEmail', defaultMessage: 'Email' },
    watchedDuration: { id: 'page.ProgramProgressCollectionAdminPage.watchedDuration', defaultMessage: '學習時間(分)' },
    watchedPercentage: {
      id: 'page.ProgramProgressCollectionAdminPage.watchedPercentage',
      defaultMessage: '學習進度',
    },
    firstWatchedAt: { id: 'page.ProgramProgressCollectionAdminPage.firstWatchedAt', defaultMessage: '初次觀看時間' },
    lastWatchedAt: { id: 'page.ProgramProgressCollectionAdminPage.lastWatchedAt', defaultMessage: '最後觀看時間' },
    totalPercentage: { id: 'page.ProgramProgressCollectionAdminPage.totalPercentage', defaultMessage: '總課程完成率' },
    exerciseStatus: { id: 'pageProgramProgressCollectionAdminPage.exerciseStatus', defaultMessage: '測驗狀態' },
    exercisePassed: { id: 'pageProgramProgressCollectionAdminPage.exercisePassed', defaultMessage: '通過' },
    exerciseFailed: { id: 'pageProgramProgressCollectionAdminPage.exerciseFailed', defaultMessage: '未通過' },
    exerciseScores: { id: 'page.ProgramProgressCollectionAdminPage.exerciseScores', defaultMessage: '測驗分數' },
    exercisePassedAt: {
      id: 'page.ProgramProgressCollectionAdminPage.exercisePassedAt',
      defaultMessage: '測驗通過時間',
    },
    practices: { id: 'page.ProgramProgressCollectionAdminPage.practices', defaultMessage: '作業' },
    learningDuration: { id: 'page.ProgramProgressCollectionAdminPage.learningDuration', defaultMessage: '學習時數' },
    learningProgress: { id: 'page.ProgramProgressCollectionAdminPage.learningProgress', defaultMessage: '學習進度' },
    exportProgramProgress: {
      id: 'page.ProgramProgressCollectionAdminPage.exportProgramProgress',
      defaultMessage: '匯出學習進度',
    },
    progressUpdatedAtText: {
      id: 'page.ProgramProgressCollectionAdminPage.progressUpdatedAtText',
      defaultMessage: '計算累計到此日期的進度',
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
