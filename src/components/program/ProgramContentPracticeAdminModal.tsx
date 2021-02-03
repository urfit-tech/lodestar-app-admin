import { EditOutlined, MoreOutlined, QuestionCircleFilled } from '@ant-design/icons'
import { Button, Checkbox, Dropdown, Form, Input, InputNumber, Menu, message, Modal, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios, { Canceler } from 'axios'
import BraftEditor, { EditorState } from 'braft-editor'
import moment, { Moment } from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import ReactStars from 'react-star-rating-component'
import styled from 'styled-components'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { handleError, uploadFile } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import { useMutateAttachment, useUploadAttachments } from '../../hooks/data'
import { useMutateProgramContent } from '../../hooks/program'
import { ReactComponent as StarGrayIcon } from '../../images/icon/star-gray.svg'
import { ReactComponent as StarIcon } from '../../images/icon/star.svg'
import { ProgramContentBodyType, ProgramContentProps, ProgramProps } from '../../types/program'
import { StyledTips } from '../admin'
import FileUploader from '../common/FileUploader'
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
const StyledLabel = styled.div`
  line-height: 1.5;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
`
const ReactStarsWrapper = styled(ReactStars)`
  margin-bottom: 24px;
  svg {
    width: 24px;
    height: 24px;
    margin-right: 4px;
  }
`
const StyledPracticeFileSizeTips = styled(StyledTips)`
  font-size: 14px;
  letter-spacing: 0.8px;
`

type FieldProps = {
  publishedAt: Moment | null
  isNotifyUpdate: boolean
  title: string
  estimatedTime: number
  description: EditorState
  isPracticePrivate: boolean
}

const ProgramContentPracticeAdminModal: React.FC<{
  program: ProgramProps
  programContent: ProgramContentProps
  programContentBody: ProgramContentBodyType
  onRefetch?: () => void
}> = ({ program, programContent, programContentBody, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { id: appId } = useApp()
  const { authToken, apiHost } = useAuth()
  const { updateProgramContentPractice, deleteProgramContent } = useMutateProgramContent()
  const { deleteAttachments } = useMutateAttachment()
  const [visible, setVisible] = useState(false)
  const [isPublished, setIsPublished] = useState(!!programContent.publishedAt)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPracticePrivate, setIsPracticePrivate] = useState(!!programContent.metadata?.private)
  const [difficulty, setDifficulty] = useState(programContent.metadata?.difficulty || 1)
  const uploadCanceler = useRef<Canceler>()
  const [attachments, setAttachments] = useState<File[]>(programContent.attachments.map(v => v.data) || [])
  const uploadAttachments = useUploadAttachments()

  const resetModal = () => {
    setDifficulty(programContent.metadata?.difficulty || 1)
    setAttachments(programContent.attachments.map(v => v.data) || [])
    form.resetFields()
  }

  const handleSubmit = (values: FieldProps) => {
    setIsSubmitting(true)
    Promise.all([
      updateProgramContentPractice({
        variables: {
          programContentId: programContent.id,
          publishedAt: program.isSubscription
            ? values.publishedAt
              ? values.publishedAt || new Date()
              : null
            : isPublished
            ? new Date()
            : null,
          title: values.title,
          description: values.description?.getCurrentContent().hasText() ? values.description.toRAW() : null,
          duration: values.estimatedTime,
          isNotifyUpdate: values.isNotifyUpdate,
          notifiedAt: values.isNotifyUpdate ? new Date() : programContent?.notifiedAt,
          metadata: { ...programContent.metadata, difficulty: difficulty, private: isPracticePrivate },
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
        setVisible(false)
        onRefetch?.()
        resetModal()
      })
      .catch(handleError)
      .finally(() => setIsSubmitting(false))
  }

  useEffect(() => {
    setIsPublished(!!programContent.publishedAt)
  }, [programContent.publishedAt])

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
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            publishedAt: programContent.publishedAt ? moment(programContent.publishedAt) : moment().startOf('minute'),
            isPracticePrivate: isPracticePrivate,
            isNotifyUpdate: programContent.isNotifyUpdate,
            title: programContent.title,
            estimatedTime: programContent.duration,
            description: BraftEditor.createEditorState(programContentBody.description),
          }}
          onFinish={handleSubmit}
        >
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
              <Checkbox checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="mr-3">
                {formatMessage(messages.show)}
              </Checkbox>

              <Checkbox
                checked={isPracticePrivate}
                onChange={e => setIsPracticePrivate(e.target.checked)}
                className="mr-3"
              >
                {formatMessage(messages.displayPrivate)}
                <Tooltip
                  placement="bottom"
                  title={<StyledTips>{formatMessage(programMessages.text.practicePrivateTips)}</StyledTips>}
                >
                  <QuestionCircleFilled className="ml-1" />
                </Tooltip>
              </Checkbox>

              <Form.Item name="isNotifyUpdate" valuePropName="checked" className="mb-0">
                <Checkbox>{formatMessage(messages.notifyUpdate)}</Checkbox>
              </Form.Item>
            </div>

            <div>
              <Button
                disabled={isSubmitting}
                onClick={() => {
                  setVisible(false)
                  resetModal()
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
                        deleteProgramContent({
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

          <div>
            <StyledLabel className="mb-2">{formatMessage(messages.difficulty)}</StyledLabel>
            <ReactStarsWrapper
              name="difficulty"
              value={difficulty}
              onStarClick={(rating: React.SetStateAction<number>) => setDifficulty(rating)}
              renderStarIcon={(nextValue, prevValue) => (nextValue > prevValue ? <StarGrayIcon /> : <StarIcon />)}
            />
          </div>
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
      </Modal>
    </>
  )
}

export default ProgramContentPracticeAdminModal
