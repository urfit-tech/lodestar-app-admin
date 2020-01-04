import { useQuery } from '@apollo/react-hooks'
import { Icon, Spin, Tabs, Typography } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import CreatorAdminLayout from '../../../components/layout/CreatorAdminLayout'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import ProgramAdminCard from '../../../components/program/ProgramAdminCard'
import ProgramCreationModal from '../../../components/program/ProgramCreationModal'
import { useAuth } from '../../../contexts/AuthContext'
import types from '../../../types'
import LoadingPage from '../LoadingPage'

const ProgramCollectionAdminPage: React.FC = () => {
  const { currentMemberId, currentUserRole } = useAuth()

  if (!currentMemberId || !currentUserRole) {
    return <LoadingPage />
  }

  const AdminLayout = currentUserRole === 'app-owner' ? OwnerAdminLayout : CreatorAdminLayout
  const memberId = currentUserRole === 'content-creator' ? currentMemberId : null

  return (
    <AdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon type="file-text" theme="filled" className="mr-3" />
        <span>課程管理</span>
      </Typography.Title>

      <ProgramCreationModal withSelector={currentUserRole === 'app-owner'} />

      <Tabs defaultActiveKey="draft">
        <Tabs.TabPane key="draft" tab="草稿">
          <ProgramCollectionBlock memberId={memberId} isDraft />
        </Tabs.TabPane>
        <Tabs.TabPane key="published" tab="已發佈">
          <ProgramCollectionBlock memberId={memberId} isDraft={false} />
        </Tabs.TabPane>
      </Tabs>
    </AdminLayout>
  )
}

const ProgramCollectionBlock: React.FC<{
  memberId: string | null
  isDraft?: boolean
}> = ({ isDraft, memberId }) => {
  const { data, error, loading } = useQuery<
    types.GET_CREATOR_PROGRAM_COLLECTION,
    types.GET_CREATOR_PROGRAM_COLLECTIONVariables
  >(GET_CREATOR_PROGRAM_COLLECTION, {
    variables: {
      appId: localStorage.getItem('kolable.app.id') || '',
      memberId,
      isDraft,
    },
  })

  return (
    <div className="row py-3">
      {loading ? (
        <Spin />
      ) : error || !data ? (
        '無法載入資料'
      ) : (
        data.program.map(program => (
          <div key={program.id} className="col-12 col-md-6 col-lg-4 mb-5">
            <ProgramAdminCard programId={program.id} link={`/programs/${program.id}`} />
          </div>
        ))
      )}
    </div>
  )
}

const GET_CREATOR_PROGRAM_COLLECTION = gql`
  query GET_CREATOR_PROGRAM_COLLECTION($appId: String!, $memberId: String, $isDraft: Boolean) {
    program(
      where: {
        app_id: { _eq: $appId }
        editors: { member_id: { _eq: $memberId } }
        published_at: { _is_null: $isDraft }
      }
    ) {
      id
      published_at
    }
  }
`

export default ProgramCollectionAdminPage
