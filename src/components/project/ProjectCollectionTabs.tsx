import { Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'
import { ProjectDataType } from '../../types/project'
import ProjectCollectionBlock from './ProjectCollectionBlock'

const ProjectCollectionTabs: React.FC<{ projectType: ProjectDataType }> = ({ projectType }) => {
  const { formatMessage } = useIntl()
  const { currentMemberId, permissions } = useAuth()
  const [counts, setCounts] = useState<{ [key: string]: number }>({})
  const { id: appId } = useApp()
  const adminPermissionOfProjectType =
    projectType === 'funding'
      ? 'PROJECT_FUNDING_ADMIN'
      : projectType === 'pre-order'
      ? 'PROJECT_PRE_ORDER_ADMIN'
      : 'null'
  const permissionOfProjectType =
    projectType === 'funding'
      ? 'PROJECT_FUNDING_NORMAL'
      : projectType === 'pre-order'
      ? 'PROJECT_PRE_ORDER_NORMAL'
      : 'null'

  const creatorId = {
    _eq: permissions[adminPermissionOfProjectType]
      ? undefined
      : permissions[permissionOfProjectType]
      ? currentMemberId
      : '',
  }

  const tabContents: {
    key: string
    tab: string
    condition: hasura.GET_PROJECT_PREVIEW_COLLECTIONVariables['condition']
    orderBy?: hasura.GET_PROJECT_PREVIEW_COLLECTIONVariables['orderBy']
    withSortingButton?: boolean
  }[] = [
    {
      key: 'published',
      tab: formatMessage(commonMessages.status.published),
      condition: {
        type: { _eq: projectType },
        published_at: { _is_null: false },
        _or: [{ expired_at: { _gt: 'now()' } }, { expired_at: { _is_null: true } }],
        creator_id: creatorId,
      },
      orderBy: [{ position: 'asc' as hasura.order_by }],
      withSortingButton: true,
    },
    {
      key: 'draft',
      tab: formatMessage(commonMessages.status.draft),
      condition: {
        type: { _eq: projectType },
        published_at: { _is_null: true },
        creator_id: creatorId,
      },
    },
    {
      key: 'finished',
      tab: formatMessage(commonMessages.status.finished),
      condition: {
        type: { _eq: projectType },
        published_at: { _is_null: false },
        expired_at: { _lt: 'now()' },
        creator_id: creatorId,
      },
    },
  ]

  return (
    <Tabs defaultActiveKey="published">
      {tabContents.map(tabContent => (
        <Tabs.TabPane
          key={tabContent.key}
          tab={`${tabContent.tab} ${typeof counts[tabContent.key] === 'number' ? `(${counts[tabContent.key]})` : ''}`}
        >
          <ProjectCollectionBlock
            appId={appId}
            projectType={projectType}
            condition={tabContent.condition}
            orderBy={tabContent?.orderBy}
            withSortingButton={tabContent.withSortingButton}
            onReady={count =>
              count !== counts[tabContent.key] &&
              setCounts({
                ...counts,
                [tabContent.key]: count,
              })
            }
          />
        </Tabs.TabPane>
      ))}
    </Tabs>
  )
}
export default ProjectCollectionTabs
