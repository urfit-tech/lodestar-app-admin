import { Button, message, Skeleton } from 'antd'
import { AdminBlock } from 'lodestar-app-admin/src/components/admin'
import MemberAdminLayout, { StyledEmptyBlock } from 'lodestar-app-admin/src/components/layout/MemberAdminLayout'
import MemberNoteAdminItem from 'lodestar-app-admin/src/components/member/MemberNoteAdminItem'
import MemberNoteAdminModal from 'lodestar-app-admin/src/components/member/MemberNoteAdminModal'
import { handleError } from 'lodestar-app-admin/src/helpers'
import { commonMessages, memberMessages } from 'lodestar-app-admin/src/helpers/translation'
import { useUploadAttachments } from 'lodestar-app-admin/src/hooks/data'
import { useMemberAdmin, useMemberNotesAdmin, useMutateMemberNote } from 'lodestar-app-admin/src/hooks/member'
import { ReactComponent as FilePlusIcon } from 'lodestar-app-admin/src/images/icon/file-plus.svg'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import hasura from '../hasura'

const MemberProfileAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { memberId } = useParams<{ memberId: string }>()
  const { currentMemberId, currentUserRole } = useAuth()

  const { memberAdmin, refetchMemberAdmin } = useMemberAdmin(memberId)
  const { loadingNotes, errorNotes, notes, refetchNotes } = useMemberNotesAdmin(
    { created_at: 'desc' as hasura.order_by },
    { member: memberId, author: currentUserRole !== 'app-owner' ? currentMemberId || '' : undefined },
  )
  const { insertMemberNote } = useMutateMemberNote()
  const uploadAttachments = useUploadAttachments()

  if (!currentMemberId || loadingNotes || errorNotes || !memberAdmin) {
    return <Skeleton active />
  }

  return (
    <MemberAdminLayout member={memberAdmin} onRefetch={refetchMemberAdmin}>
      <div className="p-5">
        <MemberNoteAdminModal
          title={formatMessage(memberMessages.label.createMemberNote)}
          renderTrigger={({ setVisible }) => (
            <Button type="primary" icon={<FilePlusIcon />} onClick={() => setVisible(true)}>
              {formatMessage(memberMessages.label.createMemberNote)}
            </Button>
          )}
          onSubmit={({ type, status, duration, description, attachments }) =>
            insertMemberNote({
              variables: {
                memberId,
                authorId: currentMemberId,
                type,
                status,
                duration,
                description,
              },
            })
              .then(async ({ data }) => {
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
          {loadingNotes ? (
            <Skeleton active />
          ) : errorNotes || notes.length === 0 ? (
            <StyledEmptyBlock>
              <span>{formatMessage(memberMessages.text.noMemberNote)}</span>
            </StyledEmptyBlock>
          ) : (
            notes.map(note => (
              <MemberNoteAdminItem
                key={note.id}
                note={note}
                memberAdmin={memberAdmin}
                onRefetch={() => {
                  refetchMemberAdmin()
                  refetchNotes()
                }}
              />
            ))
          )}
        </AdminBlock>
      </div>
    </MemberAdminLayout>
  )
}

export default MemberProfileAdminPage
