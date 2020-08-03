import { SearchOutlined } from '@ant-design/icons'
import { Input, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { currencyFormatter } from '../../helpers'
import { commonMessages, podcastMessages } from '../../helpers/translation'
import DefaultAvatar from '../../images/default/avatar.svg'
import { PodcastPlanProps } from '../../types/podcast'
import { AvatarImage } from '../common/Image'
import { ShortenPeriodTypeLabel } from '../common/Period'
import PodcastPlanAdminModal from './PodcastPlanAdminModal'

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

type PodcastPlanRowProps = PodcastPlanProps & {
  creator: {
    id: string
    name: string
    avatarUrl: string | null
  }
  salesCount: number
}

const getColumnSearchProps: (
  onSearch: (selectedKeys?: string[], confirm?: () => void) => void,
) => ColumnProps<PodcastPlanRowProps> = onSearch => ({
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

const PodcastPlanCollectionAdminTable: React.FC<{
  memberId: string
  podcastPlans: PodcastPlanRowProps[]
  refetch: () => Promise<any>
}> = ({ memberId, podcastPlans, refetch }) => {
  const { formatMessage } = useIntl()

  const [creatorSearch, setCreatorSearch] = useState('')
  const [selectedPodcastPlanId, setSelectedPodcastPlanId] = useState('')

  const columns: ColumnProps<PodcastPlanRowProps>[] = [
    {
      title: formatMessage(commonMessages.term.instructor),
      key: 'creator',
      width: '12rem',
      render: (text, record, index) => (
        <div className="d-flex align-items-center justify-content-between">
          <AvatarImage
            src={record.creator.avatarUrl || DefaultAvatar}
            size="42px"
            shape="circle"
            className="mr-3 pr-2 flex-shrink-0"
          />
          <StyledTitle className="flex-grow-1">{record.creator.name}</StyledTitle>
        </div>
      ),
      ...getColumnSearchProps(selectedKeys => {
        selectedKeys && setCreatorSearch(selectedKeys[0] || '')
      }),
    },
    {
      title: formatMessage(podcastMessages.label.plan),
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
      width: '6rem',
      align: 'center',
      render: (text, record, index) => <StyledText>{text}</StyledText>,
      defaultSortOrder: undefined,
      sorter: (a, b) => a.salesCount - b.salesCount,
    },
    {
      title: formatMessage(podcastMessages.label.status),
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
      onFilter: (value, record) => !!record.publishedAt === (value === formatMessage(podcastMessages.status.published)),
      render: (text, record, index) => (
        <StyledStatusLabel active={!!record.publishedAt} className="d-flex align-items-center justify-content-start">
          {record.publishedAt
            ? formatMessage(podcastMessages.status.published)
            : formatMessage(podcastMessages.status.notPublished)}
        </StyledStatusLabel>
      ),
    },
  ]

  return (
    <PodcastPlanAdminModal
      renderTrigger={({ setVisible }) => (
        <Table<PodcastPlanRowProps>
          rowKey="id"
          columns={columns}
          dataSource={podcastPlans.filter(
            podcastPlan => !creatorSearch || podcastPlan.creator.name.includes(creatorSearch),
          )}
          onRow={record => ({
            onClick: () => {
              setSelectedPodcastPlanId(record.id)
              setVisible(true)
            },
          })}
        />
      )}
      podcastPlan={podcastPlans.find(podcastPlan => podcastPlan.id === selectedPodcastPlanId)}
      refetch={refetch}
    />
  )
}

export default PodcastPlanCollectionAdminTable
