import { defineMessages } from 'react-intl'

const MembershipCardAdminPageMessages = {
  basicForm: defineMessages({
    cardTitle: { id: 'membershipCardAdminPage.basicForm.title', defaultMessage: 'card title' },
    sku: { id: 'membershipCardAdminPage.basicForm.sku', defaultMessage: 'Material Code (sku)' },
    effectiveDate: { id: 'membershipCardAdminPage.basicForm.effectiveDate', defaultMessage: 'effective date' },
    specifiedEffectiveDate: {
      id: 'membershipCardAdminPage.basicForm.specifiedEffectiveDate',
      defaultMessage: 'Specified effective date',
    },
    startCountingAfterHolding: {
      id: 'membershipCardAdminPage.basicForm.startCountingAfterHolding',
      defaultMessage: 'Start counting after holding',
    },
    effectiveDateDescription: {
      id: 'membershipCardAdminPage.basicForm.effectiveDateDescription',
      defaultMessage:
        "If the start date is not specified, it means 'effective immediately'; if the end date is not specified, it means 'never expires.'",
    },
    membershipCardDescription: {
      id: 'membershipCardAdminPage.basicForm.cardDescription',
      defaultMessage: 'Card Description',
    },
  }),
  previewModal: defineMessages({
    demoName: { id: 'membershipCardAdminPage.membershipCardPreviewModal.demoName', defaultMessage: 'John Doe' },
    demoAccount: { id: 'membershipCardAdminPage.membershipCardPreviewModal.demoAccount', defaultMessage: 'demo' },
  }),
  adminPage: defineMessages({
    membershipCardIntro: { id: 'membershipCardAdminPage.adminPage.intro', defaultMessage: 'Membership Card Template ' },
    membershipCardSetting: {
      id: 'membershipCardAdminPage.adminPage.setting',
      defaultMessage: 'Membership Card setting',
    },
    discountSetting: { id: 'membershipCardAdminPage.adminPage.discountSetting', defaultMessage: 'Discount Setting' },
  }),
}

export default MembershipCardAdminPageMessages
