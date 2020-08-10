import Icon from '@ant-design/icons'
import React from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import ActivityCollectionTabs from '../../components/activity/ActivityCollectionTabs'
import { AdminPageTitle } from '../../components/admin'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import AdminLayout from '../../components/layout/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages } from '../../helpers/translation'
import { useCreateActivity } from '../../hooks/activity'
import { ReactComponent as CalendarAltIcon } from '../../images/icon/calendar-alt.svg'

const ActivityCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { currentMemberId, currentUserRole } = useAuth()
  const createActivity = useCreateActivity()

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
              classType="activity"
              withCategorySelector
              withCreatorSelector={currentUserRole === 'app-owner'}
              onCreate={values =>
                createActivity({
                  title: values.title,
                  categoryIds: values.categoryIds,
                  memberId: values.creatorId || currentMemberId,
                }).then(({ data }) => {
                  const activityId = data?.insert_activity?.returning[0]?.id
                  activityId && history.push(`/activities/${activityId}`)
                })
              }
            />
          </div>
          <ActivityCollectionTabs memberId={currentUserRole === 'app-owner' ? null : currentMemberId} />
        </>
      )}
    </AdminLayout>
  )
}

export default ActivityCollectionAdminPage
