import React from 'react'
import { ActivityProps } from './Activity'
import ActivityCollectionTabs from './ActivityCollectionTabs'
import ActivityCreationModal, { CreateActivityEvent } from './ActivityCreationModal'

const ActivityCollectionAdminBlock: React.FC<{
  activities: ActivityProps[]
  onCreate?: (event: CreateActivityEvent) => void
}> = ({ activities, onCreate }) => {
  return (
    <div>
      <div className="mb-5">
        <ActivityCreationModal onCreate={onCreate} />
      </div>
      <ActivityCollectionTabs activities={activities} />
    </div>
  )
}

export default ActivityCollectionAdminBlock
