import Icon, { MessageOutlined, MoreOutlined } from '@ant-design/icons'
import { Dropdown, Menu, message } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages, memberMessages } from '../../helpers/translation'
import { useMutateAttachment, useUploadAttachments } from '../../hooks/data'
import { useMutateMemberNote } from '../../hooks/member'
import DefaultAvatar from '../../images/default/avatar.svg'
import { ReactComponent as CallInIcon } from '../../images/icon/call-in.svg'
import { ReactComponent as CallOutIcon } from '../../images/icon/call-out.svg'
import { ReactComponent as DemoIcon } from '../../images/icon/demo.svg'
import { MemberNote } from '../../types/member'
import AdminModal from '../admin/AdminModal'
import { StyledModalParagraph } from '../common'
import { CustomRatioImage } from '../common/Image'
import MemberNoteAdminModal from './MemberNoteAdminModal'

const StyledStatus = styled.span`
  display: flex;
  align-items: center;
  margin-left: 12px;
  border-left: 1px solid #d8d8d8;
  padding: 0 12px;
`

const StyledIcon = styled(Icon)<{ variant?: string | null }>`
  ${props => props.variant === 'answered' && `color: var(--success);`}
  ${props => props.variant === 'missed' && `color: var(--error);`}
`
const StyledMenuItem = styled(Menu.Item)`
  width: 100px;
  line-height: 36px;
`
const StyledParagraph = styled.p`
  white-space: break-spaces;
`
const StyledAuthorName = styled.div`
  font-size: 12px;
  height: 18px;
  font-weight: 500;
  letter-spacing: 0.6px;
  color: var(--gray-dark);
`

const MemberNoteAdminItem: React.FC<{
  isActive?: boolean
  note: Pick<
    MemberNote,
    | 'id'
    | 'createdAt'
    | 'type'
    | 'status'
    | 'author'
    | 'member'
    | 'duration'
    | 'description'
    | 'note'
    | 'attachments'
    | 'metadata'
  >
  onRefetch?: () => void
}> = ({ isActive, note, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const { updateMemberNote, deleteMemberNote } = useMutateMemberNote()
  const uploadAttachments = useUploadAttachments()
  const { archiveAttachments } = useMutateAttachment()
  const [modalVisible, setModalVisible] = React.useState(isActive || false)

  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div className="d-flex align-items-start">
        <CustomRatioImage
          ratio={1}
          width="56px"
          src={note.author.pictureUrl || DefaultAvatar}
          shape="circle"
          className="mr-5 flex-shrink-0"
        />
        <div>
          <div className="d-flex align-items-center">
            <span>{moment(note.createdAt).format('YYYY-MM-DD HH:mm')}</span>
            {note.type && (
              <StyledStatus>
                <StyledIcon
                  variant={note.status}
                  component={() =>
                    (note.type === 'outbound' && <CallOutIcon />) ||
                    (note.type === 'inbound' && <CallInIcon />) ||
                    (note.type === 'demo' && <DemoIcon />) ||
                    (note.type === 'sms' && <MessageOutlined />) ||
                    null
                  }
                />
                {note.status === 'answered' && note.type !== 'sms' && (
                  <span className="ml-2">{moment.utc((note?.duration ?? 0) * 1000).format('HH:mm:ss')}</span>
                )}
                {note.status === 'missed' && (
                  <span className="ml-2">{formatMessage(memberMessages.status.missed)}</span>
                )}
              </StyledStatus>
            )}
          </div>
          <StyledParagraph>{note.description}</StyledParagraph>
          <StyledAuthorName>By. {note.author.name}</StyledAuthorName>
        </div>
      </div>
      <Dropdown
        overlay={
          <Menu>
            <StyledMenuItem>
              <div onClick={() => setModalVisible(true)}>{formatMessage(commonMessages.ui.edit)}</div>
            </StyledMenuItem>
            <StyledMenuItem>
              <AdminModal
                title={formatMessage(memberMessages.label.deleteNote)}
                renderTrigger={({ setVisible }) => (
                  <div onClick={() => setVisible(true)}>{formatMessage(commonMessages.ui.delete)}</div>
                )}
                cancelText={formatMessage(commonMessages.ui.back)}
                okText={formatMessage(commonMessages.ui.delete)}
                onOk={() =>
                  deleteMemberNote({
                    variables: { memberNoteId: note.id, deletedAt: new Date(), currentMemberId: currentMemberId },
                  })
                    .then(() => {
                      message.success(formatMessage(commonMessages.event.successfullyDeleted))
                      onRefetch?.()
                    })
                    .catch(handleError)
                }
              >
                <StyledModalParagraph>
                  {formatMessage(memberMessages.text.deleteMemberNoteConfirmation)}
                </StyledModalParagraph>
              </AdminModal>
            </StyledMenuItem>
          </Menu>
        }
        trigger={['click']}
      >
        <MoreOutlined />
      </Dropdown>
      <MemberNoteAdminModal
        title={formatMessage(memberMessages.label.editNote)}
        note={note}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={({ type, status, duration, description, attachments }) =>
          updateMemberNote({
            variables: {
              memberNoteId: note.id,
              data: {
                type,
                status,
                duration,
                description,
              },
            },
          })
            .then(async ({ data }) => {
              const memberNoteId = data?.update_member_note_by_pk?.id
              const deletedAttachmentIds =
                note.attachments
                  ?.filter(noteAttachment =>
                    attachments.every(
                      attachment =>
                        attachment.name !== noteAttachment.data.name &&
                        attachment.lastModified !== noteAttachment.data.lastModified,
                    ),
                  )
                  .map(attachment => attachment.id) || []
              const newAttachments = attachments.filter(attachment =>
                note.attachments?.every(
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
              onRefetch?.()
            })
            .catch(handleError)
        }
      />
    </div>
  )
}

export default MemberNoteAdminItem
