import { ArrowLeftOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Spinner } from '@chakra-ui/react'
import { Button, Tabs } from 'antd'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useIntl } from 'react-intl'
import { Link, useParams } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import { v4 as uuid } from 'uuid'
import { AdminBlock, AdminBlockTitle, AdminHeader, AdminHeaderTitle, AdminPaneTitle, AdminTabBarWrapper } from '../../components/admin'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import hasura from '../../hasura'
import { CategoryName, Venue } from '../../types/venue'
import LoadingPage from '../LoadingPage'
import pageMessages from '../translation'
import VenueBasicForm from './VenueBasicForm'
import VenueSeatSetting from './VenueSeatSetting'
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
                {venue && <VenueSeatSetting venue={venue} onRefetch={refetch} />}
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="venueManagement" tab={formatMessage(pageMessages['*'].venueManagement)}>
              <div className="container py-5">
                <AdminPaneTitle className="d-flex align-items-center justify-content-between">
                  {formatMessage(pageMessages['*'].venueManagement)}
                </AdminPaneTitle>
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(pageMessages['*'].basicSettings)}</AdminBlockTitle>
                  <VenueBasicForm venue={venue} onRefetch={refetch} />
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
  const { loading, error, data, refetch } = useQuery<hasura.GET_VENUE>(GET_VENUE, { variables: { venueId } })

  const defaultSeatInfo = Array.from(Array(4).keys()).map((_i, idx) => ({
    id: uuid(),
    venue_id: data?.venue_by_pk?.id,
    position: idx,
    disabled: false,
    category: 'normal' as CategoryName,
  }))

  const venue: Venue | null = data?.venue_by_pk
    ? {
        ...data?.venue_by_pk,
        venue_seats:
          data?.venue_by_pk.venue_seats.length === 0
            ? defaultSeatInfo
            : data?.venue_by_pk.venue_seats.map(seat => ({
                id: seat.id,
                venue_id: seat.venue_id,
                position: seat.position,
                disabled: seat.disabled,
                category: seat.category as CategoryName,
              })),
      }
    : null
  return {
    loading,
    error,
    venue,
    refetch,
  }
}

const GET_VENUE = gql`
  query GET_VENUE($venueId: uuid!) {
    venue_by_pk(id: $venueId) {
      id
      name
      rows
      cols
      seats
      venue_seats {
        id
        venue_id
        position
        disabled
        category
      }
    }
  }
`
