import { ArrowLeftOutlined } from '@ant-design/icons'
import { Spinner } from '@chakra-ui/react'
import { Button, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useIntl } from 'react-intl'
import { Link, useParams } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import {
  AdminBlock,
  AdminBlockTitle,
  AdminHeader,
  AdminHeaderTitle,
  AdminPaneTitle,
  AdminTabBarWrapper,
} from '../../components/admin'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import { Venue } from '../../types/venue'
import LoadingPage from '../LoadingPage'
import pageMessages from '../translation'
import VenueBasicForm from './VenueBasicForm'
import VenueUsageCalendar from './VenueUsageCalendar'

const VenueAdminPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { venueId } = useParams<{ venueId: string }>()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const { loading, error, venue, refetch } = useVenue(venueId)

  if (Object.keys(enabledModules).length === 0 || loading) {
    return <LoadingPage />
  }

  return (
    <>
      <AdminHeader>
        <Link to="/venue-management">
          <Button type="link" className="mr-3">
            <ArrowLeftOutlined />
          </Button>
        </Link>

        {loading ? (
          <>
            <Spinner />
            <span className="flex-grow-1" />
          </>
        ) : (
          <AdminHeaderTitle>{venue?.name}</AdminHeaderTitle>
        )}
      </AdminHeader>

      <StyledLayoutContent variant="gray">
        {!loading && error ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '80%' }}>
            {formatMessage(pageMessages['*'].fetchDataError)}
          </div>
        ) : (
          <Tabs
            activeKey={activeKey || 'setting'}
            onChange={key => setActiveKey(key)}
            renderTabBar={(props, DefaultTabBar) => (
              <AdminTabBarWrapper>
                <DefaultTabBar {...props} className="mb-0" />
              </AdminTabBarWrapper>
            )}
          >
            <Tabs.TabPane key="seatSetting" tab={formatMessage(pageMessages.VenueAdminPage.seatSettings)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(pageMessages.VenueAdminPage.seatSettings)}</AdminPaneTitle>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="venueManagement" tab={formatMessage(pageMessages['*'].venueManagement)}>
              <div className="container py-5">
                <AdminPaneTitle className="d-flex align-items-center justify-content-between">
                  {formatMessage(pageMessages['*'].venueManagement)}
                </AdminPaneTitle>
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(pageMessages['*'].basicSettings)}</AdminBlockTitle>
                  <VenueBasicForm venue={venue} />
                </AdminBlock>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="usage" tab={formatMessage(pageMessages.VenueAdminPage.usage)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(pageMessages.VenueAdminPage.usage)}</AdminPaneTitle>
                <AdminBlock>
                  <VenueUsageCalendar />
                </AdminBlock>
              </div>
            </Tabs.TabPane>
          </Tabs>
        )}
      </StyledLayoutContent>
    </>
  )
}
export default VenueAdminPage

const useVenue = (venueId: string) => {
  const { loading, error, data, refetch } = {
    loading: false,
    error: false,
    data: { venue: { id: '3982031-231', name: '11樓B01', cols: 3, rows: 4, seats: 12 } },
    refetch: () => {},
  }

  const venue: Venue | null = data.venue
  return {
    loading,
    error,
    venue,
    refetch,
  }
}
