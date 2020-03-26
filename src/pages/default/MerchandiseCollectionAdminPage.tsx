import React from 'react'
import CreatorAdminLayout from '../../components/layout/CreatorAdminLayout'
import OwnerAdminLayout from '../../components/layout/OwnerAdminLayout'
import { useAuth } from '../../contexts/AuthContext'
import LoadingPage from './LoadingPage'

const MerchandiseCollectionAdminPage: React.FC = () => {
  const { currentMemberId, currentUserRole } = useAuth()

  if (!currentMemberId || !currentUserRole) {
    return <LoadingPage />
  }

  const AdminLayout = currentUserRole === 'app-owner' ? OwnerAdminLayout : CreatorAdminLayout

  return <AdminLayout>MerchandiseCollectionAdminPage</AdminLayout>
}

export default MerchandiseCollectionAdminPage
