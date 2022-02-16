import { defineMessages } from 'react-intl'

const craftMessages = {
  '*': defineMessages({
    categorySelectorEnabled: { id: 'craft.*.categorySelectorEnabled', defaultMessage: '啟用分類選擇器' },
    primary: { id: 'craft.*.primary', defaultMessage: '樣式一' },
    secondary: { id: 'craft.*.secondary', defaultMessage: '樣式二' },
    variant: { id: 'craft.*.variant', defaultMessage: '樣式' },
  }),
  ProgramCollectionSetting: defineMessages({
    programSectionId: { id: 'craft.ProgramCollectionSetting.programSectionId', defaultMessage: '課程區塊 ID' },
  }),
  ActivityCollectionSetting: defineMessages({
    activitySectionId: { id: 'craft.ActivityCollectionSetting.activitySectionId', defaultMessage: '活動區塊 ID' },
  }),
  MemberCollectionSetting: defineMessages({
    memberSectionId: { id: 'craft.MemberCollectionSetting.memberSectionId', defaultMessage: '會員區塊 ID' },
  }),
  ProgramContentCollectionSetting: defineMessages({
    programContentSectionId: {
      id: 'craft.ProgramContentCollectionSetting.programContentSectionId',
      defaultMessage: '課程內容區塊 ID',
    },
  }),
  ProgramPackageCollectionSetting: defineMessages({
    programPackageSectionId: {
      id: 'craft.ProgramPackageCollectionSetting.programPackageSectionId',
      defaultMessage: '課程組合區塊 ID',
    },
  }),
  ProjectCollectionSetting: defineMessages({
    projectSectionId: { id: 'craft.ProjectCollectionSetting.projectSectionId', defaultMessage: '專案區塊 ID' },
  }),
}

export default craftMessages
