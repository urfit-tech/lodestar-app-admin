import Icon, { EditOutlined, FileTextFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Popover, Skeleton, Tabs } from 'antd'
import gql from 'graphql-tag'
import React, { useContext, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { Link, useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { AdminPageTitle } from '../../components/admin'
import { AvatarImage } from '../../components/common/Image'
import PositionAdminLayout, {
  OverlayBlock,
  OverlayList,
  OverlayListContent,
  OverlayListItem,
  OverlayWrapper,
} from '../../components/common/PositionAdminLayout'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import AdminLayout from '../../components/layout/AdminLayout'
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
  const { loading, id: appId } = useContext(AppContext)

  const { loadingProgramPreviews, programPreviews, refetchProgramPreviews } = useProgramPreviewCollection(
    currentUserRole === 'content-creator' ? currentMemberId : null,
  )
  const [insertProgram] = useMutation<types.INSERT_PROGRAM, types.INSERT_PROGRAMVariables>(INSERT_PROGRAM)
  const [updatePositions] = useMutation<
    types.UPDATE_PROGRAM_POSITION_COLLECTION,
    types.UPDATE_PROGRAM_POSITION_COLLECTIONVariables
  >(UPDATE_PROGRAM_POSITION_COLLECTION)

  useEffect(() => {
    refetchProgramPreviews()
  }, [refetchProgramPreviews])

  if (!currentMemberId || !currentUserRole || loading) {
    return <LoadingPage />
  }

  const tabContents = [
    {
      key: 'draft',
      status: 'unpublished',
      tab: formatMessage(commonMessages.status.draft),
      programs: programPreviews.filter(program => program.isDraft),
    },
    {
      key: 'publiclyPublish',
      status: 'published',
      tab: formatMessage(commonMessages.status.publiclyPublish),
      programs: programPreviews.filter(program => !program.isDraft && !program.isPrivate),
    },
    {
      key: 'privatelyPublish',
      status: 'published',
      tab: formatMessage(commonMessages.status.privatelyPublish),
      programs: programPreviews.filter(program => !program.isDraft && program.isPrivate),
    },
  ]

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <FileTextFilled className="mr-3" />
        <span>{formatMessage(commonMessages.menu.programs)}</span>
      </AdminPageTitle>

      <div className="mb-5">
        <ProductCreationModal
          classType="program"
          withCreatorSelector={currentUserRole === 'app-owner'}
          withProgramType
          onCreate={values =>
            insertProgram({
              variables: {
                ownerId: currentMemberId,
                instructorId: values.creatorId || currentMemberId,
                appId: appId,
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
            {loadingProgramPreviews && <Skeleton active />}

            <div className="row py-3">
              <PositionAdminLayout<ProgramPreviewProps>
                value={tabContent.programs}
                onChange={value => {
                  updatePositions({
                    variables: {
                      data: value.map((program, index) => ({
                        app_id: appId,
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

                    <OverlayWrapper>
                      <ProgramAdminCard {...program} />
                      <OverlayBlock>
                        <div>
                          <Link to={`/programs/${program.id}`}>
                            <StyledButton block icon={<EditOutlined />}>
                              {formatMessage(programMessages.ui.editProgram)}
                            </StyledButton>
                          </Link>

                          {currentUserRole === 'app-owner' && tabContent.status === 'published' && (
                            <Popover
                              placement="bottomLeft"
                              content={
                                <OverlayList
                                  header={formatMessage(commonMessages.label.currentPosition, {
                                    position: currentIndex + 1,
                                  })}
                                >
                                  <OverlayListContent>
                                    {tabContent.programs.map((program, index) => (
                                      <OverlayListItem
                                        key={program.id}
                                        className={currentIndex === index ? 'active' : ''}
                                        onClick={() => moveTarget(currentIndex, index)}
                                      >
                                        <span className="flex-shrink-0">{index + 1}</span>
                                        <span>{program.title}</span>
                                      </OverlayListItem>
                                    ))}
                                  </OverlayListContent>
                                </OverlayList>
                              }
                            >
                              <StyledButton block className="mt-4">
                                <Icon component={() => <MoveIcon />} />
                                {formatMessage(commonMessages.ui.changePosition)}
                              </StyledButton>
                            </Popover>
                          )}
                        </div>
                      </OverlayBlock>
                    </OverlayWrapper>
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
