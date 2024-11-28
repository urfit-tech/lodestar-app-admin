import { defineMessages } from 'react-intl'

const ReviewAdminFormMessages = {
    common: defineMessages({
        title: { id: 'reviewAdmin.common.title', defaultMessage: '評論管理' },
        yes: { id: 'reviewAdmin.common.yes', defaultMessage: '是' },
        no: { id: 'reviewAdmin.common.no', defaultMessage: '否' },
    }),
    option: defineMessages({
        isWritable: { id: 'reviewAdmin.option.isWritable', defaultMessage: '允許寫入評論' },
        isItemViewable: { id: 'reviewAdmin.option.isItemViewable', defaultMessage: '允許檢視評論' },
        isScoreViewable: { id: 'reviewAdmin.option.isScoreViewable', defaultMessage: '允許檢視分數' },
    })

}

export default ReviewAdminFormMessages