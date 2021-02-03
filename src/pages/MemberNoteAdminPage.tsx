import { Button, message, Skeleton } from 'antd'
import { AdminBlock } from 'lodestar-app-admin/src/components/admin'
import MemberAdminLayout, { StyledEmptyBlock } from 'lodestar-app-admin/src/components/layout/MemberAdminLayout'
import MemberNoteAdminItem from 'lodestar-app-admin/src/components/member/MemberNoteAdminItem'
import MemberNoteAdminModal from 'lodestar-app-admin/src/components/member/MemberNoteAdminModal'
import { useAuth } from 'lodestar-app-admin/src/contexts/AuthContext'
import { handleError } from 'lodestar-app-admin/src/helpers'
import { commonMessages, memberMessages } from 'lodestar-app-admin/src/helpers/translation'
import { useUploadAttachments } from 'lodestar-app-admin/src/hooks/data'
import { useMemberAdmin, useMutateMemberNote } from 'lodestar-app-admin/src/hooks/member'
import { ReactComponent as FilePlusIcon } from 'lodestar-app-admin/src/images/icon/file-plus.svg'
import { isEmpty } from 'ramda'
import React from 'react'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

const MemberProfileAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { memberId } = useParams<{ memberId: string }>()
  const { currentMemberId } = useAuth()
  const { loadingMemberAdmin, errorMemberAdmin, memberAdmin, refetchMemberAdmin } = useMemberAdmin(memberId)
  const { insertMemberNote } = useMutateMemberNote()
  const uploadAttachments = useUploadAttachments()

  if (!currentMemberId || loadingMemberAdmin || errorMemberAdmin || !memberAdmin) {
    return <Skeleton active />
  }

  return (
    <MemberAdminLayout member={memberAdmin}>
      <div className="p-5">
        <MemberNoteAdminModal
          member={memberAdmin}
          title={formatMessage(memberMessages.label.createMemberNote)}
          renderTrigger={({ setVisible }) => (
            <Button type="primary" icon={<FilePlusIcon />} onClick={() => setVisible(true)}>
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
                const memberNoteId = data?.insert_member_note_one?.id
                if (memberNoteId && attachments.length) {
                  await uploadAttachments('MemberNote', memberNoteId, attachments)
                }
                message.success(formatMessage(commonMessages.event.successfullyCreated))
                refetchMemberAdmin()
              })
              .catch(handleError)
          }
        />
        <AdminBlock className="mt-4">
          {isEmpty(memberAdmin.notes) ? (
            <StyledEmptyBlock>
              <span>{formatMessage(memberMessages.text.noMemberNote)}</span>
            </StyledEmptyBlock>
          ) : (
            memberAdmin.notes.map(note => (
              <MemberNoteAdminItem key={note.id} note={note} memberAdmin={memberAdmin} onRefetch={refetchMemberAdmin} />
            ))
          )}
        </AdminBlock>
      </div>
    </MemberAdminLayout>
  )
}

export default MemberProfileAdminPage
