import Icon, { EditOutlined, MoreOutlined, UploadOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, DatePicker, Dropdown, Form, Input, InputNumber, Menu, message, Modal } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios, { Canceler } from 'axios'
import BraftEditor, { EditorState } from 'braft-editor'
import gql from 'graphql-tag'
import moment, { Moment } from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import hasura from '../../hasura'
import { getFileDuration, handleError, uploadFile } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import { useMutateProgramContent } from '../../hooks/program'
import { ReactComponent as ExclamationCircleIcon } from '../../images/icon/exclamation-circle.svg'
import { ProgramContentBodyProps, ProgramContentProps, ProgramProps } from '../../types/program'
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
  const { authToken, apiHost } = useAuth()

  const { updateProgramContent, updateProgramContentBody, deleteProgramContent } = useMutateProgramContent()
  const [updateProgramContentPlan] = useMutation<
    hasura.UPDATE_PROGRAM_CONTENT_PLAN,
    hasura.UPDATE_PROGRAM_CONTENT_PLANVariables
  >(UPDATE_PROGRAM_CONTENT_PLAN)
  const [updateProgramContentMaterials] = useMutation<
    hasura.UPDATE_PROGRAM_CONTENT_MATERIALS,
    hasura.UPDATE_PROGRAM_CONTENT_MATERIALSVariables
  >(UPDATE_PROGRAM_CONTENT_MATERIALS)

  const [visible, setVisible] = useState(false)
  const [isTrial, setIsTrial] = useState(programContent.listPrice === 0)
  const [isPublished, setIsPublished] = useState(!!programContent.publishedAt)

  const [loading, setLoading] = useState(false)
  const [realDuration, setRealDuration] = useState(0)
  const uploadCanceler = useRef<Canceler>()

  const [videoFile, setVideoFile] = useState<File | null>(programContentBody.data.video || null)
  const [captionFile, setCaptionFile] = useState<File | null>(programContentBody.data.texttrack || null)
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

    // upload video
    if (
      videoFile &&
      (videoFile?.name !== programContentBody.data?.video?.name ||
        videoFile?.lastModified !== programContentBody.data?.video?.lastModified)
    ) {
      try {
        await uploadFile(`videos/${appId}/${programContentBody.id}`, videoFile, authToken, apiHost, {
          cancelToken: new axios.CancelToken(canceler => (uploadCanceler.current = canceler)),
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(prev => ({ ...prev, [videoFile.name]: Math.floor((loaded / total) * 100) }))
          },
          timeout: 60000,
        })
      } catch (error) {
        uploadError.video = true
      }
    }
    // upload caption
    if (
      captionFile &&
      (captionFile.name !== programContentBody.data?.texttrack?.name ||
        captionFile.lastModified !== programContentBody.data?.texttrack?.lastModified)
    ) {
      try {
        await uploadFile(`texttracks/${appId}/${programContentBody.id}`, captionFile, authToken, apiHost, {
          cancelToken: new axios.CancelToken(canceler => (uploadCanceler.current = canceler)),
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(prev => ({ ...prev, [captionFile.name]: Math.floor((loaded / total) * 100) }))
          },
          timeout: 60000,
        })
      } catch (error) {
        uploadError.caption = true
      }
    }
    // upload materials
    const pendingFiles = materialFiles.filter(
      file =>
        !programContentBody.materials.some(
          material => material.data.name === file.name && material.data.lastModified === file.lastModified,
        ),
    )
    if (pendingFiles.length) {
      for (const file of pendingFiles) {
        await uploadFile(`materials/${appId}/${programContent.id}_${file.name}`, file, authToken, apiHost, {
          cancelToken: new axios.CancelToken(canceler => (uploadCanceler.current = canceler)),
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(prev => ({ ...prev, [file.name]: Math.floor((loaded / total) * 100) }))
          },
          timeout: 60000,
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
          duration:
            realDuration !== 0
              ? realDuration
              : values.duration !== Math.ceil((programContent.duration || 0) / 60)
              ? values.duration * 60
              : programContent.duration,
          isNotifyUpdate: values.isNotifyUpdate,
          notifiedAt: values.isNotifyUpdate ? new Date() : programContent?.notifiedAt,
        },
      })

      await updateProgramContentBody({
        variables: {
          programContentId: programContent.id,
          description: values.description?.getCurrentContent().hasText() ? values.description.toRAW() : null,
          type: videoFile ? 'video' : 'text',
          data: {
            video: uploadError.video
              ? programContentBody.data?.video || null
              : videoFile
              ? {
                  name: videoFile.name,
                  type: videoFile.type,
                  size: videoFile.size,
                  lastModified: videoFile.lastModified,
                }
              : null,
            texttrack: uploadError.caption
              ? programContentBody.data?.texttrack || null
              : captionFile
              ? {
                  name: captionFile.name,
                  type: captionFile.type,
                  size: captionFile.size,
                  lastModified: captionFile.lastModified,
                }
              : null,
          },
        },
      })

      if (program.isSubscription) {
        await updateProgramContentPlan({
          variables: {
            programContentId: programContent.id,
            programContentPlans:
              values.planIds?.map((planId: string) => ({
                program_content_id: programContent.id,
                program_plan_id: planId,
              })) || [],
          },
        })
      }

      if (!uploadError.materials) {
        await updateProgramContentMaterials({
          variables: {
            programContentId: programContent.id,
            materials: materialFiles.map(file => ({
              program_content_id: programContent.id,
              data: {
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified,
              },
            })),
          },
        })
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
            isNotifyUpdate: programContent.isNotifyUpdate,
            title: programContent.title,
            planIds: programContent.programPlans?.map(programPlan => programPlan.id) || [],
            duration: Math.ceil((programContent.duration || 0) / 60),
            video: programContentBody.data.video,
            texttrack: programContentBody.data.texttrack,
            description: BraftEditor.createEditorState(programContentBody.description),
          }}
          onValuesChange={(values: any) => {
            typeof values.video !== 'undefined' && setVideoFile(values.video)
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

            <div>
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
          {program.isSubscription && (
            <Form.Item label={formatMessage(messages.contentPlan)} name="planIds">
              <ProgramPlanSelector programId={program.id} placeholder={formatMessage(messages.contentPlan)} />
            </Form.Item>
          )}
          <Form.Item label={formatMessage(commonMessages.term.video)} name="video">
            <FileUploader
              renderTrigger={({ onClick }) => (
                <>
                  <Button icon={<UploadOutlined />} onClick={onClick}>
                    {formatMessage(commonMessages.ui.selectFile)}
                  </Button>
                  {isUploadFailed.video && (
                    <span className="ml-2">
                      <Icon component={() => <ExclamationCircleIcon />} className="mr-2" />
                      <span>{formatMessage(commonMessages.event.failedUpload)}</span>
                    </span>
                  )}
                </>
              )}
              showUploadList
              fileList={videoFile ? [videoFile] : []}
              accept="video/*"
              uploadProgress={uploadProgress}
              onChange={async files => {
                const duration = files[0] ? Math.ceil(await getFileDuration(files[0])) : 0
                form.setFields([{ name: 'duration', value: Math.ceil(duration / 60 || 0) }])
                setRealDuration(duration)
                setVideoFile(files[0] || null)
              }}
            />
          </Form.Item>
          <Form.Item
            label={formatMessage(commonMessages.term.caption)}
            name="texttrack"
            className={videoFile ? undefined : 'd-none'}
          >
            <FileUploader
              renderTrigger={({ onClick }) => (
                <>
                  <Button icon={<UploadOutlined />} onClick={onClick}>
                    {formatMessage(commonMessages.ui.selectFile)}
                  </Button>
                  {isUploadFailed.caption && (
                    <span className="ml-2">
                      <Icon component={() => <ExclamationCircleIcon />} className="mr-2" />
                      <span>{formatMessage(commonMessages.event.failedUpload)}</span>
                    </span>
                  )}
                </>
              )}
              showUploadList
              uploadProgress={uploadProgress}
              fileList={captionFile ? [captionFile] : []}
              onChange={files => setCaptionFile(files[0])}
            />
          </Form.Item>
          <Form.Item label={formatMessage(messages.duration)} name="duration">
            <InputNumber min={0} />
          </Form.Item>
          {enabledModules.program_content_material && (
            <Form.Item label={formatMessage(commonMessages.term.material)}>
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
      </Modal>
    </>
  )
}

const UPDATE_PROGRAM_CONTENT_PLAN = gql`
  mutation UPDATE_PROGRAM_CONTENT_PLAN(
    $programContentId: uuid!
    $programContentPlans: [program_content_plan_insert_input!]!
  ) {
    delete_program_content_plan(where: { program_content_id: { _eq: $programContentId } }) {
      affected_rows
    }
    insert_program_content_plan(objects: $programContentPlans) {
      affected_rows
    }
  }
`
const UPDATE_PROGRAM_CONTENT_MATERIALS = gql`
  mutation UPDATE_PROGRAM_CONTENT_MATERIALS(
    $programContentId: uuid!
    $materials: [program_content_material_insert_input!]!
  ) {
    delete_program_content_material(where: { program_content_id: { _eq: $programContentId } }) {
      affected_rows
    }
    insert_program_content_material(objects: $materials) {
      affected_rows
    }
  }
`

export default ProgramContentAdminModal
