import Icon from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Input, Select, Skeleton } from 'antd'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle, EmptyBlock } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import PracticeCard from '../../components/practice/PracticeCard'
import { ProgramTreeSelector } from '../../components/program/ProgramSelector'
import { useAuth } from '../../contexts/AuthContext'
import hasura from '../../hasura'
import { commonMessages, errorMessages, practiceMessages } from '../../helpers/translation'
import { ReactComponent as BookIcon } from '../../images/icon/book.svg'

type PracticeFiltersProps = {
  searchText?: string
  selectedProgramId?: string
  selectedProgramContentSectionId?: string
  selectedProgramContentId?: string
}

const PracticeCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId, currentUserRole } = useAuth()
  const [selectedStatus, setSelectedStatus] = useState<string>('unreviewed')
  const [selectedId, setSelectedId] = useState<{
    program?: string
    programContentSection?: string
    programContent?: string
  }>({})

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
            <ProgramTreeSelector
              treeNodeSelectable
              allowContentType="practice"
              memberId={currentUserRole === 'content-creator' && currentMemberId ? currentMemberId : undefined}
              onSelect={(value, option) => {
                setSelectedId({ [option.group]: value })
              }}
            />
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
          selectedStatus={selectedStatus}
          filters={{
            searchText,
            selectedProgramId: selectedId.program,
            selectedProgramContentSectionId: selectedId.programContentSection,
            selectedProgramContentId: selectedId.programContent,
          }}
        />
      )}
    </AdminLayout>
  )
}

const AllPracticeCollectionBlock: React.FC<{
  selectedStatus: string
  filters?: PracticeFiltersProps
}> = ({ selectedStatus, filters }) => {
  const { formatMessage } = useIntl()
  const { currentMemberId, currentUserRole } = useAuth()

  let unreviewed: boolean | undefined
  switch (selectedStatus) {
    case 'unreviewed':
      unreviewed = true
      break
    case 'reviewed':
      unreviewed = false
      break
  }

  const { loadingPractice, errorPractice, practices, refetchPractice } = usePracticePreviewCollection({
    ...filters,
    unreviewed,
    programRoleMemberId: currentUserRole !== 'app-owner' ? currentMemberId : undefined,
  })

  if (loadingPractice) {
    return <Skeleton active />
  }

  if (practices.length === 0) {
    return (
      <EmptyBlock>
        {errorPractice ? formatMessage(errorMessages.data.fetch) : formatMessage(practiceMessages.text.emptyPractice)}
      </EmptyBlock>
    )
  }

  return (
    <>
      {practices.map(v => (
        <PracticeCard key={v.id} {...v} onRefetch={refetchPractice} />
      ))}
    </>
  )
}
const usePracticePreviewCollection = (
  options?: PracticeFiltersProps & {
    unreviewed?: boolean
    programRoleMemberId?: string | null
  },
) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PRACTICE_PREVIEW_COLLECTION,
    hasura.GET_PRACTICE_PREVIEW_COLLECTIONVariables
  >(GET_PRACTICE_PREVIEW_COLLECTION, {
    variables: {
      searchText: options?.searchText ? `%${options.searchText}%` : undefined,
      programId: options?.selectedProgramId,
      programContentSectionId: options?.selectedProgramContentSectionId,
      programContentId: options?.selectedProgramContentId,
      unreviewed: options?.unreviewed,
      programRoleMemberId: options?.programRoleMemberId,
    },
  })

  const practices: {
    id: string
    isCoverRequired: boolean
    coverUrl: string | null
    createdAt: Date
    title: string
    memberId: string
    reactedMemberIds: string[]
    isReviewed: boolean
    roles: { id: string; name: string; memberId: string }[]
  }[] =
    data?.practice.map(v => ({
      id: v.id,
      isCoverRequired: !!v.program_content.metadata?.isCoverRequired,
      coverUrl: v.cover_url,
      createdAt: new Date(v.created_at),
      title: v.title,
      memberId: v.member_id,
      reactedMemberIds: v.practice_reactions.map(v => v.member_id),
      isReviewed: v.reviewed_at && new Date(v.reviewed_at),
      roles: v.program_content.program_content_section.program.program_roles.map(role => ({
        id: role.id,
        name: role.name,
        memberId: role.member_id,
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
  query GET_PRACTICE_PREVIEW_COLLECTION(
    $searchText: String
    $programId: uuid
    $programContentSectionId: uuid
    $programContentId: uuid
    $unreviewed: Boolean
    $programRoleMemberId: String
  ) {
    practice(
      where: {
        _or: [{ member: { username: { _like: $searchText } } }, { title: { _like: $searchText } }]
        program_content: {
          id: { _eq: $programContentId }
          program_content_section: {
            id: { _eq: $programContentSectionId }
            program_id: { _eq: $programId }
            program: { program_roles: { member_id: { _eq: $programRoleMemberId } } }
          }
        }
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
      member_id
      program_content {
        id
        metadata
        program_content_section {
          id
          program {
            id
            program_roles {
              id
              name
              member_id
            }
          }
        }
      }
      practice_reactions {
        id
        member_id
      }
    }
  }
`

export default PracticeCollectionAdminPage
