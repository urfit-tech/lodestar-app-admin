import { defineMessages } from 'react-intl'

const craftPageCollectionPageMessages = {
  '*': defineMessages({
    duplicate: { id: 'page.*.duplicate', defaultMessage: '複製' },
    create: { id: 'page.*.create', defaultMessage: '建立' },
    createPage: { id: 'page.*.createPage', defaultMessage: '建立頁面' },
    choiceTemplate: { id: 'page.*.choiceTemplate', defaultMessage: '選擇版型' },
    previousStep: { id: 'page.*.previousStep', defaultMessage: '上一步' },
    emptyPage: { id: 'page.*.emptyPage', defaultMessage: '空白頁' },
    cancel: { id: 'page.*.cancel', defaultMessage: '取消' },
    nextStep: { id: 'page.*.nextStep', defaultMessage: '下一步' },
    pageName: { id: 'page.*.pageName', defaultMessage: '頁面名稱' },
    duplicateCraftPage: { id: 'page.*.duplicateCraftPage', defaultMessage: '複製頁面' },
    isRequired: { id: 'page.*.isRequired', defaultMessage: '請輸入{field}' },
    path: { id: 'page.*.path', defaultMessage: '網址路徑' },
    pathTips: { id: 'page.*.pathTips', defaultMessage: '請填入頁面網址路徑，ex：/path' },
    slashIsRequest: { id: 'page.*.slashIsRequest', defaultMessage: '斜線是必須的' },
    pathIsExistWarning: { id: 'page.*.pathIsExist', defaultMessage: '網址路徑重複，請更換' },
  }),
  CraftPageCollectionTable: defineMessages({
    url: { id: 'page.CraftPageCollectionTable.url', defaultMessage: '網址' },
    latestUpdatedAt: { id: 'page.CraftPageCollectionTable.latestUpdatedAt', defaultMessage: '最後修改時間' },
  }),
  CraftPageReplicateModal: defineMessages({
    originPageName: { id: 'page.CraftPageReplicateModal.originPageName', defaultMessage: '原始的頁面名稱' },
    originPath: { id: 'page.CraftPageReplicateModal.originPath', defaultMessage: '原始的網址路徑' },
  }),
}

export default craftPageCollectionPageMessages
