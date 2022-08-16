import { FileAddOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useIntl } from 'react-intl'
import { AdminPageBlock, AdminPageTitle } from '../../components/admin'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import AdminLayout from '../../components/layout/AdminLayout'
import { VenueManagementIcon } from '../../images/icon'
import ForbiddenPage from '../ForbiddenPage'
import LoadingPage from '../LoadingPage'
import pageMessages from '../translation'
import VenueCollectionTable from './VenueCollectionTable'

const VenueCollectionPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { enabledModules, id: appId } = useApp()
  const { isAuthenticating, currentMemberId } = useAuth()

  if (isAuthenticating || Object.keys(enabledModules).length === 0) {
    return <LoadingPage />
  }

  if (!enabledModules.venue) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <AdminPageTitle className="d-flex align-items-center mb-0">
          <VenueManagementIcon className="mr-3" />
          <span>{formatMessage(pageMessages['*'].venueManagement)}</span>
        </AdminPageTitle>
      </div>

      {currentMemberId && appId && (
        <div className="mb-4">
          <ProductCreationModal
            renderTrigger={({ setVisible }) => (
              <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
                {formatMessage(pageMessages.VenueCollectionPage.createVenue)}
              </Button>
            )}
            customModalTitle={formatMessage(pageMessages.VenueCollectionPage.createVenue)}
            // onCreate={({ title }) => history.push(`/certificates/${}`)}
          />
        </div>
      )}

      <AdminPageBlock>
        <VenueCollectionTable />
      </AdminPageBlock>
    </AdminLayout>
  )
}

export default VenueCollectionPage
