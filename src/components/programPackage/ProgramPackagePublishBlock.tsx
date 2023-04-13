import { gql, useMutation } from '@apollo/client'
import { Skeleton } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'
import { ProgramPackageProps } from '../../types/programPackage'
import AdminPublishBlock, { ChecklistItemProps, PublishStatus } from '../admin/AdminPublishBlock'

const messages = defineMessages({
  noTitle: { id: 'programPackage.text.noTitle', defaultMessage: '尚未填寫名稱' },
  noProgramPackagePlan: { id: 'programPackage.text.noProgramPackagePlan', defaultMessage: '尚未訂定銷售方案' },

  notCompleteNotation: {
    id: 'programPackage.status.notCompleteNotation',
    defaultMessage: '未發佈，此課程組合並不會顯示在頁面上',
  },
  unpublishedNotation: {
    id: 'programPackage.status.unpublishedNotation',
    defaultMessage: '你的課程組合未發佈，此課程組合並不會顯示在頁面上。',
  },
  publishedNotation: {
    id: 'programPackage.status.publishedNotation',
    defaultMessage: '現在你的課程組合已發佈，此課程組合會出現在頁面上。',
  },
  privatelyPublished: {
    id: 'programPackage.privatelyPublished',
    defaultMessage: '已私密發佈',
  },
  isPrivatelyPublishedNotation: {
    id: 'programPackage.isPrivatelyPublishedNotation',
    defaultMessage: '你的課程組合已經私密發佈，此課程組合不會出現在頁面上，學生僅能透過連結進入瀏覽。',
  },
})

const ProgramPackagePublishBlock: React.FC<{
  programPackage: ProgramPackageProps | null
  onRefetch?: () => void
}> = ({ programPackage, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const [publishProgramPackage] = useMutation<hasura.PUBLISH_PROGRAM_PACKAGE, hasura.PUBLISH_PROGRAM_PACKAGEVariables>(
    PUBLISH_PROGRAM_PACKAGE,
  )

  if (!programPackage) {
    return <Skeleton active />
  }

  const checklist: ChecklistItemProps[] = []
  !programPackage.title &&
    checklist.push({
      id: 'NO_TITLE',
      text: formatMessage(messages.noTitle),
      tab: 'basic',
    })
  !programPackage.plans.length &&
    checklist.push({
      id: 'NO_PROGRAM_PACKAGE',
      text: formatMessage(messages.noProgramPackagePlan),
      tab: 'sales',
    })

  const publishStatus: PublishStatus =
    checklist.length > 0 ? 'alert' : programPackage.publishedAt ? 'success' : 'ordinary'

  let [title, description] = ['', '']
  if (publishStatus === 'alert')
    [title, description] = [
      formatMessage(commonMessages.status.notComplete),
      formatMessage(messages.notCompleteNotation),
    ]
  if (publishStatus === 'success')
    [title, description] = [formatMessage(commonMessages.status.published), formatMessage(messages.publishedNotation)]
  if (publishStatus === 'ordinary')
    [title, description] = [
      formatMessage(commonMessages.status.unpublished),
      formatMessage(messages.unpublishedNotation),
    ]
  if (publishStatus === 'success' && programPackage.isPrivate === true)
    [title, description] = [
      formatMessage(messages.privatelyPublished),
      formatMessage(messages.isPrivatelyPublishedNotation),
    ]

  return (
    <>
      <AdminPublishBlock
        checklist={checklist}
        type={publishStatus}
        title={title}
        description={description}
        isPrivateEnabled={enabledModules.private_program_package}
        onPublish={({ values: { publishedAt, isPrivate }, onSuccess, onError, onFinally }) => {
          publishProgramPackage({
            variables: { programPackageId: programPackage.id, isPrivate, publishedAt },
          })
            .then(() => {
              onRefetch?.()
              onSuccess?.()
            })
            .catch(error => onError && onError(error))
            .finally(() => onFinally && onFinally())
        }}
      />
    </>
  )
}

const PUBLISH_PROGRAM_PACKAGE = gql`
  mutation PUBLISH_PROGRAM_PACKAGE($programPackageId: uuid!, $isPrivate: Boolean!, $publishedAt: timestamptz) {
    update_program_package(
      where: { id: { _eq: $programPackageId } }
      _set: { published_at: $publishedAt, is_private: $isPrivate }
    ) {
      affected_rows
    }
  }
`

export default ProgramPackagePublishBlock
