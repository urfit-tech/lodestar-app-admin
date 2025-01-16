import Icon from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import ActivityCollectionTabs from '../components/activity/ActivityCollectionTabs'
import { AdminPageTitle } from '../components/admin'
import ProductCreationModal from '../components/common/ProductCreationModal'
import AdminLayout from '../components/layout/AdminLayout'
import hasura from '../hasura'
import { handleError } from '../helpers'
import { commonMessages } from '../helpers/translation'
import { ReactComponent as CalendarAltIcon } from '../images/icon/calendar-alt.svg'
import ForbiddenPage from './ForbiddenPage'

const ActivityCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { currentMemberId, currentUserRole, permissions } = useAuth()
  const { id: appId, enabledModules } = useApp()
  const [createActivity] = useMutation<hasura.INSERT_ACTIVITY, hasura.INSERT_ACTIVITYVariables>(INSERT_ACTIVITY)

  if (!enabledModules.activity || (!permissions.ACTIVITY_ADMIN && !permissions.ACTIVITY_NORMAL)) {
    return <ForbiddenPage />
  }

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
              creatorAppellation={formatMessage(commonMessages.label.selectOrganizer)}
              allowedPermissions={['ACTIVITY_NORMAL', 'ACTIVITY_ADMIN']}
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
          <ActivityCollectionTabs
            memberId={
              currentUserRole === 'content-creator'
                ? currentMemberId
                : permissions.ACTIVITY_ADMIN
                ? null
                : permissions.ACTIVITY_NORMAL
                ? currentMemberId
                : ''
            }
          />
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
