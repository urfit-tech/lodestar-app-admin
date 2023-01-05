import { Button, Skeleton, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import { useActivityCollection, useCategoryCollection } from '../../hooks/activity'
import Activity from './Activity'

const StyledButton = styled(Button)`
  && {
    height: 36px;
    font-size: 14px;
    padding: 6px 20px;
    border-radius: 30px;
  }
`

const messages = defineMessages({
  holding: { id: 'activity.status.holding', defaultMessage: '正在舉辦' },
  finished: { id: 'activity.status.finished', defaultMessage: '已結束' },
  draft: { id: 'activity.status.draft', defaultMessage: '未上架' },
  privateHolding: { id: 'activity.status.privateHolding', defaultMessage: '私密舉辦' },
  allCategory: { id: 'activity.ui.allCategory', defaultMessage: '全部分類' },
})

type Tab = 'holding' | 'finished' | 'draft' | 'privateHolding'

const ActivityCollectionTabs: React.FC<{
  memberId: string | null
}> = ({ memberId }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const [currentTab, setCurrentTab] = useState<Tab>('holding')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [counts, setCounts] = useState<{ [key: string]: number }>({})
  const condition = {
    holding: {
      organizer_id: { _eq: memberId },
      is_private: { _eq: false },
      published_at: { _is_null: false },
      activity_during_period: { ended_at: { _gt: 'now()' } },
    },
    finished: {
      organizer_id: { _eq: memberId },
      is_private: { _eq: false },
      published_at: { _is_null: false },
      activity_during_period: { ended_at: { _lt: 'now()' } },
    },
    draft: {
      organizer_id: { _eq: memberId },
      _or: [{ published_at: { _is_null: true } }, { activity_during_period: { ended_at: { _is_null: true } } }],
    },
    privateHolding: {
      organizer_id: { _eq: memberId },
      is_private: { _eq: true },
      activity_during_period: { ended_at: { _gt: 'now()' } },
    },
  }
  const { loadingActivities, activities, currentTabActivityCount, loadMoreActivities, refetchActivities } =
    useActivityCollection(condition[currentTab], selectedCategoryId)
  const { categories } = useCategoryCollection(condition[currentTab])

  if (!loadingActivities && currentTabActivityCount && !counts[currentTab]) {
    setCounts({
      ...counts,
      [currentTab]: currentTabActivityCount,
    })
  }

  const tabContents = [
    {
      key: 'holding',
      tab: formatMessage(messages.holding),
    },
    {
      key: 'finished',
      tab: formatMessage(messages.finished),
    },
    {
      key: 'draft',
      tab: formatMessage(messages.draft),
    },
    {
      key: 'privateHolding',
      tab: formatMessage(messages.privateHolding),
      hidden: !enabledModules.private_activity,
    },
  ]

  return (
    <Tabs
      defaultActiveKey={'holding'}
      onChange={() => refetchActivities()}
      onTabClick={key => {
        setCurrentTab(key as Tab)
        setSelectedCategoryId(null)
      }}
    >
      {tabContents
        .filter(tabContent => !tabContent.hidden)
        .map(tabContent => (
          <Tabs.TabPane
            key={tabContent.key}
            tab={`${tabContent.tab} ${counts[tabContent.key] ? `(${counts[tabContent.key]})` : ''}`}
          >
            <>
              <StyledButton
                type={selectedCategoryId === null ? 'primary' : 'default'}
                className="mb-2"
                onClick={() => setSelectedCategoryId(null)}
              >
                {formatMessage(messages.allCategory)}
              </StyledButton>
              {categories.map(category => (
                <StyledButton
                  key={category.id}
                  type={selectedCategoryId === category.id ? 'primary' : 'default'}
                  className="ml-2 mb-2"
                  onClick={() => setSelectedCategoryId(category.id)}
                >
                  {category.name}
                </StyledButton>
              ))}
            </>
            <div className="row py-5">
              {loadingActivities && <Skeleton active />}
              {activities.map(activity => (
                <div key={activity.id} className="col-12 col-md-6 col-lg-4 mb-5">
                  <Activity
                    id={activity.id}
                    coverUrl={activity.coverUrl}
                    title={activity.title}
                    includeSessionTypes={activity.includeSessionTypes}
                    participantsCount={activity.participantsCount}
                    startedAt={activity.startedAt}
                    endedAt={activity.endedAt}
                  />
                </div>
              ))}
            </div>
            {loadMoreActivities && (
              <div className="text-center mt-4">
                <Button
                  loading={loading}
                  onClick={() => {
                    setLoading(true)
                    loadMoreActivities().then(() => setLoading(false))
                  }}
                >
                  {formatMessage(commonMessages.ui.showMore)}
                </Button>
              </div>
            )}
          </Tabs.TabPane>
        ))}
    </Tabs>
  )
}

export default ActivityCollectionTabs
