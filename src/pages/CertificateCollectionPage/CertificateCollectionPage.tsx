import { FileAddOutlined } from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { handleError } from 'lodestar-app-element/src/helpers'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { AdminPageBlock, AdminPageTitle } from '../../components/admin'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import AdminLayout from '../../components/layout/AdminLayout'
import hasura from '../../hasura'
import { CertificateIcon } from '../../images/icon'
import ForbiddenPage from '../ForbiddenPage'
import LoadingPage from '../LoadingPage'
import pageMessages from '../translation'
import CertificateCollectionTable from './CertificateCollectionTable'

const CertificateCollectionPage: React.VFC = () => {
  const history = useHistory()
  const { formatMessage } = useIntl()
  const { enabledModules, id: appId } = useApp()
  const { isAuthenticating, currentMemberId } = useAuth()
  const [createCertificate] = useMutation<hasura.INSERT_CERTIFICATE, hasura.INSERT_CERTIFICATEVariables>(
    INSERT_CERTIFICATE,
  )
  const { publishedQuantity, unpublishedQuantity } = useCertificateQuantity()

  const tabContents = [
    {
      key: 'published',
      tab: formatMessage(pageMessages['*'].published),
      quantity: publishedQuantity,
      condition: {
        published_at: { _is_null: false },
      },
    },
    {
      key: 'unpublished',
      tab: formatMessage(pageMessages['*'].unpublished),
      quantity: unpublishedQuantity,
      condition: {
        published_at: { _is_null: true },
      },
    },
  ]

  if (isAuthenticating || Object.keys(enabledModules).length === 0) {
    return <LoadingPage />
  }

  if (!enabledModules.certificate) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <AdminPageTitle className="d-flex align-items-center mb-0">
          <CertificateIcon className="mr-3" />
          <span>{formatMessage(pageMessages['*'].certificateSetting)}</span>
        </AdminPageTitle>
      </div>

      {currentMemberId && appId && (
        <div className="mb-4">
          <ProductCreationModal
            renderTrigger={({ setVisible }) => (
              <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
                {formatMessage(pageMessages.CertificateCollectionPage.createCertificate)}
              </Button>
            )}
            customModalTitle={formatMessage(pageMessages.CertificateCollectionPage.createCertificate)}
            onCreate={({ title }) =>
              createCertificate({
                variables: {
                  title,
                  memberId: currentMemberId,
                  appId: appId,
                },
              })
                .then(({ data }) => {
                  const certificateId = data?.insert_certificate?.returning[0]?.id
                  certificateId && history.push(`/certificates/${certificateId}`)
                })
                .catch(handleError)
            }
          />
        </div>
      )}

      <Tabs defaultActiveKey="published">
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={`${tabContent.tab} (${tabContent.quantity})`}>
            <AdminPageBlock>
              <CertificateCollectionTable condition={tabContent.condition} />
            </AdminPageBlock>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

const INSERT_CERTIFICATE = gql`
  mutation INSERT_CERTIFICATE($title: String!, $memberId: String!, $appId: String!) {
    insert_certificate(objects: { title: $title, author_id: $memberId, app_id: $appId }) {
      affected_rows
      returning {
        id
      }
    }
  }
`

const useCertificateQuantity = () => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_CERTIFICATE_QUANTITY>(gql`
    query GET_CERTIFICATE_QUANTITY {
      certificate {
        id
        published_at
      }
    }
  `)
  return {
    loading,
    error,
    publishedQuantity: data?.certificate.filter(v => v.published_at).length || 0,
    unpublishedQuantity: data?.certificate.filter(v => !v.published_at).length || 0,
    refetch,
  }
}

export default CertificateCollectionPage
