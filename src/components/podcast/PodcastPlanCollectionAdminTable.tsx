import React, { useState } from 'react'
import { Table, Icon, Input } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import styled from 'styled-components'
import { currencyFormatter, getShortenPeriodTypeLabel } from '../../helpers'
import DefaultAvatar from '../../images/default/avatar.svg'
import { AvatarImage } from '../common/Image'
import PriceLabel from '../common/PriceLabel'
import { PeriodType } from '../../schemas/common'

export type PodcastPlanProps = {
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

type PodcastPlanCollectionAdminTableProps = {}
const PodcastPlanCollectionAdminTable: React.FC<PodcastPlanCollectionAdminTableProps> = () => {
  const [titleSearch, setTitleSearch] = useState('')
  const [nameSearch, setNameSearch] = useState('')

  const fakeData = [
    {
      id: '0',
      avatarUrl: null,
      creator: '李小美',
      listPrice: 500,
      salePrice: 400,
      salesCount: 88,
      isPublished: true,
      periodAmount: 2,
      periodType: 'W',
    },
    {
      id: '1',
      avatarUrl: null,
      creator: '李小龍',
      listPrice: 600,
      salePrice: 200,
      salesCount: 88,
      isPublished: true,
      periodAmount: 1,
      periodType: 'W',
    },
    {
      id: '2',
      avatarUrl: null,
      creator: '劉小東',
      listPrice: 999,
      salePrice: undefined,
      salesCount: 12,
      isPublished: false,
      periodAmount: 9,
      periodType: 'M',
    },
    {
      id: '3',
      avatarUrl: null,
      creator: '孫小小',
      listPrice: 666,
      salePrice: 400,
      salesCount: 33,
      isPublished: true,
      periodAmount: 1,
      periodType: 'Y',
    },
  ]

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
        selectedKeys && setTitleSearch(selectedKeys[0] || '')
        setNameSearch('')
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
            <StyledPriceLabel className="mr-2">每{record.periodAmount > 1 ? ` ${record.periodAmount} ` : null}{getShortenPeriodTypeLabel(record.periodType)} {currencyFormatter(record.salePrice)}</StyledPriceLabel>
          )}
          <StyledPriceLabel className="mr-2">每{record.periodAmount > 1 ? ` ${record.periodAmount} ` : null}{getShortenPeriodTypeLabel(record.periodType)} {currencyFormatter(record.listPrice)}</StyledPriceLabel>
        </div>
      ),
    },
    {
      title: '購買',
      dataIndex: 'salesCount',
      key: 'salesCount',
      width: '6rem',
      render: (text, record, index) => <StyledText>{text}</StyledText>,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: '6rem',
      filters: [{ text: '已發佈', value: 'published' }, { text: '未發佈', value: 'unpublished' }],
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
        dataSource={fakeData}
      />
    </>
  )
}

export default PodcastPlanCollectionAdminTable
