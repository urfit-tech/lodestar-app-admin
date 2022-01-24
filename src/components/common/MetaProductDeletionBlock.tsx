import { useMutation } from '@apollo/react-hooks'
import { Button, message, Skeleton } from 'antd'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useTransformProductToString } from '../../hooks/data'
import { AdminBlock, AdminBlockTitle } from '../admin'
import AdminModal from '../admin/AdminModal'

// TODO: import from element, after package.json element version update
export type MetaProductType =
  | 'Program'
  | 'ProgramPackage'
  | 'Project'
  | 'Activity'
  | 'Merchandise'
  | 'PodcastProgram'
  | 'PodcastAlbum'
  | 'Post'

const messages = defineMessages({
  deleteProduct: {
    id: 'common.ui.deleteProduct',
    defaultMessage: '刪除{metaProduct}',
  },
  deleteConfirmation: {
    id: 'common.text.deleteConfirmation',
    defaultMessage: '{metaProduct}一經刪除即不可恢復，確定要刪除嗎？',
  },
  deleteProductWarning: {
    id: 'program.text.deleteProductWarning',
    defaultMessage: '請仔細確認是否真的要刪除{metaProduct}，因為一旦刪除就無法恢復。',
  },
  deleteProductDanger: {
    id: 'program.text.deleteProductDanger',
    defaultMessage: '*已購買者在刪除後仍可觀看。',
  },
})

const StyledText = styled.div`
  color: ${props => props.theme['@primary-color']};
  font-size: 14px;
`

const MetaProductDeletionBlock: React.FC<{
  metaProductType: MetaProductType
  targetId: string
  options?: { memberShopId: string }
}> = ({ metaProductType, targetId, options }) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const history = useHistory()
  const { archiveActivity, archiveProgram, archivePost, archiveMerchandise } = useArchiveMetaProduct()

  let metaProduct = ''
  metaProduct = useTransformProductToString(metaProductType)

  const handleArchive = (metaProductType: MetaProductType, targetId: string) => {
    setLoading(true)
    switch (metaProductType) {
      case 'Program':
        archiveProgram({
          variables: { programId: targetId },
        })
          .then(() => {
            message.success(formatMessage(commonMessages.event.successfullyDeleted))
            history.push(`/programs`)
          })
          .catch(handleError)
        break
      case 'Activity':
        archiveActivity({ variables: { activityId: targetId } })
          .then(() => {
            message.success(formatMessage(commonMessages.event.successfullyDeleted))
            history.push(`/activities`)
          })
          .catch(handleError)
          .finally(() => setLoading(false))
        break
      case 'Post':
        archivePost({ variables: { postId: targetId } })
          .then(() => {
            message.success(formatMessage(commonMessages.event.successfullyDeleted))
            history.push(`/blog`)
          })
          .catch(handleError)
          .finally(() => setLoading(false))
        break
      case 'Merchandise':
        archiveMerchandise({ variables: { merchandiseId: targetId } })
          .then(() => {
            message.success(formatMessage(commonMessages.event.successfullyDeleted))
            history.push(`/member-shops/${options?.memberShopId}`)
          })
          .catch(handleError)
          .finally(() => setLoading(false))
        break
      default:
        break
    }
  }

  if (!metaProductType || !targetId) return <Skeleton active />

  return (
    <AdminBlock>
      <AdminBlockTitle>{formatMessage(messages.deleteProduct, { metaProduct })}</AdminBlockTitle>
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <div className="mb-2">{formatMessage(messages.deleteProductWarning, { metaProduct })}</div>
          {metaProductType === ('Program' || 'ProgramPackage') ? (
            <StyledText>{formatMessage(messages.deleteProductDanger)}</StyledText>
          ) : null}
        </div>

        <AdminModal
          title={formatMessage(messages.deleteProduct, { metaProduct })}
          renderTrigger={({ setVisible }) => (
            <Button type="primary" danger onClick={() => setVisible(true)}>
              {formatMessage(messages.deleteProduct, { metaProduct })}
            </Button>
          )}
          okText={formatMessage(commonMessages.ui.delete)}
          okButtonProps={{ danger: true, loading }}
          cancelText={formatMessage(commonMessages.ui.back)}
          onOk={() => handleArchive(metaProductType, targetId)}
        >
          <div>{formatMessage(messages.deleteConfirmation, { metaProduct })}</div>
        </AdminModal>
      </div>
    </AdminBlock>
  )
}

// program, activity, program_package, blog, merchandise
const useArchiveMetaProduct = () => {
  const [archiveActivity] = useMutation<hasura.ARCHIVE_ACTIVITY, hasura.ARCHIVE_ACTIVITYVariables>(gql`
    mutation ARCHIVE_ACTIVITY($activityId: uuid) {
      update_activity(where: { id: { _eq: $activityId } }, _set: { deleted_at: "now()" }) {
        affected_rows
      }
    }
  `)

  const [archiveProgram] = useMutation<hasura.ARCHIVE_PROGRAM, hasura.ARCHIVE_PROGRAMVariables>(gql`
    mutation ARCHIVE_PROGRAM($programId: uuid) {
      update_program(where: { id: { _eq: $programId } }, _set: { is_deleted: true }) {
        affected_rows
      }
    }
  `)

  const [archivePost] = useMutation<hasura.ARCHIVE_POST, hasura.ARCHIVE_POSTVariables>(gql`
    mutation ARCHIVE_POST($postId: uuid) {
      update_post(where: { id: { _eq: $postId } }, _set: { is_deleted: true }) {
        affected_rows
      }
    }
  `)

  const [archiveMerchandise] = useMutation<hasura.DELETE_MERCHANDISE, hasura.DELETE_MERCHANDISEVariables>(gql`
    mutation ARCHIVE_MERCHANDISE($merchandiseId: uuid!) {
      update_merchandise(where: { id: { _eq: $merchandiseId } }, _set: { is_deleted: true }) {
        affected_rows
      }
    }
  `)
  return { archiveActivity, archiveProgram, archivePost, archiveMerchandise }
}

export default MetaProductDeletionBlock
