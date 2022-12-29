import { useMutation } from '@apollo/react-hooks'
import { Skeleton } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'
import { useProject } from '../../hooks/project'
import { ProjectAdminProps, ProjectDataType } from '../../types/project'
import AdminPublishBlock, { ChecklistItemProps, PublishEvent, PublishStatus } from '../admin/AdminPublishBlock'
import projectMessages from './translation'

const ProjectPublishAdminBlock: React.FC<{
  type?: ProjectDataType
  project: ProjectAdminProps | null
  onRefetch?: () => void
}> = ({ project, type, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [publishProject] = useMutation<hasura.PUBLISH_PROJECT, hasura.PUBLISH_PROJECTVariables>(PUBLISH_PROJECT)
  const { updateHasSendNotification } = useProject()

  if (!project) {
    return <Skeleton active />
  }
  const checklist: ChecklistItemProps[] = []

  !project.title &&
    checklist.push({
      id: 'NO_TITLE',
      text: formatMessage(projectMessages.ProjectPublishAdminBlock.noTitle),
      tab: 'settings',
    })

  if (type === 'portfolio') {
    !project.authorId &&
      checklist.push({
        id: 'NO_AUTHOR',
        text: formatMessage(projectMessages.ProjectPublishAdminBlock.noAuthor),
        tab: 'role',
      })
    !project.coverUrl &&
      checklist.push({
        id: 'NO_VIDEO_URL',
        text: formatMessage(projectMessages.ProjectPublishAdminBlock.noVideoUrl),
        tab: 'settings',
      })
  } else {
    !project.targetAmount &&
      project.projectType === 'funding' &&
      checklist.push({
        id: 'NO_SHIPPING_METHOD',
        text: formatMessage(projectMessages.ProjectPublishAdminBlock.noFundingTerm),
        tab: 'settings',
      })
    ;(project.projectPlan.length === 0 || project.projectPlan.some(v => v.listPrice === null)) &&
      checklist.push({
        id: 'NO_PROJECT_PLAN',
        text: formatMessage(projectMessages.ProjectPublishAdminBlock.noSalePrice),
        tab: 'salesPlan',
      })
  }

  const publishStatus: PublishStatus = checklist.length > 0 ? 'alert' : !project.publishedAt ? 'ordinary' : 'success'

  const [title, description] =
    publishStatus === 'alert'
      ? [
          formatMessage(commonMessages.status.notComplete),
          type === 'portfolio'
            ? formatMessage(projectMessages.ProjectPublishAdminBlock.notCompletePortfolioNotation)
            : formatMessage(projectMessages.ProjectPublishAdminBlock.notCompleteNotation),
        ]
      : publishStatus === 'ordinary'
      ? [
          formatMessage(commonMessages.status.unpublished),
          type === 'portfolio'
            ? formatMessage(projectMessages.ProjectPublishAdminBlock.unpublishedPortfolioNotation)
            : formatMessage(projectMessages.ProjectPublishAdminBlock.unpublishedNotation),
        ]
      : publishStatus === 'success'
      ? [
          formatMessage(commonMessages.status.published),
          type === 'portfolio'
            ? formatMessage(projectMessages.ProjectPublishAdminBlock.publishedNotation)
            : formatMessage(projectMessages.ProjectPublishAdminBlock.publishedNotation),
        ]
      : ['', '']

  const handlePublish: (event: PublishEvent) => void = ({ values, onSuccess, onError, onFinally }) => {
    publishProject({
      variables: {
        projectId: project.id,
        publishedAt: values.publishedAt,
      },
    })
      .then(() => {
        if (type === 'portfolio') {
          updateHasSendNotification({ variables: { projectId: project.id } })
            .then(() => {
              onSuccess?.()
              onRefetch?.()
            })
            .catch(error => onError && onError(error))
        } else {
          onSuccess?.()
          onRefetch?.()
        }
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
      publishText={
        type === 'portfolio'
          ? formatMessage(projectMessages.ProjectPublishAdminBlock.activateNow)
          : formatMessage(projectMessages.ProjectPublishAdminBlock.activateProject)
      }
      unPublishText={formatMessage(projectMessages.ProjectPublishAdminBlock.closeProject)}
      unpublishingWarningText={
        type === 'portfolio'
          ? formatMessage(projectMessages.ProjectPublishAdminBlock.portfolioUnpublishingWarningText)
          : undefined
      }
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
