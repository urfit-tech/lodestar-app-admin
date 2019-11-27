import { useQuery } from '@apollo/react-hooks'
import { Icon, Spin, Tabs, Typography } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { useAuth } from '../../../components/auth/AuthContext'
import CreatorAdminLayout from '../../../components/layout/CreatorAdminLayout'
import ProgramAdminCard from '../../../components/program/ProgramAdminCard'
import ProgramCreationModal from '../../../components/program/ProgramCreationModal'
import types from '../../../types'

const ProgramCollectionAdminPage: React.FC = () => {
  const { currentMemberId } = useAuth()
  return (
    <CreatorAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon type="file-text" theme="filled" className="mr-3" />
        <span>課程管理</span>
      </Typography.Title>

      <ProgramCreationModal />

      <Tabs defaultActiveKey="draft">
        <Tabs.TabPane key="draft" tab="草稿">
          {currentMemberId && <ProgramCollectionBlock memberId={currentMemberId} isDraft />}
        </Tabs.TabPane>
        <Tabs.TabPane key="published" tab="已發佈">
          {currentMemberId && <ProgramCollectionBlock memberId={currentMemberId} isDraft={false} />}
        </Tabs.TabPane>
      </Tabs>
    </CreatorAdminLayout>
  )
}

const ProgramCollectionBlock: React.FC<{
  memberId: string
  isDraft?: boolean
}> = ({ isDraft, memberId }) => {
  const { data, error, loading } = useQuery<
    types.GET_CREATOR_PROGRAM_COLLECTION,
    types.GET_CREATOR_PROGRAM_COLLECTIONVariables
  >(GET_CREATOR_PROGRAM_COLLECTION, {
    variables: { appId: localStorage.getItem('kolable.app.id') || '', memberId, isDraft },
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
            <ProgramAdminCard programId={program.id} />
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
