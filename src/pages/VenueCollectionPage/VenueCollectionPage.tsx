import { FileAddOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { handleError } from 'lodestar-app-element/src/helpers'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { AdminPageBlock, AdminPageTitle } from '../../components/admin'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import AdminLayout from '../../components/layout/AdminLayout'
import hasura from '../../hasura'
import { VenueManagementIcon } from '../../images/icon'
import ForbiddenPage from '../ForbiddenPage'
import LoadingPage from '../LoadingPage'
import pageMessages from '../translation'
import VenueCollectionTable from './VenueCollectionTable'

const VenueCollectionPage: React.VFC = () => {
  const history = useHistory()
  const { formatMessage } = useIntl()
  const { enabledModules, id: appId } = useApp()
  const { isAuthenticating, currentMemberId } = useAuth()
  const [createVenue] = useMutation<hasura.INSERT_VENUE, hasura.INSERT_VENUEVariables>(INSERT_VENUE)

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
            onCreate={({ title }) =>
              createVenue({
                variables: {
                  name: title,
                  appId: appId,
                },
              })
                .then(({ data }) => {
                  const venueId = data?.insert_venue?.returning[0]?.id
                  venueId && history.push(`/venue-management/${venueId}?tab=seatSetting`)
                })
                .catch(handleError)
            }
          />
        </div>
      )}

      <AdminPageBlock>
        <VenueCollectionTable />
      </AdminPageBlock>
    </AdminLayout>
  )
}

const INSERT_VENUE = gql`
  mutation INSERT_VENUE($name: String!, $appId: String!) {
    insert_venue(objects: { name: $name, app_id: $appId }) {
      affected_rows
      returning {
        id
      }
    }
  }
`

export default VenueCollectionPage
