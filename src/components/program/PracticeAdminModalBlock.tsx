import { MoreOutlined, QuestionCircleFilled } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Flex } from '@chakra-ui/react'
import { Button, Checkbox, Dropdown, Form, Input, InputNumber, Menu, message, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useMutateAttachment, useUploadAttachments } from '../../hooks/data'
import { useMutateProgramContent, useProgramContentActions, useProgramContentBody } from '../../hooks/program'
import { ProgramContentBody, ProgramContentProps } from '../../types/program'
import { StyledTips } from '../admin'
import FileUploader from '../common/FileUploader'
import RatingInput from '../common/RatingInput'
import AdminBraftEditor from '../form/AdminBraftEditor'
import DisplayModeSelector from './DisplayModeSelector'
import ProgramPlanSelector from './ProgramPlanSelector'
import programMessages from './translation'

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
  planIds: string[]
}

const PracticeForm: React.FC<{
  programId: string
  programContent: ProgramContentProps
  programContentBody: ProgramContentBody
  onRefetch?: () => void
  onCancel?: () => void
}> = ({ programId, programContent, programContentBody, onRefetch, onCancel }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const uploadAttachments = useUploadAttachments()
  const { archiveAttachments } = useMutateAttachment()
  const { deleteProgramContent } = useMutateProgramContent()
  const [updatePractice] = useMutation<hasura.UPDATE_PRACTICE, hasura.UPDATE_PRACTICEVariables>(UPDATE_PRACTICE)
  const [attachments, setAttachments] = useState<File[]>(programContent.attachments.map(v => v.data) || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { updatePlans } = useProgramContentActions(programContent.id)

  const handleSubmit = (values: FieldProps) => {
    setIsSubmitting(true)
    Promise.all([
      updatePlans(values.planIds || []),
      updatePractice({
        variables: {
          programContentId: programContent.id,
          displayMode: values.displayMode,
          publishedAt: values.publishedAt
            ? values.publishedAt.toDate()
            : values.displayMode !== 'conceal'
            ? new Date()
            : null,
          title: values.title || '',
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
        title: programContent.title || '',
        planIds: programContent.programPlans?.map(programPlan => programPlan.id) || [],
        estimatedTime: programContent.duration,
        description: BraftEditor.createEditorState(programContentBody.description),
        difficulty: programContent.metadata?.difficulty || 1,
        isCoverRequired: programContent.metadata?.isCoverRequired ?? true,
      }}
      onFinish={handleSubmit}
    >
      <Flex
        alignItems={{ base: 'flex-end', md: 'center' }}
        justifyContent="space-between"
        marginBottom="16px"
        flexDirection={{ base: 'column-reverse', md: 'row' }}
      >
        <Flex flexWrap="wrap">
          {programContent.displayMode && (
            <DisplayModeSelector contentType="practice" displayMode={programContent.displayMode} />
          )}
          <Flex flexWrap="wrap">
            <Form.Item name="isPracticePrivate" valuePropName="checked" className="mr-3 mb-0">
              <Checkbox>
                {formatMessage(messages.displayPrivate)}
                <Tooltip
                  placement="right"
                  title={
                    <StyledTips>{formatMessage(programMessages.PracticeAdminModal.practicePrivateTips)}</StyledTips>
                  }
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
              <Checkbox>{formatMessage(programMessages['*'].notifyUpdate)}</Checkbox>
            </Form.Item>
          </Flex>
        </Flex>

        <Flex alignItems="center" marginBottom={{ base: '12px', md: '0' }}>
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
                    window.confirm(formatMessage(programMessages.PracticeAdminModal.deletePracticeWarning)) &&
                    deleteProgramContent({ variables: { programContentId: programContent.id } })
                      .then(() => onRefetch?.())
                      .catch(handleError)
                  }
                >
                  {formatMessage(programMessages['*'].deleteContent)}
                </Menu.Item>
              </Menu>
            }
          >
            <MoreOutlined />
          </Dropdown>
        </Flex>
      </Flex>

      <StyledTitle className="mb-3">{formatMessage(programMessages.PracticeAdminModal.practice)}</StyledTitle>

      <Form.Item label={formatMessage(programMessages['*'].contentTitle)} name="title">
        <Input />
      </Form.Item>

      <Form.Item label={formatMessage(programMessages.PracticeAdminModal.contentPlan)} name="planIds">
        <ProgramPlanSelector
          programId={programId}
          placeholder={formatMessage(programMessages.PracticeAdminModal.contentPlan)}
        />
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
                  {formatMessage(programMessages.PracticeAdminModal.practiceFileSizeTips)}
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
      <Form.Item label={<span>{formatMessage(programMessages['*'].description)}</span>} name="description">
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
const PracticeAdminModalBlock: React.FC<{
  programId: string
  programContent: ProgramContentProps
  onRefetch?: () => void
  onClose: () => void
}> = ({ programId, programContent, onRefetch, onClose }) => {
  const { loadingProgramContentBody, programContentBody } = useProgramContentBody(programContent.id)

  if (loadingProgramContentBody) return <Skeleton active />
  return (
    <PracticeForm
      programId={programId}
      programContent={programContent}
      programContentBody={programContentBody}
      onRefetch={() => onRefetch?.()}
      onCancel={() => onClose()}
    />
  )
}

export default PracticeAdminModalBlock
