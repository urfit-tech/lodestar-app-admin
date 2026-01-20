import { defineMessages } from 'react-intl'

const programPackageMessages = {
  '*': defineMessages({}),
  ProgramPackageBasicFrom: defineMessages({
    tag: { id: 'programPackage.ProgramPackageBasicFrom.tag', defaultMessage: 'Tag' },
    showOriginSize: {
      id: 'project.ProgramPackageBasicFrom.showOriginSize',
      defaultMessage: 'Display at original size',
    },
    notUploaded: {
      id: 'project.ProgramPackageBasicFrom.notUploaded',
      defaultMessage: '*Not uploaded yet',
    },
  }),
  ProgramPackagePlanCollectionBlock: defineMessages({
    editPlan: { id: 'programPackage.ProgramPackagePlanCollectionBlock.editPlan', defaultMessage: 'Edit plan' },
    sku: { id: 'programPackage.ProgramPackagePlanCollectionBlock.sku', defaultMessage: 'SKU' },
    skuSetting: { id: 'programPackage.ProgramPackagePlanCollectionBlock.skuSetting', defaultMessage: 'Set SKU' },
  }),
  ProgramPackagePlanAdminModal: defineMessages({
    productLevel: { id: 'programPackage.ProgramPackagePlanAdminModal.productLevel', defaultMessage: 'Plan level' },
  }),
  ProgramPackageProgramConnectionModal: defineMessages({
    allPerpetualPrograms: {
      id: 'programPackage.ProgramPackageProgramConnectionModal.allPerpetualPrograms',
      defaultMessage: 'All single courses',
    },
    allSubscriptionPrograms: {
      id: 'programPackage.ProgramPackageProgramConnectionModal.allSubscriptionPrograms',
      defaultMessage: 'All subscription courses',
    },
  }),
}

export default programPackageMessages
