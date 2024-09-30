import { defineMessages } from 'react-intl'

const craftPageCollectionPageMessages = {
  '*': defineMessages({
    duplicate: { id: 'CraftPageCollectionPage.*.duplicate', defaultMessage: '複製' },
    create: { id: 'CraftPageCollectionPage.*.create', defaultMessage: '建立' },
    createPage: { id: 'CraftPageCollectionPage.*.createPage', defaultMessage: '建立頁面' },
    choiceTemplate: { id: 'CraftPageCollectionPage.*.choiceTemplate', defaultMessage: '選擇版型' },
    previousStep: { id: 'CraftPageCollectionPage.*.previousStep', defaultMessage: '上一步' },
    emptyPage: { id: 'CraftPageCollectionPage.*.emptyPage', defaultMessage: '空白頁' },
    cancel: { id: 'CraftPageCollectionPage.*.cancel', defaultMessage: '取消' },
    nextStep: { id: 'CraftPageCollectionPage.*.nextStep', defaultMessage: '下一步' },
    pageName: { id: 'CraftPageCollectionPage.*.pageName', defaultMessage: '頁面名稱' },
    duplicateCraftPage: { id: 'CraftPageCollectionPage.*.duplicateCraftPage', defaultMessage: '複製頁面' },
    isRequired: { id: 'CraftPageCollectionPage.*.isRequired', defaultMessage: '請輸入{field}' },
    path: { id: 'CraftPageCollectionPage.*.path', defaultMessage: '網址路徑' },
    pathTips: { id: 'CraftPageCollectionPage.*.pathTips', defaultMessage: '請填入頁面網址路徑，ex：/path' },
    slashIsRequest: { id: 'CraftPageCollectionPage.*.slashIsRequest', defaultMessage: '斜線是必須的' },
    pathIsExistWarning: {
      id: 'craftPageAdminPage.*.pathIsExist',
      defaultMessage: '網址路徑重複，請更換',
    },
    localePathIsExistWarning: {
      id: 'CraftPageCollectionPage.*.pathIsExist',
      defaultMessage: '{locale}語系已重複設定同個路徑',
    },
    header: { id: 'CraftPageCollectionPage.*.header', defaultMessage: '頁首選單' },
    footer: { id: 'CraftPageCollectionPage.*.footer', defaultMessage: '頁尾選單' },
    enable: { id: 'CraftPageCollectionPage.*.enable', defaultMessage: '顯示' },
    disable: { id: 'CraftPageCollectionPage.*.disable', defaultMessage: '隱藏' },
    displayLocale: { id: 'CraftPageCollectionPage.*.displayLocale', defaultMessage: '顯示語系' },
    noSpecificLocale: {
      id: 'CraftPageCollectionPage.*.noSpecificLocale',
      defaultMessage: '不指定特定語系',
    },
    noneLocalePathIsExistWarning: {
      id: 'CraftPageCollectionPage.*.noneLocalePathIsExist',
      defaultMessage: '不指定特定語系已重複設定同個路徑',
    },
  }),
  CraftPageCollectionTable: defineMessages({
    url: { id: 'CraftPageCollectionPage.CraftPageCollectionTable.url', defaultMessage: '網址' },
    latestUpdatedAt: {
      id: 'CraftPageCollectionPage.CraftPageCollectionTable.latestUpdatedAt',
      defaultMessage: '最後修改時間',
    },
  }),
  CraftPageReplicateModal: defineMessages({
    originPageName: {
      id: 'CraftPageCollectionPage.CraftPageReplicateModal.originPageName',
      defaultMessage: '原始的頁面名稱',
    },
    originPath: { id: 'CraftPageCollectionPage.CraftPageReplicateModal.originPath', defaultMessage: '原始的網址路徑' },
  }),
  CraftPageCreationModal: defineMessages({}),
}

export default craftPageCollectionPageMessages
