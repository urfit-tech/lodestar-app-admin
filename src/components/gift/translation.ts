import { defineMessages } from 'react-intl'

const giftPlanMessages = {
  GiftPlanCollectionAdminModal: defineMessages({
    editGiftPlan: { id: 'giftPlan.GiftPlanCollectionAdminModal.editGiftPlan', defaultMessage: '編輯贈品方案' },
    title: { id: 'giftPlan.GiftPlanCollectionAdminModal.title', defaultMessage: '贈品方案名稱' },
    titleIsRequired: {
      id: 'giftPlan.GiftPlanCollectionAdminModal.titleIsRequired',
      defaultMessage: '贈品方案名稱為必填',
    },
    giftItemName: { id: 'giftPlan.GiftPlanCollectionAdminModal.giftItemName', defaultMessage: '贈品項目' },
    customGiftNameIsRequired: {
      id: 'giftPlan.GiftPlanCollectionAdminModal.customGiftNameIsRequired',
      defaultMessage: '贈品項目名稱為必填',
    },
    giftCover: { id: 'giftPlan.GiftPlanCollectionAdminModal.giftCover', defaultMessage: '贈品封面' },
    giftCoverTips: {
      id: 'giftPlan.GiftPlanCollectionAdminModal.giftCoverTips',
      defaultMessage: '建議圖片尺寸：600*600px',
    },
    giftDeliverMethod: {
      id: 'giftPlan.GiftPlanCollectionAdminModal.giftDeliverMethod',
      defaultMessage: '贈品交付方式',
    },
    isDeliverable: { id: 'giftPlan.GiftPlanCollectionAdminModal.isDeliverable', defaultMessage: '需索取寄送地址' },
    isNotDeliverable: { id: 'giftPlan.GiftPlanCollectionAdminModal.isNotDeliverable', defaultMessage: '線上自行交付' },
  }),
  GiftPlanDeleteAdminModal: defineMessages({
    deleteGriftPlanMessage: {
      id: 'giftPlan.GiftPlanDeleteAdminModal.deleteGriftPlanMessage',
      defaultMessage: '確定刪除此贈品方案？',
    },
  }),
  GiftPlanPublishAdminModal: defineMessages({
    discontinueGriftPlanMessage: {
      id: 'giftPlan.GiftPlanPublishAdminModal.discontinueGriftPlanMessage',
      defaultMessage: '確定下架此贈品方案？',
    },
  }),
}

export default giftPlanMessages
