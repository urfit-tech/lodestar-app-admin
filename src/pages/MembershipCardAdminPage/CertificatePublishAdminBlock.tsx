import { gql, useMutation } from '@apollo/client'
import { Skeleton } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import AdminPublishBlock, {
  ChecklistItemProps,
  PublishEvent,
  PublishStatus,
} from '../../components/admin/AdminPublishBlock'
import hasura from '../../hasura'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { Certificate } from '../../types/certificate'
import pageMessages from '../translation'

const CertificatePublishAdminBlock: React.VFC<{
  certificate: Certificate | null
  onRefetch?: () => void
}> = ({ certificate, onRefetch }) => {
  const { formatMessage } = useIntl()

  const [publishCertificate] = useMutation<hasura.PUBLISH_CERTIFICATE, hasura.PUBLISH_CERTIFICATEVariables>(
    PUBLISH_CERTIFICATE,
  )
  if (!certificate) {
    return <Skeleton active />
  }

  const checklist: ChecklistItemProps[] = []

  !certificate.title &&
    checklist.push({
      id: 'NO_CERTIFICATE_TITLE',
      text: formatMessage(pageMessages.CertificatePublishAdminBlock.noCertificateTitle),
      tab: 'setting',
    })
  !certificate.certificateTemplate.id &&
    checklist.push({
      id: 'NO_CERTIFICATE_TEMPLATE',
      text: formatMessage(pageMessages.CertificatePublishAdminBlock.noCertificateTemplate),
      tab: 'setting',
    })

  const publishStatus: PublishStatus =
    checklist.length > 0 ? 'alert' : !certificate.publishedAt ? 'ordinary' : 'success'

  const [title, description] =
    publishStatus === 'alert'
      ? [formatMessage(commonMessages.status.notComplete), formatMessage(craftPageMessages.text.notCompleteNotation)]
      : publishStatus === 'ordinary'
      ? [
          formatMessage(commonMessages.status.unpublished),
          formatMessage(pageMessages.CertificatePublishAdminBlock.unPublishedCertificateText),
        ]
      : publishStatus === 'success'
      ? [
          formatMessage(commonMessages.status.published),
          formatMessage(pageMessages.CertificatePublishAdminBlock.publishedCertificateText),
        ]
      : ['', '']

  const handlePublish: (event: PublishEvent) => void = ({ values, onSuccess, onError, onFinally }) => {
    publishCertificate({
      variables: {
        id: certificate.id,
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

const PUBLISH_CERTIFICATE = gql`
  mutation PUBLISH_CERTIFICATE($id: uuid!, $publishedAt: timestamptz) {
    update_certificate(where: { id: { _eq: $id } }, _set: { published_at: $publishedAt }) {
      affected_rows
    }
  }
`

export default CertificatePublishAdminBlock
