import { Tabs } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { ProjectDataType } from '../../types/project'
import ProjectCollectionBlock from './ProjectCollectionBlock'

const ProjectCollectionTabs: React.FC<{ projectType: ProjectDataType }> = ({ projectType }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { currentMemberId, currentUserRole } = useAuth()
  const [counts, setCounts] = useState<{ [key: string]: number }>({})

  const tabContents: {
    key: string
    tab: string
    condition: types.GET_PROJECT_PREVIEW_COLLECTIONVariables['condition']
  }[] = [
    {
      key: 'published',
      tab: formatMessage(commonMessages.status.published),
      condition: {
        type: { _eq: projectType },
        published_at: { _is_null: false },
        creator_id: { _eq: currentUserRole !== 'app-owner' ? currentMemberId : null },
      },
    },
    {
      key: 'draft',
      tab: formatMessage(commonMessages.status.draft),
      condition: {
        type: { _eq: projectType },
        published_at: { _is_null: true },
        creator_id: { _eq: currentUserRole !== 'app-owner' ? currentMemberId : null },
      },
    },
    {
      key: 'finished',
      tab: formatMessage(commonMessages.status.finished),
      condition: {
        type: { _eq: projectType },
        expired_at: { _lte: 'now()' },
        creator_id: { _eq: currentUserRole !== 'app-owner' ? currentMemberId : null },
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
            condition={tabContent.condition}
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
