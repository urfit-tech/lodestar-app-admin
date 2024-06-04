import { gql, useMutation } from '@apollo/client'
import { Button, message, Skeleton } from 'antd'
import { MetaProductType } from 'lodestar-app-element/src/types/metaProduct'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { useTransformProductToString } from '../../hooks/data'
import { AdminBlock, AdminBlockTitle } from '../admin'
import AdminModal from '../admin/AdminModal'
import commonMessages from './translation'

const StyledText = styled.div`
  color: ${props => props.theme['@primary-color']};
  font-size: 14px;
`

const MetaProductDeletionBlock: React.FC<{
  metaProductType: MetaProductType
  targetId: string
  renderDeleteDangerText?: string
  options?: { memberShopId: string }
}> = ({ metaProductType, targetId, renderDeleteDangerText, options }) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const history = useHistory()
  const {
    archiveActivity,
    archiveProgram,
    archivePost,
    archiveMerchandise,
    archiveCertificate,
    archiveMemebershipCard,
  } = useArchiveMetaProduct()

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
            message.success(formatMessage(commonMessages.MetaProductDeletionBlock.successfullyDeleted))
            history.push(`/programs`)
          })
          .catch(handleError)
        break
      case 'Activity':
        archiveActivity({ variables: { activityId: targetId } })
          .then(() => {
            message.success(formatMessage(commonMessages.MetaProductDeletionBlock.successfullyDeleted))
            history.push(`/activities`)
          })
          .catch(handleError)
          .finally(() => setLoading(false))
        break
      case 'Post':
        archivePost({ variables: { postId: targetId } })
          .then(() => {
            message.success(formatMessage(commonMessages.MetaProductDeletionBlock.successfullyDeleted))
            history.push(`/blog`)
          })
          .catch(handleError)
          .finally(() => setLoading(false))
        break
      case 'Merchandise':
        archiveMerchandise({ variables: { merchandiseId: targetId } })
          .then(() => {
            message.success(formatMessage(commonMessages.MetaProductDeletionBlock.successfullyDeleted))
            history.push(`/member-shops/${options?.memberShopId}`)
          })
          .catch(handleError)
          .finally(() => setLoading(false))
        break
      case 'Certificate':
        archiveCertificate({ variables: { certificateId: targetId } })
          .then(() => {
            message.success(formatMessage(commonMessages.MetaProductDeletionBlock.successfullyDeleted))
            history.push(`/certificates`)
          })
          .catch(handleError)
          .finally(() => setLoading(false))
        break
      case 'MembershipCard':
        archiveMemebershipCard({ variables: { membershipCardId: targetId } })
          .then(() => {
            message.success(formatMessage(commonMessages.MetaProductDeletionBlock.successfullyDeleted))
            history.push(`/membership-card`)
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
      <AdminBlockTitle>
        {formatMessage(commonMessages.MetaProductDeletionBlock.deleteProduct, { metaProduct })}
      </AdminBlockTitle>
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <div className="mb-2">
            {formatMessage(commonMessages.MetaProductDeletionBlock.deleteProductWarning, { metaProduct })}
          </div>
          {renderDeleteDangerText ? <StyledText>{renderDeleteDangerText}</StyledText> : null}
        </div>

        <AdminModal
          title={formatMessage(commonMessages.MetaProductDeletionBlock.deleteProduct, { metaProduct })}
          renderTrigger={({ setVisible }) => (
            <Button type="primary" danger onClick={() => setVisible(true)}>
              {formatMessage(commonMessages.MetaProductDeletionBlock.deleteProduct, { metaProduct })}
            </Button>
          )}
          okText={formatMessage(commonMessages.MetaProductDeletionBlock.delete)}
          okButtonProps={{ danger: true, loading }}
          cancelText={formatMessage(commonMessages.MetaProductDeletionBlock.back)}
          onOk={() => handleArchive(metaProductType, targetId)}
        >
          <div>{formatMessage(commonMessages.MetaProductDeletionBlock.deleteConfirmation, { metaProduct })}</div>
        </AdminModal>
      </div>
    </AdminBlock>
  )
}

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

  const [archiveMerchandise] = useMutation<hasura.ARCHIVE_MERCHANDISE, hasura.ARCHIVE_MERCHANDISEVariables>(gql`
    mutation ARCHIVE_MERCHANDISE($merchandiseId: uuid!) {
      update_merchandise(where: { id: { _eq: $merchandiseId } }, _set: { is_deleted: true }) {
        affected_rows
      }
    }
  `)

  const [archiveCertificate] = useMutation<hasura.ARCHIVE_CERTIFICATE, hasura.ARCHIVE_CERTIFICATEVariables>(gql`
    mutation ARCHIVE_CERTIFICATE($certificateId: uuid!) {
      update_certificate(where: { id: { _eq: $certificateId } }, _set: { deleted_at: "now()" }) {
        affected_rows
      }
    }
  `)

  const [archiveMemebershipCard] = useMutation<hasura.ArchiveMembershipCard, hasura.ArchiveMembershipCardVariables>(gql`
    mutation ArchiveMembershipCard($membershipCardId: uuid!) {
      update_card(where: { id: { _eq: $membershipCardId } }, _set: { deleted_at: "now()" }) {
        affected_rows
      }
    }
  `)
  return {
    archiveActivity,
    archiveProgram,
    archivePost,
    archiveMerchandise,
    archiveCertificate,
    archiveMemebershipCard,
  }
}

export default MetaProductDeletionBlock
