import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Icon, List, Popover, Spin, Tabs, Typography } from 'antd'
import gql from 'graphql-tag'
import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { AvatarImage } from '../../components/common/Image'
import PositionAdminLayout from '../../components/common/PositionAdminLayout'
import CreatorAdminLayout from '../../components/layout/CreatorAdminLayout'
import OwnerAdminLayout from '../../components/layout/OwnerAdminLayout'
import ProgramAdminCard from '../../components/program/ProgramAdminCard'
import ProgramCreationModal from '../../components/program/ProgramCreationModal'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages, programMessages } from '../../helpers/translation'
import { ReactComponent as MoveIcon } from '../../images/icon/move.svg'
import { ProgramPlanPeriodType } from '../../schemas/program'
import types from '../../types'
import { ProgramPreviewProps } from '../../types/program'
import LoadingPage from './LoadingPage'

const AvatarPlaceHolder = styled.div`
  margin: 16px 0;
  height: 32px;
  color: #9b9b9b;
  font-size: 14px;
`
const StyledWrapper = styled.div`
  position: relative;
`
const OverlayBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;

  :hover {
    opacity: 1;
  }
`
const OverlayContentBlock = styled.div`
  width: 8rem;
`
const StyledButton = styled(Button)`
  && {
    background: none;
    border: 1px solid white;
    color: white;
  }
`
const StyledList = styled(List)`
  width: 25rem;
  overflow: hidden;
  .ant-list-header {
    padding: 1rem;
  }
`
const ListWrapper = styled.div`
  max-height: 20rem;
  overflow: auto;
`
const StyledListItem = styled(List.Item)`
  && {
    padding: 0.75rem 1rem;
    cursor: pointer;
  }
  &.active,
  :hover {
    background: var(--gray-lighter);
    color: ${props => props.theme['@primary-color']};
  }

  > span:first-child {
    width: 2rem;
  }
  > span:nth-child(2) {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`

const ProgramCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId, currentUserRole } = useAuth()
  const { loadingProgramPreviews, programPreviews } = useProgramCollection(
    currentUserRole === 'content-creator' ? currentMemberId : null,
  )
  const updatePosition = useUpdatePosition()

  if (!currentMemberId || !currentUserRole) {
    return <LoadingPage />
  }

  const AdminLayout = currentUserRole === 'app-owner' ? OwnerAdminLayout : CreatorAdminLayout

  const tabContents = [
    {
      key: 'draft',
      tab: formatMessage(commonMessages.status.draft),
      programs: programPreviews.filter(program => program.isDraft),
    },
    {
      key: 'published',
      tab: formatMessage(commonMessages.status.published),
      programs: programPreviews.filter(program => !program.isDraft),
    },
  ]

  return (
    <AdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon type="file-text" theme="filled" className="mr-3" />
        <span>{formatMessage(commonMessages.menu.programs)}</span>
      </Typography.Title>

      <ProgramCreationModal withSelector={currentUserRole === 'app-owner'} />

      <Tabs defaultActiveKey="draft">
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={tabContent.tab}>
            {loadingProgramPreviews && <Spin />}

            <div className="row">
              <PositionAdminLayout<ProgramPreviewProps>
                value={tabContent.programs}
                onChange={programs => {
                  updatePosition(
                    programs.map((program, index) => ({
                      id: program.id,
                      position: index,
                      isSubscription: program.isSubscription,
                      title: program.title,
                    })),
                  )
                }}
                renderItem={(program, currentIndex, moveTarget) => (
                  <div key={program.id} className="col-12 col-md-6 col-lg-4 mb-5">
                    <AvatarPlaceHolder className="mb-3">
                      {program.instructors[0] ? (
                        <div className="d-flex align-items-center">
                          <AvatarImage src={program.instructors[0].avatarUrl || ''} />
                          <span className="pl-2">{program.instructors[0].name}</span>
                        </div>
                      ) : (
                        formatMessage(programMessages.text.noAssignedInstructor)
                      )}
                    </AvatarPlaceHolder>

                    <StyledWrapper>
                      <ProgramAdminCard {...program} />
                      <OverlayBlock>
                        <OverlayContentBlock>
                          <Link to={`/programs/${program.id}`}>
                            <StyledButton block className="mb-4" icon="edit">
                              {formatMessage(programMessages.ui.editProgram)}
                            </StyledButton>
                          </Link>

                          <Popover
                            trigger="click"
                            placement="bottomLeft"
                            content={
                              <StyledList
                                header={formatMessage(commonMessages.label.currentPosition, {
                                  position: currentIndex + 1,
                                })}
                              >
                                <ListWrapper>
                                  {tabContent.programs.map((program, index) => (
                                    <StyledListItem
                                      key={program.id}
                                      className={currentIndex === index ? 'active' : ''}
                                      onClick={() => moveTarget(currentIndex, index)}
                                    >
                                      <span className="flex-shrink-0">{index + 1}</span>
                                      <span>{program.title}</span>
                                    </StyledListItem>
                                  ))}
                                </ListWrapper>
                              </StyledList>
                            }
                          >
                            <StyledButton block>
                              <Icon component={() => <MoveIcon />} />
                              {formatMessage(commonMessages.ui.changePosition)}
                            </StyledButton>
                          </Popover>
                        </OverlayContentBlock>
                      </OverlayBlock>
                    </StyledWrapper>
                  </div>
                )}
              />
            </div>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

const useProgramCollection = (memberId: string | null) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_PROGRAM_PREVIEW_COLLECTION,
    types.GET_PROGRAM_PREVIEW_COLLECTIONVariables
  >(
    gql`
      query GET_PROGRAM_PREVIEW_COLLECTION($memberId: String) {
        program(
          where: { editors: { member_id: { _eq: $memberId } }, is_deleted: { _eq: false } }
          order_by: { position: asc, published_at: desc }
        ) {
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
          is_subscription
          list_price
          sale_price
          sold_at
          program_plans(limit: 1) {
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
          published_at
        }
      }
    `,
    { variables: { memberId } },
  )

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
              ? (plan && plan.program_plan_enrollments_aggregate.aggregate?.count) || 0
              : program.program_enrollments_aggregate.aggregate?.count || 0,
            isDraft: !!program.published_at,
          }
        })

  return {
    loadingProgramPreviews: loading,
    errorProgramPreviews: error,
    programPreviews,
    refetchProgramPreviews: refetch,
  }
}

const useUpdatePosition = () => {
  const app = useContext(AppContext)
  const [updateProgramPositionCollection] = useMutation(gql`
    mutation UPDATE_PROGRAM_POSITION_COLLECTION($data: [program_insert_input!]!) {
      insert_program(objects: $data, on_conflict: { constraint: program_pkey, update_columns: position }) {
        affected_rows
      }
    }
  `)

  const updatePosition = (
    programs: {
      id: string
      position: number
      isSubscription: boolean
      title: string
    }[],
  ) => {
    updateProgramPositionCollection({
      variables: {
        data: programs.map(program => ({
          id: program.id,
          position: program.position,
          appId: app.id,
          title: program.title,
          is_subscription: program.isSubscription,
        })),
      },
    })
  }

  return updatePosition
}

export default ProgramCollectionAdminPage
