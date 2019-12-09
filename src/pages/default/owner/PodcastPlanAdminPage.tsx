import { Icon, Typography, Skeleton } from 'antd'
import React from 'react'
import AdminCard from '../../../components/admin/AdminCard'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import PodcastPlanAdminModal from '../../../containers/podcast/PodcastPlanAdminModal'
import { ReactComponent as DiscountIcon } from '../../../images/default/discount.svg'
import { useAuth } from '../../../components/auth/AuthContext'
import styled from 'styled-components'

const StyledTitle = styled.h1`
  color: var(--gray-darker);
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
type PodcastPlanAdminProps = {}

const PodcastPlanAdminPage: React.FC<PodcastPlanAdminProps> = ({ }) => {
  const { currentMemberId } = useAuth()

  return (
    <OwnerAdminLayout>
      <StyledTitle className="mb-4">
        <Icon component={() => <DiscountIcon />} className="mr-2" />
        <span>訂閱方案</span>
      </StyledTitle>

      {!currentMemberId ? (<Skeleton active />)
        : (
          <>
            <div className="mb-5">
              <PodcastPlanAdminModal />
            </div>
            <AdminCard></AdminCard>
          </>
        )}

    </OwnerAdminLayout>
  )
}

export default PodcastPlanAdminPage
