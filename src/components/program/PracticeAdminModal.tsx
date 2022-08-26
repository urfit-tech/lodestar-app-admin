import { EditOutlined, MoreOutlined, QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, Dropdown, Form, Input, InputNumber, Menu, message, Modal, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import gql from 'graphql-tag'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import { useMutateAttachment, useUploadAttachments } from '../../hooks/data'
import { useMutateProgramContent, useProgramContentBody } from '../../hooks/program'
import { ProgramContentBody, ProgramContentProps } from '../../types/program'
import { StyledTips } from '../admin'
import FileUploader from '../common/FileUploader'
import RatingInput from '../common/RatingInput'
import AdminBraftEditor from '../form/AdminBraftEditor'
import DisplayModeSelector from './DisplayModeSelector'

const messages = defineMessages({
  displayPrivate: { id: 'program.label.displayPrivate', defaultMessage: '私密成果' },
  difficulty: { id: 'program.ui.difficulty', defaultMessage: '難易度' },
  estimatedTime: { id: 'program.label.estimatedTime', defaultMessage: '估計時間（分鐘）' },
  uploadExample: { id: 'program.ui.uploadExample', defaultMessage: '範例素材' },
  coverRequired: { id: 'program.label.coverRequired', defaultMessage: '上傳封面' },
  coverRequiredTips: { id: 'program.text.coverRequiredTips', defaultMessage: '若作業形式以文件為主，建議不勾選' },
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
  publishedAt: Moment | null
  displayMode: string
  isNotifyUpdate: boolean
  title: string
  estimatedTime: number
  description: EditorState
  isPracticePrivate: boolean
  difficulty: number
  isCoverRequired: boolean
}

const PracticeAdminModal: React.FC<{
  programContent: ProgramContentProps
  onRefetch?: () => void
}> = ({ programContent, onRefetch }) => {
  const [visible, setVisible] = useState(false)
  const { loadingProgramContentBody, programContentBody } = useProgramContentBody(programContent.id)

  if (loadingProgramContentBody) return <Skeleton active />

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
  programContentBody: ProgramContentBody
  onRefetch?: () => void
  onCancel?: () => void
}> = ({ programContent, programContentBody, onRefetch, onCancel }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const uploadAttachments = useUploadAttachments()
  const { archiveAttachments } = useMutateAttachment()
  const { deleteProgramContent } = useMutateProgramContent()
  const [updatePractice] = useMutation<hasura.UPDATE_PRACTICE, hasura.UPDATE_PRACTICEVariables>(UPDATE_PRACTICE)

  const [attachments, setAttachments] = useState<File[]>(programContent.attachments.map(v => v.data) || [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (values: FieldProps) => {
    setIsSubmitting(true)
    Promise.all([
      updatePractice({
        variables: {
          programContentId: programContent.id,
          displayMode: values.displayMode,
          publishedAt: values.publishedAt
            ? values.publishedAt.toDate()
            : values.displayMode !== 'conceal'
            ? new Date()
            : null,
          title: values.title,
          description: values.description?.getCurrentContent().hasText() ? values.description.toRAW() : null,
          duration: values.estimatedTime,
          isNotifyUpdate: values.isNotifyUpdate,
          notifiedAt: values.isNotifyUpdate ? new Date() : programContent?.notifiedAt,
          metadata: {
            ...programContent.metadata,
            difficulty: values.difficulty,
            private: values.isPracticePrivate,
            isCoverRequired: values.isCoverRequired,
          },
        },
      }),
    ])
      .then(async () => {
        try {
          const deletedAttachmentIds = programContent.attachments
            .filter(
              programContentAttachment =>
                !attachments.some(
                  attachment =>
                    attachment.name === programContentAttachment.data.name &&
                    attachment.lastModified === programContentAttachment.data.lastModified,
                ),
            )
            .map(attachment => attachment.id)
          const newAttachments = attachments.filter(
            attachment =>
              !programContent.attachments.some(
                programContentAttachment =>
                  programContentAttachment.data.name === attachment.name &&
                  programContentAttachment.data.lastModified === attachment.lastModified,
              ),
          )

          if (deletedAttachmentIds.length) {
            await archiveAttachments({ variables: { attachmentIds: deletedAttachmentIds } })
          }
          if (newAttachments.length) {
            await uploadAttachments('ProgramContent', programContent.id, newAttachments)
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

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        publishedAt: programContent.publishedAt ? moment(programContent.publishedAt) : moment().startOf('minute'),
        displayMode: programContent.displayMode,
        isPracticePrivate: !!programContent.metadata?.private,
        isNotifyUpdate: programContent.isNotifyUpdate,
        title: programContent.title,
        estimatedTime: programContent.duration,
        description: BraftEditor.createEditorState(programContentBody.description),
        difficulty: programContent.metadata?.difficulty || 1,
        isCoverRequired: programContent.metadata?.isCoverRequired ?? true,
      }}
      onFinish={handleSubmit}
    >
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center">
          {programContent.displayMode && (
            <DisplayModeSelector contentType="practice" displayMode={programContent.displayMode} />
          )}

          <Form.Item name="isPracticePrivate" valuePropName="checked" className="mr-3 mb-0">
            <Checkbox>
              {formatMessage(messages.displayPrivate)}
              <Tooltip
                placement="right"
                title={<StyledTips>{formatMessage(programMessages.text.practicePrivateTips)}</StyledTips>}
                style={{ position: 'relative' }}
              >
                <QuestionCircleFilled className="ml-1" style={{ position: 'absolute', top: '30%' }} />
              </Tooltip>
            </Checkbox>
          </Form.Item>

          <Form.Item name="isCoverRequired" valuePropName="checked" className="mr-3 mb-0">
            <Checkbox>
              {formatMessage(messages.coverRequired)}
              <Tooltip
                placement="right"
                title={<StyledTips>{formatMessage(messages.coverRequiredTips)}</StyledTips>}
                style={{ position: 'relative' }}
              >
                <QuestionCircleFilled className="ml-1" style={{ position: 'absolute', top: '30%' }} />
              </Tooltip>
            </Checkbox>
          </Form.Item>

          <Form.Item name="isNotifyUpdate" valuePropName="checked" className="mb-0">
            <Checkbox>{formatMessage(programMessages.label.notifyUpdate)}</Checkbox>
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
                    window.confirm(formatMessage(programMessages.text.deletePracticeWarning)) &&
                    deleteProgramContent({ variables: { programContentId: programContent.id } })
                      .then(() => onRefetch?.())
                      .catch(handleError)
                  }
                >
                  {formatMessage(programMessages.ui.deleteContent)}
                </Menu.Item>
              </Menu>
            }
          >
            <MoreOutlined />
          </Dropdown>
        </div>
      </div>

      <StyledTitle className="mb-3">{formatMessage(programMessages.label.practice)}</StyledTitle>

      <Form.Item label={formatMessage(programMessages.label.contentTitle)} name="title">
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
          <span className="d-flex align-items-center">
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
      <Form.Item label={<span>{formatMessage(programMessages.label.description)}</span>} name="description">
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
    $displayMode: String
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
        display_mode: $displayMode
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

export default PracticeAdminModal
