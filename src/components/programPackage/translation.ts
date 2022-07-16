import { defineMessages } from 'react-intl'

const programPackageMessages = {
  '*': defineMessages({}),
  ProgramPackageBasicFrom: defineMessages({
    tag: { id: 'programPackage.ProgramPackageBasicFrom.tag', defaultMessage: '標籤' },
  }),
  ProgramPackagePlanCollectionBlock: defineMessages({
    editPlan: { id: 'programPackage.ProgramPackagePlanCollectionBlock.editPlan', defaultMessage: '編輯方案' },
    sku: { id: 'programPackage.ProgramPackagePlanCollectionBlock.sku', defaultMessage: 'SKU' },
    skuSetting: { id: 'programPackage.ProgramPackagePlanCollectionBlock.skuSetting', defaultMessage: '設定料號' },
  }),
}

export default programPackageMessages
