import { useMutation } from '@apollo/client'
import { Button, Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import { gql } from '@apollo/client'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import MemberAvatar from '../common/MemberAvatar'
import { createUploadFn } from '../form/AdminBraftEditor'

export const StyledEditor = styled(BraftEditor)`
  border: 1px solid #cdcdcd;
  border-radius: 4px;

  .bf-content {
    height: initial;
  }
`

type FieldProps = {
  content: EditorState
}

const IssueReplyCreationBlock: React.FC<{
  memberId: string
  issueId: string
  onRefetch?: () => void
}> = ({ memberId, issueId, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { authToken } = useAuth()
  const { id: appId } = useApp()
  const [insertIssueReply] = useMutation<hasura.INSERT_ISSUE_REPLY, hasura.INSERT_ISSUE_REPLYVariables>(
    INSERT_ISSUE_REPLY,
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    insertIssueReply({
      variables: {
        memberId,
        issueId,
        content: values.content?.getCurrentContent().hasText() ? values.content.toRAW() : null,
      },
    })
      .then(() => {
        form.resetFields()
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      initialValues={{
        content: BraftEditor.createEditorState(null),
      }}
      onFinish={handleSubmit}
    >
      <div className="d-flex align-items-center mb-3">
        <MemberAvatar size="32px" memberId={memberId} withName />
      </div>
      <Form.Item
        name="content"
        rules={[{ required: true, message: formatMessage(errorMessages.form.issueContent) }]}
        className="mb-1"
      >
        <StyledEditor
          language="zh-hant"
          controls={['bold', 'italic', 'underline', 'separator', 'media']}
          media={{ uploadFn: createUploadFn(appId, authToken), accepts: { video: false, audio: false } }}
        />
      </Form.Item>
      <Form.Item className="text-right">
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.reply)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const INSERT_ISSUE_REPLY = gql`
  mutation INSERT_ISSUE_REPLY($memberId: String!, $issueId: uuid!, $content: String) {
    insert_issue_reply(objects: { member_id: $memberId, issue_id: $issueId, content: $content }) {
      affected_rows
    }
  }
`

export default IssueReplyCreationBlock
