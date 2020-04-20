import { useMutation } from '@apollo/react-hooks'
import { Button, Icon, List, Popover, Spin, Tabs, Typography } from 'antd'
import gql from 'graphql-tag'
import React, { useContext, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import { AvatarImage } from '../../components/common/Image'
import PositionAdminLayout from '../../components/common/PositionAdminLayout'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import CreatorAdminLayout from '../../components/layout/CreatorAdminLayout'
import OwnerAdminLayout from '../../components/layout/OwnerAdminLayout'
import ProgramAdminCard from '../../components/program/ProgramAdminCard'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages, programMessages } from '../../helpers/translation'
import { useProgramPreviewCollection } from '../../hooks/program'
import { ReactComponent as MoveIcon } from '../../images/icon/move.svg'
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
  const { history } = useRouter()
  const app = useContext(AppContext)

  const { loadingProgramPreviews, programPreviews, refetchProgramPreviews } = useProgramPreviewCollection(
    currentUserRole === 'content-creator' ? currentMemberId : null,
  )
  const [createProgram] = useMutation<types.INSERT_PROGRAM, types.INSERT_PROGRAMVariables>(INSERT_PROGRAM)
  const [updatePositions] = useMutation<
    types.UPDATE_PROGRAM_POSITION_COLLECTION,
    types.UPDATE_PROGRAM_POSITION_COLLECTIONVariables
  >(UPDATE_PROGRAM_POSITION_COLLECTION)

  useEffect(() => {
    refetchProgramPreviews()
  }, [refetchProgramPreviews])

  if (!currentMemberId || !currentUserRole || app.loading) {
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

      <div className="mb-5">
        <ProductCreationModal
          classType="program"
          withCreatorSelector={currentUserRole === 'app-owner'}
          withProgramType
          onCreate={values =>
            createProgram({
              variables: {
                ownerId: currentMemberId,
                instructorId: values.creatorId || currentMemberId,
                appId: app.id,
                title: values.title,
                isSubscription: values.isSubscription || false,
                programCategories: values.categoryIds.map((categoryId, index) => ({
                  category_id: categoryId,
                  position: index,
                })),
              },
            }).then(res => {
              refetchProgramPreviews().then(() => {
                const programId = res.data?.insert_program?.returning[0].id
                programId && history.push(`/programs/${programId}`)
              })
            })
          }
        />
      </div>

      <Tabs defaultActiveKey="draft">
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={tabContent.tab}>
            {loadingProgramPreviews && <Spin />}

            <div className="row py-3">
              <PositionAdminLayout<ProgramPreviewProps>
                value={tabContent.programs}
                onChange={value => {
                  updatePositions({
                    variables: {
                      data: value.map((program, index) => ({
                        app_id: app.id,
                        id: program.id,
                        title: program.title,
                        is_subscription: program.isSubscription,
                        position: index,
                      })),
                    },
                  }).then(() => refetchProgramPreviews())
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
                            <StyledButton block icon="edit">
                              {formatMessage(programMessages.ui.editProgram)}
                            </StyledButton>
                          </Link>

                          {currentUserRole === 'app-owner' && tabContent.key === 'published' && (
                            <Popover
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
                              <StyledButton block className="mt-4">
                                <Icon component={() => <MoveIcon />} />
                                {formatMessage(commonMessages.ui.changePosition)}
                              </StyledButton>
                            </Popover>
                          )}
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
