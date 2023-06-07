import { defineMessages } from 'react-intl'

const programPackageMessages = {
  '*': defineMessages({}),
  ProgramPackageBasicFrom: defineMessages({
    tag: { id: 'programPackage.ProgramPackageBasicFrom.tag', defaultMessage: '標籤' },
    showOriginSize: {
      id: 'project.ProgramPackageBasicFrom.showOriginSize',
      defaultMessage: '以原圖尺寸顯示',
    },
    notUploaded: {
      id: 'project.ProgramPackageBasicFrom.notUploaded',
      defaultMessage: '*尚未上傳',
    },
  }),
  ProgramPackagePlanCollectionBlock: defineMessages({
    editPlan: { id: 'programPackage.ProgramPackagePlanCollectionBlock.editPlan', defaultMessage: '編輯方案' },
    sku: { id: 'programPackage.ProgramPackagePlanCollectionBlock.sku', defaultMessage: 'SKU' },
    skuSetting: { id: 'programPackage.ProgramPackagePlanCollectionBlock.skuSetting', defaultMessage: '設定料號' },
  }),
  ProgramPackagePlanAdminModal: defineMessages({
    productLevel: { id: 'programPackage.ProgramPackagePlanAdminModal.productLevel', defaultMessage: '方案等級' },
  }),
}

export default programPackageMessages
