import { Skeleton } from 'antd'
import gql from 'graphql-tag'
import { isEmpty } from 'ramda'
import React from 'react'
import { useIntl } from 'react-intl'
import AdminPublishBlock, {
  ChecklistItemProps,
  PublishEvent,
  PublishStatus,
} from '../../components/admin/AdminPublishBlock'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { CraftPageAdminProps } from '../../types/craft'

const CraftPagePublishAdminBlock: React.VFC<{
  pageAdmin: CraftPageAdminProps | null
  onRefetch?: () => void
}> = ({ pageAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  //TODO: app_page add published column
  //   const [publishCraftPage] = useMutation<hasura.PUBLISH_ACTIVITY, hasura.PUBLISH_ACTIVITYVariables>(PUBLISH_CRAFT_PAGE)

  if (!pageAdmin) {
    return <Skeleton active />
  }

  const checklist: ChecklistItemProps[] = []

  isEmpty(pageAdmin.pageName) &&
    checklist.push({
      id: 'NO_PAGE_NAME',
      text: formatMessage(craftPageMessages.text.noPageName),
      tab: 'general',
    })
  isEmpty(pageAdmin.path) &&
    checklist.push({
      id: 'NO_PAGE_NAME',
      text: formatMessage(craftPageMessages.text.noPath),
      tab: 'general',
    })
  const publishStatus: PublishStatus = checklist.length > 0 ? 'alert' : !pageAdmin.publishedAt ? 'ordinary' : 'success'

  const [title, description] =
    publishStatus === 'alert'
      ? [formatMessage(commonMessages.status.notComplete), formatMessage(craftPageMessages.text.notCompleteNotation)]
      : publishStatus === 'ordinary'
      ? [formatMessage(commonMessages.status.unpublished), formatMessage(craftPageMessages.text.unpublishedNotation)]
      : publishStatus === 'success'
      ? [formatMessage(commonMessages.status.published), formatMessage(craftPageMessages.text.publishedNotation)]
      : ['', '']

  const handlePublish: (event: PublishEvent) => void = ({ values, onSuccess, onError, onFinally }) => {
    // publishCraftPage({
    //   variables: {
    //     pageId: pageAdmin.id,
    //     publishedAt: values.publishedAt,
    //   },
    // })
    //   .then(() => {
    //     onRefetch?.()
    //     onSuccess?.()
    //   })
    //   .catch(error => onError && onError(error))
    //   .finally(() => onFinally && onFinally())
  }

  return (
    <AdminPublishBlock
      type={publishStatus}
      title={title}
      description={description}
      checklist={checklist}
      onPublish={handlePublish}
    />
  )
}

const PUBLISH_CRAFT_PAGE = gql`
  mutation PUBLISH_CRAFT_PAGE($pageId: uuid!, $publishedAt: timestamptz) {
    update_app_page(where: { id: { _eq: $activityId } }, _set: { published_at: $publishedAt }) {
      affected_rows
    }
  }
`

export default CraftPagePublishAdminBlock
