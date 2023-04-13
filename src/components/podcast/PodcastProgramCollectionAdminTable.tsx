import { SearchOutlined } from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { Button, Input, Skeleton, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import hasura from '../../hasura'
import { currencyFormatter } from '../../helpers'
import { commonMessages, podcastMessages } from '../../helpers/translation'
import { usePodcastProgramCollection } from '../../hooks/podcast'
import EmptyCover from '../../images/default/empty-cover.png'
import { CustomRatioImage } from '../common/Image'

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

export type PodcastProgramColumnProps = {
  id: string
  coverUrl?: string | null
  title: string
  instructorName: string
  listPrice: number
  salePrice?: number
  isPublished: boolean
}

const getColumnSearchProps: (events: {
  onReset: (clearFilters: any) => void
  onSearch: (selectedKeys?: React.ReactText[], confirm?: () => void) => void
}) => ColumnProps<PodcastProgramColumnProps> = ({ onReset, onSearch }) => ({
  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
    <div className="p-2">
      <Input
        autoFocus
        value={selectedKeys && selectedKeys[0]}
        onChange={e => setSelectedKeys && setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() => onSearch(selectedKeys, confirm)}
        style={{ width: 188, marginBottom: 8, display: 'block' }}
      />
      <div className="row">
        <div className="col-6">
          <Button
            type="primary"
            size="small"
            icon={<SearchOutlined />}
            block
            onClick={() => onSearch(selectedKeys, confirm)}
          >
            Search
          </Button>
        </div>
        <div className="col-6">
          <Button size="small" block onClick={() => onReset(clearFilters)}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  ),
  filterIcon: filtered => <SearchOutlined style={{ color: filtered ? 'var(--primary)' : undefined }} />,
})

const PodcastProgramCollectionAdminTable: React.FC<{
  memberId?: string
}> = ({ memberId }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { loadingPodcastPrograms, podcastPrograms, refetchPodcastPrograms } = usePodcastProgramCollection(memberId)

  const [titleSearch, setTitleSearch] = useState('')
  const [nameSearch, setNameSearch] = useState('')

  useEffect(() => {
    refetchPodcastPrograms()
  }, [refetchPodcastPrograms])

  if (loadingPodcastPrograms) {
    return <Skeleton active />
  }

  const columns: ColumnProps<PodcastProgramColumnProps>[] = [
    {
      title: formatMessage(commonMessages.label.title),
      dataIndex: 'title',
      key: 'title',
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
      ...getColumnSearchProps({
        onReset: clearFilters => {
          clearFilters()
          setTitleSearch('')
        },
        onSearch: (selectedKeys, confirm) => {
          confirm && confirm()
          selectedKeys && setTitleSearch(selectedKeys[0].toString())
        },
      }),
    },
    {
      title: formatMessage(commonMessages.label.instructor),
      dataIndex: 'instructorName',
      key: 'instructorName',
      width: '12rem',
      render: (text, record, index) => <StyledText>{text}</StyledText>,
      ...getColumnSearchProps({
        onReset: clearFilters => {
          clearFilters()
          setNameSearch('')
        },
        onSearch: (selectedKeys, confirm) => {
          confirm && confirm()
          selectedKeys && setNameSearch(selectedKeys[0].toString())
        },
      }),
    },
    {
      title: formatMessage(commonMessages.label.price),
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
      title: formatMessage(podcastMessages.label.salesCount),
      dataIndex: 'salesCount',
      key: 'salesCount',
      width: '7rem',
      align: 'center',
      render: (text, record, index) => <SalesCount id={record.id} />,
      // sorter: (a, b) => b.salesCount - a.salesCount,
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: formatMessage(podcastMessages.label.status),
      dataIndex: 'status',
      key: 'status',
      width: '7rem',
      render: (text, record, index) => (
        <StyledStatusLabel active={record.isPublished} className="d-flex align-items-center justify-content-start">
          {record.isPublished
            ? formatMessage(commonMessages.status.published)
            : formatMessage(commonMessages.status.notPublished)}
        </StyledStatusLabel>
      ),
      filters: [
        {
          text: formatMessage(commonMessages.status.published),
          value: formatMessage(commonMessages.status.published),
        },
        {
          text: formatMessage(commonMessages.status.notPublished),
          value: formatMessage(commonMessages.status.notPublished),
        },
      ],
      onFilter: (value, record) => record.isPublished === (value === formatMessage(commonMessages.status.published)),
    },
  ]

  return (
    <Table<PodcastProgramColumnProps>
      rowKey="id"
      rowClassName="cursor-pointer"
      columns={columns}
      dataSource={podcastPrograms
        .filter(podcastProgram => !titleSearch || podcastProgram.title.includes(titleSearch))
        .filter(podcastProgram => !nameSearch || podcastProgram.instructorName.includes(nameSearch))}
      onRow={record => ({
        onClick: () => history.push(`/podcast-programs/${record.id}`),
      })}
    />
  )
}

const SalesCount: React.FC<{ id: string }> = ({ id }) => {
  const { data } = useQuery<hasura.GET_PODCAST_PROGRAM_AGGREGATE, hasura.GET_PODCAST_PROGRAM_AGGREGATEVariables>(
    gql`
      query GET_PODCAST_PROGRAM_AGGREGATE($id: uuid!) {
        podcast_program_enrollment_aggregate(where: { podcast_program_id: { _eq: $id } }) {
          aggregate {
            count
          }
        }
      }
    `,
    {
      variables: { id },
    },
  )

  const salesCount = data?.podcast_program_enrollment_aggregate.aggregate
    ? data.podcast_program_enrollment_aggregate.aggregate.count || 0
    : 0

  return <>{salesCount}</>
}

export default PodcastProgramCollectionAdminTable
