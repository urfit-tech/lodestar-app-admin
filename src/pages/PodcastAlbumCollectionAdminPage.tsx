import Icon, { FileAddOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button } from 'antd'
import gql from 'graphql-tag'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { AdminPageTitle } from '../components/admin'
import ProductCreationModal from '../components/common/ProductCreationModal'
import AdminLayout from '../components/layout/AdminLayout'
import PodcastAlbumCollectionTabs from '../components/podcastAlbum/PodcastAlbumCollectionTabs'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import hasura from '../hasura'
import { handleError } from '../helpers'
import { commonMessages, podcastAlbumMessages } from '../helpers/translation'
import { ReactComponent as MicrophoneIcon } from '../images/icon/microphone.svg'

const PodcastAlbumCollectionAdminPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { currentMemberId } = useAuth()
  const history = useHistory()
  const [createPodcastAlbum] = useMutation<hasura.INSERT_PODCAST_ALBUM, hasura.INSERT_PODCAST_ALBUMVariables>(
    INSERT_PODCAST_ALBUM,
  )

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
                {formatMessage(podcastAlbumMessages.ui.addPodcastProgram)}
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
    insert_podcast_album(objects: { app_id: $appId, title: $title, author_id: $authorId }) {
      affected_rows
      returning {
        id
      }
    }
  }
`

export default PodcastAlbumCollectionAdminPage
