import { Icon, Skeleton, Button } from 'antd'
import React, { useState } from 'react'
import styled from 'styled-components'
import AdminCard from '../../../components/admin/AdminCard'
import { useAuth } from '../../../components/auth/AuthContext'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import PodcastPlanCollectionAdminTable from '../../../containers/podcast/PodcastPlanCollectionAdminTable'
import PodcastPlanCreationModal from '../../../containers/podcast/PodcastPlanCreationModal'
import { ReactComponent as DiscountIcon } from '../../../images/default/discount.svg'
import { usePodcastPlanAdminCollection } from '../../../hooks/podcast'

const StyledTitle = styled.h1`
  color: var(--gray-darker);
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
const PodcastPlanAdminPage: React.FC = () => {
  const { currentMemberId } = useAuth()
  const [isVisible, setVisible] = useState<boolean>(false)
  const { loadingPodcastPlanAdminCollection, errorPodcastPlanAdminCollection, podcastPlans, refetchPodcastPlanAdminCollection } = usePodcastPlanAdminCollection()

  return (
    <OwnerAdminLayout>
      <StyledTitle className="mb-4">
        <Icon component={() => <DiscountIcon />} className="mr-2" />
        <span>訂閱方案</span>
      </StyledTitle>

      {!currentMemberId ? (
        <Skeleton active />
      ) : (
          <>
            <div className="mb-5">
              <PodcastPlanCreationModal
                isVisible={isVisible}
                onVisibleSet={setVisible}
                refetch={refetchPodcastPlanAdminCollection}
              >
                <Button
                  icon="file-add"
                  type="primary"
                  onClick={() => setVisible(true)}
                >
                  建立方案
                </Button>
              </PodcastPlanCreationModal >
            </div>

            <AdminCard>
              <PodcastPlanCollectionAdminTable
                loading={loadingPodcastPlanAdminCollection}
                error={errorPodcastPlanAdminCollection}
                podcastPlans={podcastPlans}
                refetch={refetchPodcastPlanAdminCollection}
              />
            </AdminCard>
          </>
        )}
    </OwnerAdminLayout>
  )
}

export default PodcastPlanAdminPage
