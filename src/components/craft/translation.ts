import { defineMessages } from 'react-intl'

const craftMessages = {
  '*': defineMessages({
    categorySelectorEnabled: { id: 'craft.*.categorySelectorEnabled', defaultMessage: '啟用分類選擇器' },
    primary: { id: 'craft.*.primary', defaultMessage: '樣式一' },
    secondary: { id: 'craft.*.secondary', defaultMessage: '樣式二' },
    variant: { id: 'craft.*.variant', defaultMessage: '樣式' },
    spaceStyle: { id: 'craft.*.spaceStyle', defaultMessage: '間距樣式' },
    positionStyle: { id: 'craft.*.positionStyle', defaultMessage: '位置樣式' },
    borderStyle: { id: 'craft.*.borderStyle', defaultMessage: '框線樣式' },
  }),
  ProgramCollectionSettings: defineMessages({
    programSectionId: { id: 'craft.ProgramCollectionSettings.programSectionId', defaultMessage: '課程區塊 ID' },
  }),
  ActivityCollectionSettings: defineMessages({
    activitySectionId: { id: 'craft.ActivityCollectionSettings.activitySectionId', defaultMessage: '活動區塊 ID' },
  }),
  MemberCollectionSettings: defineMessages({
    memberSectionId: { id: 'craft.MemberCollectionSettings.memberSectionId', defaultMessage: '會員區塊 ID' },
  }),
  ProgramContentCollectionSettings: defineMessages({
    programContentSectionId: {
      id: 'craft.ProgramContentCollectionSettings.programContentSectionId',
      defaultMessage: '課程內容區塊 ID',
    },
  }),
  ProgramPackageCollectionSettings: defineMessages({
    programPackageSectionId: {
      id: 'craft.ProgramPackageCollectionSettings.programPackageSectionId',
      defaultMessage: '課程組合區塊 ID',
    },
  }),
  ProjectCollectionSettings: defineMessages({
    projectSectionId: { id: 'craft.ProjectCollectionSettings.projectSectionId', defaultMessage: '專案區塊 ID' },
  }),
  ImageSettings: defineMessages({
    ratio: { id: 'craft.ImageSettings.ratio', defaultMessage: '比例' },
  }),
  SizeStyleInput: defineMessages({
    width: { id: 'craft.SizeStyleInput.width', defaultMessage: '寬度' },
    height: { id: 'craft.SizeStyleInput.height', defaultMessage: '高度' },
  }),
  LayoutSettings: defineMessages({
    ratio: { id: 'craft.LayoutSettings.ratio', defaultMessage: '比例' },
    gap: { id: 'craft.LayoutSettings.gap', defaultMessage: '間距' },
  }),
}

export default craftMessages
