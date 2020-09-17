import Icon, { MoreOutlined } from '@ant-design/icons'
import { Dropdown, Menu, message } from 'antd'
import moment from 'moment'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages, profileMessages } from '../../helpers/translation'
import { useMutateMemberNote } from '../../hooks/member'
import DefaultAvatar from '../../images/default/avatar.svg'
import { ReactComponent as CallOutIcon } from '../../images/icon/call-out.svg'
import { MemberAdminProps, MemberNoteAdminProps } from '../../types/member'
import AdminModal from '../admin/AdminModal'
import { CustomRatioImage } from '../common/Image'
import { StyledModalParagraph } from '../program/ProgramDeletionAdminCard'
import MemberNoteAdminModal from './MemberNoteAdminModal'

const StyledStatus = styled.span`
  margin-left: 12px;
  border-left: 1px solid #d8d8d8;
  padding: 0 12px;
`

const StyledIcon = styled(Icon)<{ variant?: string | null }>`
  ${props => props.variant === 'answered' && `color: var(--success);`}
  ${props => props.variant === 'missed' && `color: var(--error);`}
`

const StyledParagraph = styled.p`
  white-space: break-spaces;
`

const StyledAuthorName = styled.span`
  font-size: 12px;
  height: 18px;
  font-weight: 500;
  letter-spacing: 0.6px;
  color: var(--gray-dark);
`

const MemberNoteAdminItem: React.FC<{
  note: MemberNoteAdminProps
  memberAdmin: MemberAdminProps
  onRefetch: () => void
}> = ({ note, memberAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { updateMemberNote, deleteMemberNote } = useMutateMemberNote()

  return (
    <>
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
            <span>
              <span>{moment(note.updatedAt).format('YYYY-MM-DD HH:mm')}</span>
              {note.type === 'inbound' && (
                <StyledStatus>
                  <StyledIcon variant={note.status} component={() => <CallOutIcon />} />
                  {note.status === 'answered' && (
                    <span className="ml-2">{moment.utc((note?.duration ?? 0) * 1000).format('HH:mm:ss')}</span>
                  )}
                  {note.status === 'missed' && (
                    <span className="ml-2">{formatMessage(profileMessages.status.missed)}</span>
                  )}
                </StyledStatus>
              )}
            </span>
            <StyledParagraph>{note.description}</StyledParagraph>
            <StyledAuthorName>By. {note.author.name}</StyledAuthorName>
          </div>
        </div>
        <Dropdown
          placement="bottomRight"
          overlay={
            <Menu>
              <Menu.Item>
                <MemberNoteAdminModal
                  title={formatMessage(profileMessages.label.editMemberNote)}
                  member={memberAdmin}
                  note={note}
                  renderTrigger={({ setVisible }) => (
                    <span onClick={() => setVisible(true)}>{formatMessage(commonMessages.ui.edit)}</span>
                  )}
                  renderSubmit={({ type, status, duration, description }) =>
                    updateMemberNote({
                      variables: {
                        memberNoteId: note.id,
                        type,
                        status,
                        duration,
                        description,
                      },
                    })
                      .then(() => {
                        onRefetch()
                        message.success(formatMessage(commonMessages.event.successfullyEdited))
                      })
                      .catch(handleError)
                  }
                />
              </Menu.Item>
              <Menu.Item>
                <AdminModal
                  title={formatMessage(profileMessages.label.deleteMemberNote)}
                  renderTrigger={({ setVisible }) => (
                    <span onClick={() => setVisible(true)}>{formatMessage(commonMessages.ui.delete)}</span>
                  )}
                  cancelText={formatMessage(commonMessages.ui.back)}
                  okText={formatMessage(commonMessages.ui.delete)}
                  onOk={() =>
                    deleteMemberNote({ variables: { memberNoteId: note.id } })
                      .then(() => {
                        onRefetch()
                        message.success(formatMessage(commonMessages.event.successfullyDeleted))
                      })
                      .catch(handleError)
                  }
                >
                  <StyledModalParagraph>
                    {formatMessage(profileMessages.text.deleteMemberNoteConfirmation)}
                  </StyledModalParagraph>
                </AdminModal>
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <div>{<MoreOutlined />}</div>
        </Dropdown>
      </div>
    </>
  )
}

export default MemberNoteAdminItem
