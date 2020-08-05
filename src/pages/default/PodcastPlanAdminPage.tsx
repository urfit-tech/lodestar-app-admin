import Icon, { FileAddOutlined } from '@ant-design/icons'
import { Button, Skeleton } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminCard from '../../components/admin/AdminCard'
import AdminLayout from '../../components/layout/AdminLayout'
import PodcastPlanAdminModal from '../../components/podcast/PodcastPlanAdminModal'
import PodcastPlanCollectionAdminTable from '../../components/podcast/PodcastPlanCollectionAdminTable'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages, podcastMessages } from '../../helpers/translation'
import { usePodcastPlanAdminCollection } from '../../hooks/podcast'
import { ReactComponent as DiscountIcon } from '../../images/icon/discount.svg'

const PodcastPlanAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId, currentUserRole } = useAuth()

  const { loadingPodcastPlans, podcastPlans, refetchPodcastPlans } = usePodcastPlanAdminCollection(
    currentUserRole === 'app-owner' ? undefined : currentMemberId || '',
  )

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
              refetch={refetchPodcastPlans}
            />
          </div>

          <AdminCard>
            {loadingPodcastPlans ? (
              <Skeleton active />
            ) : (
              <PodcastPlanCollectionAdminTable
                memberId={currentMemberId}
                podcastPlans={podcastPlans}
                refetch={refetchPodcastPlans}
              />
            )}
          </AdminCard>
        </>
      )}
    </AdminLayout>
  )
}

export default PodcastPlanAdminPage
