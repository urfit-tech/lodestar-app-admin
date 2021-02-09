import { useMutation } from '@apollo/react-hooks'
import { Skeleton } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { ProjectAdminProps, ProjectDataType } from '../../types/project'
import AdminPublishBlock, { ChecklistItemProps, PublishEvent, PublishStatus } from '../admin/AdminPublishBlock'

const messages = defineMessages({
  notCompleteNotation: {
    id: 'project.text.notCompleteNotation',
    defaultMessage: '請填寫以下必填資料，填寫完畢即可發佈你的專案。',
  },
  unpublishedNotation: {
    id: 'project.text.unpublishedNotation',
    defaultMessage: '你的專案未發佈，此專案並不會顯示在頁面上。',
  },
  publishedNotation: {
    id: 'project.text.publishedNotation',
    defaultMessage: '現在你的專案已發佈，此專案會出現在頁面上。',
  },
  noTitle: { id: 'project.text.noShopTitle', defaultMessage: '尚未設定專案名稱' },
  noFundingTerm: { id: 'project.text.noSalePlan', defaultMessage: '尚未訂定募資條件' },
  noSalePrice: { id: 'project.text.noShippingDays', defaultMessage: '尚未訂定售價' },
  activateProject: { id: 'project.ui.activateShop', defaultMessage: '發佈專案' },
  closeProject: { id: 'project.ui.closeShop', defaultMessage: '取消發佈' },
})

const ProjectPublishAdminBlock: React.FC<{
  type?: ProjectDataType
  project: ProjectAdminProps | null
  onRefetch?: () => void
}> = ({ project, type, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [publishProject] = useMutation<types.PUBLISH_PROJECT, types.PUBLISH_PROJECTVariables>(PUBLISH_PROJECT)

  if (!project) {
    return <Skeleton active />
  }
  const checklist: ChecklistItemProps[] = []

  !project.title &&
    checklist.push({
      id: 'NO_TITLE',
      text: formatMessage(messages.noTitle),
      tab: 'settings',
    })
  !project.targetAmount &&
    project.projectType === 'funding' &&
    checklist.push({
      id: 'NO_SHIPPING_METHOD',
      text: formatMessage(messages.noFundingTerm),
      tab: 'settings',
    })
  ;(project.projectPlan.length === 0 || project.projectPlan.some(v => v.listPrice === null)) &&
    checklist.push({
      id: 'NO_PROJECT_PLAN',
      text: formatMessage(messages.noSalePrice),
      tab: 'salesPlan',
    })

  const publishStatus: PublishStatus = checklist.length > 0 ? 'alert' : !project.publishedAt ? 'ordinary' : 'success'

  const [title, description] =
    publishStatus === 'alert'
      ? [formatMessage(commonMessages.status.notComplete), formatMessage(messages.notCompleteNotation)]
      : publishStatus === 'ordinary'
      ? [formatMessage(commonMessages.status.unpublished), formatMessage(messages.unpublishedNotation)]
      : publishStatus === 'success'
      ? [formatMessage(commonMessages.status.published), formatMessage(messages.publishedNotation)]
      : ['', '']

  const handlePublish: (event: PublishEvent) => void = ({ values, onSuccess, onError, onFinally }) => {
    publishProject({
      variables: {
        projectId: project.id,
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
      publishText={formatMessage(messages.activateProject)}
      unPublishText={formatMessage(messages.closeProject)}
      onPublish={handlePublish}
    />
  )
}

const PUBLISH_PROJECT = gql`
  mutation PUBLISH_PROJECT($projectId: uuid!, $publishedAt: timestamptz) {
    update_project(where: { id: { _eq: $projectId } }, _set: { published_at: $publishedAt }) {
      affected_rows
    }
  }
`

export default ProjectPublishAdminBlock
