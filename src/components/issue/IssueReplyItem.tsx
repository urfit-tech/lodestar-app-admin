import { HeartFilled, HeartOutlined, MoreOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Dropdown, Menu, message, Tag } from 'antd'
import BraftEditor from 'braft-editor'
import { BraftContent } from 'lodestar-app-element/src/components/common/StyledBraftEditor'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import hasura from '../../hasura'
import { rgba } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { ProgramRoleProps } from '../../types/program'
import MemberAvatar from '../common/MemberAvatar'
import { ProgramRoleLabel } from '../common/UserRole'
import { createUploadFn } from '../form/AdminBraftEditor'
import { StyledEditor } from './IssueReplyCreationBlock'

const messages = defineMessages({
  updateIssueFailed: { id: 'error.event.updateIssueFailed', defaultMessage: '無法更新回復' },
})

const IssueReplyContentBlock = styled.div`
  padding: 1rem;
  background: #f7f8f8;
  border-radius: 0.5rem;
  transition: background-color 1s ease-in-out;
`
const StyledIssueReplyItem = styled.div`
  position: relative;
  transition: background-color 1s ease-in-out;

  &.isIssueDeleting::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    content: ' ';
    background: rgba(256, 256, 256, 0.6);
  }
  &.focus {
    background: ${props => rgba(props.theme['@primary-color'], 0.1)};
  }
  &.focus ${IssueReplyContentBlock} {
    background: none;
  }
`
const StyledAction = styled.span<{ reacted?: boolean }>`
  padding: 0;
  color: ${props => (props.reacted ? props.theme['@primary-color'] : props.theme['@text-color-secondary'])};
  cursor: pointer;
`
const StyledTag = styled(Tag)`
  border: 0;
`

const IssueReplyItem: React.FC<{
  programRoles: ProgramRoleProps[]
  issueReplyId: string
  content: string
  reactedMemberIds: string[]
  createdAt: Date
  memberId: string
  onRefetch?: () => void
}> = ({ programRoles, issueReplyId, content, reactedMemberIds, createdAt, memberId, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [qIssueReplyId] = useQueryParam('issueReplyId', StringParam)
  const { currentMemberId, authToken, currentUserRole } = useAuth()
  const { id: appId } = useApp()
  const theme = useAppTheme()

  const [insertIssueReplyReaction] = useMutation<
    hasura.INSERT_ISSUE_REPLY_REACTION,
    hasura.INSERT_ISSUE_REPLY_REACTIONVariables
  >(INSERT_ISSUE_REPLY_REACTION)
  const [deleteIssueReplyReaction] = useMutation<
    hasura.DELETE_ISSUE_REPLY_REACTION,
    hasura.DELETE_ISSUE_REPLY_REACTIONVariables
  >(DELETE_ISSUE_REPLY_REACTION)
  const [deleteIssueReply] = useMutation<hasura.DELETE_ISSUE_REPLY, hasura.DELETE_ISSUE_REPLYVariables>(
    DELETE_ISSUE_REPLY,
  )
  const [updateIssueReply] = useMutation<hasura.UPDATE_ISSUE_REPLY, hasura.UPDATE_ISSUE_REPLYVariables>(
    UPDATE_ISSUE_REPLY,
  )

  const [editing, setEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [focus, setFocus] = useState(qIssueReplyId === issueReplyId)
  const [contentState, setContentState] = useState(BraftEditor.createEditorState(content))
  const [reacted, setReacted] = useState(false)

  const otherReactedMemberIds = reactedMemberIds.filter(id => id !== currentMemberId).length

  useEffect(() => {
    if (currentMemberId && reactedMemberIds.includes(currentMemberId)) {
      setReacted(true)
    }
  }, [currentMemberId, reactedMemberIds])

  const toggleReaction = async (reacted: boolean) => {
    reacted
      ? await deleteIssueReplyReaction({
          variables: { issueReplyId, memberId: currentMemberId || '' },
        })
      : await insertIssueReplyReaction({
          variables: { issueReplyId, memberId: currentMemberId || '' },
        })

    onRefetch?.()
  }

  const handleDeleteIssueReply = () => {
    setIsDeleting(true)
    deleteIssueReplyReaction({
      variables: { issueReplyId },
    })
      .then(() => deleteIssueReply({ variables: { issueReplyId } }))
      .then(() => onRefetch?.())
      .finally(() => setIsDeleting(false))
  }

  return (
    <StyledIssueReplyItem
      className={focus ? 'focus' : '' + (isDeleting ? ' isIssueDeleting' : ' ')}
      ref={ref => {
        if (ref && focus) {
          ref.scrollIntoView()
          setTimeout(() => {
            setFocus(false)
          }, 1000)
        }
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center">
          <MemberAvatar
            size="32px"
            memberId={memberId}
            renderText={() =>
              programRoles &&
              programRoles
                .filter(role => role?.member?.id === memberId)
                .map(role =>
                  role.name === 'instructor' ? (
                    <StyledTag key={role.id} color={theme.colors.primary[500]} className="ml-2 mr-0">
                      <ProgramRoleLabel role={role.name} />
                    </StyledTag>
                  ) : role.name === 'assistant' ? (
                    <StyledTag key={role.id} color={theme['@processing-color']} className="ml-2 mr-0">
                      <ProgramRoleLabel role={role.name} />
                    </StyledTag>
                  ) : null,
                )
            }
            withName
          />
          <span className="ml-2" style={{ fontSize: '12px', color: '#9b9b9b' }}>
            {moment(createdAt).fromNow()}
          </span>
        </div>

        {(memberId === currentMemberId || currentUserRole === 'app-owner') && !editing && (
          <Dropdown
            placement="bottomRight"
            overlay={
              <Menu>
                {memberId === currentMemberId && (
                  <Menu.Item onClick={() => setEditing(true)}>{formatMessage(commonMessages.ui.edit)}</Menu.Item>
                )}
                <Menu.Item
                  onClick={() =>
                    window.confirm(formatMessage(commonMessages.label.cannotRecover)) && handleDeleteIssueReply()
                  }
                >
                  {formatMessage(commonMessages.ui.delete)}
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <MoreOutlined />
          </Dropdown>
        )}
      </div>

      <IssueReplyContentBlock>
        <div className="mb-3">
          {editing ? (
            <>
              <StyledEditor
                value={contentState}
                onChange={value => setContentState(value)}
                controls={['bold', 'italic', 'underline', 'separator', 'media']}
                media={{
                uploadFn: createUploadFn(appId, authToken),
                accepts: { video: false, audio: false },
                externals: { image: true, video: false, audio: false, embed: true },
              }}
              />
              <div>
                <Button className="mr-2" onClick={() => setEditing(false)}>
                  {formatMessage(commonMessages.ui.cancel)}
                </Button>
                <Button
                  type="primary"
                  onClick={() =>
                    updateIssueReply({
                      variables: { issueReplyId, content: contentState.toRAW() },
                    })
                      .then(() => {
                        setEditing(false)
                        onRefetch?.()
                      })
                      .catch(err => message.error(formatMessage(messages.updateIssueFailed)))
                  }
                >
                  {formatMessage(commonMessages.ui.save)}
                </Button>
              </div>
            </>
          ) : (
            <BraftContent>{content}</BraftContent>
          )}
        </div>

        <div>
          <StyledAction
            onClick={() => {
              setReacted(!reacted)
              toggleReaction(reacted)
            }}
            reacted={reacted}
          >
            {reacted ? <HeartFilled className="mr-1" /> : <HeartOutlined className="mr-1" />}
            <span>{reacted ? otherReactedMemberIds + 1 : otherReactedMemberIds}</span>
          </StyledAction>
        </div>
      </IssueReplyContentBlock>
    </StyledIssueReplyItem>
  )
}

const INSERT_ISSUE_REPLY_REACTION = gql`
  mutation INSERT_ISSUE_REPLY_REACTION($memberId: String!, $issueReplyId: uuid!) {
    insert_issue_reply_reaction(objects: { member_id: $memberId, issue_reply_id: $issueReplyId }) {
      affected_rows
    }
  }
`

const DELETE_ISSUE_REPLY_REACTION = gql`
  mutation DELETE_ISSUE_REPLY_REACTION($issueReplyId: uuid!, $memberId: String) {
    delete_issue_reply_reaction(where: { member_id: { _eq: $memberId }, issue_reply_id: { _eq: $issueReplyId } }) {
      affected_rows
    }
  }
`

const DELETE_ISSUE_REPLY = gql`
  mutation DELETE_ISSUE_REPLY($issueReplyId: uuid!) {
    delete_issue_reply(where: { id: { _eq: $issueReplyId } }) {
      affected_rows
    }
  }
`

const UPDATE_ISSUE_REPLY = gql`
  mutation UPDATE_ISSUE_REPLY($issueReplyId: uuid!, $content: String) {
    update_issue_reply(where: { id: { _eq: $issueReplyId } }, _set: { content: $content }) {
      affected_rows
    }
  }
`
export default IssueReplyItem
