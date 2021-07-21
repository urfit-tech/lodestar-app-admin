import { Skeleton, Tabs } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useActivityCollection } from '../../hooks/activity'
import Activity from './Activity'

const messages = defineMessages({
  holding: { id: 'activity.status.holding', defaultMessage: '正在舉辦' },
  finished: { id: 'activity.status.finished', defaultMessage: '已結束' },
  draft: { id: 'activity.status.draft', defaultMessage: '未上架' },
})

const ActivityCollectionTabs: React.FC<{
  memberId: string | null
}> = ({ memberId }) => {
  const { formatMessage } = useIntl()
  const { loadingActivities, activities, refetchActivities } = useActivityCollection(memberId)

  const tabContents = [
    {
      key: 'holding',
      tab: formatMessage(messages.holding),
      activities: activities.filter(
        activity => activity.publishedAt && activity.endedAt && activity.endedAt.getTime() > Date.now(),
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
  ]

  return (
    <Tabs defaultActiveKey={'holding'} onChange={() => refetchActivities()}>
      {tabContents.map(tabContent => (
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
