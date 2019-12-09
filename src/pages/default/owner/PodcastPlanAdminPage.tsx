import { Icon, Typography } from 'antd'
import React from 'react'
import AdminCard from '../../../components/admin/AdminCard'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
// import PodcastPlanAdminModal from '../../../components/podcast/PodcastPlanCreationModal'
import { ReactComponent as DiscountIcon } from '../../../images/default/discount.svg'

type PodcastPlanAdminProps = {}

const PodcastPlanAdminPage: React.FC<PodcastPlanAdminProps> = ({}) => {
  return (
    <OwnerAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon component={() => <DiscountIcon />} className="mr-3" />
        <span>訂閱方案</span>
      </Typography.Title>
      {/* <PodcastPlanAdminModal>

      </PodcastPlanAdminModal> */}
      <AdminCard></AdminCard>
    </OwnerAdminLayout>
  )
}

export default PodcastPlanAdminPage
