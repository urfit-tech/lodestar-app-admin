import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
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
})

const ProgramPackagePublishBlock: React.FC<{
  programPackage: ProgramPackageProps
  onRefetch?: () => void
}> = ({ programPackage, onRefetch }) => {
  const { formatMessage } = useIntl()

  const checklist: ChecklistItemProps[] = []
  !programPackage.title &&
    checklist.push({
      id: 'NO_TITLE',
      text: formatMessage(messages.noTitle),
      tabkey: 'basic',
    })
  !programPackage.plans.length &&
    checklist.push({
      id: 'NO_PROGRAM_PACKAGE',
      text: formatMessage(messages.noProgramPackagePlan),
      tabkey: 'sales',
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

  const publishProgramPackage = useProgramPackagePublish(programPackage.id)

  return (
    <>
      <AdminPublishBlock
        checklist={checklist}
        type={publishStatus}
        title={title}
        description={description}
        onPublish={({ values: { publishedAt: now }, onSuccess, onError, onFinally }) => {
          publishProgramPackage(now)
            .then(() => {
              onRefetch && onRefetch()
              onSuccess && onSuccess()
            })
            .catch(error => onError && onError(error))
            .finally(() => onFinally && onFinally())
        }}
      />
    </>
  )
}

const useProgramPackagePublish = (id: string) => {
  const [publishProgramPackageHandler] = useMutation(gql`
    mutation PROGRAM_PACKAGE_PUBLISH($id: uuid!, $publishedAt: timestamptz) {
      update_program_package(_set: { published_at: $publishedAt }, where: { id: { _eq: $id } }) {
        affected_rows
      }
    }
  `)

  const publishProgramPackage = (publishedAt: Date | null) => {
    return publishProgramPackageHandler({
      variables: {
        id,
        publishedAt,
      },
    })
  }

  return publishProgramPackage
}

export default ProgramPackagePublishBlock
