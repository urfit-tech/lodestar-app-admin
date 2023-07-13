import Icon from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { Input, Select, Skeleton } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useCallback, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle, EmptyBlock } from '../components/admin'
import AdminLayout from '../components/layout/AdminLayout'
import PracticeCard from '../components/practice/PracticeCard'
import { ProgramTreeSelector } from '../components/program/ProgramSelector'
import hasura from '../hasura'
import { commonMessages, errorMessages, programMessages } from '../helpers/translation'
import { ReactComponent as BookIcon } from '../images/icon/book.svg'
import ForbiddenPage from './ForbiddenPage'

const MAX_LIMIT = 100
const LIMIT = 20

type PracticeFiltersProps = {
  searchText?: string
  selectedProgramId?: string
  selectedProgramContentSectionId?: string
  selectedProgramContentId?: string
}

const PracticeCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { currentMemberId, permissions } = useAuth()
  const [selectedStatus, setSelectedStatus] = useState<string>('unreviewed')
  const [selectedId, setSelectedId] = useState<{
    program?: string
    programContentSection?: string
    programContent?: string
  }>({})

  const [searchText, setSearchText] = useState('')

  if (!enabledModules.practice || (!permissions.PRACTICE_ADMIN && !permissions.PRACTICE_NORMAL)) {
    return <ForbiddenPage />
  }

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
              <Select.Option value="unreviewed">{formatMessage(programMessages.status.unreviewed)}</Select.Option>
              <Select.Option value="reviewed">{formatMessage(programMessages.status.reviewed)}</Select.Option>
              <Select.Option value="all">{formatMessage(commonMessages.label.all)}</Select.Option>
            </Select>
          </div>
          <div className="col-12 col-sm-5 mb-2 mb-sm-0 px-0 pr-sm-3">
            <ProgramTreeSelector
              treeNodeSelectable
              allowContentTypes={['practice']}
              memberId={
                permissions.PRACTICE_ADMIN
                  ? undefined
                  : permissions.PRACTICE_NORMAL && currentMemberId
                  ? currentMemberId
                  : ''
              }
              onSelect={(value, option) => {
                setSelectedId({ [option.group]: value })
              }}
            />
          </div>
          <div className="col-12 col-sm-2" />
          <div className="col-12 col-sm-3 px-0">
            <Input.Search
              placeholder={formatMessage(programMessages.text.searchPractice)}
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
  const { currentMemberId, permissions } = useAuth()
  const observer = useRef<IntersectionObserver>()

  let unreviewed: boolean | undefined
  switch (selectedStatus) {
    case 'unreviewed':
      unreviewed = true
      break
    case 'reviewed':
      unreviewed = false
      break
  }

  const { loadingPractice, errorPractice, practices, refetchPractice, loadMorePractices, hasMore } =
    usePracticePreviewCollection({
      ...filters,
      unreviewed,
      programRoleMemberId: permissions.PRACTICE_ADMIN ? undefined : currentMemberId,
    })

  const lastElementRef = useCallback(
    node => {
      if (loadingPractice) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePractices?.()
        }
      })
      if (node) observer.current.observe(node)
    },
    [loadingPractice, loadMorePractices, hasMore],
  )

  if (loadingPractice && practices.length === 0) {
    return <Skeleton active />
  }

  if (practices.length === 0) {
    return (
      <EmptyBlock>
        {errorPractice ? formatMessage(errorMessages.data.fetch) : formatMessage(programMessages.text.emptyPractice)}
      </EmptyBlock>
    )
  }

  return (
    <>
      {practices.map((practice, index) => {
        const isLast = practices.length === index + 1
        return (
          <PracticeCard
            key={practice.id}
            {...practice}
            onRefetch={() => refetchPractice(practices.length > MAX_LIMIT ? MAX_LIMIT : practices.length)}
            ref={isLast ? lastElementRef : undefined}
          />
        )
      })}
      {loadingPractice && hasMore && <Skeleton active />}
    </>
  )
}

const usePracticePreviewCollection = (
  options?: PracticeFiltersProps & {
    unreviewed?: boolean
    programRoleMemberId?: string | null
  },
) => {
  const condition: hasura.GET_PRACTICE_PREVIEW_COLLECTIONVariables['condition'] = {
    _or: [
      { member: { username: { _like: options?.searchText ? `%${options.searchText}%` : undefined } } },
      { member: { name: { _like: options?.searchText ? `%${options.searchText}%` : undefined } } },
      { title: { _like: options?.searchText ? `%${options.searchText}%` : undefined } },
    ],
    program_content: {
      id: { _eq: options?.selectedProgramContentId },
      program_content_section: {
        id: { _eq: options?.selectedProgramContentSectionId },
        program_id: { _eq: options?.selectedProgramId },
        program: { program_roles: { member_id: { _eq: options?.programRoleMemberId } } },
      },
    },
    reviewed_at: { _is_null: options?.unreviewed },
    is_deleted: { _eq: false },
  }
  const { loading, error, data, fetchMore, refetch } = useQuery<
    hasura.GET_PRACTICE_PREVIEW_COLLECTION,
    hasura.GET_PRACTICE_PREVIEW_COLLECTIONVariables
  >(GET_PRACTICE_PREVIEW_COLLECTION, {
    variables: {
      condition,
      limit: LIMIT,
    },
    notifyOnNetworkStatusChange: true,
  })

  const loadMorePractices =
    (data?.practice.length || 0) < (data?.practice_aggregate.aggregate?.count || 0)
      ? () =>
          fetchMore({
            variables: {
              condition: {
                ...condition,
                created_at: { _gt: data?.practice.slice(-1)[0]?.created_at },
              },
              limit: LIMIT,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              return Object.assign({}, prev, {
                practice: [...prev.practice, ...fetchMoreResult.practice],
              })
            },
          })
      : undefined

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
      coverUrl: v.cover_url || null,
      createdAt: new Date(v.created_at),
      title: v.title || '',
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
    hasMore: practices.length !== (data?.practice_aggregate.aggregate?.count || 0),
    refetchPractice: (dataLength: number) => refetch({ condition, limit: dataLength }),
    loadMorePractices,
  }
}

const GET_PRACTICE_PREVIEW_COLLECTION = gql`
  query GET_PRACTICE_PREVIEW_COLLECTION($condition: practice_bool_exp!, $limit: Int!) {
    practice_aggregate(where: $condition) {
      aggregate {
        count
      }
    }
    practice(where: $condition, order_by: { created_at: asc }, limit: $limit) {
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
