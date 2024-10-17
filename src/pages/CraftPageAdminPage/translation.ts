import { defineMessages } from 'react-intl'

const CraftPageAdminPage = {
  '*': defineMessages({}),
  CraftPageBasicSettingBlock: defineMessages({
    selectLocale: { id: 'CraftPageAdminPage.CraftPageBasicSettingBlock.selectLocale', defaultMessage: '選擇語系' },
    displayLocale: { id: 'CraftPageAdminPage.CraftPageBasicSettingBlock.displayLocale', defaultMessage: '顯示語系' },
    localeTooltip: {
      id: 'CraftPageAdminPage.CraftPageBasicSettingBlock.localeTooltip',
      defaultMessage: '當前台為指定語系時才會顯示，若不選擇全語系皆顯示',
    },
    pathIsExistWarning: {
      id: 'CraftPageAdminPage.CraftPageBasicSettingBlock.pathIsExistWarning',
      defaultMessage: '網址路徑重複，請更換',
    },
    localePathIsExistWarning: {
      id: 'CraftPageAdminPage.CraftPageBasicSettingBlock.localePathIsExistWarning',
      defaultMessage: '{locale}語系已重複設定同個路徑',
    },
    noneLocalePathIsExistWarning: {
      id: 'CraftPageCollectionPage.CraftPageBasicSettingBlock.noneLocalePathIsExist',
      defaultMessage: '不指定特定語系已重複設定同個路徑',
    },
    noSpecificLocale: {
      id: 'CraftPageCollectionPage.CraftPageBasicSettingBlock.noSpecificLocale',
      defaultMessage: '不指定特定語系',
    },
    displayLocaleTooltip: {
      id: 'CraftPageCollectionPage.CraftPageBasicSettingBlock.displayLocaleTooltip',
      defaultMessage: '當前台為指定語系時才會顯示，若不選擇全語系皆顯示',
    },
  }),
}

export default CraftPageAdminPage
