import { Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import React from 'react'
import styled from 'styled-components'
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
  color: #21b1b1;
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

const columns: ColumnProps<PodcastProgramProps>[] = [
  {
    title: '名稱',
    dataIndex: 'title',
    key: 'title',
    width: '25rem',
    render: (text, record, index) => (
      <div key={record.id} className="d-flex align-items-center justify-content-between">
        <CustomRatioImage
          width="42px"
          ratio={1}
          src={record.coverUrl || EmptyCover}
          className="mr-3 pr-2 flex-shrink-0"
        />
        <StyledTitle className="flex-grow-1">{record.title}</StyledTitle>
      </div>
    ),
  },
  {
    title: '老師',
    dataIndex: 'creator',
    key: 'creator',
    render: (text, record, index) => <StyledText key={record.id}>{text}</StyledText>,
  },
  {
    title: '售價',
    dataIndex: 'price',
    key: 'price',
    width: '12rem',
    render: (text, record, index) => (
      <div key={record.id}>
        {typeof record.salePrice === 'number' && (
          <StyledPriceLabel className="mr-2">{currencyFormatter(record.salePrice)}</StyledPriceLabel>
        )}
        <StyledPriceLabel>{currencyFormatter(record.listPrice)}</StyledPriceLabel>
      </div>
    ),
  },
  {
    title: '購買',
    dataIndex: 'salesCount',
    key: 'salesCount',
    width: '6rem',
    align: 'right',
    render: (text, record, index) => <StyledText key={record.id}>{text}</StyledText>,
  },
  {
    title: '狀態',
    dataIndex: 'status',
    key: 'status',
    width: '6rem',
    render: (text, record, index) => (
      <StyledStatusLabel
        key={record.id}
        active={record.isPublished}
        className="d-flex align-items-center justify-content-start"
      >
        {record.isPublished ? '已發布' : '未發布'}
      </StyledStatusLabel>
    ),
  },
]

const PodcastProgramCollectionAdminTable: React.FC<{
  podcastPrograms: PodcastProgramProps[]
}> = ({ podcastPrograms }) => {
  return <Table columns={columns} dataSource={podcastPrograms} />
}

export default PodcastProgramCollectionAdminTable
