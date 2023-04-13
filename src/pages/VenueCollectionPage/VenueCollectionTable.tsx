import { SearchOutlined } from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Dropdown, Input, Menu, message, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'
import { MoreIcon } from '../../images/icon'
import { Venue } from '../../types/venue'
import pageMessages from '../translation'

const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: 0.2px;
  cursor: pointer;
`

type VenueColumn = Pick<Venue, 'id' | 'name' | 'cols' | 'rows' | 'seats'>

const filterIcon = (filtered: boolean) => <SearchOutlined style={{ color: filtered ? 'var(--primary)' : undefined }} />

const VenueCollectionTable: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [searchName, setSearchName] = useState<string | null>(null)
  const { loading, error, venues, refetch } = useVenue({ name: searchName ? { _ilike: `%${searchName}%` } : undefined })
  const [archiveVenue] = useMutation<hasura.ARCHIVE_VENUE, hasura.ARCHIVE_VENUEVariables>(ARCHIVE_VENUE)

  const columns: ColumnProps<VenueColumn>[] = [
    {
      key: 'name',
      title: formatMessage(pageMessages['*'].title),
      width: '60%',
      render: (_, record) => (
        <Link to={`/venue-management/${record.id}?tab=seatSetting`}>
          <StyledTitle className="flex-grow-1">{record.name}</StyledTitle>
        </Link>
      ),
      filterDropdown: () => (
        <div className="p-2">
          <Input
            autoFocus
            value={searchName || ''}
            onChange={e => {
              searchName && setSearchName('')
              setSearchName(e.target.value)
            }}
          />
        </div>
      ),
      filterIcon,
    },
    {
      key: 'rows',
      title: formatMessage(pageMessages.VenueCollectionPage.rows),
      width: '10%',
      render: (_, record) => (
        <Link to={`/venue-management/${record.id}?tab=seatSetting`}>
          <StyledTitle className="flex-grow-1">{record.cols}</StyledTitle>
        </Link>
      ),
    },
    {
      key: 'cols',
      title: formatMessage(pageMessages.VenueCollectionPage.cols),
      width: '10%',
      render: (_, record) => (
        <Link to={`/venue-management/${record.id}?tab=seatSetting`}>
          <StyledTitle className="flex-grow-1">{record.rows}</StyledTitle>
        </Link>
      ),
    },
    {
      key: 'seats',
      title: formatMessage(pageMessages.VenueCollectionPage.seats),
      width: '10%',
      render: (_, record) => (
        <Link to={`/venue-management/${record.id}?tab=seatSetting`}>
          <StyledTitle className="flex-grow-1">{record.seats}</StyledTitle>
        </Link>
      ),
    },
    {
      key: 'more',
      title: '',
      width: '10%',
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                onClick={() => {
                  archiveVenue({ variables: { venueId: record.id } }).then(() => {
                    message.success(formatMessage(commonMessages.event.successfullyDeleted))
                    refetch()
                  })
                }}
              >
                {formatMessage(commonMessages.ui.delete)}
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <MoreIcon style={{ cursor: 'pointer' }} />
        </Dropdown>
      ),
    },
  ]

  if (error) {
    return <div>{formatMessage(pageMessages['*'].fetchDataError)}</div>
  }

  return <Table<VenueColumn> loading={loading} rowKey="id" columns={columns} dataSource={venues} pagination={false} />
}

const useVenue = (condition: any) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_VENUE_PREVIEW, hasura.GET_VENUE_PREVIEWVariables>(
    GET_VENUE_PREVIEW,
    {
      variables: {
        condition,
      },
    },
  )

  return {
    loading,
    error,
    venues: data?.venue,
    refetch,
  }
}

const GET_VENUE_PREVIEW = gql`
  query GET_VENUE_PREVIEW($condition: venue_bool_exp!) {
    venue(where: $condition) {
      id
      name
      rows
      cols
      seats
    }
  }
`

const ARCHIVE_VENUE = gql`
  mutation ARCHIVE_VENUE($venueId: uuid!) {
    update_venue(where: { id: { _eq: $venueId } }, _set: { deleted_at: "now()" }) {
      affected_rows
    }
  }
`

export default VenueCollectionTable
