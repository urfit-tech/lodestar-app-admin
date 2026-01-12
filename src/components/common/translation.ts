import { defineMessages } from 'react-intl'

const commonMessages = {
  '*': defineMessages({
    save: { id: 'common.*.save', defaultMessage: 'Save' },
    cancel: { id: 'common.*.cancel', defaultMessage: 'Cancel' },
    confirm: { id: 'common.*.confirm', defaultMessage: 'Confirm' },
    successfullySaved: { id: 'common.*.successfullySaved', defaultMessage: 'Saved successfully' },
  }),
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
      defaultMessage: 'Delete {metaProduct}',
    },
    deleteConfirmation: {
      id: 'common.MetaProductDeletionBlock.deleteConfirmation',
      defaultMessage: '{metaProduct} cannot be recovered once deleted. Are you sure you want to delete it?',
    },
    deleteProductWarning: {
      id: 'common.MetaProductDeletionBlock.deleteProductWarning',
      defaultMessage: 'Please carefully confirm whether you really want to delete {metaProduct}, as it cannot be recovered once deleted.',
    },
  }),
  ProductSkuModal: defineMessages({
    channelSkuDuplicated: {
      id: 'common.ProductSkuModal.channelSkuDuplicated',
      defaultMessage: 'Channel SKU is duplicated, please reset',
    },
    productChannelSkuDuplicated: {
      id: 'common.ProductSkuModal.productChannelSkuDuplicated',
      defaultMessage: 'Channel SKU {channelSku} is duplicated with "{productName}", please reset',
    },
    productChannelUpdateError: {
      id: 'common.ProductSkuModal.productChannelUpdateError',
      defaultMessage: 'Error occurred while updating channel SKU, please reset.',
    },
  }),
  UnAuthCover: defineMessages({
    unAuth: { id: 'common.UnAuthCover.unAuth', defaultMessage: 'No permission' },
  }),
  ManagerInput: defineMessages({
    loadError: {
      id: 'common.ManagerInput.loadError',
      defaultMessage: 'Load error',
    },
  }),
  SalesMemberInput: defineMessages({
    loadError: {
      id: 'common.SalesMemberInput.loadError',
      defaultMessage: 'Load error',
    },
  }),
  SharingCode: defineMessages({
    title: { id: 'common.SharingCode.title', defaultMessage: 'Promotion URL' },
    description: {
      id: 'common.SharingCode.description',
      defaultMessage:
        '1. When students purchase through the "Promotion URL" you set, the order will be marked as ordered through the promotion URL.\n2. Deleting or modifying will directly replace and invalidate the original URL. Therefore, after the URL is publicly promoted, it is not recommended to delete or modify it again.',
    },
    code: { id: 'common.SharingCode.code', defaultMessage: 'Set URL' },
    codeIsRequired: {
      id: 'common.SharingCode.code.IsRequired',
      defaultMessage: 'URL is not filled in',
    },
    codeDuplicated: {
      id: 'common.SharingCode.Duplicated',
      defaultMessage: 'Promotion URL cannot be duplicated',
    },
    note: { id: 'common.SharingCode.note', defaultMessage: 'Usage note' },
    copiedToClipboard: {
      id: 'common.SharingCode.copiedToClipboard',
      defaultMessage: 'Copied to clipboard',
    },
    copy: { id: 'common.SharingCode.copy', defaultMessage: 'Copy' },
    addUrl: { id: 'common.SharingCode.addUrl', defaultMessage: 'Add URL' },
  }),
}

export default commonMessages
