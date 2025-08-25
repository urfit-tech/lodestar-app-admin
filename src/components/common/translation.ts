import { defineMessages } from 'react-intl'

const commonMessages = {
  '*': defineMessages({
    save: { id: 'common.*.save', defaultMessage: '存檔' },
    cancel: { id: 'common.*.cancel', defaultMessage: '取消' },
    confirm: { id: 'common.*.confirm', defaultMessage: '確定' },
    successfullySaved: { id: 'common.*.successfullySaved', defaultMessage: '儲存成功' },
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
  ManagerInput: defineMessages({
    loadError: {
      id: 'common.ManagerInput.loadError',
      defaultMessage: '讀取錯誤',
    },
  }),
  SalesMemberInput: defineMessages({
    loadError: {
      id: 'common.SalesMemberInput.loadError',
      defaultMessage: '讀取錯誤',
    },
  }),
  SharingCode: defineMessages({
    title: { id: 'common.SharingCode.title', defaultMessage: '推廣網址' },
    description: {
      id: 'common.SharingCode.description',
      defaultMessage:
        '1. 當學生由你所設定的「推廣網址」進入購買，該筆訂單將標記為由推廣網址下單。\n2. 刪除或修改將會直接取代並失效原本的網址，因此網址公開推廣曝光後，不建議再做刪除或修改。',
    },
    code: { id: 'common.SharingCode.code', defaultMessage: '設定網址' },
    codeIsRequired: {
      id: 'common.SharingCode.code.IsRequired',
      defaultMessage: '未填寫設定網址',
    },
    codeDuplicated: {
      id: 'common.SharingCode.Duplicated',
      defaultMessage: '推廣網址不可重複',
    },
    note: { id: 'common.SharingCode.note', defaultMessage: '用途備註' },
    copiedToClipboard: {
      id: 'common.SharingCode.copiedToClipboard',
      defaultMessage: '已複製到剪貼簿',
    },
    copy: { id: 'common.SharingCode.copy', defaultMessage: '複製' },
    addUrl: { id: 'common.SharingCode.addUrl', defaultMessage: '新增網址' },
  }),
}

export default commonMessages
