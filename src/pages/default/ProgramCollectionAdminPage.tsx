import { EditOutlined, FileTextFilled } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Input, Skeleton, Tabs } from 'antd'
import gql from 'graphql-tag'
import { sum } from 'ramda'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { Link, useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { AdminPageTitle, EmptyBlock } from '../../components/admin'
import { OverlayBlock, OverlayWrapper } from '../../components/admin/PositionAdminLayout'
import { AvatarImage } from '../../components/common/Image'
import ItemsSortingModal from '../../components/common/ItemsSortingModal'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import AdminLayout from '../../components/layout/AdminLayout'
import ProgramAdminCard from '../../components/program/ProgramAdminCard'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramPlanPeriodType, ProgramPreviewProps } from '../../types/program'
import LoadingPage from './LoadingPage'

type ProgramSortProps = {
  id: string
  title: string
  isSubscription: boolean
}

const AvatarPlaceHolder = styled.div`
  margin: 16px 0;
  height: 32px;
  color: #9b9b9b;
  font-size: 14px;
`
const StyledButton = styled(Button)`
  && {
    background: none;
    border: 1px solid white;
    color: white;
  }
`

const ProgramCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { currentMemberId, currentUserRole } = useAuth()
  const { loading, id: appId, enabledModules } = useApp()
  const [searchText, setSearchText] = useState('')
  const [counts, setCounts] = useState<{ [key: string]: number }>({})

  const [insertProgram] = useMutation<types.INSERT_PROGRAM, types.INSERT_PROGRAMVariables>(INSERT_PROGRAM)

  if (!currentMemberId || loading) {
    return <LoadingPage />
  }

  const tabContents: {
    key: string
    tab: string
    condition: types.GET_PROGRAM_PREVIEW_COLLECTIONVariables['condition']
    orderBy?: types.GET_PROGRAM_PREVIEW_COLLECTIONVariables['orderBy']
    hidden?: boolean
    withSortingButton?: boolean
  }[] = [
    {
      key: 'draft',
      tab: formatMessage(commonMessages.status.draft),
      condition: enabledModules.approval
        ? {
            published_at: { _is_null: true },
            _or: [
              { _not: { program_approval_status: {} } },
              { program_approval_status: { status: { _eq: 'canceled' } } },
              { program_approval_status: { status: { _eq: 'rejected' } } },
            ],
            title: searchText ? { _like: `%${searchText}%` } : undefined,
          }
        : {
            published_at: { _is_null: true },
            title: searchText ? { _like: `%${searchText}%` } : undefined,
          },
    },
    {
      key: 'pending',
      tab: formatMessage(programMessages.status.pending),
      condition: {
        published_at: { _is_null: true },
        program_approval_status: { status: { _eq: 'pending' } },
        title: searchText ? { _like: `%${searchText}%` } : undefined,
      },
      hidden: !enabledModules.approval,
    },
    {
      key: 'approved',
      tab: formatMessage(programMessages.status.approved),
      condition: {
        published_at: { _is_null: true },
        program_approval_status: { status: { _eq: 'approved' } },
        title: searchText ? { _like: `%${searchText}%` } : undefined,
      },
      hidden: !enabledModules.approval,
    },
    {
      key: 'publiclyPublish',
      tab: formatMessage(commonMessages.status.publiclyPublish),
      withSortingButton: true,
      condition: {
        published_at: { _is_null: false },
        is_private: { _eq: false },
        title: searchText ? { _like: `%${searchText}%` } : undefined,
      },
      orderBy: [{ position: 'asc' as types.order_by }],
    },
    {
      key: 'privatelyPublish',
      tab: formatMessage(commonMessages.status.privatelyPublish),
      condition: {
        published_at: { _is_null: false },
        is_private: { _eq: true },
        title: searchText ? { _like: `%${searchText}%` } : undefined,
      },
    },
  ]

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <FileTextFilled className="mr-3" />
        <span>{formatMessage(commonMessages.menu.programs)}</span>
      </AdminPageTitle>

      <div className="row mb-5">
        <div className="col-8">
          <ProductCreationModal
            categoryClassType="program"
            withCreatorSelector={currentUserRole === 'app-owner'}
            withProgramType
            onCreate={({ title, categoryIds, creatorId, isSubscription }) =>
              insertProgram({
                variables: {
                  ownerId: currentMemberId,
                  instructorId: creatorId || currentMemberId,
                  appId,
                  title,
                  isSubscription: isSubscription || false,
                  programCategories:
                    categoryIds?.map((categoryId, index) => ({
                      category_id: categoryId,
                      position: index,
                    })) || [],
                },
              }).then(res => {
                const programId = res.data?.insert_program?.returning[0]?.id
                programId && history.push(`/programs/${programId}`)
              })
            }
          />
        </div>
        <div className="col-4">
          <Input.Search
            placeholder={formatMessage(programMessages.text.searchProgramTitle)}
            onChange={e => !e.target.value.trim() && setSearchText('')}
            onSearch={value => setSearchText(value.trim())}
          />
        </div>
      </div>

      <Tabs defaultActiveKey="draft">
        {tabContents
          .filter(tabContent => !tabContent.hidden)
          .map(tabContent => (
            <Tabs.TabPane
              key={tabContent.key}
              tab={`${tabContent.tab} ${
                typeof counts[tabContent.key] === 'number' ? `(${counts[tabContent.key]})` : ''
              }`}
            >
              <ProgramCollectionBlock
                appId={appId}
                condition={tabContent.condition}
                orderBy={tabContent?.orderBy}
                withSortingButton={tabContent.withSortingButton}
                onReady={count =>
                  count !== counts[tabContent.key] &&
                  setCounts({
                    ...counts,
                    [tabContent.key]: count,
                  })
                }
              />
            </Tabs.TabPane>
          ))}
      </Tabs>
    </AdminLayout>
  )
}

const ProgramCollectionBlock: React.FC<{
  appId: string
  condition: types.GET_PROGRAM_PREVIEW_COLLECTIONVariables['condition']
  orderBy?: types.GET_PROGRAM_PREVIEW_COLLECTIONVariables['orderBy']
  withSortingButton?: boolean
  onReady?: (count: number) => void
}> = ({ appId, condition, orderBy, withSortingButton, onReady }) => {
  const { formatMessage } = useIntl()
  const {
    loadingProgramPreviews,
    errorProgramPreviews,
    programPreviewCount,
    programPreviews,
    refetchProgramPreviews,
    loadMorePrograms,
  } = useProgramPreviewCollection(condition, orderBy)
  const [updatePositions] = useMutation<
    types.UPDATE_PROGRAM_POSITION_COLLECTION,
    types.UPDATE_PROGRAM_POSITION_COLLECTIONVariables
  >(UPDATE_PROGRAM_POSITION_COLLECTION)
  const [loading, setLoading] = useState(false)
  const { loadingProgramSorts, errorProgramSorts, programSorts, refetchProgramSorts } = useProgramSortCollection(
    condition,
  )

  useEffect(() => {
    onReady?.(programPreviewCount)
    refetchProgramPreviews()
  }, [onReady, programPreviewCount, refetchProgramPreviews])

  if (loadingProgramPreviews || errorProgramPreviews || loadingProgramSorts || errorProgramSorts) {
    return <Skeleton active />
  }

  if (programPreviews.length === 0) {
    return <EmptyBlock>{formatMessage(programMessages.text.noProgram)}</EmptyBlock>
  }

  return (
    <div className="row py-3">
      {withSortingButton && (
        <div className="d-flex flex-row-reverse" style={{ width: '100%' }}>
          <ItemsSortingModal
            items={programSorts}
            triggerText={formatMessage(programMessages.ui.sortProgram)}
            onSubmit={values =>
              updatePositions({
                variables: {
                  data: values.map((value, index) => ({
                    app_id: appId,
                    id: value.id,
                    title: value.title,
                    is_subscription: value.isSubscription,
                    position: index,
                  })),
                },
              })
                .then(() => {
                  refetchProgramSorts()
                  refetchProgramPreviews()
                })
                .catch(handleError)
            }
          />
        </div>
      )}

      {programPreviews.map(program => (
        <div key={program.id} className="col-12 col-md-6 col-lg-4 mb-5">
          <AvatarPlaceHolder className="mb-3">
            {program.instructors[0] ? (
              <div className="d-flex align-items-center">
                <AvatarImage size="32px" src={program.instructors[0].avatarUrl || ''} />
                <span className="pl-2">{program.instructors[0].name}</span>
              </div>
            ) : (
              formatMessage(programMessages.text.noAssignedInstructor)
            )}
          </AvatarPlaceHolder>

          <OverlayWrapper>
            <ProgramAdminCard {...program} />
            <OverlayBlock>
              <div>
                <Link to={`/programs/${program.id}`}>
                  <StyledButton block icon={<EditOutlined />}>
                    {formatMessage(programMessages.ui.editProgram)}
                  </StyledButton>
                </Link>
              </div>
            </OverlayBlock>
          </OverlayWrapper>
        </div>
      ))}

      {loadMorePrograms && (
        <div className="text-center" style={{ width: '100%' }}>
          <Button
            loading={loading}
            onClick={() => {
              setLoading(true)
              loadMorePrograms().finally(() => setLoading(false))
            }}
          >
            {formatMessage(commonMessages.ui.showMore)}
          </Button>
        </div>
      )}
    </div>
  )
}

const useProgramPreviewCollection = (
  condition: types.GET_PROGRAM_PREVIEW_COLLECTIONVariables['condition'],
  orderBy: types.GET_PROGRAM_PREVIEW_COLLECTIONVariables['orderBy'] = [
    { updated_at: 'desc_nulls_last' as types.order_by },
  ],
) => {
  const { loading, error, data, refetch, fetchMore } = useQuery<
    types.GET_PROGRAM_PREVIEW_COLLECTION,
    types.GET_PROGRAM_PREVIEW_COLLECTIONVariables
  >(GET_PROGRAM_PREVIEW_COLLECTION, {
    variables: {
      condition,
      orderBy,
      limit: 10,
    },
  })

  const programPreviews: ProgramPreviewProps[] =
    loading || error || !data
      ? []
      : data.program.map(program => {
          const plan = program.program_plans[0]

          return {
            id: program.id,
            coverUrl: program.cover_url,
            title: program.title,
            abstract: program.abstract,
            instructors: program.program_roles.map(programRole => ({
              id: programRole.member?.id || '',
              avatarUrl: programRole.member?.picture_url || null,
              name: programRole.member?.name || programRole.member?.username || '',
            })),
            isSubscription: program.is_subscription,
            listPrice: program.is_subscription ? (plan ? plan.list_price : null) : program.list_price,
            salePrice: program.is_subscription
              ? plan && plan.sold_at && new Date(plan.sold_at).getTime() > Date.now()
                ? plan.sale_price
                : null
              : program.sold_at && new Date(program.sold_at).getTime() > Date.now()
              ? program.sale_price
              : null,
            periodAmount: program.is_subscription && plan ? 1 : null,
            periodType: program.is_subscription && plan ? (plan.period_type as ProgramPlanPeriodType) : null,
            enrollment: program.is_subscription
              ? sum(program.program_plans.map(plan => plan.program_plan_enrollments_aggregate.aggregate?.count || 0))
              : program.program_enrollments_aggregate.aggregate?.count || 0,
            isPrivate: program.is_private,
          }
        })

  const loadMorePrograms =
    (data?.program.length || 0) < (data?.program_aggregate.aggregate?.count || 0)
      ? () =>
          fetchMore({
            variables: {
              condition: {
                ...condition,
                ...(Object.keys(orderBy ? orderBy[0] : {})[0] === 'position'
                  ? { position: { _gt: data?.program.slice(-1)[0]?.position } }
                  : { updated_at: { _lt: data?.program.slice(-1)[0]?.updated_at } }),
              },
              limit: 10,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              return {
                program_aggregate: prev.program_aggregate,
                program: [...prev.program, ...fetchMoreResult.program],
              }
            },
          })
      : undefined

  return {
    loadingProgramPreviews: loading,
    errorProgramPreviews: error,
    programPreviewCount: data?.program_aggregate.aggregate?.count || 0,
    programPreviews,
    refetchProgramPreviews: refetch,
    loadMorePrograms,
  }
}
const useProgramSortCollection = (condition: types.GET_PROGRAM_PREVIEW_COLLECTIONVariables['condition']) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_PROGRAM_SORT_COLLECTION,
    types.GET_PROGRAM_SORT_COLLECTIONVariables
  >(GET_PROGRAM_SORT_COLLECTION, {
    variables: {
      condition,
    },
  })

  const programSorts: ProgramSortProps[] =
    loading || error || !data
      ? []
      : data.program.map(program => {
          return {
            id: program.id,
            title: program.title,
            isSubscription: program.is_subscription,
          }
        })

  return {
    loadingProgramSorts: loading,
    errorProgramSorts: error,
    programSorts,
    refetchProgramSorts: refetch,
  }
}

const GET_PROGRAM_PREVIEW_COLLECTION = gql`
  query GET_PROGRAM_PREVIEW_COLLECTION($condition: program_bool_exp!, $orderBy: [program_order_by!], $limit: Int!) {
    program_aggregate(where: $condition) {
      aggregate {
        count
      }
    }
    program(where: $condition, order_by: $orderBy, limit: $limit) {
      id
      cover_url
      title
      abstract
      program_roles(where: { name: { _eq: "instructor" } }, limit: 1) {
        id
        member {
          id
          picture_url
          name
          username
        }
      }
      list_price
      sale_price
      sold_at
      position
      updated_at
      published_at
      is_private
      is_subscription
      program_plans {
        id
        list_price
        sale_price
        sold_at
        period_type
        program_plan_enrollments_aggregate {
          aggregate {
            count
          }
        }
      }
      program_enrollments_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`
const GET_PROGRAM_SORT_COLLECTION = gql`
  query GET_PROGRAM_SORT_COLLECTION($condition: program_bool_exp!) {
    program(where: $condition, order_by: { position: asc }) {
      id
      title
      is_subscription
    }
  }
`

const INSERT_PROGRAM = gql`
  mutation INSERT_PROGRAM(
    $ownerId: String!
    $instructorId: String!
    $appId: String!
    $title: String!
    $isSubscription: Boolean!
    $programCategories: [program_category_insert_input!]!
  ) {
    insert_program(
      objects: {
        app_id: $appId
        title: $title
        is_subscription: $isSubscription
        program_roles: {
          data: [{ member_id: $ownerId, name: "owner" }, { member_id: $instructorId, name: "instructor" }]
        }
        program_categories: { data: $programCategories }
      }
    ) {
      returning {
        id
      }
    }
  }
`
const UPDATE_PROGRAM_POSITION_COLLECTION = gql`
  mutation UPDATE_PROGRAM_POSITION_COLLECTION($data: [program_insert_input!]!) {
    insert_program(objects: $data, on_conflict: { constraint: program_pkey, update_columns: position }) {
      affected_rows
    }
  }
`

export default ProgramCollectionAdminPage
