import Icon, { FileAddOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/client'
import { Button } from 'antd'
import { gql } from '@apollo/client'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { AdminPageTitle } from '../components/admin'
import ProductCreationModal from '../components/common/ProductCreationModal'
import AdminLayout from '../components/layout/AdminLayout'
import PodcastAlbumCollectionTabs from '../components/podcastAlbum/PodcastAlbumCollectionTabs'
import hasura from '../hasura'
import { handleError } from '../helpers'
import { commonMessages, podcastAlbumMessages } from '../helpers/translation'
import { ReactComponent as MicrophoneIcon } from '../images/icon/microphone.svg'
import ForbiddenPage from './ForbiddenPage'

const PodcastAlbumCollectionAdminPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { id: appId, enabledModules } = useApp()
  const { currentMemberId, permissions } = useAuth()
  const history = useHistory()
  const [createPodcastAlbum] = useMutation<hasura.INSERT_PODCAST_ALBUM, hasura.INSERT_PODCAST_ALBUMVariables>(
    INSERT_PODCAST_ALBUM,
  )

  if (!enabledModules.podcast || !permissions.PODCAST_ALBUM_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <MicrophoneIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.podcastAlbum)}</span>
      </AdminPageTitle>

      {currentMemberId && (
        <div className="mb-5">
          <ProductCreationModal
            icon={<FileAddOutlined />}
            customModalTitle={formatMessage(podcastAlbumMessages.ui.createAlbum)}
            renderTrigger={({ setVisible }) => (
              <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
                {formatMessage(podcastAlbumMessages.ui.createAlbum)}
              </Button>
            )}
            onCreate={({ title }) =>
              createPodcastAlbum({
                variables: {
                  appId,
                  title,
                  authorId: currentMemberId,
                },
              })
                .then(res => {
                  const podcastAlbumId = res.data?.insert_podcast_album?.returning[0].id
                  podcastAlbumId && history.push(`/podcast-albums/${podcastAlbumId}?tab=podcastItem`)
                })
                .catch(handleError)
            }
          />
        </div>
      )}

      <PodcastAlbumCollectionTabs />
    </AdminLayout>
  )
}

const INSERT_PODCAST_ALBUM = gql`
  mutation INSERT_PODCAST_ALBUM($appId: String!, $title: String!, $authorId: String!) {
    insert_podcast_album(objects: { app_id: $appId, title: $title, author_id: $authorId, is_public: true }) {
      affected_rows
      returning {
        id
      }
    }
  }
`

export default PodcastAlbumCollectionAdminPage
