import Icon from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Input, Select, Skeleton } from 'antd'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle, EmptyBlock } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import PracticeCard from '../../components/practice/PracticeCard'
import { EditableProgramSelector, OwnedProgramSelector } from '../../components/program/ProgramSelector'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages, errorMessages, practiceMessages } from '../../helpers/translation'
import { ReactComponent as BookIcon } from '../../images/icon/book.svg'
import types from '../../types'

const PracticeCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId, currentUserRole } = useAuth()
  const [selectedStatus, setSelectedStatus] = useState<string>('unreviewed')
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all')
  const [searchText, setSearchText] = useState('')

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <BookIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.practice)}</span>
      </AdminPageTitle>

      <div className="d-flex flex-wrap mb-4">
        <div className="d-flex flex-wrap col-12 px-0 mb-2 mb-md-0">
          <div className="col-12 col-sm-2 mb-2 mb-sm-0 px-0 pr-sm-3">
            <Select style={{ width: '100%' }} value={selectedStatus} onChange={(key: string) => setSelectedStatus(key)}>
              <Select.Option value="unreviewed">{formatMessage(practiceMessages.status.unreviewed)}</Select.Option>
              <Select.Option value="reviewed">{formatMessage(practiceMessages.status.reviewed)}</Select.Option>
              <Select.Option value="all">{formatMessage(commonMessages.label.all)}</Select.Option>
            </Select>
          </div>
          <div className="col-12 col-sm-5 mb-2 mb-sm-0 px-0 pr-sm-3">
            {currentMemberId && currentUserRole === 'app-owner' && (
              <OwnedProgramSelector value={selectedProgramId} onChange={key => setSelectedProgramId(key)} />
            )}
            {currentMemberId && currentUserRole === 'content-creator' && (
              <EditableProgramSelector
                value={selectedProgramId}
                memberId={currentMemberId}
                onChange={key => setSelectedProgramId(key)}
              />
            )}
          </div>
          <div className="col-12 col-sm-2" />
          <div className="col-12 col-sm-3 px-0">
            <Input.Search
              placeholder={formatMessage(practiceMessages.text.searchPractice)}
              onChange={e => setSearchText(e.target.value)}
            />
          </div>
        </div>
      </div>

      {currentMemberId && (
        <AllPracticeCollectionBlock
          selectedProgramId={selectedProgramId}
          selectedStatus={selectedStatus}
          searchText={searchText}
        />
      )}
    </AdminLayout>
  )
}

const AllPracticeCollectionBlock: React.FC<{
  selectedProgramId: string
  selectedStatus: string
  searchText: string
}> = ({ selectedProgramId, selectedStatus, searchText }) => {
  const { formatMessage } = useIntl()

  let unreviewed: boolean | undefined
  switch (selectedStatus) {
    case 'unreviewed':
      unreviewed = true
      break
    case 'reviewed':
      unreviewed = false
      break
  }
  const { loadingPractice, errorPractice, practices, refetchPractice } = usePracticePreviewCollection(
    selectedProgramId,
    searchText,
    unreviewed,
  )

  if (loadingPractice) return <Skeleton active />
  if (errorPractice) return <EmptyBlock>{formatMessage(errorMessages.data.fetch)}</EmptyBlock>
  if (practices.length === 0) {
    return <EmptyBlock>{formatMessage(practiceMessages.text.emptyPractice)}</EmptyBlock>
  }

  return (
    <>
      {practices.map(v => (
        <PracticeCard key={v.id} {...v} onRefetch={refetchPractice} />
      ))}
    </>
  )
}

const usePracticePreviewCollection = (selectedProgramId: string, searchText: string | null, unreviewed?: boolean) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_PRACTICE_PREVIEW_COLLECTION,
    types.GET_PRACTICE_PREVIEW_COLLECTIONVariables
  >(GET_PRACTICE_PREVIEW_COLLECTION, {
    variables: {
      searchText: searchText ? `%${searchText}%` : undefined,
      programId: selectedProgramId === 'all' ? undefined : selectedProgramId,
      unreviewed,
    },
  })

  const practices: {
    id: string
    coverUrl: string | null
    createdAt: Date
    title: string
    memberUrl: string | null
    memberName: string
    reactedMemberIds: string[]
    isReviewed: boolean
    roles: { id: string; name: string }[]
  }[] =
    data?.practice.map(v => ({
      id: v.id,
      coverUrl: v.cover_url,
      createdAt: new Date(v.created_at),
      title: v.title,
      memberUrl: v.member.picture_url,
      memberName: v.member.username,
      reactedMemberIds: v.practice_reactions.map(v => v.member_id),
      isReviewed: v.reviewed_at && new Date(v.reviewed_at),
      roles: v.program_content.program_content_section.program.program_roles.map(role => ({
        id: role.id,
        name: role.name,
      })),
    })) || []

  return {
    loadingPractice: loading,
    errorPractice: error,
    practices,
    refetchPractice: refetch,
  }
}

const GET_PRACTICE_PREVIEW_COLLECTION = gql`
  query GET_PRACTICE_PREVIEW_COLLECTION($searchText: String, $programId: uuid, $unreviewed: Boolean) {
    practice(
      where: {
        _or: [{ member: { username: { _like: $searchText } } }, { title: { _like: $searchText } }]
        program_content: { program_content_section: { program_id: { _eq: $programId } } }
        reviewed_at: { _is_null: $unreviewed }
        is_deleted: { _eq: false }
      }
      order_by: { created_at: asc }
    ) {
      id
      title
      cover_url
      created_at
      reviewed_at
      member {
        id
        username
        picture_url
      }
      program_content {
        program_content_section {
          program {
            program_roles {
              name
              id
            }
          }
        }
      }
      practice_reactions {
        member_id
      }
    }
  }
`

export default PracticeCollectionAdminPage
