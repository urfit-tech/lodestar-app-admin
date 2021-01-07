import { SearchOutlined, UserOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Button, DatePicker, Input, Table, Tag, Typography } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { SorterResult } from 'antd/lib/table/interface'
import Axios from 'axios'
import gql from 'graphql-tag'
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
import { useAuth } from '../../contexts/AuthContext'
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
  memberNoteNote: { id: 'member.label.memberNoteNote', defaultMessage: '備註' },
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
  note: string | null
}

const NoteCollectionPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const searchInputRef = useRef<Input | null>(null)
  const [orderBy, setOrderBy] = useState<types.GET_MEMBER_NOTES_ADMINVariables['orderBy']>({
    created_at: 'asc' as types.order_by.asc,
  })
  const [filters, setFilters] = useState<FiltersProps>({
    range: [moment().startOf('month'), moment().endOf('month')],
  })
  const { loadingNotes, notes, loadMoreNotes } = useMemberNotesAdmin(orderBy, filters)
  const { updateMemberNote } = useMutateMemberNote()
  const [updatedNotes, setUpdatedNotes] = useState<{ [noteID: string]: string }>({})
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
            memberName={record.member?.name || ''}
            startTime={record.metadata?.starttime || ''}
            filePath={record.metadata.recordfile}
          />
        ),
    },
    {
      key: 'description',
      title: formatMessage(messages.memberNoteNote),
      render: (text, record, index) => (
        <StyledDescription
          editable={{
            autoSize: { maxRows: 5, minRows: 1 },
            onChange: value =>
              updateMemberNote({
                variables: {
                  memberNoteId: record.id,
                  note: value,
                },
              })
                .then(() =>
                  setUpdatedNotes({
                    ...updatedNotes,
                    [record.id]: value,
                  }),
                )
                .catch(handleError),
          }}
          className="mb-0"
        >
          {updatedNotes[record.id] || record.note || ''}
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
            onChange={(pagination, filters, sorter) => {
              const newSorter = sorter as SorterResult<NoteAdminProps>
              setOrderBy({
                [newSorter.columnKey === 'duration' ? 'duration' : 'created_at']:
                  newSorter.order === 'descend' ? ('desc' as types.order_by.desc) : ('asc' as types.order_by.asc),
              })
            }}
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
  memberName: string
  startTime: string
  filePath: string
}> = ({ memberName, startTime, filePath }) => {
  const { formatMessage } = useIntl()
  const { authToken, apiHost } = useAuth()
  const { id: appId } = useApp()
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  if (!authToken || !apiHost || !appId) {
    return (
      <Button type="primary" loading>
        {formatMessage(podcastMessages.ui.play)}
      </Button>
    )
  }

  const loadAudioData = async () => {
    setAudioUrl('')
    try {
      const response = await Axios.post(
        `${apiHost}/call/download-record`,
        { appId, filePath },
        { headers: { authorization: `Bearer ${authToken}` } },
      )

      const view = new Uint8Array(response.data.result.data)
      const arrayBuffer = view.buffer

      const blob = new Blob([arrayBuffer], { type: 'audio/wav' })
      setAudioUrl(window.URL.createObjectURL(blob))
    } catch (error) {
      handleError(error)
      setAudioUrl(null)
    }
  }

  return !audioUrl ? (
    <Button type="primary" loading={typeof audioUrl === 'string'} onClick={() => loadAudioData()}>
      {formatMessage(podcastMessages.ui.play)}
    </Button>
  ) : (
    <div className="d-flex align-items-center">
      <a href={audioUrl} download={`${memberName}_${startTime.replace(/:/g, '')}.wav`} className="flex-shrink-0 mr-2">
        <Button type="primary">{formatMessage(commonMessages.ui.download)}</Button>
      </a>
      <audio src={audioUrl} controls />
    </div>
  )
}

const useMemberNotesAdmin = (orderBy: types.GET_MEMBER_NOTES_ADMINVariables['orderBy'], filters?: FiltersProps) => {
  const condition: types.GET_MEMBER_NOTES_ADMINVariables['condition'] = {
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
    types.GET_MEMBER_NOTES_ADMIN,
    types.GET_MEMBER_NOTES_ADMINVariables
  >(
    gql`
      query GET_MEMBER_NOTES_ADMIN($orderBy: member_note_order_by!, $condition: member_note_bool_exp) {
        member_note_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
        member_note(where: $condition, order_by: [$orderBy], limit: 10) {
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
          description
          metadata
          note
        }
      }
    `,
    { variables: { condition, orderBy } },
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
      note: v.note,
    })) || []

  const loadMoreNotes = () =>
    fetchMore({
      variables: {
        orderBy,
        condition: {
          ...condition,
          created_at: orderBy.created_at
            ? { [orderBy.created_at === 'desc' ? '_lt' : '_gt']: data?.member_note.slice(-1)[0]?.created_at }
            : undefined,
          duration: orderBy.duration
            ? { [orderBy.duration === 'desc' ? '_lt' : '_gt']: data?.member_note.slice(-1)[0]?.duration }
            : undefined,
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
