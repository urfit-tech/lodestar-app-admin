import { SearchOutlined, UserOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/client'
import { Button, Checkbox, DatePicker, Input, message, Select, Table, Tag } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { SorterResult } from 'antd/lib/table/interface'
import axios from 'axios'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment, { Moment } from 'moment'
import { sum } from 'ramda'
import React, { useEffect, useRef, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminPageTitle } from '../components/admin'
import AdminCard from '../components/admin/AdminCard'
import { AvatarImage } from '../components/common/Image'
import AdminLayout from '../components/layout/AdminLayout'
import MemberNoteAdminModal from '../components/member/MemberNoteAdminModal'
import hasura from '../hasura'
import { currencyFormatter, dateFormatter, downloadFile, getFileDownloadableLink, handleError } from '../helpers'
import { commonMessages, memberMessages, podcastMessages } from '../helpers/translation'
import { useMutateAttachment, useUploadAttachments } from '../hooks/data'
import { useMutateMemberNote } from '../hooks/member'
import ForbiddenPage from './ForbiddenPage'

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
const StyledDescription = styled.div`
  color: var(--gray-darker);
  line-height: 1.5;
  letter-spacing: 0.2px;
`
const FilterWrapper = styled.div`
  padding-top: 0.5rem;
  max-height: 20rem;
  overflow: auto;
`
const NoWrapText = styled.div`
  white-space: nowrap;
`

type FiltersProps = {
  range?: [Moment, Moment]
  author?: string
  manager?: string
  member?: string
  categories?: string[]
  tags?: string[]
}

export type NoteAdmin = {
  id: string
  createdAt: Date
  type: 'inbound' | 'outbound' | 'demo' | 'sms' | null
  status: string | null
  author: {
    id: string
    pictureUrl: string | null
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
    properties: {
      name: string
      value: string
    }[]
  }
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
  attachments: {
    id: string
    data: any
    options: any
  }[]
}
const NoteCollectionPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { authToken, permissions } = useAuth()

  const { enabledModules } = useApp()
  const [orderBy, setOrderBy] = useState<hasura.member_note_order_by>({
    created_at: 'desc' as hasura.order_by,
  })
  const [filters, setFilters] = useState<FiltersProps>({
    range: [moment().startOf('month'), moment().endOf('month')],
  })
  const { loadingNotes, allMemberCategories, allMemberTags, notes, loadMoreNotes, refetchNotes } = useMemberNotesAdmin(
    orderBy,
    filters,
  )
  const { updateMemberNote } = useMutateMemberNote()
  const uploadAttachments = useUploadAttachments()
  const { archiveAttachments } = useMutateAttachment()

  const searchInputRef = useRef<Input | null>(null)

  const [updatedNotes, setUpdatedNotes] = useState<{ [NoteID: string]: string }>({})
  const [loading, setLoading] = useState(false)
  const [downloadingNoteIds, setDownloadingNoteIds] = useState<string[]>([])
  const [selectedNote, setSelectedNote] = useState<NoteAdmin | null>(null)
  const [playbackRate, setPlaybackRate] = useState(1)

  const getColumnSearchProps: (columId: keyof FiltersProps) => ColumnProps<NoteAdmin> = columnId => ({
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

  const columns: ColumnProps<NoteAdmin>[] = [
    {
      key: 'createdAt',
      title: formatMessage(messages.memberNoteCreatedAt),
      render: (text, record, index) => <NoWrapText>{dateFormatter(record.createdAt)}</NoWrapText>,
      sorter: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    },
    {
      key: 'author',
      title: formatMessage(messages.memberNoteAuthor),
      render: (text, record, index) => <div>{record.author.name}</div>,
      ...getColumnSearchProps('author'),
    },
    {
      key: 'manager',
      title: formatMessage(messages.memberNoteManager),
      render: (text, record, index) => <div>{record.manager?.name}</div>,
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
      title: formatMessage(commonMessages.label.category),
      width: '10rem',
      ...getColumnSearchProps('categories'),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div>
          <FilterWrapper>
            <Checkbox.Group
              value={filters.categories}
              onChange={value =>
                value.length
                  ? setFilters({ ...filters, categories: value as string[] })
                  : setFilters({ ...filters, categories: undefined })
              }
            >
              {allMemberCategories.map(category => (
                <Checkbox key={category.id} value={category.id} className="d-block mx-2 mb-2">
                  {category.name}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </FilterWrapper>
          <div className="p-2 text-right">
            <Button size="small" onClick={() => setFilters({ ...filters, categories: undefined })}>
              {formatMessage(commonMessages.ui.reset)}
            </Button>
          </div>
        </div>
      ),
      render: (text, record, index) => <>{record.memberCategories.map(category => category.name).join(', ')}</>,
    },
    {
      key: 'tag',
      title: formatMessage(commonMessages.label.tag),
      width: '10rem',
      ...getColumnSearchProps('tags'),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div>
          <FilterWrapper>
            <Checkbox.Group
              value={filters.tags}
              onChange={value =>
                value.length
                  ? setFilters({ ...filters, tags: value as string[] })
                  : setFilters({ ...filters, tags: undefined })
              }
            >
              {allMemberTags.map(tag => (
                <Checkbox key={tag} value={tag} className="d-block mx-2 mb-2">
                  {tag}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </FilterWrapper>
          <div className="p-2 text-right">
            <Button size="small" onClick={() => setFilters({ ...filters, tags: undefined })}>
              {formatMessage(commonMessages.ui.reset)}
            </Button>
          </div>
        </div>
      ),
      render: (text, record, index) => record.memberTags.map(tag => <Tag key={tag}>{tag}</Tag>),
    },
    {
      key: 'propertyMaterials',
      title: '廣告素材',
      width: '10rem',
      render: (text, record, index) => record.member?.properties.find(property => property.name === '廣告素材')?.value,
    },
    {
      key: 'propertyEvent',
      title: '行銷活動',
      width: '10rem',
      render: (text, record, index) => record.member?.properties.find(property => property.name === '行銷活動')?.value,
    },
    {
      key: 'propertyPackage',
      title: '廣告組合',
      width: '10rem',
      render: (text, record, index) => record.member?.properties.find(property => property.name === '廣告組合')?.value,
    },
    {
      key: 'consumption',
      title: formatMessage(commonMessages.label.consumption),
      render: (text, record, index) => <NoWrapText>{currencyFormatter(record.consumption)}</NoWrapText>,
      sorter: (a, b) => a.consumption - b.consumption,
    },
    {
      key: 'duration',
      title: formatMessage(messages.memberNoteDuration),
      render: (text, record, index) => (
        <NoWrapText>
          {formatMessage(commonMessages.text.minutes, { minutes: Math.round(record.duration / 60) })}
        </NoWrapText>
      ),
      sorter: (a, b) => a.duration - b.duration,
    },
    {
      key: 'audioRecordFile',
      title: (
        <>
          <span className="mr-2">{formatMessage(memberMessages.label.audioRecordFile)}</span>
          <Select<number> value={playbackRate} onChange={value => setPlaybackRate(value)}>
            <Select.Option value={0.5}>0.5x</Select.Option>
            <Select.Option value={1}>1x</Select.Option>
            <Select.Option value={1.5}>1.5x</Select.Option>
            <Select.Option value={2}>2x</Select.Option>
          </Select>
        </>
      ),

      render: (text, record, index) => {
        const recordAttachmentId = record.attachments.find(v => v.data.name.includes('recordFile'))?.id
        return (
          recordAttachmentId && (
            <div onClick={event => event.stopPropagation()}>
              <LoadRecordFileButton
                memberName={record.member?.name || ''}
                startTime={record.metadata?.starttime || ''}
                playbackRate={playbackRate}
                attachmentId={recordAttachmentId}
              />
            </div>
          )
        )
      },
    },
    {
      key: 'attachments',
      title: formatMessage(memberMessages.label.attachment),
      width: '8rem',
      render: (text, record, index) =>
        record.attachments.length ? (
          <Button
            type="primary"
            loading={downloadingNoteIds.includes(record.id)}
            onClick={async event => {
              event.stopPropagation()
              setDownloadingNoteIds(prev => [...prev, record.id])
              let downloadedCount = 0
              record.attachments.forEach(async attachment => {
                try {
                  const link: string = await getFileDownloadableLink(`attachments/${attachment.id}`, authToken)
                  if (link && attachment.data?.name) {
                    await downloadFile(attachment.data.name, { url: link })
                    downloadedCount++
                    if (downloadedCount === record.attachments.length) {
                      setDownloadingNoteIds(prev => prev.filter(v => v !== record.id))
                    }
                  }
                } catch (error) {
                  handleError(error)
                  setDownloadingNoteIds(prev => prev.filter(v => v !== record.id))
                }
              })
            }}
          >
            {formatMessage(commonMessages.ui.download)}
          </Button>
        ) : null,
    },
    {
      key: 'description',
      title: formatMessage(messages.memberNoteNote),
      width: '15rem',
      render: (text, record, index) => (
        <StyledDescription>{updatedNotes[record.id] || record.note || ''}</StyledDescription>
      ),
    },
  ]

  if (!enabledModules.member_note || (!permissions.MEMBER_NOTE_ADMIN && !permissions.VIEW_ALL_MEMBER_NOTE)) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <UserOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.noteAdmin)}</span>
      </AdminPageTitle>

      <DatePicker.RangePicker
        defaultValue={[moment().startOf('month'), moment().endOf('month')]}
        showTime
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
          <MemberNoteAdminModal
            title={formatMessage(memberMessages.label.editNote)}
            note={selectedNote || undefined}
            renderTrigger={({ setVisible }) => (
              <Table<NoteAdmin>
                columns={columns}
                rowKey="id"
                rowClassName="cursor-pointer"
                pagination={false}
                loading={loadingNotes}
                dataSource={notes}
                onChange={(pagination, filters, sorter) => {
                  const newSorter = sorter as SorterResult<NoteAdmin>
                  setOrderBy({
                    [newSorter.columnKey === 'duration' ? 'duration' : 'created_at']:
                      newSorter.order === 'ascend' ? 'asc' : 'desc',
                  })
                }}
                onRow={
                  (permissions.MEMBER_NOTE_ADMIN || permissions.EDIT_DELETE_ALL_MEMBER_NOTE) ?
                    note => ({
                      onClick: () => {
                        setSelectedNote(note)
                        setVisible(true)
                      },
                    }) : undefined}
              />
            )}
            onSubmit={
              (permissions.MEMBER_NOTE_ADMIN || permissions.EDIT_DELETE_ALL_MEMBER_NOTE) &&
                selectedNote
                ? ({ type, status, duration, description, note, attachments }) =>
                  updateMemberNote({
                    variables: {
                      memberNoteId: selectedNote.id || '',
                      data: {
                        type,
                        status,
                        duration,
                        description,
                        note,
                      },
                    },
                  })
                    .then(async ({ data }) => {
                      setUpdatedNotes(prev => ({
                        ...prev,
                        [selectedNote.id]: note,
                      }))

                      const memberNoteId = data?.update_member_note_by_pk?.id
                      const deletedAttachmentIds =
                        selectedNote.attachments
                          ?.filter(noteAttachment =>
                            attachments.every(
                              attachment =>
                                attachment.name !== noteAttachment.data.name &&
                                attachment.lastModified !== noteAttachment.data.lastModified,
                            ),
                          )
                          ?.map(attachment => attachment.id) || []
                      const newAttachments = attachments.filter(attachment =>
                        selectedNote.attachments?.every(
                          noteAttachment =>
                            noteAttachment.data.name !== attachment.name &&
                            noteAttachment.data.lastModified !== attachment.lastModified,
                        ),
                      )
                      if (memberNoteId && attachments.length) {
                        await archiveAttachments({ variables: { attachmentIds: deletedAttachmentIds } })
                        await uploadAttachments('MemberNote', memberNoteId, newAttachments)
                      }
                      message.success(formatMessage(commonMessages.event.successfullyEdited))
                      refetchNotes()
                    })
                    .catch(handleError)
                : undefined
            }
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
  playbackRate: number
  attachmentId: string
}> = ({ memberName, startTime, playbackRate, attachmentId }) => {
  const { formatMessage } = useIntl()
  const { authToken } = useAuth()
  const { id: appId } = useApp()
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!audioRef.current || audioRef.current.playbackRate === playbackRate) {
      return
    }

    audioRef.current.playbackRate = playbackRate
  }, [playbackRate])

  if (!authToken || !appId) {
    return (
      <Button type="primary" loading>
        {formatMessage(podcastMessages.ui.play)}
      </Button>
    )
  }

  const loadAudioData = async () => {
    setAudioUrl('')
    try {
      const link: string = await getFileDownloadableLink(`attachments/${attachmentId}`, authToken)

      const response = await axios.get(link, {
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: 'audio/wav' })
      setAudioUrl(window.URL.createObjectURL(blob))
    } catch (error) {
      handleError(error)
      setAudioUrl(null)
    }
  }

  return audioUrl ? (
    <div className="d-flex align-items-center">
      <a href={audioUrl} download={`${memberName}_${startTime.replace(/:/g, '')}.wav`} className="flex-shrink-0 mr-2">
        <Button type="primary">{formatMessage(commonMessages.ui.download)}</Button>
      </a>
      <audio ref={audioRef} src={audioUrl} controls />
    </div>
  ) : (
    <Button type="primary" loading={typeof audioUrl === 'string'} onClick={() => loadAudioData()}>
      {formatMessage(podcastMessages.ui.play)}
    </Button>
  )
}

const useMemberNotesAdmin = (
  orderBy: hasura.GET_MEMBER_NOTES_ADMIN_XUEMIVariables['orderBy'],
  filters?: FiltersProps,
) => {
  const { currentMemberId, currentUserRole, permissions } = useAuth()

  const condition: hasura.GET_MEMBER_NOTES_ADMIN_XUEMIVariables['condition'] = {
    created_at: filters?.range
      ? {
        _gte: filters.range[0].toDate(),
        _lte: filters.range[1].toDate(),
      }
      : undefined,
    author:
      currentUserRole === 'app-owner' || permissions.MEMBER_NOTE_ADMIN || permissions.VIEW_ALL_MEMBER_NOTE
        ?
        filters?.author
          ? {
            _or: [
              { name: { _ilike: `%${filters.author}%` } },
              { username: { _ilike: `%${filters.author}%` } },
              { email: { _ilike: `%${filters.author}%` } },
            ],
          }
          : undefined
        : {
          id: {
            _eq: currentMemberId,
          },
        },
    member: {
      manager: filters?.manager
        ? {
          _or: [
            { name: { _ilike: `%${filters.manager}%` } },
            { username: { _ilike: `%${filters.manager}%` } },
            { email: { _ilike: `%${filters.manager}%` } },
          ],
        }
        : undefined,
      _or: filters?.member
        ? [
          { id: { _eq: filters.member } },
          { name: { _ilike: `%${filters.member}%` } },
          { username: { _ilike: `%${filters.member}%` } },
          { email: { _ilike: `%${filters.member}%` } },
        ]
        : undefined,
      _and:
        filters?.categories || filters?.tags
          ? [
            {
              _or: filters.categories?.map(categoryId => ({
                member_categories: { category_id: { _eq: categoryId } },
              })),
            },
            {
              _or: filters.tags?.map(tag => ({
                member_tags: { tag_name: { _eq: tag } },
              })),
            },
          ]
          : undefined,
    },
  }
  const { loading, error, data, refetch, fetchMore } = useQuery<
    hasura.GET_MEMBER_NOTES_ADMIN_XUEMI,
    hasura.GET_MEMBER_NOTES_ADMIN_XUEMIVariables
  >(
    gql`
      query GET_MEMBER_NOTES_ADMIN_XUEMI($orderBy: member_note_order_by!, $condition: member_note_bool_exp) {
        category(where: { member_categories: {} }) {
          id
          name
        }
        member_tag(distinct_on: tag_name) {
          tag_name
        }
        member_note_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
        member_note(where: $condition, order_by: [$orderBy], limit: 10) {
          id
          created_at
          type
          status
          author {
            id
            picture_url
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
            member_properties(where: { property: { name: { _similar: "廣告素材|行銷活動|廣告組合" } } }) {
              id
              property {
                id
                name
              }
              value
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
          member_note_attachments {
            attachment_id
            data
            options
          }
        }
      }
    `,
    { variables: { condition, orderBy } },
  )

  const allMemberCategories: {
    id: string
    name: string
  }[] =
    data?.category.map(v => ({
      id: v.id,
      name: v.name,
    })) || []
  const allMemberTags: string[] = data?.member_tag.map(v => v.tag_name) || []

  const notes: NoteAdmin[] =
    data?.member_note.map(v => ({
      id: v.id,
      createdAt: new Date(v.created_at),
      type: v.type as NoteAdmin['type'],
      status: v.status || null,
      author: {
        id: v.author.id,
        pictureUrl: v.author.picture_url || null,
        name: v.author.name,
      },
      manager: v.member?.manager
        ? {
          id: v.member.manager.id,
          name: v.member.manager.name || v.member.manager.username,
        }
        : null,
      member: {
        id: v.member?.id || '',
        pictureUrl: v.member?.picture_url || '',
        name: v.member?.name || v.member?.username || '',
        email: v.member?.email || '',
        properties:
          v.member?.member_properties.map(w => ({
            name: w.property.name,
            value: w.value,
          })) || [],
      },
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
      description: v.description || null,
      metadata: v.metadata,
      note: v.note || null,
      attachments: v.member_note_attachments.map(u => ({
        id: u.attachment_id,
        data: u.data,
        options: u.options,
      })),
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
          ...prev,
          member_note_aggregate: fetchMoreResult.member_note_aggregate,
          member_note: [...prev.member_note, ...fetchMoreResult.member_note],
        }
      },
    })

  return {
    loadingNotes: loading,
    errorNotes: error,
    allMemberCategories,
    allMemberTags,
    notes,
    refetchNotes: refetch,
    loadMoreNotes: (data?.member_note_aggregate.aggregate?.count || 0) > 10 ? loadMoreNotes : undefined,
  }
}

export default NoteCollectionPage
