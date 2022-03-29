import Icon, { FileAddOutlined } from '@ant-design/icons'
import { Button, Skeleton } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { Redirect } from 'react-router-dom'
import { AdminPageTitle } from '../components/admin'
import AdminCard from '../components/admin/AdminCard'
import AdminLayout from '../components/layout/AdminLayout'
import PodcastPlanAdminModal from '../components/podcast/PodcastPlanAdminModal'
import PodcastPlanCollectionAdminTable from '../components/podcast/PodcastPlanCollectionAdminTable'
import { commonMessages, podcastMessages } from '../helpers/translation'
import { usePodcastPlanAdminCollection } from '../hooks/podcast'
import { ReactComponent as DiscountIcon } from '../images/icon/discount.svg'

const PodcastPlanAdminPage: React.FC = () => {
  const { enabledModules } = useApp()
  const { formatMessage } = useIntl()
  const { currentMemberId, permissions } = useAuth()

  const { loadingPodcastPlans, podcastPlans, refetchPodcastPlans } = usePodcastPlanAdminCollection(
    permissions.PODCAST_ADMIN ? undefined : permissions.PODCAST_NORMAL ? currentMemberId || '' : '',
  )

  if (!enabledModules.podcast || !permissions.PODCAST_ADMIN || !permissions.PODCAST_NORMAL) {
    return <Redirect to="/" />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <DiscountIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.podcastPlans)}</span>
      </AdminPageTitle>

      {!currentMemberId ? (
        <Skeleton active />
      ) : (
        <>
          <div className="mb-5">
            <PodcastPlanAdminModal
              renderTrigger={({ setVisible }) => (
                <Button icon={<FileAddOutlined />} type="primary" onClick={() => setVisible(true)}>
                  {formatMessage(podcastMessages.ui.createPodcastPlan)}
                </Button>
              )}
              onRefetch={refetchPodcastPlans}
            />
          </div>

          <AdminCard>
            {loadingPodcastPlans ? (
              <Skeleton active />
            ) : (
              <PodcastPlanCollectionAdminTable
                memberId={currentMemberId}
                podcastPlans={podcastPlans}
                onRefetch={refetchPodcastPlans}
              />
            )}
          </AdminCard>
        </>
      )}
    </AdminLayout>
  )
}

export default PodcastPlanAdminPage
