import Icon, { EditOutlined, MoreOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Checkbox, DatePicker, Dropdown, Form, Input, InputNumber, Menu, message, Modal } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios, { Canceler } from 'axios'
import BraftEditor, { EditorState } from 'braft-editor'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment, { Moment } from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { handleError, uploadFile } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import { useMutateProgramContent, useProgramContentActions } from '../../hooks/program'
import { ReactComponent as ExclamationCircleIcon } from '../../images/icon/exclamation-circle.svg'
import { ProgramContentBodyProps, ProgramContentProps, ProgramProps } from '../../types/program'
import AttachmentSelector, { AttachmentSelectorValue } from '../common/AttachmentSelector'
import FileUploader from '../common/FileUploader'
import AdminBraftEditor from '../form/AdminBraftEditor'
import ProgramPlanSelector from './ProgramPlanSelector'

const messages = defineMessages({
  contentPlan: { id: 'program.label.contentPlan', defaultMessage: '適用方案' },
  uploadVideo: { id: 'program.ui.uploadVideo', defaultMessage: '上傳影片' },
  uploadCaption: { id: 'program.ui.uploadCaption', defaultMessage: '上傳字幕' },
  duration: { id: 'program.label.duration', defaultMessage: '內容時長（分鐘）' },
  uploadMaterial: { id: 'program.ui.uploadMaterial', defaultMessage: '上傳教材' },
})

type FieldProps = {
  publishedAt: Moment | null
  isNotifyUpdate: boolean
  title: string
  planIds?: string[]
  duration: number
  description: EditorState
  texttrack: any
  videoAttachment: AttachmentSelectorValue | null
}

const ProgramContentAdminModal: React.FC<{
  program: ProgramProps
  programContent: ProgramContentProps
  programContentBody: ProgramContentBodyProps
  onRefetch?: () => void
}> = ({ program, programContent, programContentBody, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { id: appId, enabledModules } = useApp()
  const { authToken } = useAuth()

  const { updateProgramContent, updateProgramContentBody, deleteProgramContent, insertProgramContentBody } =
    useMutateProgramContent()
  const { updatePlans, updateMaterials, updateVideos } = useProgramContentActions(programContent.id)

  const [visible, setVisible] = useState(false)
  const [isTrial, setIsTrial] = useState(programContent?.listPrice === 0)
  const [isPublished, setIsPublished] = useState(!!programContent?.publishedAt)

  const [loading, setLoading] = useState(false)
  const uploadCanceler = useRef<Canceler>()

  const [materialFiles, setMaterialFiles] = useState<File[]>(programContentBody.materials.map(v => v.data) || [])
  const [isUploadFailed, setIsUploadFailed] = useState<{
    video?: boolean
    caption?: boolean
    materials?: boolean
  }>({})
  const [failedUploadFiles, setFailedUploadFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number
  }>({})

  const handleSubmit = async (values: FieldProps) => {
    setLoading(true)
    setIsUploadFailed({})
    setFailedUploadFiles([])
    setUploadProgress({})
    const uploadError: typeof isUploadFailed = {}

    let updatedProgramContentBodyId = programContentBody.id

    // upload materials
    const newFiles = materialFiles.filter(
      file =>
        !programContentBody.materials.some(
          material => material.data.name === file.name && material.data.lastModified === file.lastModified,
        ),
    )
    if (newFiles.length) {
      for (const file of newFiles) {
        await uploadFile(`materials/${appId}/${programContent.id}_${file.name}`, file, authToken, {
          cancelToken: new axios.CancelToken(canceler => (uploadCanceler.current = canceler)),
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(prev => ({ ...prev, [file.name]: Math.floor((loaded / total) * 100) }))
          },
        }).catch(() => {
          uploadError.materials = true
          setFailedUploadFiles(prev => [...prev, file])
        })
      }
    }
    setIsUploadFailed(uploadError)

    try {
      await updateProgramContent({
        variables: {
          programContentId: programContent.id,
          price: isTrial ? 0 : null,
          publishedAt: program.isSubscription
            ? values.publishedAt
              ? values.publishedAt.toDate()
              : null
            : isPublished
            ? new Date()
            : null,
          title: values.title,
          duration: values.duration,
          isNotifyUpdate: values.isNotifyUpdate,
          notifiedAt: values.isNotifyUpdate ? new Date() : programContent?.notifiedAt,
          programContentBodyId: updatedProgramContentBodyId,
        },
      })

      await updateVideos(values.videoAttachment ? [values.videoAttachment.id] : [])

      await updateProgramContentBody({
        variables: {
          programContentId: programContent.id,
          description: values.description?.getCurrentContent().hasText() ? values.description.toRAW() : null,
          type: values.videoAttachment ? 'video' : 'text',
          data: {},
        },
      })

      if (program.isSubscription) {
        await updatePlans(values.planIds || [])
      }

      if (!uploadError.materials) {
        await updateMaterials(materialFiles)
      }

      if (Object.values(uploadError).some(v => v)) {
        message.error(formatMessage(commonMessages.event.failedUpload))
      } else {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        setUploadProgress({})
        setVisible(false)
      }
      onRefetch?.()
    } catch (error) {
      message.error(formatMessage(commonMessages.event.failedSave))
    }

    setLoading(false)
  }

  useEffect(() => {
    setIsPublished(!!programContent?.publishedAt)
  }, [programContent?.publishedAt])

  useEffect(() => {
    programContent?.videos?.length && form.setFieldsValue({ videoAttachment: programContent.videos.pop() })
  }, [form, programContent?.videos])

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
        {programContent && (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              videoAttachment: programContent.videos[0],
              publishedAt: programContent.publishedAt ? moment(programContent.publishedAt) : moment().startOf('minute'),
              isNotifyUpdate: programContent.isNotifyUpdate,
              title: programContent.title,
              planIds: programContent.programPlans?.map(programPlan => programPlan.id) || [],
              duration: programContent.duration || 0,
              video: programContentBody.data.video,
              texttrack: programContentBody.data.texttrack,
              description: BraftEditor.createEditorState(programContentBody.description),
            }}
            onValuesChange={(values: Partial<FieldProps>) => {
              form.setFieldsValue({
                duration: values.videoAttachment?.duration || form.getFieldValue('duration') || 0,
              })
            }}
            onFinish={handleSubmit}
          >
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="d-flex align-items-center">
                <Checkbox checked={isTrial} onChange={e => setIsTrial(e.target.checked)}>
                  {formatMessage(commonMessages.ui.trial)}
                </Checkbox>

                <Checkbox checked={isPublished} onChange={e => setIsPublished(e.target.checked)}>
                  {formatMessage(programMessages.label.show)}
                </Checkbox>

                {program.isSubscription && isPublished && (
                  <Form.Item name="publishedAt" className="mb-0 mr-2">
                    <DatePicker
                      format="YYYY-MM-DD HH:mm"
                      showTime={{ format: 'HH:mm', defaultValue: moment('00:00', 'HH:mm') }}
                    />
                  </Form.Item>
                )}

                <Form.Item name="isNotifyUpdate" valuePropName="checked" className="mb-0">
                  <Checkbox>{formatMessage(programMessages.label.notifyUpdate)}</Checkbox>
                </Form.Item>
              </div>

              <div className="d-flex align-items-center">
                <Button disabled={loading} onClick={() => setVisible(false)} className="mr-2">
                  {formatMessage(commonMessages.ui.cancel)}
                </Button>
                <Button type="primary" htmlType="submit" loading={loading} className="mr-2">
                  {formatMessage(commonMessages.ui.save)}
                </Button>
                <Dropdown
                  trigger={['click']}
                  placement="bottomRight"
                  overlay={
                    <Menu>
                      <Menu.Item
                        onClick={() =>
                          window.confirm(formatMessage(programMessages.text.deleteContentWarning)) &&
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

            <Form.Item label={formatMessage(programMessages.label.contentTitle)} name="title">
              <Input />
            </Form.Item>
            <Form.Item label={formatMessage(messages.contentPlan)} name="planIds">
              <ProgramPlanSelector programId={program.id} placeholder={formatMessage(messages.contentPlan)} />
            </Form.Item>
            <Form.Item label={formatMessage(commonMessages.label.video)} name="videoAttachment">
              <AttachmentSelector contentType="video/*" />
            </Form.Item>
            <Form.Item label={formatMessage(messages.duration)} name="duration">
              <InputNumber min={0} formatter={v => Math.ceil(Number(v) / 60).toString()} parser={v => Number(v) * 60} />
            </Form.Item>
            {enabledModules.program_content_material && (
              <Form.Item label={formatMessage(commonMessages.label.material)}>
                <FileUploader
                  renderTrigger={({ onClick }) => (
                    <>
                      <Button icon={<UploadOutlined />} onClick={onClick}>
                        {formatMessage(commonMessages.ui.selectFile)}
                      </Button>
                      {isUploadFailed.materials && (
                        <span className="ml-2">
                          <Icon component={() => <ExclamationCircleIcon />} className="mr-2" />
                          <span>{formatMessage(commonMessages.event.failedUpload)}</span>
                        </span>
                      )}
                    </>
                  )}
                  multiple
                  showUploadList
                  fileList={materialFiles}
                  uploadProgress={uploadProgress}
                  failedUploadFiles={failedUploadFiles}
                  downloadableLink={file => `materials/${appId}/${programContent.id}_${file.name}`}
                  onChange={files => setMaterialFiles(files)}
                />
              </Form.Item>
            )}
            <Form.Item label={formatMessage(programMessages.label.description)} name="description">
              <AdminBraftEditor />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  )
}

export default ProgramContentAdminModal
