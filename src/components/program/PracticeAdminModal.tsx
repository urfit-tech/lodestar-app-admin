import { EditOutlined, MoreOutlined, QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, Dropdown, Form, Input, InputNumber, Menu, message, Modal, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios, { Canceler } from 'axios'
import BraftEditor, { EditorState } from 'braft-editor'
import gql from 'graphql-tag'
import React, { useEffect, useRef, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import hasura from '../../hasura'
import { handleError, uploadFile } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import { useMutateAttachment, useUploadAttachments } from '../../hooks/data'
import { ProgramContentBodyProps, ProgramContentProps } from '../../types/program'
import { StyledTips } from '../admin'
import FileUploader from '../common/FileUploader'
import RatingInput from '../common/RatingInput'
import AdminBraftEditor from '../form/AdminBraftEditor'

const messages = defineMessages({
  show: { id: 'program.ui.show', defaultMessage: '顯示' },
  deleteContentWarning: {
    id: 'program.text.deleteContentWarning',
    defaultMessage: '你確定要刪除此內容？此動作無法還原',
  },
  deleteContent: { id: 'program.ui.deleteContent', defaultMessage: '刪除內容' },
  contentTitle: { id: 'program.label.contentTitle', defaultMessage: '標題' },
  estimatedTime: { id: 'program.label.estimatedTime', defaultMessage: '估計時間（分鐘）' },
  description: { id: 'program.label.description', defaultMessage: '描述' },
  notifyUpdate: { id: 'program.label.notifyUpdate', defaultMessage: '通知內容更新' },
  displayPrivate: { id: 'program.ui.displayPrivate', defaultMessage: '私密成果' },
  difficulty: { id: 'program.ui.difficulty', defaultMessage: '難易度' },
  uploadExample: { id: 'program.ui.uploadExample', defaultMessage: '範例素材' },
})

const StyledTitle = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--gray-darker);
  letter-spacing: 0.2px;
`
const StyledPracticeFileSizeTips = styled(StyledTips)`
  font-size: 14px;
  letter-spacing: 0.8px;
`

type FieldProps = {
  publishedAt: boolean
  isNotifyUpdate: boolean
  title: string
  estimatedTime: number
  description: EditorState
  isPracticePrivate: boolean
  difficulty: number
}

const PracticeAdminModal: React.FC<{
  programContent: ProgramContentProps
  programContentBody: ProgramContentBodyProps
  onRefetch?: () => void
}> = ({ programContent, programContentBody, onRefetch }) => {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <EditOutlined onClick={() => setVisible(true)} />

      <Modal
        width="70vw"
        footer={null}
        maskStyle={{ background: 'rgba(255, 255, 255, 0.8)' }}
        maskClosable={false}
        closable={false}
        visible={visible}
      >
        <PracticeForm
          programContent={programContent}
          programContentBody={programContentBody}
          onRefetch={() => onRefetch?.()}
          onCancel={() => setVisible(false)}
        />
      </Modal>
    </>
  )
}

const PracticeForm: React.FC<{
  programContent: ProgramContentProps
  programContentBody: ProgramContentBodyProps
  onRefetch?: () => void
  onCancel?: () => void
}> = ({ programContent, programContentBody, onRefetch, onCancel }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { authToken, apiHost } = useAuth()
  const [form] = useForm<FieldProps>()
  const uploadCanceler = useRef<Canceler>()
  const [attachments, setAttachments] = useState<File[]>(programContent.attachments.map(v => v.data) || [])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const uploadAttachments = useUploadAttachments()
  const { deleteAttachments } = useMutateAttachment()
  const [updatePractice] = useMutation<hasura.UPDATE_PRACTICE, hasura.UPDATE_PRACTICEVariables>(UPDATE_PRACTICE)
  const [deletePractice] = useMutation<hasura.DELETE_PRACTICE, hasura.DELETE_PRACTICEVariables>(DELETE_PRACTICE)

  const handleSubmit = (values: FieldProps) => {
    setIsSubmitting(true)
    Promise.all([
      updatePractice({
        variables: {
          programContentId: programContent.id,
          publishedAt: values.publishedAt ? new Date() : null,
          title: values.title,
          description: values.description?.getCurrentContent().hasText() ? values.description.toRAW() : null,
          duration: values.estimatedTime,
          isNotifyUpdate: values.isNotifyUpdate,
          notifiedAt: values.isNotifyUpdate ? new Date() : programContent?.notifiedAt,
          metadata: { ...programContent.metadata, difficulty: values.difficulty, private: values.isPracticePrivate },
        },
      }),
    ])
      .then(async () => {
        try {
          const existedFiles: File[] = programContentBody.materials.map(material => material.data).flat()
          for (const file of attachments) {
            if (
              existedFiles.some(
                existedFile => existedFile.name === file.name && existedFile.lastModified === file.lastModified,
              )
            ) {
              continue
            }
            await uploadFile(`programContent/${appId}/${programContent.id}_${file.name}`, file, authToken, apiHost, {
              cancelToken: new axios.CancelToken(canceler => {
                uploadCanceler.current = canceler
              }),
            })
          }
          const programContentId = programContent.id
          const deletedAttachmentIds = programContent.attachments
            .filter(programContentAttachment =>
              attachments.every(
                attachment =>
                  attachment.name !== programContentAttachment.data.name &&
                  attachment.lastModified !== programContentAttachment.data.lastModified,
              ),
            )
            .map(attachment => attachment.id)
          const newAttachments = attachments.filter(attachment =>
            programContent.attachments.every(
              programContentAttachment =>
                programContentAttachment.data.name !== attachment.name &&
                programContentAttachment.data.lastModified !== attachment.lastModified,
            ),
          )
          if (programContentId && attachments.length) {
            await deleteAttachments({ variables: { attachmentIds: deletedAttachmentIds } })
            await uploadAttachments('ProgramContent', programContentId, newAttachments)
          }
          message.success(formatMessage(commonMessages.event.successfullySaved))
          onRefetch?.()
        } catch (error) {
          process.env.NODE_ENV === 'development' && console.error(error)
          return error
        }
      })
      .then(() => {
        onCancel?.()
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setIsSubmitting(false))
  }

  useEffect(() => {
    form.setFieldsValue({ publishedAt: !!programContent.publishedAt })
  }, [form, programContent.publishedAt])

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        publishedAt: !!programContent.publishedAt,
        isPracticePrivate: programContent.metadata && programContent.metadata.private,
        isNotifyUpdate: programContent.isNotifyUpdate,
        title: programContent.title,
        estimatedTime: programContent.duration,
        description: BraftEditor.createEditorState(programContentBody.description),
        difficulty: programContent.metadata?.difficulty || 1,
      }}
      onFinish={handleSubmit}
    >
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center">
          <Form.Item name="publishedAt" valuePropName="checked" className="mr-3">
            <Checkbox>{formatMessage(messages.show)}</Checkbox>
          </Form.Item>

          <Form.Item name="isPracticePrivate" valuePropName="checked" className="mr-3">
            <Checkbox>
              {formatMessage(messages.displayPrivate)}
              <Tooltip
                placement="bottom"
                title={<StyledTips>{formatMessage(programMessages.text.practicePrivateTips)}</StyledTips>}
              >
                <QuestionCircleFilled className="ml-1" />
              </Tooltip>
            </Checkbox>
          </Form.Item>

          <Form.Item name="isNotifyUpdate" valuePropName="checked">
            <Checkbox>{formatMessage(messages.notifyUpdate)}</Checkbox>
          </Form.Item>
        </div>

        <div>
          <Button
            disabled={isSubmitting}
            onClick={() => {
              onCancel?.()
              form.resetFields()
            }}
            className="mr-2"
          >
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" htmlType="submit" loading={isSubmitting} className="mr-2">
            {formatMessage(commonMessages.ui.save)}
          </Button>
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            overlay={
              <Menu>
                <Menu.Item
                  onClick={() =>
                    window.confirm(formatMessage(messages.deleteContentWarning)) &&
                    deletePractice({
                      variables: { programContentId: programContent.id },
                    }).then(() => onRefetch?.())
                  }
                >
                  {formatMessage(messages.deleteContent)}
                </Menu.Item>
              </Menu>
            }
          >
            <MoreOutlined />
          </Dropdown>
        </div>
      </div>

      <StyledTitle className="mb-3">{formatMessage(programMessages.label.practice)}</StyledTitle>

      <Form.Item label={formatMessage(messages.contentTitle)} name="title">
        <Input />
      </Form.Item>

      <Form.Item label={formatMessage(messages.difficulty)} name="difficulty">
        <RatingInput size="24px" name="difficulty" />
      </Form.Item>
      <Form.Item label={formatMessage(messages.estimatedTime)} name="estimatedTime">
        <InputNumber min={0} />
      </Form.Item>
      <Form.Item
        label={
          <span>
            {formatMessage(messages.uploadExample)}
            <Tooltip
              placement="top"
              title={
                <StyledPracticeFileSizeTips>
                  {formatMessage(programMessages.text.practiceFileSizeTips)}
                </StyledPracticeFileSizeTips>
              }
            >
              <QuestionCircleFilled className="ml-1" />
            </Tooltip>
          </span>
        }
        name="practiceFiles"
      >
        <FileUploader multiple showUploadList fileList={attachments} onChange={files => setAttachments(files)} />
      </Form.Item>
      <Form.Item label={<span>{formatMessage(messages.description)}</span>} name="description">
        <AdminBraftEditor />
      </Form.Item>
    </Form>
  )
}
const UPDATE_PRACTICE = gql`
  mutation UPDATE_PRACTICE(
    $programContentId: uuid!
    $title: String
    $description: String
    $publishedAt: timestamptz
    $duration: numeric
    $isNotifyUpdate: Boolean
    $notifiedAt: timestamptz
    $metadata: jsonb
  ) {
    update_program_content(
      where: { id: { _eq: $programContentId } }
      _set: {
        title: $title
        duration: $duration
        published_at: $publishedAt
        is_notify_update: $isNotifyUpdate
        notified_at: $notifiedAt
        metadata: $metadata
      }
    ) {
      affected_rows
    }
    update_program_content_body(
      where: { program_contents: { id: { _eq: $programContentId } } }
      _set: { description: $description }
    ) {
      affected_rows
    }
  }
`

const DELETE_PRACTICE = gql`
  mutation DELETE_PRACTICE($programContentId: uuid!) {
    delete_practice(where: { program_content_id: { _eq: $programContentId } }) {
      affected_rows
    }
    delete_program_content_body(where: { program_contents: { id: { _eq: $programContentId } } }) {
      affected_rows
    }
  }
`

export default PracticeAdminModal
