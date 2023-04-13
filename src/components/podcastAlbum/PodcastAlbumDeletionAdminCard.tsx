import { gql, useMutation } from '@apollo/client'
import { Button, message, Modal, Skeleton } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, podcastAlbumMessages } from '../../helpers/translation'
import { PodcastAlbum } from '../../types/podcastAlbum'
import AdminModal from '../admin/AdminModal'

export const StyledModal = styled(Modal)`
  && {
    .ant-modal-body {
      padding: 32px 32px 0;
    }
    .ant-modal-footer {
      border-top: 0;
      padding: 20px;
    }
  }
`
export const StyledModalTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: var(--gray-darker);
  letter-spacing: 0.8px;
`
export const StyledModalParagraph = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: var(--gray-darker);
  letter-spacing: 0.2px;
  line-height: 1.5;
`
const StyledText = styled.div`
  color: ${props => props.theme['@primary-color']};
  font-size: 14px;
`

const PodcastAlbumDeletionAdminCard: React.FC<{
  podcastAlbum: PodcastAlbum
  onRefetch?: () => Promise<any>
}> = ({ podcastAlbum, onRefetch }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const [archivePodcastAlbum] = useMutation<
    hasura.UPDATE_PODCAST_ALBUM_IS_DELETED,
    hasura.UPDATE_PODCAST_ALBUM_IS_DELETEDVariables
  >(UPDATE_PODCAST_ALBUM_IS_DELETED)

  if (!podcastAlbum) {
    return <Skeleton active />
  }

  const handleArchive = (podcastAlbumId: string) => {
    archivePodcastAlbum({
      variables: { podcastAlbumId },
    })
      .then(() =>
        onRefetch?.().then(() => {
          message.success(formatMessage(commonMessages.event.successfullyDeleted))
          history.push(`/podcast-albums`)
        }),
      )
      .catch(handleError)
  }

  return (
    <div className="d-flex align-items-center justify-content-between">
      <div>
        <div className="mb-2">{formatMessage(podcastAlbumMessages.text.deletePodcastAlbumWarning)}</div>
        <StyledText>{formatMessage(podcastAlbumMessages.text.deletePodcastAlbumDanger)}</StyledText>
      </div>

      <AdminModal
        title={formatMessage(podcastAlbumMessages.ui.deletePodcastAlbum)}
        renderTrigger={({ setVisible }) =>
          podcastAlbum.isDeleted ? (
            <Button disabled>{formatMessage(commonMessages.status.deleted)}</Button>
          ) : (
            <Button type="primary" danger onClick={() => setVisible(true)}>
              {formatMessage(podcastAlbumMessages.ui.deletePodcastAlbum)}
            </Button>
          )
        }
        okText={formatMessage(commonMessages.ui.delete)}
        okButtonProps={{ danger: true }}
        cancelText={formatMessage(commonMessages.ui.back)}
        onOk={() => handleArchive(podcastAlbum.id)}
      >
        <div>{formatMessage(podcastAlbumMessages.text.deletePodcastAlbumConfirmation)}</div>
      </AdminModal>
    </div>
  )
}

const UPDATE_PODCAST_ALBUM_IS_DELETED = gql`
  mutation UPDATE_PODCAST_ALBUM_IS_DELETED($podcastAlbumId: uuid) {
    update_podcast_album(where: { id: { _eq: $podcastAlbumId } }, _set: { is_deleted: true }) {
      affected_rows
    }
  }
`

export default PodcastAlbumDeletionAdminCard
