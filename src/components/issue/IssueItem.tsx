import { HeartFilled, HeartOutlined, MessageOutlined, MoreOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/client'
import { Button, Dropdown, Form, Input, Menu, Tag, Typography } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import { gql } from '@apollo/client'
import { BraftContent } from 'lodestar-app-element/src/components/common/StyledBraftEditor'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import hasura from '../../hasura'
import { handleError, rgba } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import { ProgramRoleProps } from '../../types/program'
import MemberAvatar from '../common/MemberAvatar'
import { ProgramRoleLabel } from '../common/UserRole'
import IssueReplyCollectionBlock from './IssueReplyCollectionBlock'
import { StyledEditor } from './IssueReplyCreationBlock'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { createUploadFn } from '../form/AdminBraftEditor'

const StyledIssueItem = styled.div`
  position: relative;
  background: none;
  transition: background-color 1s ease-in-out;

  &.focus {
    background: ${props => rgba(props.theme['@primary-color'], 0.1)};
  }
`
const IssueContentBlock = styled.div`
  padding-left: 48px;

  @media (max-width: 768px) {
    padding-left: 0;
  }
`
const StyledAction = styled.span<{ reacted?: boolean }>`
  padding: 0;
  color: ${props => (props.reacted ? props.theme['@primary-color'] : props.theme['@text-color-secondary'])};
  cursor: pointer;
`
const IssueState = styled(Typography.Text)`
  text-align: right;
  font-size: 12px;
  line-height: 44px;
`
const StyledTag = styled(Tag)<{ variant?: string }>`
  &.ant-tag-has-color {
    ${props => (props.variant && props.variant === 'assistant' ? `color: ${props.theme['@primary-color']};` : '')}
  }
`

const messages = defineMessages({
  editIssueFailed: { id: 'program.event.editIssueFailed', defaultMessage: '無法更改問題' },
  deleteIssuePrompt: {
    id: 'program.label.deleteIssuePrompt',
    defaultMessage: '將刪除所有與此留言相關資料且不可復原，確定要刪除嗎？',
  },
  markIssueAs: { id: 'program.label.markIssueAs', defaultMessage: '標記為 {status}' },
})

type FieldProps = {
  title: string
  description: EditorState
}

const IssueItem: React.FC<{
  programRoles: ProgramRoleProps[]
  issueId: string
  title: string
  description: string
  reactedMemberIds: string[]
  numReplies: number
  createdAt: Date
  memberId: string
  solvedAt: Date | null
  onRefetch?: () => void
  defaultRepliesVisible?: boolean
  showSolvedCheckbox?: boolean
}> = ({
  programRoles,
  issueId,
  title,
  description,
  reactedMemberIds,
  numReplies,
  createdAt,
  memberId,
  solvedAt,
  onRefetch,
  defaultRepliesVisible,
  showSolvedCheckbox,
}) => {
  const { formatMessage } = useIntl()
  const [qIssueId] = useQueryParam('issueId', StringParam)
  const [qIssueReplyId] = useQueryParam('issueReplyId', StringParam)
  const [form] = useForm<FieldProps>()
  const { id: appId } = useApp()
  const { currentMemberId, currentUserRole, authToken } = useAuth()
  const theme = useAppTheme()

  const [updateIssue] = useMutation<hasura.UPDATE_ISSUE, hasura.UPDATE_ISSUEVariables>(UPDATE_ISSUE)
  const [deleteIssue] = useMutation<hasura.DELETE_ISSUE, hasura.DELETE_ISSUEVariables>(DELETE_ISSUE)
  const [insertIssueReaction] = useMutation<hasura.INSERT_ISSUE_REACTION, hasura.INSERT_ISSUE_REACTIONVariables>(
    INSERT_ISSUE_REACTION,
  )
  const [deleteIssueReaction] = useMutation<hasura.DELETE_ISSUE_REACTION, hasura.DELETE_ISSUE_REACTIONVariables>(
    DELETE_ISSUE_REACTION,
  )

  const [editing, setEditing] = useState<boolean>(false)
  const [focus, setFocus] = useState(!qIssueReplyId && qIssueId === issueId)
  const [repliesVisible, setRepliesVisible] = useState(defaultRepliesVisible)
  const [reacted, setReacted] = useState(false)

  const otherReactedMemberIds = reactedMemberIds.filter(id => id !== currentMemberId).length

  useEffect(() => {
    if (currentMemberId && reactedMemberIds.includes(currentMemberId)) {
      setReacted(true)
    } else {
      setReacted(false)
    }
  }, [currentMemberId, reactedMemberIds])

  const toggleReaction = async (reacted: boolean) => {
    reacted
      ? await deleteIssueReaction({
          variables: {
            issueId,
            memberId: currentMemberId || '',
          },
        })
      : await insertIssueReaction({
          variables: {
            issueId,
            memberId: currentMemberId || '',
          },
        })
    onRefetch?.()
  }

  const handleSubmit = (values: FieldProps) => {
    updateIssue({
      variables: {
        issueId,
        title: values.title || '',
        description: values.description?.getCurrentContent().hasText() ? values.description.toRAW() : null,
      },
    })
      .then(() => {
        setEditing(false)
        onRefetch?.()
      })
      .catch(handleError)
  }

  return (
    <StyledIssueItem
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
        <div className="d-flex align-items-center justify-content-center">
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
                    <StyledTag
                      key={role.id}
                      color={theme['@processing-color']}
                      className="ml-2 mr-0"
                      variant="assistant"
                    >
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

        {currentUserRole === 'app-owner' && !editing && (
          <Dropdown
            placement="bottomRight"
            overlay={
              <Menu>
                <Menu.Item onClick={() => setEditing(true)}>{formatMessage(commonMessages.ui.edit)}</Menu.Item>
                <Menu.Item
                  onClick={() => {
                    window.confirm(formatMessage(messages.deleteIssuePrompt)) &&
                      deleteIssue({
                        variables: {
                          issueId,
                        },
                      })
                        .then(() => onRefetch?.())
                        .catch(handleError)
                  }}
                >
                  {formatMessage(commonMessages.ui.delete)}
                </Menu.Item>
                <Menu.Item
                  onClick={() =>
                    updateIssue({
                      variables: {
                        issueId,
                        title,
                        description,
                        solvedAt: solvedAt ? undefined : new Date(),
                      },
                    })
                      .then(() => onRefetch?.())
                      .catch(handleError)
                  }
                >
                  {formatMessage(messages.markIssueAs, {
                    status: solvedAt
                      ? formatMessage(programMessages.status.issueOpen)
                      : formatMessage(programMessages.status.issueSolved),
                  })}
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <div>{defaultRepliesVisible && <MoreOutlined />}</div>
          </Dropdown>
        )}
      </div>

      <IssueContentBlock>
        {editing ? (
          <Form
            form={form}
            initialValues={{
              title,
              description: BraftEditor.createEditorState(description),
            }}
            onFinish={handleSubmit}
          >
            <Form.Item name="title">
              <Input />
            </Form.Item>
            <Form.Item name="description">
              <StyledEditor
                controls={['bold', 'italic', 'underline', 'separator', 'media']}
                media={{
                  uploadFn: createUploadFn(appId, authToken),
                  accepts: { video: false, audio: false },
                  externals: { image: true, video: false, audio: false, embed: true },
                }}
              />
            </Form.Item>

            <Form.Item>
              <Button className="mr-2" onClick={() => setEditing(false)}>
                {formatMessage(commonMessages.ui.cancel)}
              </Button>
              <Button type="primary" htmlType="submit">
                {formatMessage(commonMessages.ui.save)}
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div>
            <Typography.Text strong className="mb-2" style={{ fontSize: '16px' }}>
              {title}
            </Typography.Text>
            <div style={{ fontSize: '14px' }}>
              <BraftContent>{description}</BraftContent>
            </div>
          </div>
        )}

        <div className="d-flex align-items-center justify-content-between">
          <div>
            <StyledAction
              className="mr-3"
              onClick={() => {
                setReacted(!reacted)
                toggleReaction(reacted)
              }}
              reacted={reacted}
            >
              {reacted ? <HeartFilled className="mr-1" /> : <HeartOutlined className="mr-1" />}
              <span>{reacted ? otherReactedMemberIds + 1 : otherReactedMemberIds}</span>
            </StyledAction>
            <StyledAction onClick={() => setRepliesVisible(!repliesVisible)}>
              <MessageOutlined className="mr-1" />
              <span>{numReplies}</span>
            </StyledAction>
          </div>
          <div>
            {!showSolvedCheckbox && (
              <IssueState type="secondary">
                {solvedAt
                  ? formatMessage(programMessages.status.issueSolved)
                  : formatMessage(programMessages.status.issueOpen)}
              </IssueState>
            )}
          </div>
        </div>

        {repliesVisible && <IssueReplyCollectionBlock programRoles={programRoles} issueId={issueId} />}
      </IssueContentBlock>
    </StyledIssueItem>
  )
}

const UPDATE_ISSUE = gql`
  mutation UPDATE_ISSUE($issueId: uuid!, $title: String, $description: String, $solvedAt: timestamptz) {
    update_issue(
      where: { id: { _eq: $issueId } }
      _set: { title: $title, description: $description, solved_at: $solvedAt }
    ) {
      affected_rows
    }
  }
`
const DELETE_ISSUE = gql`
  mutation DELETE_ISSUE($issueId: uuid!) {
    delete_issue_reply_reaction(where: { issue_reply: { issue_id: { _eq: $issueId } } }) {
      affected_rows
    }
    delete_issue_reaction(where: { issue_id: { _eq: $issueId } }) {
      affected_rows
    }
    delete_issue_reply(where: { issue_id: { _eq: $issueId } }) {
      affected_rows
    }
    delete_issue(where: { id: { _eq: $issueId } }) {
      affected_rows
    }
  }
`
const INSERT_ISSUE_REACTION = gql`
  mutation INSERT_ISSUE_REACTION($memberId: String!, $issueId: uuid!) {
    insert_issue_reaction(objects: { member_id: $memberId, issue_id: $issueId }) {
      affected_rows
    }
  }
`
const DELETE_ISSUE_REACTION = gql`
  mutation DELETE_ISSUE_REACTION($memberId: String!, $issueId: uuid!) {
    delete_issue_reaction(where: { member_id: { _eq: $memberId }, issue_id: { _eq: $issueId } }) {
      affected_rows
    }
  }
`

export default IssueItem
