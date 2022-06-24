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
      id: 'program.MetaProductDeletionBlock.deleteProductWarning',
      defaultMessage: '請仔細確認是否真的要刪除{metaProduct}，因為一旦刪除就無法恢復。',
    },
  }),
}

export default commonMessages
