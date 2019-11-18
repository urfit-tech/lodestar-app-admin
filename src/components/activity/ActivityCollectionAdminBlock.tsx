import React from 'react'
import { ActivityProps } from './Activity'
import ActivityCollectionTabs from './ActivityCollectionTabs'
import ActivityCreationModal from './ActivityCreationModal'

const ActivityCollectionAdminBlock: React.FC<{
  activities: ActivityProps[]
  onCreate?: (
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    data: {
      title: string
      description: string
      activityCategoryIds: string[]
    },
  ) => void
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
