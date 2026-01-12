import { Skeleton } from 'antd'
import { isEmpty } from 'ramda'
import React from 'react'
import { useIntl } from 'react-intl'
import AdminPublishBlock, { ChecklistItemProps, PublishEvent, PublishStatus } from '../../components/admin/AdminPublishBlock'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { useMutateAppPage } from '../../hooks/appPage'
import { CraftPageAdminProps } from '../../types/craft'

const CraftPagePublishAdminBlock: React.VFC<{
  pageAdmin: CraftPageAdminProps | null
  onRefetch?: () => void
}> = ({ pageAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { updateAppPage } = useMutateAppPage()

  if (!pageAdmin) {
    return <Skeleton active />
  }

  const checklist: ChecklistItemProps[] = []

  isEmpty(pageAdmin.title) &&
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
    updateAppPage({
      pageId: pageAdmin.id,
      publishedAt: values.publishedAt || null,
    })
      .then(() => {
        onRefetch?.()
        onSuccess?.()
      })
      .catch(error => onError && onError(error))
      .finally(() => onFinally && onFinally())
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

export default CraftPagePublishAdminBlock
