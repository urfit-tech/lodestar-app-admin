import { Icon, Input, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import React, { useState } from 'react'
import styled from 'styled-components'
import { currencyFormatter, getShortenPeriodTypeLabel } from '../../helpers'
import DefaultAvatar from '../../images/default/avatar.svg'
import { PeriodType } from '../../schemas/common'
import { AvatarImage } from '../common/Image'

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
  text-align: center;
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
) => ColumnProps<PodcastPlanProps> = onSearch => ({
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

export type PodcastPlan = {
  id: string
  avatarUrl?: string | null
  creator: string
  listPrice: number
  salePrice?: number
  salesCount: number
  isPublished: boolean
  periodAmount: number
  periodType: PeriodType | string
}
type PodcastPlanCollectionAdminTableProps = {
  podcastPlans: PodcastPlan[]
}
export type PodcastPlanProps = PodcastPlan & {
  sorter?: number
}
const PodcastPlanCollectionAdminTable: React.FC<PodcastPlanCollectionAdminTableProps> = ({
  podcastPlans
}) => {
  const [creatorSearch, setCreatorSearch] = useState('')

  const columns: ColumnProps<PodcastPlanProps>[] = [
    {
      title: '老師',
      dataIndex: 'creator',
      key: 'creator',
      width: '12rem',
      render: (text, record, index) => (
        <div className="d-flex align-items-center justify-content-between">
          <AvatarImage
            src={record.avatarUrl || DefaultAvatar}
            size="42px"
            shape="circle"
            className="mr-3 pr-2 flex-shrink-0"
          />
          <StyledTitle className="flex-grow-1">{record.creator}</StyledTitle>
        </div>
      ),
      ...getColumnSearchProps(selectedKeys => {
        selectedKeys && setCreatorSearch(selectedKeys[0] || '')
      }),
    },
    {
      title: '方案',
      dataIndex: 'price',
      key: 'price',
      width: '15rem',
      render: (text, record, index) => (
        <div>
          {typeof record.salePrice === 'number' && (
            <StyledPriceLabel className="mr-2">{currencyFormatter(record.salePrice)} 每{record.periodAmount > 1 ? ` ${record.periodAmount} ` : null}{getShortenPeriodTypeLabel(record.periodType)}</StyledPriceLabel>
          )}
          <StyledPriceLabel className="mr-2">{currencyFormatter(record.listPrice)} 每{record.periodAmount > 1 ? ` ${record.periodAmount} ` : null}{getShortenPeriodTypeLabel(record.periodType)}</StyledPriceLabel>
        </div>
      ),
    },
    {
      title: '購買',
      dataIndex: 'salesCount',
      key: 'salesCount',
      width: '6rem',
      align: 'center',
      render: (text, record, index) => <StyledText>{text}</StyledText>,
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.salesCount - b.salesCount,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: '6rem',
      filters: [
        { 
          text: '已發佈',
          value: '已發佈'
        }, 
        {
          text: '未發佈',
          value: '未發佈'
        }
      ],
      filterMultiple: false,
      onFilter: (value, record) => record.isPublished === (value === '已發佈'),
      render: (text, record, index) => (
        <StyledStatusLabel active={record.isPublished} className="d-flex align-items-center justify-content-start">
          {record.isPublished ? '已發佈' : '未發佈'}
        </StyledStatusLabel>
      ),
    },
  ]
  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={podcastPlans
          .filter(podcastPlan => !creatorSearch || podcastPlan.creator.includes(creatorSearch))
        }
      />
    </>
  )
}

export default PodcastPlanCollectionAdminTable
