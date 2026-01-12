import { gql, useMutation } from '@apollo/client'
import { Skeleton } from 'antd'
import { isEmpty } from 'ramda'
import React from 'react'
import { useIntl } from 'react-intl'
import AdminPublishBlock, { ChecklistItemProps, PublishEvent, PublishStatus } from '../../components/admin/AdminPublishBlock'
import hasura from '../../hasura'
import { commonMessages, craftPageMessages, podcastAlbumMessages } from '../../helpers/translation'
import { PodcastAlbum } from '../../types/podcastAlbum'

const PodcastAlbumPublishAdminBlock: React.VFC<{
  podcastAlbum: PodcastAlbum
  onRefetch?: () => void
}> = ({ podcastAlbum, onRefetch }) => {
  const { formatMessage } = useIntl()

  const [publishMerchandise] = useMutation<hasura.PUBLISH_PODCAST_ALBUM, hasura.PUBLISH_PODCAST_ALBUMVariables>(
    PUBLISH_PODCAST_ALBUM,
  )
  if (!podcastAlbum) {
    return <Skeleton active />
  }

  const checklist: ChecklistItemProps[] = []

  isEmpty(podcastAlbum.title) &&
    checklist.push({
      id: 'NO_PODCAST_ALBUM_TITLE',
      text: formatMessage(podcastAlbumMessages.text.noPodcastAlbumTitle),
      tab: 'basicSettings',
    })

  const publishStatus: PublishStatus =
    checklist.length > 0 ? 'alert' : !podcastAlbum.publishedAt ? 'ordinary' : 'success'

  const [title, description] =
    publishStatus === 'alert'
      ? [formatMessage(commonMessages.status.notComplete), formatMessage(craftPageMessages.text.notCompleteNotation)]
      : publishStatus === 'ordinary'
      ? [formatMessage(commonMessages.status.unpublished), formatMessage(craftPageMessages.text.unpublishedNotation)]
      : publishStatus === 'success'
      ? [formatMessage(commonMessages.status.published), formatMessage(craftPageMessages.text.publishedNotation)]
      : ['', '']

  const handlePublish: (event: PublishEvent) => void = ({ values, onSuccess, onError, onFinally }) => {
    publishMerchandise({
      variables: {
        id: podcastAlbum.id,
        publishedAt: values.publishedAt || null,
      },
    })
      .then(() => {
        onRefetch?.()
        onSuccess?.()
      })
      .catch(error => onError && onError(error))
      .finally(() => onFinally && onFinally())
  }

  return (
    <AdminPublishBlock
      type={publishStatus}
      title={title}
      description={description}
      checklist={checklist}
      onPublish={handlePublish}
    />
  )
}

const PUBLISH_PODCAST_ALBUM = gql`
  mutation PUBLISH_PODCAST_ALBUM($id: uuid!, $publishedAt: timestamptz) {
    update_podcast_album(where: { id: { _eq: $id } }, _set: { published_at: $publishedAt }) {
      affected_rows
    }
  }
`

export default PodcastAlbumPublishAdminBlock
