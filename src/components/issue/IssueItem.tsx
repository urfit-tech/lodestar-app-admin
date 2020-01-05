import { useMutation } from '@apollo/react-hooks'
import { Button, Dropdown, Form, Icon, Input, Menu, message, Tag, Typography } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useContext, useEffect, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import { InferType } from 'yup'
import { useAuth } from '../../contexts/AuthContext'
import { programRoleFormatter, rgba } from '../../helpers'
import { programRoleSchema } from '../../schemas/program'
import types from '../../types'
import MemberAvatar from '../common/MemberAvatar'
import { BraftContent } from '../common/StyledBraftEditor'
import IssueReplyCollectionBlock from './IssueReplyCollectionBlock'
import { StyledEditor } from './IssueReplyCreationBlock'

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

type IssueItemProps = FormComponentProps & {
  programRoles: Array<InferType<typeof programRoleSchema>>
  issueId: string
  title: string
  description: string
  reactedMemberIds: string[]
  numReplies: number
  createdAt: Date
  memberId: string
  solvedAt: Date
  onRefetch?: () => void
  defaultRepliesVisible?: boolean
  showSolvedCheckbox?: boolean
}
const IssueItem: React.FC<IssueItemProps> = ({
  form,
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
  const [qIssueId] = useQueryParam('issueId', StringParam)
  const [qIssueReplyId] = useQueryParam('issueReplyId', StringParam)
  const { currentMemberId } = useAuth()
  const theme = useContext(ThemeContext)

  const [insertIssueReaction] = useMutation<types.INSERT_ISSUE_REACTION, types.INSERT_ISSUE_REACTIONVariables>(
    INSERT_ISSUE_REACTION,
  )
  const [deleteIssueReaction] = useMutation<types.DELETE_ISSUE_REACTION, types.DELETE_ISSUE_REACTIONVariables>(
    DELETE_ISSUE_REACTION,
  )
  const [deleteIssue] = useMutation<types.DELETE_ISSUE, types.DELETE_ISSUEVariables>(DELETE_ISSUE)
  const [updateIssue] = useMutation<types.UPDATE_ISSUE, types.UPDATE_ISSUEVariables>(UPDATE_ISSUE)

  const [editing, setEditing] = useState()
  const [focus, setFocus] = useState(!qIssueReplyId && qIssueId === issueId)
  const [repliesVisible, setRepliesVisible] = useState(defaultRepliesVisible)
  const [reacted, setReacted] = useState(false)

  const otherReactedMemberIds = reactedMemberIds.filter(id => id !== currentMemberId).length

  useEffect(() => {
    if (currentMemberId && reactedMemberIds.includes(currentMemberId)) {
      setReacted(true)
    }
  }, [currentMemberId, reactedMemberIds])

  const toggleReaction = async (reacted: boolean) => {
    reacted
      ? await deleteIssueReaction({
          variables: { issueId, memberId: currentMemberId || '' },
        })
      : await insertIssueReaction({
          variables: { issueId, memberId: currentMemberId || '' },
        })

    onRefetch && onRefetch()
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        updateIssue({
          variables: {
            issueId,
            title: values.title,
            description: values.description.toRAW(),
          },
        })
          .then(() => {
            setEditing(false)
            onRefetch && onRefetch()
          })
          .catch(err => message.error('無法更改問題'))
      }
    })
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
            memberId={memberId}
            renderText={() =>
              programRoles &&
              programRoles
                .filter(role => role.member.id === memberId)
                .map(role =>
                  role.name === 'instructor' ? (
                    <StyledTag key={role.id} color={theme['@primary-color']} className="ml-2 mr-0">
                      {programRoleFormatter(role.name)}
                    </StyledTag>
                  ) : role.name === 'assistant' ? (
                    <StyledTag
                      key={role.id}
                      color={theme['@processing-color']}
                      className="ml-2 mr-0"
                      variant="assistant"
                    >
                      {programRoleFormatter(role.name)}
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
                <Menu.Item onClick={() => setEditing(true)}>編輯問題</Menu.Item>
                <Menu.Item
                  onClick={() =>
                    window.confirm('此問題的留言將被一併刪除') &&
                    deleteIssue({ variables: { issueId } }).then(() => onRefetch && onRefetch())
                  }
                >
                  刪除問題
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
                    }).then(() => onRefetch && onRefetch())
                  }
                >
                  標示為{solvedAt ? '未解決' : '已解決'}
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <Icon type="more" />
          </Dropdown>
        )}
      </div>

      <IssueContentBlock>
        {editing ? (
          <Form onSubmit={handleSubmit}>
            <Form.Item>{form.getFieldDecorator('title', { initialValue: title })(<Input />)}</Form.Item>
            <Form.Item>
              {form.getFieldDecorator('description', {
                initialValue: BraftEditor.createEditorState(description),
              })(<StyledEditor controls={['bold', 'italic', 'underline', 'separator', 'media']} />)}
            </Form.Item>
            <Form.Item>
              <Button className="mr-2" onClick={() => setEditing(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                儲存
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
              <Icon type="heart" theme={reacted ? 'filled' : 'outlined'} className="mr-1" />
              <span>{reacted ? otherReactedMemberIds + 1 : otherReactedMemberIds}</span>
            </StyledAction>
            <StyledAction onClick={() => setRepliesVisible(!repliesVisible)}>
              <Icon type="message" className="mr-1" />
              <span>{numReplies}</span>
            </StyledAction>
          </div>
          <div>{!showSolvedCheckbox && <IssueState type="secondary">{solvedAt ? '已解決' : '解決中'}</IssueState>}</div>
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
export default Form.create<IssueItemProps>()(IssueItem)
