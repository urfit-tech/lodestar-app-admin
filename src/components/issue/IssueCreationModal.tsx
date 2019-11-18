import { Button, Form, Icon, Input, message, Modal, Typography } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ModalProps } from 'antd/lib/modal'
import BraftEditor, { EditorState } from 'braft-editor'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import styled from 'styled-components'
import MemberAvatar from '../common/MemberAvatar'
import StyledBraftEditor from '../common/StyledBraftEditor'

const StyledButton = styled(Button)`
  height: initial;
  font-size: 14px;
`

type IssueCreationModalProps = ModalProps &
  FormComponentProps & {
    threadId: string
    memberId: string
    onSubmit?: () => void
  }
const IssueCreationModal: React.FC<IssueCreationModalProps> = ({
  threadId,
  form,
  memberId,
  onSubmit,
  ...modalProps
}) => {
  const [loading, setLoading] = useState()
  const [modalVisible, setModalVisible] = useState()
  const insertIssue = useMutation(INSERT_ISSUE)
  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (!error) {
        insertIssue({
          variables: {
            appId: process.env.REACT_APP_ID,
            memberId,
            threadId,
            title: values.title,
            description: values.description.toRAW(),
          },
        })
          .then(() => {
            form.resetFields()
            onSubmit && onSubmit()
            setModalVisible(false)
          })
          .catch(err => message.error(err.message))
          .finally(() => setLoading(false))
      }
    })
  }
  return (
    <>
      <Modal
        okText="送出問題"
        style={{ top: 12 }}
        onOk={handleSubmit}
        confirmLoading={loading}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        {...modalProps}
      >
        <Typography.Title level={4}>填寫問題</Typography.Title>
        <Form>
          <Form.Item label="標題">
            {form.getFieldDecorator('title', {
              initialValue: '',
              rules: [{ required: true, message: '請輸入問題內容' }],
            })(<Input />)}
          </Form.Item>
          <Form.Item label="問題內容">
            {form.getFieldDecorator('description', {
              initialValue: BraftEditor.createEditorState(null),
              rules: [
                {
                  validator: (rule, value: EditorState, callback) => {
                    value.isEmpty() ? callback('請輸入問題內容') : callback()
                  },
                },
              ],
            })(
              <StyledBraftEditor
                language="zh-hant"
                controls={[
                  'bold',
                  'italic',
                  'underline',
                  { key: 'remove-styles', title: '清除樣式' },
                  'separator',
                  'media',
                ]}
                contentClassName="short-bf-content"
              />,
            )}
          </Form.Item>
        </Form>
      </Modal>

      <StyledButton
        block
        className="d-flex justify-content-between align-items-center mb-5 p-4"
        onClick={() => setModalVisible(true)}
      >
        <span className="d-flex align-items-center">
          <span className="mr-2">{memberId && <MemberAvatar memberId={memberId} />}</span>
          <span className="ml-1">留下你的問題...</span>
        </span>
        <Icon type="edit" />
      </StyledButton>
    </>
  )
}

const INSERT_ISSUE = gql`
  mutation INSERT_ISSUE($appId: String!, $memberId: String!, $threadId: String!, $title: String, $description: String) {
    insert_issue(
      objects: { app_id: $appId, member_id: $memberId, thread_id: $threadId, title: $title, description: $description }
    ) {
      affected_rows
    }
  }
`

export default Form.create<IssueCreationModalProps>()(IssueCreationModal)
