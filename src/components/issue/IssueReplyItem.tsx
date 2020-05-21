import { useMutation } from '@apollo/react-hooks'
import { Button, Dropdown, Icon, Menu, message, Tag } from 'antd'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useContext, useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled, { ThemeContext } from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import MemberAvatar from '../../containers/common/MemberAvatar'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { rgba } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramRoleType } from '../../types/program'
import { createUploadFn } from '../admin/AdminBraftEditor'
import { BraftContent } from '../common/StyledBraftEditor'
import { ProgramRoleLabel } from '../common/UserRole'
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
  transition: background-color 1s ease-in-out;

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

type IssueReplyItemProps = {
  programRoles: ProgramRoleType[]
  issueReplyId: string
  content: string
  reactedMemberIds: string[]
  createdAt: Date
  memberId: string
  onRefetch?: () => void
}
const IssueReplyItem: React.FC<IssueReplyItemProps> = ({
  programRoles,
  issueReplyId,
  content,
  reactedMemberIds,
  createdAt,
  memberId,
  onRefetch,
}) => {
  const { id: appId } = useContext(AppContext)
  const { formatMessage } = useIntl()
  const [qIssueReplyId] = useQueryParam('issueReplyId', StringParam)
  const { currentMemberId, authToken } = useAuth()
  const theme = useContext(ThemeContext)

  const [insertIssueReplyReaction] = useMutation<
    types.INSERT_ISSUE_REPLY_REACTION,
    types.INSERT_ISSUE_REPLY_REACTIONVariables
  >(INSERT_ISSUE_REPLY_REACTION)
  const [deleteIssueReplyReaction] = useMutation<
    types.DELETE_ISSUE_REPLY_REACTION,
    types.DELETE_ISSUE_REPLY_REACTIONVariables
  >(DELETE_ISSUE_REPLY_REACTION)
  const [deleteIssueReply] = useMutation<types.DELETE_ISSUE_REPLY, types.DELETE_ISSUE_REPLYVariables>(
    DELETE_ISSUE_REPLY,
  )
  const [updateIssueReply] = useMutation<types.UPDATE_ISSUE_REPLY, types.UPDATE_ISSUE_REPLYVariables>(
    UPDATE_ISSUE_REPLY,
  )

  const [editing, setEditing] = useState(false)
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

    onRefetch && onRefetch()
  }

  return (
    <StyledIssueReplyItem
      className={focus ? 'focus' : ''}
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
            memberId={memberId}
            renderText={() =>
              programRoles &&
              programRoles
                .filter(role => role?.member?.id === memberId)
                .map(role =>
                  role.name === 'instructor' ? (
                    <StyledTag key={role.id} color={theme['@primary-color']} className="ml-2 mr-0">
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

        {memberId === currentMemberId && !editing && (
          <Dropdown
            placement="bottomRight"
            overlay={
              <Menu>
                <Menu.Item onClick={() => setEditing(true)}>{formatMessage(commonMessages.ui.edit)}</Menu.Item>
                <Menu.Item
                  onClick={() =>
                    window.confirm(formatMessage(commonMessages.label.cannotRecover)) &&
                    deleteIssueReply({ variables: { issueReplyId } }).then(() => onRefetch && onRefetch())
                  }
                >
                  {formatMessage(commonMessages.ui.delete)}
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <Icon type="more" />
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
                media={{ uploadFn: createUploadFn(appId, authToken) }}
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
                        onRefetch && onRefetch()
                        setEditing(false)
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
            <Icon className="mr-1" type="heart" theme={reacted ? 'filled' : 'outlined'} />
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
  mutation DELETE_ISSUE_REPLY_REACTION($memberId: String!, $issueReplyId: uuid!) {
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
