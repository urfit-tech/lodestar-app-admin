import { SearchOutlined, UserOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Button, DatePicker, Input, Table, Tag, Typography } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import Axios from 'axios'
import gql from 'graphql-tag'
import md5 from 'md5'
import moment, { Moment } from 'moment'
import { sum } from 'ramda'
import React, { useRef, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminPageTitle } from '../../components/admin'
import AdminCard from '../../components/admin/AdminCard'
import { AvatarImage } from '../../components/common/Image'
import AdminLayout from '../../components/layout/AdminLayout'
import { useApp } from '../../contexts/AppContext'
import { currencyFormatter, dateFormatter, handleError } from '../../helpers'
import { commonMessages, memberMessages, podcastMessages } from '../../helpers/translation'
import { useMutateMemberNote } from '../../hooks/member'
import types from '../../types'

const messages = defineMessages({
  memberNoteCreatedAt: { id: 'member.label.memberNoteCreatedAt', defaultMessage: '聯絡時間' },
  memberNoteAuthor: { id: 'member.label.memberNoteAuthor', defaultMessage: '聯絡者' },
  memberNoteManager: { id: 'member.label.memberNoteManager', defaultMessage: '承辦人' },
  memberNoteMember: { id: 'member.label.memberNoteMember', defaultMessage: '學員姓名 / Email' },
  memberNoteDuration: { id: 'member.label.memberNoteDuration', defaultMessage: '音檔長度' },
  memberNoteDescription: { id: 'member.label.memberNoteDescription', defaultMessage: '備註' },
})

const TableWrapper = styled.div`
  overflow-x: auto;

  thead {
    th {
      white-space: nowrap;
    }
  }
`
const StyledMemberName = styled.div`
  color: var(--gray-darker);
  line-height: 1.5;
  letter-spacing: 0.2px;
`
const StyledMemberEmail = styled.div`
  color: var(--gray-dark);
  font-size: 12px;
  letter-spacing: 0.6px;
`
const StyledCategory = styled.div`
  width: 5rem;
`
const StyledDescription = styled(Typography.Paragraph)`
  width: 10rem;
  white-space: pre-line;
`

type FiltersProps = {
  range?: [Moment, Moment]
  author?: string
  manager?: string
  member?: string
  category?: string
  tag?: string
}
type NoteAdminProps = {
  id: string
  createdAt: Date
  author: {
    id: string
    name: string
  }
  manager: {
    id: string
    name: string
  } | null
  member: {
    id: string
    pictureUrl: string | null
    name: string
    email: string
  } | null
  memberCategories: {
    id: string
    name: string
  }[]
  memberTags: string[]
  consumption: number
  duration: number
  audioFilePath: string | null
  description: string | null
  metadata: any
}

const NoteCollectionPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { settings } = useApp()
  const searchInputRef = useRef<Input | null>(null)
  const [filters, setFilters] = useState<FiltersProps>({
    range: [moment().startOf('month'), moment().endOf('month')],
  })
  const { loadingNotes, notes, loadMoreNotes } = useMemberNotesAdmin(filters)
  const { updateMemberNote } = useMutateMemberNote()
  const [updatedDescriptions, setUpdatedDescriptions] = useState<{ [noteID: string]: string }>({})
  const [loading, setLoading] = useState(false)

  const getColumnSearchProps: (columId: keyof FiltersProps) => ColumnProps<NoteAdminProps> = columnId => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-2">
        <Input
          ref={searchInputRef}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => {
            confirm()
            setFilters({
              ...filters,
              [columnId]: selectedKeys[0] as string,
            })
          }}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <div>
          <Button
            type="primary"
            onClick={() => {
              confirm()
              setFilters({
                ...filters,
                [columnId]: selectedKeys[0] as string,
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
              setFilters({
                ...filters,
                [columnId]: undefined,
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

  const columns: ColumnProps<NoteAdminProps>[] = [
    {
      key: 'createdAt',
      title: formatMessage(messages.memberNoteCreatedAt),
      render: (text, record, index) => dateFormatter(record.createdAt),
      sorter: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    },
    {
      key: 'author',
      title: formatMessage(messages.memberNoteAuthor),
      render: (text, record, index) => record.author.name,
      ...getColumnSearchProps('author'),
    },
    {
      key: 'manager',
      title: formatMessage(messages.memberNoteManager),
      render: (text, record, index) => record.manager?.name,
      ...getColumnSearchProps('manager'),
    },
    {
      key: 'member',
      title: formatMessage(messages.memberNoteMember),
      ...getColumnSearchProps('member'),
      render: (text, record, index) =>
        record.member && (
          <div className="d-flex align-items-center">
            <AvatarImage size="36px" src={record.member.pictureUrl} className="flex-shrink-0 mr-2" />
            <div className="flex-grow-1">
              <StyledMemberName>{record.member.name}</StyledMemberName>
              <StyledMemberEmail>{record.member.email}</StyledMemberEmail>
            </div>
          </div>
        ),
    },
    {
      key: 'category',
      title: formatMessage(commonMessages.term.category),
      ...getColumnSearchProps('category'),
      render: (text, record, index) => (
        <StyledCategory>{record.memberCategories.map(category => category.name).join(', ')}</StyledCategory>
      ),
    },
    {
      key: 'tag',
      title: formatMessage(commonMessages.term.tag),
      ...getColumnSearchProps('tag'),
      render: (text, record, index) => record.memberTags.map(tag => <Tag key={tag}>{tag}</Tag>),
    },
    {
      key: 'consumption',
      title: formatMessage(commonMessages.label.consumption),
      render: (text, record, index) => currencyFormatter(record.consumption),
      sorter: (a, b) => a.consumption - b.consumption,
    },
    {
      key: 'duration',
      title: formatMessage(messages.memberNoteDuration),
      render: (text, record, index) =>
        formatMessage(commonMessages.text.minutes, { minutes: Math.round(record.duration / 60) }),
      sorter: (a, b) => a.duration - b.duration,
    },
    {
      key: 'audioRecordFile',
      title: formatMessage(memberMessages.label.audioRecordFile),
      render: (text, record, index) =>
        record.metadata?.recordfile && (
          <LoadRecordFileButton
            url={`${settings['call_server.origin']}/coocenter-api/monitor/${record.metadata.recordfile}`}
          />
        ),
    },
    {
      key: 'description',
      title: formatMessage(messages.memberNoteDescription),
      render: (text, record, index) => (
        <StyledDescription
          editable={{
            autoSize: { maxRows: 5, minRows: 1 },
            onChange: value =>
              updateMemberNote({
                variables: {
                  memberNoteId: record.id,
                  description: value,
                },
              })
                .then(() =>
                  setUpdatedDescriptions({
                    ...updatedDescriptions,
                    [record.id]: value,
                  }),
                )
                .catch(handleError),
          }}
          className="mb-0"
        >
          {updatedDescriptions[record.id] || record.description || ''}
        </StyledDescription>
      ),
    },
  ]

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <UserOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.noteAdmin)}</span>
      </AdminPageTitle>

      <DatePicker.RangePicker
        defaultValue={[moment().startOf('month'), moment().endOf('month')]}
        onChange={value =>
          value &&
          value[0] &&
          value[1] &&
          setFilters({
            ...filters,
            range: [value[0], value[1]],
          })
        }
        className="mb-4"
      />

      <AdminCard className="mb-5">
        <TableWrapper>
          <Table<NoteAdminProps>
            columns={columns}
            rowKey="id"
            pagination={false}
            loading={loadingNotes}
            dataSource={notes}
          />
        </TableWrapper>

        {loadMoreNotes && (
          <div className="text-center mt-5">
            <Button
              loading={loadingNotes || loading}
              onClick={() => {
                setLoading(true)
                loadMoreNotes()
                  .catch(handleError)
                  .finally(() => setLoading(false))
              }}
            >
              {formatMessage(commonMessages.ui.showMore)}
            </Button>
          </div>
        )}
      </AdminCard>
    </AdminLayout>
  )
}

const LoadRecordFileButton: React.FC<{
  url: string
}> = ({ url }) => {
  const { formatMessage } = useIntl()
  const [audioStatus, setAudioStatus] = useState<'loading' | 'playing' | null>(null)

  const audioCtx = new window.AudioContext()
  const buffer = useRef<AudioBuffer | null>(null)
  const source = useRef<AudioBufferSourceNode | null>(null)

  const loadAudioData = async () => {
    try {
      const response = await Axios.get(url, {
        headers: {
          Authorization: md5(`xuemi${moment().format('YYYY-MM-DD')}`),
        },
        responseType: 'arraybuffer',
      })

      buffer.current = await audioCtx.decodeAudioData(response.data)
    } catch (error) {
      handleError(error)
    }
  }

  const handlePlay = async () => {
    setAudioStatus('loading')
    await loadAudioData()
    if (!buffer.current) {
      return
    }

    source.current = audioCtx.createBufferSource()
    source.current.addEventListener('ended', () => {
      source.current?.stop(0)
      setAudioStatus(null)
    })

    source.current.buffer = buffer.current
    source.current.connect(audioCtx.destination)
    source.current.start(0)
    setAudioStatus('playing')
  }

  return (
    <Button
      type="primary"
      loading={audioStatus === 'loading'}
      onClick={() => {
        if (audioStatus === 'playing') {
          source.current?.stop(0)
          setAudioStatus(null)
        } else {
          handlePlay()
        }
      }}
    >
      {audioStatus === 'playing' ? formatMessage(podcastMessages.ui.stop) : formatMessage(podcastMessages.ui.play)}
    </Button>
  )
}

const useMemberNotesAdmin = (filters?: FiltersProps) => {
  const condition: types.MEMBER_NOTES_ADMINVariables['condition'] = {
    created_at: filters?.range
      ? {
          _gte: filters.range[0].toDate(),
          _lte: filters.range[1].toDate(),
        }
      : undefined,
    author: filters?.author
      ? {
          _or: [
            { name: { _ilike: `%${filters.author}%` } },
            { username: { _ilike: `%${filters.author}%` } },
            { email: { _ilike: `%${filters.author}%` } },
          ],
        }
      : undefined,
    member:
      filters?.manager || filters?.member || filters?.category || filters?.tag
        ? {
            manager: filters.manager
              ? {
                  _or: [
                    { name: { _ilike: `%${filters.manager}%` } },
                    { username: { _ilike: `%${filters.manager}%` } },
                    { email: { _ilike: `%${filters.manager}%` } },
                  ],
                }
              : undefined,
            _or: filters.member
              ? [
                  { name: { _ilike: `%${filters.member}%` } },
                  { username: { _ilike: `%${filters.member}%` } },
                  { email: { _ilike: `%${filters.member}%` } },
                ]
              : undefined,

            member_categories: filters.category
              ? {
                  category: { name: { _ilike: `%${filters.category}%` } },
                }
              : undefined,
            member_tags: filters.tag
              ? {
                  tag_name: { _ilike: `%${filters.tag}%` },
                }
              : undefined,
          }
        : undefined,
  }
  const { loading, error, data, refetch, fetchMore } = useQuery<
    types.MEMBER_NOTES_ADMIN,
    types.MEMBER_NOTES_ADMINVariables
  >(
    gql`
      query MEMBER_NOTES_ADMIN($condition: member_note_bool_exp) {
        member_note_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
        member_note(where: $condition, order_by: { created_at: desc }, limit: 10) {
          id
          created_at
          author {
            id
            name
            username
          }
          member {
            id
            picture_url
            name
            username
            email
            manager {
              id
              name
              username
            }
            member_categories {
              id
              category {
                id
                name
              }
            }
            member_tags {
              tag_name
            }
            order_logs {
              id
              order_products_aggregate {
                aggregate {
                  sum {
                    price
                  }
                }
              }
              order_discounts_aggregate {
                aggregate {
                  sum {
                    price
                  }
                }
              }
            }
          }
          duration
          metadata
          description
        }
      }
    `,
    { variables: { condition } },
  )

  const notes: NoteAdminProps[] =
    data?.member_note.map(v => ({
      id: v.id,
      createdAt: new Date(v.created_at),
      author: {
        id: v.author.id,
        name: v.author.name,
      },
      manager: v.member?.manager
        ? {
            id: v.member.manager.id,
            name: v.member.manager.name || v.member.manager.username,
          }
        : null,
      member: v.member
        ? {
            id: v.member.id,
            pictureUrl: v.member.picture_url,
            name: v.member.name || v.member.username,
            email: v.member.email,
          }
        : null,
      memberCategories:
        v.member?.member_categories.map(u => ({
          id: u.category.id,
          name: u.category.name,
        })) || [],
      memberTags: v.member?.member_tags.map(u => u.tag_name) || [],
      consumption:
        sum(v.member?.order_logs.map(u => u.order_products_aggregate.aggregate?.sum?.price || 0) || []) -
        sum(v.member?.order_logs.map(u => u.order_discounts_aggregate.aggregate?.sum?.price || 0) || []),
      duration: v.duration || 0,
      audioFilePath: v.metadata?.recordfile || null,
      description: v.description,
      metadata: v.metadata,
    })) || []

  const loadMoreNotes = () =>
    fetchMore({
      variables: {
        condition: {
          ...condition,
          created_at: { _lt: data?.member_note.slice(-1)[0]?.created_at },
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev
        }
        return {
          member_note_aggregate: fetchMoreResult.member_note_aggregate,
          member_note: [...prev.member_note, ...fetchMoreResult.member_note],
        }
      },
    })

  return {
    loadingNotes: loading,
    errorNotes: error,
    notes,
    refetchNotes: refetch,
    loadMoreNotes: (data?.member_note_aggregate.aggregate?.count || 0) > 10 ? loadMoreNotes : undefined,
  }
}

export default NoteCollectionPage
