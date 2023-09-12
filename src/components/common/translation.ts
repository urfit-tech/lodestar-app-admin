import { defineMessages } from 'react-intl'

const commonMessages = {
  '*': defineMessages({}),
  MetaProductDeletionBlock: defineMessages({
    delete: {
      id: 'common.MetaProductDeletionBlock.delete',
      defaultMessage: 'delete',
    },
    back: {
      id: 'common.MetaProductDeletionBlock.back',
      defaultMessage: 'back',
    },
    successfullyDeleted: {
      id: 'common.MetaProductDeletionBlock.successfullyDeleted',
      defaultMessage: 'Successfully deleted',
    },
    deleteProduct: {
      id: 'common.MetaProductDeletionBlock.deleteProduct',
      defaultMessage: '刪除{metaProduct}',
    },
    deleteConfirmation: {
      id: 'common.MetaProductDeletionBlock.deleteConfirmation',
      defaultMessage: '{metaProduct}一經刪除即不可恢復，確定要刪除嗎？',
    },
    deleteProductWarning: {
      id: 'common.MetaProductDeletionBlock.deleteProductWarning',
      defaultMessage: '請仔細確認是否真的要刪除{metaProduct}，因為一旦刪除就無法恢復。',
    },
  }),
  ProductSkuModal: defineMessages({
    channelSkuDuplicated: {
      id: 'common.ProductSkuModal.channelSkuDuplicated',
      defaultMessage: '通路料號重複，請重新設定',
    },
    productChannelSkuDuplicated: {
      id: 'common.ProductSkuModal.productChannelSkuDuplicated',
      defaultMessage: '通路料號 {channelSku} 與「{productName}」重複，請重新設定',
    },
    productChannelUpdateError: {
      id: 'common.ProductSkuModal.productChannelUpdateError',
      defaultMessage: '更新通路料號發生錯誤，請重新設定。',
    },
  }),
  UnAuthCover: defineMessages({
    unAuth: { id: 'common.UnAuthCover.unAuth', defaultMessage: '無此權限' },
  }),
}

export default commonMessages
