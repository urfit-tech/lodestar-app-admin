import { Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { StringParam, useQueryParam } from 'use-query-params'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'
import { ProjectDataType } from '../../types/project'
import ProjectCollectionBlock from './ProjectCollectionBlock'

const ProjectCollectionTabs: React.FC<{ projectType: ProjectDataType }> = ({ projectType }) => {
  const { formatMessage } = useIntl()
  const { currentMemberId, permissions } = useAuth()
  const [counts, setCounts] = useState<{ [key: string]: number }>({})
  const { id: appId } = useApp()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)

  const creatorId = {
    _eq:
      (projectType === 'funding' && permissions.PROJECT_FUNDING_ADMIN) ||
      (projectType === 'pre-order' && permissions.PROJECT_PRE_ORDER_ADMIN) ||
      (projectType === 'portfolio' && permissions.PROJECT_PORTFOLIO_ADMIN)
        ? undefined
        : (projectType === 'funding' && permissions.PROJECT_FUNDING_NORMAL) ||
          (projectType === 'pre-order' && permissions.PROJECT_PRE_ORDER_NORMAL) ||
          (projectType === 'portfolio' && permissions.PROJECT_PORTFOLIO_NORMAL)
        ? currentMemberId
        : '',
  }

  const tabContents: {
    key: string
    tab: string
    condition: hasura.GET_PROJECT_PREVIEW_COLLECTIONVariables['condition']
    markedRoleCondition?: hasura.GET_MARKED_PROJECT_ROLESVariables['condition']
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
      orderBy:
        projectType === 'portfolio'
          ? { published_at: 'desc' as hasura.order_by }
          : { position: 'asc' as hasura.order_by },
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
    {
      key: 'marked',
      tab: formatMessage(commonMessages.status.marked),
      condition: {
        type: { _eq: projectType },
        project_roles: { member_id: { _eq: currentMemberId } },
      },
      markedRoleCondition: { created_at: { _lt: 'now()' } },
    },
  ]

  return (
    <Tabs
      defaultActiveKey={projectType === 'portfolio' ? undefined : 'published'}
      activeKey={projectType === 'portfolio' ? activeKey || 'published' : undefined}
      onChange={key => {
        if (projectType === 'portfolio') {
          setActiveKey(key)
        } else {
          return undefined
        }
      }}
    >
      {tabContents
        .filter(
          tabContent =>
            (projectType === 'portfolio' ? tabContent.key === 'finished' : tabContent.key === 'marked') === false,
        )
        .map(tabContent => (
          <Tabs.TabPane
            key={tabContent.key}
            tab={`${tabContent.tab} ${typeof counts[tabContent.key] === 'number' ? `(${counts[tabContent.key]})` : ''}`}
          >
            <ProjectCollectionBlock
              appId={appId}
              projectType={projectType}
              condition={tabContent.condition}
              markedRoleCondition={tabContent.markedRoleCondition}
              orderBy={tabContent?.orderBy}
              withSortingButton={tabContent.withSortingButton}
              tabContentKey={tabContent.key}
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
