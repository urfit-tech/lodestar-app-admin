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
import CertificateCollectionTable from './MembershipCardCollectionTable'
import MembershipCardPageMessages from './translation'

const MembershipCardCollectionPage: React.VFC = () => {
  const history = useHistory()
  const { formatMessage } = useIntl()
  const { enabledModules, id: appId } = useApp()
  const { isAuthenticating, currentMemberId } = useAuth()
  const [createCertificate] = useMutation<hasura.InsertCard, hasura.InsertCardVariables>(InsertCard)
  const { publishedQuantity, unpublishedQuantity } = useCertificateQuantity()

  const tabContents = [
    {
      key: 'available',
      tab: formatMessage(pageMessages['*'].available),
      quantity: publishedQuantity,
      condition: {
        _or: [
          {
            fixed_end_date: {
              _gt: 'now()',
            },
          },
          {
            fixed_end_date: {
              _is_null: true,
            },
          },
        ],
      },
    },
    {
      key: 'unavailable',
      tab: formatMessage(pageMessages['*'].unavailable),
      quantity: unpublishedQuantity,
      condition: {
        fixed_end_date: {
          _lt: 'now()',
        },
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
          <span>{formatMessage(MembershipCardPageMessages.page.title)}</span>
        </AdminPageTitle>
      </div>

      {currentMemberId && appId && (
        <div className="mb-4">
          <ProductCreationModal
            renderTrigger={({ setVisible }) => (
              <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
                {formatMessage(MembershipCardPageMessages.page.createCard)}
              </Button>
            )}
            customModalTitle={formatMessage(MembershipCardPageMessages.page.createCard)}
            onCreate={({ title }) =>
              createCertificate({
                variables: {
                  title,
                  appId: appId,
                },
              })
                .then(({ data }) => {
                  const membershipCardId = data?.insert_card?.returning[0]?.id
                  membershipCardId && history.push(`/membership-card/${membershipCardId}`)
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

const InsertCard = gql`
  mutation InsertCard($appId: String, $title: String) {
    insert_card(objects: { app_id: $appId, title: $title }) {
      affected_rows
      returning {
        id
        app_id
        title
        description
        template
        creator_id
        sku
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

export default MembershipCardCollectionPage
