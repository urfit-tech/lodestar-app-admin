import { useMutation } from '@apollo/react-hooks'
import { Button, Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'
import MemberAvatar from '../common/MemberAvatar'
import { createUploadFn } from '../form/AdminBraftEditor'

export const StyledEditor = styled(BraftEditor)`
  .bf-content {
    height: initial;
  }
`

const IssueReplyCreationBlock: React.FC<{
  memberId: string
  issueId: string
  onRefetch?: () => void
}> = ({ memberId, issueId, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const { authToken } = useAuth()
  const { id: appId } = useContext(AppContext)
  const [insertIssueReply] = useMutation<types.INSERT_ISSUE_REPLY, types.INSERT_ISSUE_REPLYVariables>(
    INSERT_ISSUE_REPLY,
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: any) => {
    setLoading(true)
    insertIssueReply({
      variables: {
        memberId,
        issueId,
        content: values.content.toRAW(),
      },
    })
      .then(() => {
        form.resetFields()
        onRefetch && onRefetch()
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
          style={{ border: '1px solid #cdcdcd', borderRadius: '4px' }}
          language="zh-hant"
          controls={['bold', 'italic', 'underline', 'separator', 'media']}
          media={{ uploadFn: createUploadFn(appId, authToken) }}
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
