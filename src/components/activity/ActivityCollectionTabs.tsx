import { Skeleton, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useActivityCollection } from '../../hooks/activity'
import Activity from './Activity'

const messages = defineMessages({
  holding: { id: 'activity.status.holding', defaultMessage: '正在舉辦' },
  finished: { id: 'activity.status.finished', defaultMessage: '已結束' },
  draft: { id: 'activity.status.draft', defaultMessage: '未上架' },
  privateHolding: { id: 'activity.status.privateHolding', defaultMessage: '私密舉辦' },
})

const ActivityCollectionTabs: React.FC<{
  memberId: string | null
}> = ({ memberId }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { loadingActivities, activities, refetchActivities } = useActivityCollection(memberId)

  const tabContents = [
    {
      key: 'holding',
      tab: formatMessage(messages.holding),
      activities: activities.filter(
        activity =>
          activity.publishedAt && activity.endedAt && activity.endedAt.getTime() > Date.now() && !activity.isPrivate,
      ),
    },
    {
      key: 'finished',
      tab: formatMessage(messages.finished),
      activities: activities.filter(
        activity => activity.publishedAt && activity.endedAt && activity.endedAt.getTime() < Date.now(),
      ),
    },
    {
      key: 'draft',
      tab: formatMessage(messages.draft),
      activities: activities.filter(activity => !activity.publishedAt || !activity.endedAt),
    },
    {
      key: 'privateHolding',
      tab: formatMessage(messages.privateHolding),
      activities: activities.filter(
        activity =>
          activity.publishedAt && activity.endedAt && activity.endedAt.getTime() > Date.now() && activity.isPrivate,
      ),
      hidden: !enabledModules.private_activity,
    },
  ]

  return (
    <Tabs defaultActiveKey={'holding'} onChange={() => refetchActivities()}>
      {tabContents
        .filter(tabContent => !tabContent.hidden)
        .map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={`${tabContent.tab} (${tabContent.activities.length})`}>
            <div className="row py-5">
              {loadingActivities && <Skeleton active />}
              {tabContent.activities.map(activity => (
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
          </Tabs.TabPane>
        ))}
    </Tabs>
  )
}

export default ActivityCollectionTabs
