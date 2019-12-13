import { Icon, Input, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import React, { useState } from 'react'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import { currencyFormatter } from '../../helpers'
import EmptyCover from '../../images/default/empty-cover.png'
import { CustomRatioImage } from '../common/Image'

export type PodcastProgramProps = {
  id: string
  coverUrl?: string | null
  title: string
  creator: string
  listPrice: number
  salePrice?: number
  salesCount: number
  isPublished: boolean
}

const StyledTitle = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: 3rem;
  color: var(--gray-darker);
  line-height: 1.5;
  letter-spacing: 0.2px;
`
const StyledText = styled.div`
  color: var(--gray-darker);
  line-height: 1.5;
  letter-spacing: 0.2px;
  white-space: nowrap;
`
const StyledPriceLabel = styled.span`
  color: ${props => props.theme['@primary-color']};
  font-weight: 500;
  letter-spacing: 0.2px;
  white-space: nowrap;

  & + & {
    color: var(--gray-dark);
    text-decoration: line-through;
  }
`
const StyledStatusLabel = styled.div<{ active?: boolean }>`
  font-size: 14px;
  letter-spacing: 0.4px;
  color: var(--gray-dark);
  white-space: nowrap;

  ::before {
    display: inline-block;
    margin-right: 0.5rem;
    width: 10px;
    height: 10px;
    background-color: ${props => (props.active ? 'var(--success)' : 'var(--gray)')};
    border-radius: 50%;
    content: '';
  }
`

const getColumnSearchProps: (
  onSearch: (selectedKeys?: string[], confirm?: () => void) => void,
) => ColumnProps<PodcastProgramProps> = onSearch => ({
  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
    <div className="p-2">
      <Input
        autoFocus
        value={selectedKeys && selectedKeys[0]}
        onChange={e => {
          setSelectedKeys && setSelectedKeys([e.target.value || ''])
          onSearch([e.target.value || ''], confirm)
        }}
        style={{ width: 188, marginBottom: 8, display: 'block' }}
      />
    </div>
  ),
  filterIcon: filtered => <Icon type="search" style={{ color: filtered ? 'var(--primary)' : undefined }} />,
})

const PodcastProgramCollectionAdminTable: React.FC<{
  podcastPrograms: PodcastProgramProps[]
}> = ({ podcastPrograms }) => {
  const { history } = useRouter()

  const [titleSearch, setTitleSearch] = useState('')
  const [nameSearch, setNameSearch] = useState('')

  const columns: ColumnProps<PodcastProgramProps>[] = [
    {
      title: '名稱',
      dataIndex: 'title',
      key: 'title',
      width: '25rem',
      render: (text, record, index) => (
        <div className="d-flex align-items-center justify-content-between">
          <CustomRatioImage
            width="42px"
            ratio={1}
            src={record.coverUrl || EmptyCover}
            className="mr-3 pr-2 flex-shrink-0"
          />
          <StyledTitle className="flex-grow-1">{record.title}</StyledTitle>
        </div>
      ),
      ...getColumnSearchProps(selectedKeys => {
        selectedKeys && setTitleSearch(selectedKeys[0] || '')
        setNameSearch('')
      }),
    },
    {
      title: '老師',
      dataIndex: 'creator',
      key: 'creator',
      render: (text, record, index) => <StyledText>{text}</StyledText>,
      ...getColumnSearchProps(selectedKeys => {
        selectedKeys && setNameSearch(selectedKeys[0] || '')
        setTitleSearch('')
      }),
    },
    {
      title: '售價',
      dataIndex: 'price',
      key: 'price',
      width: '12rem',
      render: (text, record, index) => (
        <div>
          {typeof record.salePrice === 'number' && (
            <StyledPriceLabel className="mr-2">{currencyFormatter(record.salePrice)}</StyledPriceLabel>
          )}
          <StyledPriceLabel>{currencyFormatter(record.listPrice)}</StyledPriceLabel>
        </div>
      ),
      sorter: (a, b) => b.listPrice - a.listPrice,
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: '購買',
      dataIndex: 'salesCount',
      key: 'salesCount',
      width: '6rem',
      align: 'center',
      render: (text, record, index) => <StyledText>{text}</StyledText>,
      sorter: (a, b) => b.salesCount - a.salesCount,
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: '6rem',
      render: (text, record, index) => (
        <StyledStatusLabel active={record.isPublished} className="d-flex align-items-center justify-content-start">
          {record.isPublished ? '已發佈' : '未發佈'}
        </StyledStatusLabel>
      ),
      filters: [
        {
          text: '已發佈',
          value: '已發佈',
        },
        {
          text: '未發佈',
          value: '未發佈',
        },
      ],
      onFilter: (value, record) => record.isPublished === (value === '已發佈'),
    },
  ]

  return (
    <Table
      rowKey="id"
      rowClassName={() => 'cursor-pointer'}
      columns={columns}
      dataSource={podcastPrograms
        .filter(podcastProgram => !titleSearch || podcastProgram.title.includes(titleSearch))
        .filter(podcastProgram => !nameSearch || podcastProgram.creator.includes(nameSearch))}
      onRow={record => ({
        onClick: () => history.push(`/admin/podcast-programs/${record.id}`),
      })}
    />
  )
}

export default PodcastProgramCollectionAdminTable
