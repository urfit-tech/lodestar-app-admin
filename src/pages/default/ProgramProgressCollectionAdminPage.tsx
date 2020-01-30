import { Icon, Typography } from 'antd'
import React, { useContext, useState } from 'react'
import { AdminPageBlock } from '../../components/admin'
import CreatorAdminLayout from '../../components/layout/CreatorAdminLayout'
import OwnerAdminLayout from '../../components/layout/OwnerAdminLayout'
import ProgramProgressTable from '../../containers/program/ProgramProgressTable'
import ProgramSelector from '../../containers/program/ProgramSelector'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import LoadingPage from './LoadingPage'
import NotFoundPage from './NotFoundPage'

const ProgramProgressCollectionAdminPage: React.FC = () => {
  const [selectedProgramId, setSelectedProgramId] = useState()
  const { currentMemberId, currentUserRole } = useAuth()
  const { enabledModules } = useContext(AppContext)

  if (!currentMemberId || !currentUserRole) {
    return <LoadingPage />
  }

  if (!enabledModules.learning_statistics) {
    return <NotFoundPage />
  }

  const AdminLayout = currentUserRole === 'app-owner' ? OwnerAdminLayout : CreatorAdminLayout

  return (
    <AdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon type="file-text" theme="filled" className="mr-3" />
        <span>學習進度</span>
      </Typography.Title>
      <ProgramSelector
        className="mb-3"
        allText="總體學習進度"
        onChange={programId => setSelectedProgramId(programId)}
      />
      <AdminPageBlock>
        <ProgramProgressTable programId={selectedProgramId === 'all' ? null : selectedProgramId} />
      </AdminPageBlock>
    </AdminLayout>
  )
}

export default ProgramProgressCollectionAdminPage
