import { Tabs } from 'antd'
import React, { useState } from 'react'
import { StringParam, useQueryParam } from 'use-query-params'
import Activity, { ActivityProps } from './Activity'

const ActivityCollectionTabs: React.FC<{
  activities: ActivityProps[]
}> = ({ activities }) => {
  const [defaultActiveKey, setDefaultActiveKey] = useQueryParam('tabkey', StringParam)
  const [activeKey, setActiveKey] = useState(defaultActiveKey || 'now')

  const tabContents = [
    {
      key: 'now',
      name: '正在舉辦',
      activities: activities.filter(
        activity => activity.isPublished && activity.endedAt && activity.endedAt.getTime() > Date.now(),
      ),
    },
    {
      key: 'finished',
      name: '已結束',
      activities: activities.filter(
        activity => activity.isPublished && activity.endedAt && activity.endedAt.getTime() < Date.now(),
      ),
    },
    {
      key: 'not-published',
      name: '未上架',
      activities: activities.filter(activity => !activity.isPublished || !activity.endedAt),
    },
  ]

  return (
    <Tabs
      activeKey={activeKey}
      onChange={key => {
        setActiveKey(key)
        setDefaultActiveKey(key)
      }}
    >
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
