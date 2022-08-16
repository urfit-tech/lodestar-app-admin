import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import { VenueManagementIcon } from '../../images/icon'
import ForbiddenPage from '../ForbiddenPage'
import LoadingPage from '../LoadingPage'
import pageMessages from '../translation'

const VenueAdminPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { isAuthenticating } = useAuth()

  if (isAuthenticating || Object.keys(enabledModules).length === 0) {
    return <LoadingPage />
  }

  if (!enabledModules.venue) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <AdminPageTitle className="d-flex align-items-center mb-0">
          <VenueManagementIcon className="mr-3" />
          <span>{formatMessage(pageMessages['*'].venueManagement)}</span>
        </AdminPageTitle>
      </div>
    </AdminLayout>
  )
}

export default VenueAdminPage
