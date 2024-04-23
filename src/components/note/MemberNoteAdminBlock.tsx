import { FileAddOutlined } from '@ant-design/icons'
import { Button, Input, message, Skeleton } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, memberMessages } from '../../helpers/translation'
import { useUploadAttachments } from '../../hooks/data'
import { useMemberAdmin, useMemberNotesAdmin, useMutateMemberNote } from '../../hooks/member'
import { useFindMemberNoteByNoteId } from '../../pages/NoteCollectionPage'
import { AdminBlock } from '../admin'
import { EmptyAdminBlock } from '../admin/AdminBlock'
import MemberNoteAdminItem from '../member/MemberNoteAdminItem'
import MemberNoteAdminModal from '../member/MemberNoteAdminModal'

const SearchBlock = styled.div`
  position: absolute;
  right: 3rem;
  width: 100%;
  max-width: 33.3333%;
`

const MemberNoteAdminBlock: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { formatMessage } = useIntl()
  const [searchText, setSearchText] = useState('')

  return (
    <div className="p-5 position-relative">
      <SearchBlock>
        <Input.Search
          placeholder={formatMessage(memberMessages.text.searchNoteRecord)}
          onChange={e => !e.target.value.trim() && setSearchText('')}
          onSearch={value => setSearchText(value.trim())}
        />
      </SearchBlock>
      <MemberNoteCollectionBlock memberId={memberId} searchText={searchText} />
    </div>
  )
}

const MemberNoteCollectionBlock: React.FC<{ memberId: string; searchText: string }> = ({ memberId, searchText }) => {
  const [activeMemberNoteId, setActiveMemberNoteId] = useQueryParam('id', StringParam)
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()

  const { loadingNotes, errorNotes, notes, refetchNotes, loadMoreNotes } = useMemberNotesAdmin(
    { created_at: 'desc' as hasura.order_by, id: 'asc' as hasura.order_by },
    { member: memberId },
    searchText,
  )
  const { foundNote, loadingFoundNote } = useFindMemberNoteByNoteId(activeMemberNoteId || '', memberId)

  const { memberAdmin, refetchMemberAdmin } = useMemberAdmin(memberId)
  const [loading, setLoading] = useState(false)

  const { insertMemberNote, updateLastMemberNoteAnswered, updateLastMemberNoteCalled } = useMutateMemberNote()
  const uploadAttachments = useUploadAttachments()

  if (loadingFoundNote) return <></>
  const indexToRemove = notes.findIndex(note => note.id === activeMemberNoteId)
  indexToRemove !== -1 && notes.splice(indexToRemove, 1)
  foundNote.length && notes.unshift(...foundNote)

  if (!currentMemberId || loadingNotes || errorNotes || !memberAdmin) {
    return <Skeleton active />
  }

  return (
    <>
      <MemberNoteAdminModal
        title={formatMessage(memberMessages.label.createMemberNote)}
        renderTrigger={({ setVisible }) => (
          <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
            {formatMessage(memberMessages.label.createMemberNote)}
          </Button>
        )}
        onSubmit={({ type, status, duration, description, attachments, note }) =>
          insertMemberNote({
            variables: {
              memberId: memberAdmin.id,
              authorId: currentMemberId,
              type,
              status,
              duration,
              description,
              note,
            },
          })
            .then(async ({ data }) => {
              if (type === 'outbound') {
                if (status !== 'answered') {
                  await updateLastMemberNoteCalled({
                    variables: { memberId: memberAdmin.id, lastMemberNoteCalled: new Date() },
                  }).catch(handleError)
                } else if (status === 'answered') {
                  await updateLastMemberNoteAnswered({
                    variables: { memberId: memberAdmin.id, lastMemberNoteAnswered: new Date() },
                  }).catch(handleError)
                }
              }
              const memberNoteId = data?.insert_member_note_one?.id
              if (memberNoteId && attachments.length) {
                await uploadAttachments('MemberNote', memberNoteId, attachments)
              }
              message.success(formatMessage(commonMessages.event.successfullyCreated))
              refetchMemberAdmin()
              refetchNotes()
            })
            .catch(handleError)
        }
      />
      <AdminBlock className="mt-4">
        {notes.length === 0 ? (
          <EmptyAdminBlock>
            <span>{formatMessage(memberMessages.text.noMemberNote)}</span>
          </EmptyAdminBlock>
        ) : (
          notes.map(note => (
            <MemberNoteAdminItem
              key={note.id}
              isActive={note.id === activeMemberNoteId}
              note={note}
              onRefetch={() => {
                refetchMemberAdmin()
                refetchNotes()
                setActiveMemberNoteId(undefined)
              }}
            />
          ))
        )}

        {loadMoreNotes && (
          <Button
            onClick={() => {
              setLoading(true)
              loadMoreNotes().finally(() => setLoading(false))
            }}
            loading={loading}
          >
            {formatMessage(commonMessages.ui.showMore)}
          </Button>
        )}
      </AdminBlock>
    </>
  )
}

export default MemberNoteAdminBlock
