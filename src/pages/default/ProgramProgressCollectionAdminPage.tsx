import { Icon, Typography } from 'antd'
import React from 'react'
import { AdminPageBlock } from '../../components/admin'
import CreatorAdminLayout from '../../components/layout/CreatorAdminLayout'
import OwnerAdminLayout from '../../components/layout/OwnerAdminLayout'
import ProgramProgressTable from '../../containers/program/ProgramProgressTable'
import ProgramSelector from '../../containers/program/ProgramSelector'
import { useAuth } from '../../contexts/AuthContext'
import LoadingPage from './LoadingPage'

const ProgramProgressCollectionAdminPage: React.FC = () => {
  const { currentMemberId, currentUserRole } = useAuth()

  if (!currentMemberId || !currentUserRole) {
    return <LoadingPage />
  }

  const AdminLayout = currentUserRole === 'app-owner' ? OwnerAdminLayout : CreatorAdminLayout

  return (
    <AdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon type="file-text" theme="filled" className="mr-3" />
        <span>學習進度</span>
      </Typography.Title>
      <ProgramSelector className="mb-3" allText="總體學習進度" />
      <AdminPageBlock>
        <ProgramProgressTable
        // programId={}
        />
      </AdminPageBlock>
    </AdminLayout>
  )
}

export default ProgramProgressCollectionAdminPage
