import { SearchOutlined } from '@ant-design/icons'
import { Input, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { ApolloError, ApolloQueryResult } from 'apollo-client'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import PodcastPlanUpdateModal from '../../containers/podcast/PodcastPlanUpdateModal'
import { currencyFormatter } from '../../helpers'
import { commonMessages, podcastMessages } from '../../helpers/translation'
import DefaultAvatar from '../../images/default/avatar.svg'
import types from '../../types'
import { PeriodType } from '../../types/general'
import { AvatarImage } from '../common/Image'
import { ShortenPeriodTypeLabel } from '../common/Period'

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

const messages = defineMessages({
  plan: { id: 'podcast.label.plan', defaultMessage: '方案' },
})

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
  filterIcon: filtered => <SearchOutlined style={{ color: filtered ? 'var(--primary)' : undefined }} />,
})

type PodcastPlan = {
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
  loading: boolean
  error?: ApolloError
  refetch: (
    variables?: Record<string, any> | undefined,
  ) => Promise<ApolloQueryResult<types.GET_PODCAST_PLAN_ADMIN_COLLECTION>>
}
type PodcastPlanProps = PodcastPlan & {
  sorter?: number
}
const PodcastPlanCollectionAdminTable: React.FC<PodcastPlanCollectionAdminTableProps> = ({ podcastPlans, refetch }) => {
  const { formatMessage } = useIntl()
  const [creatorSearch, setCreatorSearch] = useState('')
  const [isVisible, setVisible] = useState(false)
  const [programPlanId, setProgramPlanId] = useState('')

  const columns: ColumnProps<PodcastPlanProps>[] = [
    {
      title: formatMessage(commonMessages.term.instructor),
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
      title: formatMessage(messages.plan),
      dataIndex: 'price',
      key: 'price',
      width: '15rem',
      render: (text, record, index) => (
        <div>
          {typeof record.salePrice === 'number' && !!record.salePrice && (
            <StyledPriceLabel className="mr-2">
              {currencyFormatter(record.salePrice)} /{record.periodAmount > 1 ? ` ${record.periodAmount} ` : null}
              <ShortenPeriodTypeLabel periodType={record.periodType} />
            </StyledPriceLabel>
          )}
          <StyledPriceLabel className="mr-2">
            {currencyFormatter(record.listPrice)} /{record.periodAmount > 1 ? ` ${record.periodAmount} ` : null}
            <ShortenPeriodTypeLabel periodType={record.periodType} />
          </StyledPriceLabel>
        </div>
      ),
    },
    {
      title: formatMessage(podcastMessages.label.salesCount),
      dataIndex: 'salesCount',
      key: 'salesCount',
      width: '6rem',
      align: 'center',
      render: (text, record, index) => <StyledText>{text}</StyledText>,
      defaultSortOrder: undefined,
      sorter: (a, b) => a.salesCount - b.salesCount,
    },
    {
      title: formatMessage(podcastMessages.label.status),
      dataIndex: 'status',
      key: 'status',
      width: '6rem',
      filters: [
        {
          text: formatMessage(podcastMessages.status.published),
          value: formatMessage(podcastMessages.status.published),
        },
        {
          text: formatMessage(podcastMessages.status.notPublished),
          value: formatMessage(podcastMessages.status.notPublished),
        },
      ],
      filterMultiple: false,
      onFilter: (value, record) => record.isPublished === (value === formatMessage(podcastMessages.status.published)),
      render: (text, record, index) => (
        <StyledStatusLabel active={record.isPublished} className="d-flex align-items-center justify-content-start">
          {record.isPublished
            ? formatMessage(podcastMessages.status.published)
            : formatMessage(podcastMessages.status.notPublished)}
        </StyledStatusLabel>
      ),
    },
  ]
  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={podcastPlans.filter(podcastPlan => !creatorSearch || podcastPlan.creator.includes(creatorSearch))}
        onRow={record => {
          return {
            onClick: () => {
              setVisible(true)
              setProgramPlanId(record.id)
            },
          }
        }}
      />
      {isVisible && (
        <PodcastPlanUpdateModal
          podcastPlanId={programPlanId}
          isVisible={isVisible}
          onVisibleSet={setVisible}
          refetch={refetch}
        />
      )}
    </>
  )
}

export default PodcastPlanCollectionAdminTable
