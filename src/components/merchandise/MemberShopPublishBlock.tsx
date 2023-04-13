import { gql, useMutation } from '@apollo/client'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'
import { MemberShopProps } from '../../types/merchandise'
import AdminPublishBlock, { ChecklistItemProps, PublishEvent, PublishStatus } from '../admin/AdminPublishBlock'

const messages = defineMessages({
  notCompleteNotation: {
    id: 'merchandise.text.notCompleteNotation',
    defaultMessage: '請填寫以下必填資料，填寫完畢即可啟用你的商店',
  },
  unpublishedNotation: {
    id: 'merchandise.text.unpublishedNotation',
    defaultMessage: '你的商店未啟用，你的所有商品並不會顯示在頁面上。',
  },
  publishedNotation: {
    id: 'merchandise.text.publishedNotation',
    defaultMessage: '現在你的商店已啟用，你的所有商品會出現在頁面上。',
  },
  noTitle: { id: 'merchandise.text.noShopTitle', defaultMessage: '尚未填寫商店名稱' },
  noShippingMethod: { id: 'merchandise.text.noShippingMethod', defaultMessage: '尚未設定物流' },
  noShippingDays: { id: 'merchandise.text.noShippingDays', defaultMessage: '尚未填寫寄送天數' },
  activateShop: { id: 'merchandise.ui.activateShop', defaultMessage: '啟用商店' },
  closeShop: { id: 'merchandise.ui.closeShop', defaultMessage: '關閉商店' },
})

const MemberShopPublishBlock: React.FC<{
  memberShop: MemberShopProps
  onRefetch?: () => void
}> = ({ memberShop, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [publishMemberShop] = useMutation<hasura.PUBLISH_MEMBER_SHOP, hasura.PUBLISH_MEMBER_SHOPVariables>(
    PUBLISH_MEMBER_SHOP,
  )

  const checklist: ChecklistItemProps[] = []

  !memberShop.title &&
    checklist.push({
      id: 'NO_TITLE',
      text: formatMessage(messages.noTitle),
      tab: 'settings',
    })
  memberShop.shippingMethods.length === 0 &&
    checklist.push({
      id: 'NO_SHIPPING_METHOD',
      text: formatMessage(messages.noShippingMethod),
      tab: 'shipping-methods',
    })
  memberShop.shippingMethods.some(shippingMethod => shippingMethod.days === 0) &&
    checklist.push({
      id: 'NO_SHIPPING_DAYS',
      text: formatMessage(messages.noShippingDays),
      tab: 'shipping-methods',
    })

  const publishStatus: PublishStatus = checklist.length > 0 ? 'alert' : !memberShop.publishedAt ? 'ordinary' : 'success'

  const [title, description] =
    publishStatus === 'alert'
      ? [formatMessage(commonMessages.status.notComplete), formatMessage(messages.notCompleteNotation)]
      : publishStatus === 'ordinary'
      ? [formatMessage(commonMessages.status.unpublished), formatMessage(messages.unpublishedNotation)]
      : publishStatus === 'success'
      ? [formatMessage(commonMessages.status.published), formatMessage(messages.publishedNotation)]
      : ['', '']

  const handlePublish: (event: PublishEvent) => void = ({ values, onSuccess, onError, onFinally }) => {
    publishMemberShop({
      variables: {
        memberShopId: memberShop.id,
        publishedAt: values.publishedAt,
      },
    })
      .then(() => {
        onSuccess?.()
        onRefetch?.()
      })
      .catch(error => onError && onError(error))
      .finally(() => onFinally && onFinally())
  }

  return (
    <AdminPublishBlock
      type={publishStatus}
      checklist={checklist}
      title={title}
      description={description}
      publishText={formatMessage(messages.activateShop)}
      unPublishText={formatMessage(messages.closeShop)}
      onPublish={handlePublish}
    />
  )
}

const PUBLISH_MEMBER_SHOP = gql`
  mutation PUBLISH_MEMBER_SHOP($memberShopId: uuid!, $publishedAt: timestamptz) {
    update_member_shop(where: { id: { _eq: $memberShopId } }, _set: { published_at: $publishedAt }) {
      affected_rows
    }
  }
`

export default MemberShopPublishBlock
