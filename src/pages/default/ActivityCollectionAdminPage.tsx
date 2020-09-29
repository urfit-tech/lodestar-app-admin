import Icon from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import ActivityCollectionTabs from '../../components/activity/ActivityCollectionTabs'
import { AdminPageTitle } from '../../components/admin'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import AdminLayout from '../../components/layout/AdminLayout'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as CalendarAltIcon } from '../../images/icon/calendar-alt.svg'
import types from '../../types'

const ActivityCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { currentMemberId, currentUserRole } = useAuth()
  const { id: appId } = useContext(AppContext)
  const [createActivity] = useMutation<types.INSERT_ACTIVITY, types.INSERT_ACTIVITYVariables>(INSERT_ACTIVITY)

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <CalendarAltIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.activities)}</span>
      </AdminPageTitle>

      {currentMemberId && (
        <>
          <div className="mb-5">
            <ProductCreationModal
              categoryClassType="activity"
              withCreatorSelector={currentUserRole === 'app-owner'}
              onCreate={({ title, creatorId, categoryIds }) =>
                createActivity({
                  variables: {
                    appId,
                    title,
                    memberId: creatorId || currentMemberId,
                    activityCategories:
                      categoryIds?.map((categoryId: string, index: number) => ({
                        category_id: categoryId,
                        position: index,
                      })) || [],
                  },
                })
                  .then(({ data }) => {
                    const activityId = data?.insert_activity?.returning[0]?.id
                    activityId && history.push(`/activities/${activityId}`)
                  })
                  .catch(handleError)
              }
            />
          </div>
          <ActivityCollectionTabs memberId={currentUserRole === 'app-owner' ? null : currentMemberId} />
        </>
      )}
    </AdminLayout>
  )
}

const INSERT_ACTIVITY = gql`
  mutation INSERT_ACTIVITY(
    $title: String!
    $memberId: String!
    $appId: String!
    $activityCategories: [activity_category_insert_input!]!
  ) {
    insert_activity(
      objects: {
        title: $title
        organizer_id: $memberId
        app_id: $appId
        activity_categories: { data: $activityCategories }
      }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`

export default ActivityCollectionAdminPage
