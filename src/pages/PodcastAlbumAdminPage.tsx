import { ArrowLeftOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Skeleton, Tabs } from 'antd'
import gql from 'graphql-tag'
import { useIntl } from 'react-intl'
import { Link, useParams } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import {
  AdminBlock,
  AdminBlockTitle,
  AdminHeader,
  AdminHeaderTitle,
  AdminPaneTitle,
  AdminTabBarWrapper,
  EmptyBlock,
} from '../components/admin'
import ItemsSortingModal from '../components/common/ItemsSortingModal'
import { StyledLayoutContent } from '../components/layout/DefaultLayout'
import PodcastAlbumBasicForm from '../components/podcastAlbum/PodcastAlbumBasicForm'
import PodcastAlbumDeletionAdminCard from '../components/podcastAlbum/PodcastAlbumDeletionAdminCard'
import PodcastAlbumDescriptionForm from '../components/podcastAlbum/PodcastAlbumDescriptionForm'
import PodcastAlbumPodcastProgramCollectionBlock from '../components/podcastAlbum/PodcastAlbumPodcastProgramCollectionBlock'
import PodcastAlbumPodcastProgramConnectionModal from '../components/podcastAlbum/PodcastAlbumPodcastProgramConnectionModal'
import PodcastAlbumPublishAdminBlock from '../components/podcastAlbum/PodcastAlbumPublishAdminBlock'
import { useApp } from '../contexts/AppContext'
import hasura from '../hasura'
import { handleError } from '../helpers'
import { commonMessages, podcastAlbumMessages } from '../helpers/translation'
import { usePodcastAlbumAdmin } from '../hooks/podcastAlbum'

const PodcastAlbumAdminPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { podcastAlbumId } = useParams<{ podcastAlbumId: string }>()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const { host } = useApp()
  const { loading, podcastAlbum, refetch } = usePodcastAlbumAdmin(podcastAlbumId)
  const [updatePosition] = useMutation<
    hasura.UPDATE_PODCAST_ALBUM_PODCAST_PROGRAM_POSITION_COLLECTION,
    hasura.UPDATE_PODCAST_ALBUM_PODCAST_PROGRAM_POSITION_COLLECTIONVariables
  >(UPDATE_PODCAST_ALBUM_PODCAST_PROGRAM_POSITION_COLLECTION)

  return (
    <>
      <AdminHeader>
        <Link to="/podcast-albums">
          <Button type="link" className="mr-3">
            <ArrowLeftOutlined />
          </Button>
        </Link>

        <AdminHeaderTitle>{podcastAlbum.title}</AdminHeaderTitle>
        <a href={`//${host}/podcast-albums/${podcastAlbumId}`} target="_blank" rel="noopener noreferrer">
          <Button>{formatMessage(commonMessages.ui.preview)}</Button>
        </a>
      </AdminHeader>

      {loading ? (
        <Skeleton active />
      ) : (
        <StyledLayoutContent variant="gray">
          <Tabs
            activeKey={activeKey || 'settings'}
            onChange={key => setActiveKey(key)}
            renderTabBar={(props, DefaultTabBar) => (
              <AdminTabBarWrapper>
                <DefaultTabBar {...props} className="mb-0" />
              </AdminTabBarWrapper>
            )}
          >
            <Tabs.TabPane key="podcastItem" tab={formatMessage(podcastAlbumMessages.label.podcastItem)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(podcastAlbumMessages.label.podcastItem)}</AdminPaneTitle>
                <div className="d-flex justify-content-between align-items-center">
                  <PodcastAlbumPodcastProgramConnectionModal
                    podcastAlbumId={podcastAlbumId}
                    podcastPrograms={
                      podcastAlbum.podcastPrograms.map(podcastProgram => ({
                        id: podcastProgram.id,
                        title: podcastProgram.title,
                        podcastAlbumPodcastProgramId: podcastProgram.podcastAlbumPodcastProgramId,
                      })) || []
                    }
                    onRefetch={refetch}
                  />
                  <ItemsSortingModal
                    items={
                      podcastAlbum?.podcastPrograms.map(podcastProgram => ({
                        id: podcastProgram.podcastAlbumPodcastProgramId,
                        title: podcastProgram.title,
                        podcastProgramId: podcastProgram.id,
                      })) || []
                    }
                    triggerText={formatMessage(podcastAlbumMessages.ui.sortPodcastProgram)}
                    onSubmit={values =>
                      updatePosition({
                        variables: {
                          data: values.map((value, index) => ({
                            id: value.id,
                            podcast_album_id: podcastAlbumId,
                            podcast_program_id: value.podcastProgramId,
                            position: index,
                          })),
                        },
                      })
                        .then(() => refetch?.())
                        .catch(handleError)
                    }
                  />
                </div>
                <div className="py-5">
                  {!loading && podcastAlbum.podcastPrograms.length === 0 && (
                    <EmptyBlock>{formatMessage(podcastAlbumMessages.text.emptyPodcastAlbum)}</EmptyBlock>
                  )}
                  <PodcastAlbumPodcastProgramCollectionBlock podcastPrograms={podcastAlbum.podcastPrograms} />
                </div>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="basicSettings" tab={formatMessage(commonMessages.label.basicSettings)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(commonMessages.label.basicSettings)}</AdminPaneTitle>

                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(commonMessages.label.basicSettings)}</AdminBlockTitle>
                  <PodcastAlbumBasicForm podcastAlbum={podcastAlbum} onRefetch={refetch} />
                </AdminBlock>

                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(commonMessages.label.description)}</AdminBlockTitle>
                  <PodcastAlbumDescriptionForm podcastAlbum={podcastAlbum} onRefetch={refetch} />
                </AdminBlock>

                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(podcastAlbumMessages.label.deletePodcastAlbum)}</AdminBlockTitle>
                  <PodcastAlbumDeletionAdminCard podcastAlbum={podcastAlbum} onRefetch={refetch} />
                </AdminBlock>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="publish" tab={formatMessage(commonMessages.label.publishAdmin)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(commonMessages.label.publishAdmin)}</AdminPaneTitle>
                <AdminBlock>
                  <PodcastAlbumPublishAdminBlock podcastAlbum={podcastAlbum} onRefetch={refetch} />
                </AdminBlock>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </StyledLayoutContent>
      )}
    </>
  )
}

const UPDATE_PODCAST_ALBUM_PODCAST_PROGRAM_POSITION_COLLECTION = gql`
  mutation UPDATE_PODCAST_ALBUM_PODCAST_PROGRAM_POSITION_COLLECTION(
    $data: [podcast_album_podcast_program_insert_input!]!
  ) {
    insert_podcast_album_podcast_program(
      objects: $data
      on_conflict: { constraint: podcast_album_podcast_program_pkey, update_columns: position }
    ) {
      affected_rows
    }
  }
`

export default PodcastAlbumAdminPage
