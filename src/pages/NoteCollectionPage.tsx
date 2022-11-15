import { SearchOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Checkbox, DatePicker, Input, message, Table, Tag } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { SorterResult } from 'antd/lib/table/interface'
import axios from 'axios'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment, { Moment } from 'moment'
import React, { useRef, useState } from 'react'
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
import { useMemberNotesAdmin, useMutateMemberNote } from '../hooks/member'
import { NoteAdminProps } from '../types/member'
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
  const [selectedNote, setSelectedNote] = useState<NoteAdminProps | null>(null)

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
      title: formatMessage(memberMessages.label.audioRecordFile),
      render: (text, record, index) => {
        const recordAttachmentId = record.attachments.find(v => v.data.name.includes('recordFile'))?.id
        return (
          recordAttachmentId && (
            <div onClick={event => event.stopPropagation()}>
              <LoadRecordFileButton
                memberName={record.member?.name || ''}
                startTime={record.metadata?.starttime || ''}
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

  if (!enabledModules.member_note || !permissions.MEMBER_NOTE_ADMIN) {
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
              <Table<NoteAdminProps>
                columns={columns}
                rowKey="id"
                rowClassName="cursor-pointer"
                pagination={false}
                loading={loadingNotes}
                dataSource={notes}
                onChange={(pagination, filters, sorter) => {
                  const newSorter = sorter as SorterResult<NoteAdminProps>
                  setOrderBy({
                    [newSorter.columnKey === 'duration' ? 'duration' : 'created_at']:
                      newSorter.order === 'ascend' ? 'asc' : 'desc',
                  })
                }}
                onRow={note => ({
                  onClick: () => {
                    setSelectedNote(note)
                    setVisible(true)
                  },
                })}
              />
            )}
            onSubmit={
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
                        const deletedAttachmentIds = selectedNote.attachments
                          .filter(noteAttachment =>
                            attachments.every(
                              attachment =>
                                attachment.name !== noteAttachment.data.name &&
                                attachment.lastModified !== noteAttachment.data.lastModified,
                            ),
                          )
                          .map(attachment => attachment.id)
                        const newAttachments = attachments.filter(attachment =>
                          selectedNote.attachments.every(
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
  attachmentId: string
}> = ({ memberName, startTime, attachmentId }) => {
  const { formatMessage } = useIntl()
  const { authToken } = useAuth()
  const { id: appId } = useApp()
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

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
      <audio src={audioUrl} controls />
    </div>
  ) : (
    <Button type="primary" loading={typeof audioUrl === 'string'} onClick={() => loadAudioData()}>
      {formatMessage(podcastMessages.ui.play)}
    </Button>
  )
}

export default NoteCollectionPage
