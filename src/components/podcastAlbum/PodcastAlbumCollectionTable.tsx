import { SearchOutlined } from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { Button, Input, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'
import EmptyCover from '../../images/default/empty-cover.png'
import { PodcastAlbum } from '../../types/podcastAlbum'
import { CustomRatioImage } from '../common/Image'

type PodcastAlbumColumnProps = Pick<PodcastAlbum, 'id' | 'title' | 'coverUrl' | 'author' | 'publishedAt'>

const TableWrapper = styled.div`
  overflow-x: auto;
  th {
    white-space: nowrap;
  }
  td {
    color: var(--gray-darker);
  }
`

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

const PodcastAlbumCollectionTable: React.VFC<{
  condition: hasura.GET_PODCAST_ALBUM_PREVIEW_COLLECTIONVariables['condition']
}> = ({ condition }) => {
  const { formatMessage } = useIntl()
  const [fieldFilter, setFieldFilter] = useState<{ title?: string; author?: string }>({})
  const searchInputRef = useRef<Input | null>(null)
  const { loading, podcastAlbums } = usePodcastAlbumPreviewCollection(condition)

  const getColumnSearchProps: (field: keyof typeof fieldFilter) => ColumnProps<PodcastAlbumColumnProps> = columnId => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-2">
        <Input
          ref={searchInputRef}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => {
            confirm()
            setFieldFilter({
              ...fieldFilter,
              [columnId]: selectedKeys[0] ?? undefined,
            })
          }}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <div>
          <Button
            type="primary"
            onClick={() => {
              confirm()
              setFieldFilter({
                ...fieldFilter,
                [columnId]: selectedKeys[0] ?? undefined,
              })
            }}
            icon={<SearchOutlined />}
            size="small"
            className="mr-2"
            style={{ width: 90 }}
          >
            {formatMessage(commonMessages.ui.search)}
          </Button>
          <Button
            onClick={() => {
              clearFilters && clearFilters()
              setFieldFilter({
                ...fieldFilter,
                [columnId]: null ?? undefined,
              })
            }}
            size="small"
            style={{ width: 90 }}
          >
            {formatMessage(commonMessages.ui.reset)}
          </Button>
        </div>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilterDropdownVisibleChange: visible => visible && setTimeout(() => searchInputRef.current?.select(), 100),
  })

  const columns: ColumnProps<PodcastAlbumColumnProps>[] = [
    {
      title: formatMessage(commonMessages.label.title),
      key: 'title',
      render: (text, record, index) => (
        <div className="d-flex align-items-center">
          <CustomRatioImage
            width="42px"
            ratio={1}
            src={record.coverUrl || EmptyCover}
            className="mr-3 pr-2 flex-shrink-0"
          />
          <StyledTitle className="flex-grow-1">{record.title}</StyledTitle>
        </div>
      ),
      ...getColumnSearchProps('title'),
    },
    {
      title: formatMessage(commonMessages.label.owner),
      key: 'author',
      dataIndex: 'author',
      render: (_, record) => <>{record.author.name}</>,
      ...getColumnSearchProps('author'),
    },
    {
      title: formatMessage(commonMessages.label.price),
      key: 'salePrice',
      dataIndex: 'salePrice',
      // TODO: finish it later
      //   render: v => 0,
      //   sorter: (a, b) => b.salePrice - a.salePrice,
    },
    {
      title: formatMessage(commonMessages.label.purchase),
      key: 'purchasing',
      dataIndex: 'purchasing',
      // TODO: finish it later
      //   render: v => 0,
      //   sorter: (a, b) => b.purchasing - a.purchasing,
    },
  ]

  return (
    <TableWrapper>
      <Table<PodcastAlbumColumnProps>
        rowKey="id"
        rowClassName="cursor-pointer"
        loading={loading}
        pagination={false}
        dataSource={podcastAlbums
          .filter(v => (fieldFilter.title ? v.title.includes(fieldFilter.title) : v))
          .filter(w => (fieldFilter.author ? w.author.name.includes(fieldFilter.author) : w))}
        columns={columns}
        onRow={record => ({
          onClick: () => {
            window.open(`${process.env.PUBLIC_URL}/podcast-albums/${record.id}?tab=podcastItem`, '_blank')
          },
        })}
      />
    </TableWrapper>
  )
}

const usePodcastAlbumPreviewCollection = (
  condition: hasura.GET_PODCAST_ALBUM_PREVIEW_COLLECTIONVariables['condition'],
) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PODCAST_ALBUM_PREVIEW_COLLECTION,
    hasura.GET_PODCAST_ALBUM_PREVIEW_COLLECTIONVariables
  >(
    gql`
      query GET_PODCAST_ALBUM_PREVIEW_COLLECTION($condition: podcast_album_bool_exp!) {
        podcast_album(where: $condition, order_by: { published_at: desc }) {
          id
          title
          cover_url
          published_at
          author {
            id
            name
          }
        }
      }
    `,
    { variables: { condition }, fetchPolicy: 'no-cache' },
  )

  const podcastAlbums: Pick<PodcastAlbum, 'id' | 'title' | 'coverUrl' | 'author' | 'publishedAt'>[] =
    data?.podcast_album.map(v => ({
      id: v.id,
      title: v.title || '',
      coverUrl: v.cover_url || '',
      publishedAt: v.published_at,
      author: {
        id: v.author?.id || '',
        name: v.author?.name || '',
      },
    })) || []

  return {
    loading,
    error,
    podcastAlbums,
    refetch,
  }
}

export default PodcastAlbumCollectionTable
