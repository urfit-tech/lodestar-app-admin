import { Tabs } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { StringParam, useQueryParam } from 'use-query-params'
import Activity, { ActivityProps } from './Activity'

const messages = defineMessages({
  holding: { id: 'activity.status.holding', defaultMessage: '正在舉辦' },
  finished: { id: 'activity.status.finished', defaultMessage: '已結束' },
  draft: { id: 'activity.status.draft', defaultMessage: '未上架' },
})

const ActivityCollectionTabs: React.FC<{
  activities: ActivityProps[]
}> = ({ activities }) => {
  const [activeKey, setActiveKey] = useQueryParam('tabkey', StringParam)
  const { formatMessage } = useIntl()

  const tabContents = [
    {
      key: 'holding',
      name: formatMessage(messages.holding),
      activities: activities.filter(
        activity => activity.isPublished && activity.endedAt && activity.endedAt.getTime() > Date.now(),
      ),
    },
    {
      key: 'finished',
      name: formatMessage(messages.finished),
      activities: activities.filter(
        activity => activity.isPublished && activity.endedAt && activity.endedAt.getTime() < Date.now(),
      ),
    },
    {
      key: 'draft',
      name: formatMessage(messages.draft),
      activities: activities.filter(activity => !activity.isPublished || !activity.endedAt),
    },
  ]

  return (
    <Tabs activeKey={activeKey || 'holding'} onChange={key => setActiveKey(key)}>
      {tabContents.map(tabContent => (
        <Tabs.TabPane key={tabContent.key} tab={`${tabContent.name} (${tabContent.activities.length})`}>
          <div className="row py-5">
            {tabContent.activities.map(activity => (
              <div key={activity.id} className="col-12 col-md-6 col-lg-4 mb-5">
                <Activity {...activity} />
              </div>
            ))}
          </div>
        </Tabs.TabPane>
      ))}
    </Tabs>
  )
}

export default ActivityCollectionTabs
