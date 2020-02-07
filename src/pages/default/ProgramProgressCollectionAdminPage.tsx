import { Icon, Typography } from 'antd'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageBlock } from '../../components/admin'
import CreatorAdminLayout from '../../components/layout/CreatorAdminLayout'
import OwnerAdminLayout from '../../components/layout/OwnerAdminLayout'
import ProgramProgressTable from '../../containers/program/ProgramProgressTable'
import ProgramSelector from '../../containers/program/ProgramSelector'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages } from '../../helpers/translation'
import LoadingPage from './LoadingPage'
import NotFoundPage from './NotFoundPage'

const ProgramProgressCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId, currentUserRole } = useAuth()
  const { enabledModules } = useContext(AppContext)
  const [selectedProgramId, setSelectedProgramId] = useState()

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
        <span>{formatMessage(commonMessages.menu.programProgress)}</span>
      </Typography.Title>
      <ProgramSelector
        className="mb-3"
        allText={formatMessage(commonMessages.label.allProgramProgress)}
        onChange={programId => setSelectedProgramId(programId)}
      />
      <AdminPageBlock>
        <ProgramProgressTable programId={selectedProgramId === 'all' ? null : selectedProgramId} />
      </AdminPageBlock>
    </AdminLayout>
  )
}

export default ProgramProgressCollectionAdminPage
