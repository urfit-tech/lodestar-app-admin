import { SearchOutlined } from '@ant-design/icons'
import { Dropdown, Input, Menu, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import { MoreIcon } from '../../images/icon'
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

const filterIcon = (filtered: boolean) => <SearchOutlined style={{ color: filtered ? 'var(--primary)' : undefined }} />

type VenueColumn = {
  id: string
  name: string
  cols: number
  rows: number
  seats: number
}

const VenueCollectionTable: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [searchName, setSearchName] = useState<string | null>(null)
  const { loading, error, venues } = useVenue({ title: searchName ? { _ilike: `%${searchName}%` } : undefined })

  const columns: ColumnProps<VenueColumn>[] = [
    {
      key: 'title',
      title: formatMessage(pageMessages['*'].title),
      width: '60%',
      render: (_, record) => (
        <Link to={`/venues/${record.id}`}>
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
        <Link to={`/venues/${record.id}`}>
          <StyledTitle className="flex-grow-1">{record.cols}</StyledTitle>
        </Link>
      ),
    },
    {
      key: 'cols',
      title: formatMessage(pageMessages.VenueCollectionPage.cols),
      width: '10%',
      render: (_, record) => (
        <Link to={`/venues/${record.id}`}>
          <StyledTitle className="flex-grow-1">{record.rows}</StyledTitle>
        </Link>
      ),
    },
    {
      key: 'seats',
      title: formatMessage(pageMessages.VenueCollectionPage.seats),
      width: '10%',
      render: (_, record) => (
        <Link to={`/venues/${record.id}`}>
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
                  //deleteVenue
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

  return <Table<VenueColumn> loading={loading} rowKey="id" columns={columns} dataSource={venues} />
}

const useVenue = (condition: any) => {
  const { loading, error, data } = {
    loading: false,
    error: false,
    data: {
      venue: [
        { id: '3982031-231', name: '11樓B01', cols: 3, rows: 4, seats: 12 },
        { id: '3909131-291', name: '11樓B02', cols: 10, rows: 8, seats: 72 },
      ],
    } as { venue: VenueColumn[] },
  } //useQuery

  return {
    loading,
    error,
    venues: data.venue,
  }
}

export default VenueCollectionTable
