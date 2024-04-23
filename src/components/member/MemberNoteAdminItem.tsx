import Icon, { MessageOutlined, MoreOutlined } from '@ant-design/icons'
import { Dropdown, Menu, message, Modal, Space } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages, memberMessages, merchandiseMessages } from '../../helpers/translation'
import { useMutateAttachment, useUploadAttachments } from '../../hooks/data'
import { useMutateMemberNote } from '../../hooks/member'
import DefaultAvatar from '../../images/default/avatar.svg'
import { ReactComponent as CallInIcon } from '../../images/icon/call-in.svg'
import { ReactComponent as CallOutIcon } from '../../images/icon/call-out.svg'
import { ReactComponent as DemoIcon } from '../../images/icon/demo.svg'
import { ReactComponent as Attachments } from '../../images/icon/memberNote-attachments.svg'
import { ReactComponent as Note } from '../../images/icon/memberNote-note.svg'
import { MemberNote } from '../../types/member'
import AdminModal from '../admin/AdminModal'
import { StyledModalParagraph } from '../common'
import FileUploader from '../common/FileUploader'
import { CustomRatioImage } from '../common/Image'
import MemberNoteAdminModal from './MemberNoteAdminModal'

const StyledStatus = styled.span<{ cursor?: 'pointer' | 'not-allowed' }>`
  display: flex;
  align-items: center;
  margin-left: 12px;
  border-left: 1px solid #d8d8d8;
  padding: 0 12px;
  cursor: ${props => props.cursor || 'auto'};
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
const StyledCommentTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: 0.4px;
  color: var(--gray-dark);
`

const StyledCommentBody = styled.div`
  font-size: 14px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: 0.4px;
  color: var(--gray-darker);
  margin-top: 12px;
  margin-bottom: 16px;
`
const StyledCommentBlock = styled.div`
  white-space: break-spaces;
  word-break: break-all;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  border-radius: 4px;
  border: solid 1px var(--gray-light);
  padding: 12px;
  margin-top: 16px;
`

type MemberNoteType = Pick<
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
  | 'transcript'
>

const MemberNoteTranscriptButton: React.FC<{ transcript: string }> = ({ transcript }) => {
  const { formatMessage } = useIntl()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      {isModalOpen && (
        <Modal
          title={formatMessage(merchandiseMessages.label.transcript)}
          visible={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <div style={{ whiteSpace: 'pre-line' }}>{transcript}</div>
        </Modal>
      )}
      <StyledStatus cursor={'pointer'} onClick={() => setIsModalOpen(true)}>
        <Space>
          <Note />
          {formatMessage(merchandiseMessages.label.transcript)}
        </Space>
      </StyledStatus>
    </>
  )
}

const MemberNoteAttachmentsButton: React.FC<{ note: MemberNoteType }> = ({ note }) => {
  const { formatMessage } = useIntl()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [attachments, setAttachments] = useState<File[]>(note?.attachments?.map(attachment => attachment.data) || [])

  return (
    <>
      {isModalOpen && (
        <Modal
          title={formatMessage(memberMessages.label.attachment)}
          visible={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <FileUploader
            multiple
            showUploadList
            fileList={attachments}
            onChange={files => setAttachments(files)}
            downloadableLink={
              note?.attachments
                ? note?.metadata?.meetId
                  ? file => file.name
                  : file => {
                      const attachmentId = note.attachments?.find(
                        v => v.data.name === file.name && v.data.lastModified,
                      )?.id
                      return `attachments/${attachmentId}`
                    }
                : undefined
            }
            downloadOnly={true}
          />
        </Modal>
      )}
      <StyledStatus cursor={'pointer'} onClick={() => setIsModalOpen(true)}>
        <Space>
          <Attachments />
          {`${note.attachments && note.attachments.length} ${formatMessage(memberMessages.label.numberAttachment)}`}
        </Space>
      </StyledStatus>
    </>
  )
}

const MemberNoteAdminItem: React.FC<{
  isActive?: boolean
  note: MemberNoteType
  onRefetch?: () => void
}> = ({ isActive, note, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { currentMemberId, permissions } = useAuth()
  const { updateMemberNote, deleteMemberNote } = useMutateMemberNote()
  const uploadAttachments = useUploadAttachments()
  const { archiveAttachments } = useMutateAttachment()
  const [modalVisible, setModalVisible] = useState(
    permissions.MEMBER_NOTE_ADMIN || permissions.EDIT_DELETE_ALL_MEMBER_NOTE ? isActive : false,
  )

  return (
    <div className="d-flex justify-content-between mb-4">
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
              <>
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
              </>
            )}
            <>
              {permissions.VIEW_MEMBER_NOTE_TRANSCRIPT && note.transcript && (
                <MemberNoteTranscriptButton transcript={note.transcript} />
              )}
              {(permissions.VIEW_ALL_MEMBER_NOTE || permissions.MEMBER_NOTE_ADMIN) &&
                note.attachments &&
                note.attachments?.length > 0 && <MemberNoteAttachmentsButton note={note} />}
            </>
          </div>

          <StyledParagraph>{note.description}</StyledParagraph>
          <StyledAuthorName>By. {note.author.name}</StyledAuthorName>
          {(permissions.VIEW_ALL_MEMBER_NOTE || permissions.MEMBER_NOTE_ADMIN) && note.note && (
            <StyledCommentBlock>
              <StyledCommentTitle>備註</StyledCommentTitle>
              <StyledCommentBody> {note.note}</StyledCommentBody>
              <StyledAuthorName>By. {note.author.name}</StyledAuthorName>
            </StyledCommentBlock>
          )}
        </div>
      </div>
      <div>
        {permissions.MEMBER_NOTE_ADMIN || permissions.EDIT_DELETE_ALL_MEMBER_NOTE ? (
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
                        variables: {
                          memberNoteId: note.id,
                          deletedAt: new Date(),
                          currentMemberId: currentMemberId,
                        },
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
            trigger={['click', 'hover']}
          >
            <MoreOutlined />
          </Dropdown>
        ) : null}
      </div>
      <MemberNoteAdminModal
        title={formatMessage(memberMessages.label.editNote)}
        note={note}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false)
        }}
        onSubmit={async ({ type, status, duration, description, attachments, note: memberNote_note }) => {
          if (permissions.MEMBER_NOTE_ADMIN || permissions.EDIT_DELETE_ALL_MEMBER_NOTE) {
            try {
              const { data } = await updateMemberNote({
                variables: {
                  memberNoteId: note.id,
                  data: {
                    type,
                    status,
                    duration,
                    description,
                    note: memberNote_note,
                  },
                },
              })

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
                  .map(attachment_1 => attachment_1.id) || []
              const newAttachments = attachments.filter(attachment_2 =>
                note.attachments?.every(
                  noteAttachment_1 =>
                    noteAttachment_1.data.name !== attachment_2.name &&
                    noteAttachment_1.data.lastModified !== attachment_2.lastModified,
                ),
              )
              if (memberNoteId && attachments.length) {
                await archiveAttachments({ variables: { attachmentIds: deletedAttachmentIds } })
                await uploadAttachments('MemberNote', memberNoteId, newAttachments)
              }
              message.success(formatMessage(commonMessages.event.successfullyEdited))
              onRefetch?.()
            } catch (error) {
              return handleError(error)
            }
          } else {
            return Promise.resolve()
          }
        }}
      />
    </div>
  )
}

export default MemberNoteAdminItem
