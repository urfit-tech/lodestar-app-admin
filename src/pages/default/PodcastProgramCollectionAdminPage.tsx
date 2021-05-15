import Icon from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Skeleton } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { AdminPageBlock, AdminPageTitle } from '../../components/admin'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import AdminLayout from '../../components/layout/AdminLayout'
import PodcastProgramCollectionAdminTable from '../../components/podcast/PodcastProgramCollectionAdminTable'
import { useAuth } from '../../contexts/AuthContext'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as MicrophoneOIcon } from '../../images/icon/microphone-o.svg'

const PodcastProgramCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { currentUserRole, currentMemberId } = useAuth()
  const [createPodcastProgram] = useMutation<hasura.CREATE_PODCAST_PROGRAM, hasura.CREATE_PODCAST_PROGRAMVariables>(
    CREATE_PODCAST_PROGRAM,
  )

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <MicrophoneOIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.podcastPrograms)}</span>
      </AdminPageTitle>

      {!currentMemberId ? (
        <Skeleton active />
      ) : (
        <>
          <div className="mb-5">
            <ProductCreationModal
              withCreatorSelector={currentUserRole === 'app-owner'}
              onCreate={({ title, categoryIds, creatorId }) =>
                createPodcastProgram({
                  variables: {
                    title,
                    creatorId: creatorId || currentMemberId,
                    podcastCategories:
                      categoryIds?.map((categoryId: string, index: number) => ({
                        category_id: categoryId,
                        position: index,
                      })) || [],
                  },
                }).then(({ data }) => {
                  const podcastProgramId = data?.insert_podcast_program?.returning[0]?.id
                  podcastProgramId && history.push(`/podcast-programs/${podcastProgramId}`)
                })
              }
            />
          </div>

          <AdminPageBlock>
            <PodcastProgramCollectionAdminTable
              memberId={currentUserRole === 'content-creator' ? currentMemberId : undefined}
            />
          </AdminPageBlock>
        </>
      )}
    </AdminLayout>
  )
}

const CREATE_PODCAST_PROGRAM = gql`
  mutation CREATE_PODCAST_PROGRAM(
    $title: String!
    $creatorId: String!
    $podcastCategories: [podcast_program_category_insert_input!]!
  ) {
    insert_podcast_program(
      objects: {
        title: $title
        creator_id: $creatorId
        podcast_program_categories: { data: $podcastCategories }
        podcast_program_bodies: { data: { description: "" } }
        podcast_program_roles: { data: { member_id: $creatorId, name: "instructor" } }
      }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`

export default PodcastProgramCollectionAdminPage
