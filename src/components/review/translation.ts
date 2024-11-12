import { defineMessages } from 'react-intl'

const ReviewAdminFormMessages = {
    common: defineMessages({
        title: { id: 'title', defaultMessage: 'Review Admin' },
        yes: { id: 'yes', defaultMessage: 'Yes' },
        no: { id: 'no', defaultMessage: 'No' },
    }),
    option: defineMessages({
        isWritable: { id: 'isWritable', defaultMessage: '允許寫入評論' },
        isItemViewable: { id: 'isItemViewable', defaultMessage: '允許檢視評論' },
        isScoreViewable: { id: 'isScoreViewable', defaultMessage: '允許檢視分數' },
    })

}

export default ReviewAdminFormMessages