import { message } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { useMutation } from 'react-apollo-hooks'
import { ActivityAdminProps } from '../../components/activity/ActivityAdminBlock'
import ActivitySettingsAdminBlockComponent from '../../components/activity/ActivitySettingsAdminBlock'
import types from '../../types'

const ActivitySettingsAdminBlock: React.FC<{
  activityAdmin: ActivityAdminProps
  onRefetch?: () => void
}> = ({ activityAdmin, onRefetch }) => {
  const updateActivityBasic = useMutation<types.UPDATE_ACTIVITY_BASIC, types.UPDATE_ACTIVITY_BASICVariables>(
    UPDATE_ACTIVITY_BASIC,
  )
  const updateActivityIntroduction = useMutation<
    types.UPDATE_ACTIVITY_INTRODUCTION,
    types.UPDATE_ACTIVITY_INTRODUCTIONVariables
  >(UPDATE_ACTIVITY_INTRODUCTION)

  const handleUpdateBasic: (
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    data: {
      title: string
      categoryIds: string[]
      isParticipantsVisible: boolean
    },
  ) => void = (setLoading, { title, categoryIds, isParticipantsVisible }) => {
    setLoading(true)

    updateActivityBasic({
      variables: {
        activityId: activityAdmin.id,
        title,
        isParticipantsVisible,
        activityCategories: categoryIds.map((categoryId, index) => ({
          activity_id: activityAdmin.id,
          category_id: categoryId,
          position: index,
        })),
      },
    })
      .then(() => {
        message.success('儲存成功')
        if (onRefetch) {
          onRefetch()
        }
      })
      .catch(error => {
        if (process.env.NODE_ENV === 'development') {
          console.error(error)
        }
        message.error('儲存失敗')
      })
      .finally(() => setLoading(false))
  }

  const handleUpdateIntroduction: (
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    data: {
      coverUrl: string
      description: string
    },
  ) => void = (setLoading, { coverUrl, description }) => {
    setLoading(true)

    updateActivityIntroduction({
      variables: {
        activityId: activityAdmin.id,
        coverUrl,
        description,
      },
    })
      .then(() => {
        message.success('儲存成功')
        if (onRefetch) {
          onRefetch()
        }
      })
      .catch(error => {
        if (process.env.NODE_ENV === 'development') {
          console.error(error)
        }
        message.error('儲存失敗')
      })
      .finally(() => setLoading(false))
  }

  return (
    <ActivitySettingsAdminBlockComponent
      activityAdmin={activityAdmin}
      onUpdateBasic={handleUpdateBasic}
      onUpdateIntroduction={handleUpdateIntroduction}
    />
  )
}

const UPDATE_ACTIVITY_BASIC = gql`
  mutation UPDATE_ACTIVITY_BASIC(
    $activityId: uuid!
    $title: String!
    $isParticipantsVisible: Boolean!
    $activityCategories: [activity_category_insert_input!]!
  ) {
    update_activity(
      where: { id: { _eq: $activityId } }
      _set: { title: $title, is_participants_visible: $isParticipantsVisible }
    ) {
      affected_rows
    }

    delete_activity_category(where: { activity_id: { _eq: $activityId } }) {
      affected_rows
    }

    insert_activity_category(objects: $activityCategories) {
      affected_rows
    }
  }
`
const UPDATE_ACTIVITY_INTRODUCTION = gql`
  mutation UPDATE_ACTIVITY_INTRODUCTION($activityId: uuid!, $coverUrl: String, $description: String) {
    update_activity(where: { id: { _eq: $activityId } }, _set: { cover_url: $coverUrl, description: $description }) {
      affected_rows
    }
  }
`

export default ActivitySettingsAdminBlock
