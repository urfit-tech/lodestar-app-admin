import { FileAddOutlined } from '@ant-design/icons'
import { IconButton } from '@chakra-ui/react'
import { Button, Input, message, Skeleton } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useRef, useState } from 'react'
import { AiOutlineRedo } from 'react-icons/ai'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, memberMessages } from '../../helpers/translation'
import { useUploadAttachments } from '../../hooks/data'
import { useMemberAdmin, useMemberNotesAdmin, useMutateMemberNote } from '../../hooks/member'
import { AdminBlock } from '../admin'
import { EmptyAdminBlock } from '../admin/AdminBlock'
import MemberNoteAdminItem from '../member/MemberNoteAdminItem'
import MemberNoteAdminModal from '../member/MemberNoteAdminModal'
import noteMessages from './translation'

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
  const currentIndex = useRef(0)
  const { loadingNotes, errorNotes, notes, refetchNotes, loadMoreNotes, noteAggregate } = useMemberNotesAdmin(
    currentIndex,
    { created_at: 'desc' as hasura.order_by, id: 'asc' as hasura.order_by },
    { member: memberId },
    searchText,
  )
  const { loadingMemberAdmin, memberAdmin, refetchMemberAdmin } = useMemberAdmin(memberId)
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const { insertMemberNote, updateLastMemberNoteAnswered, updateLastMemberNoteCalled } = useMutateMemberNote()
  const uploadAttachments = useUploadAttachments()

  if (loadingMemberAdmin || loadingNotes || !currentMemberId || errorNotes || !memberAdmin) {
    return <Skeleton active />
  }

  return (
    <>
      <MemberNoteAdminModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        title={formatMessage(memberMessages.label.createMemberNote)}
        renderTrigger={() => (
          <Button type="primary" icon={<FileAddOutlined />} onClick={() => setModalVisible(true)}>
            {formatMessage(memberMessages.label.createMemberNote)}
          </Button>
        )}
        onSubmit={({ type, status, duration, description, attachments }) =>
          insertMemberNote({
            variables: {
              memberId: memberAdmin.id,
              authorId: currentMemberId,
              type,
              status,
              duration,
              description,
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
              setModalVisible(false)
            })
            .catch(handleError)
        }
      />
      <IconButton
        ml="3"
        w="45px"
        h="45px"
        _hover={{}}
        aria-label="refresh"
        icon={<AiOutlineRedo />}
        variant="outline"
        onClick={() => {
          refetchMemberAdmin()
          refetchNotes()
          message.info(formatMessage(noteMessages.MemberNoteAdminBlock.successfullyRefreshed))
        }}
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
              }}
              onResetActiveMemberNoteId={() => setActiveMemberNoteId(undefined)}
            />
          ))
        )}

        {noteAggregate > currentIndex.current ? (
          <Button
            onClick={() => {
              setLoading(true)
              loadMoreNotes().finally(() => setLoading(false))
            }}
            loading={loading}
          >
            {formatMessage(commonMessages.ui.showMore)}
          </Button>
        ) : null}
      </AdminBlock>
    </>
  )
}

export default MemberNoteAdminBlock
