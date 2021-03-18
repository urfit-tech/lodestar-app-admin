import { EditOutlined, MoreOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, DatePicker, Dropdown, Form, Input, InputNumber, Menu, message, Modal } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { UploadChangeParam } from 'antd/lib/upload'
import { UploadFile } from 'antd/lib/upload/interface'
import axios, { Canceler } from 'axios'
import BraftEditor, { EditorState } from 'braft-editor'
import gql from 'graphql-tag'
import moment, { Moment } from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import hasura from '../../hasura'
import { handleError, uploadFile } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import { useMutateProgramContent } from '../../hooks/program'
import { ProgramContentBodyProps, ProgramContentProps, ProgramProps } from '../../types/program'
import FileUploader from '../common/FileUploader'
import AdminBraftEditor from '../form/AdminBraftEditor'
import SingleUploader from '../form/SingleUploader'
import ProgramPlanSelector from './ProgramPlanSelector'

const messages = defineMessages({
  contentTitle: { id: 'program.label.contentTitle', defaultMessage: '標題' },
  contentPlan: { id: 'program.label.contentPlan', defaultMessage: '適用方案' },
  uploadVideo: { id: 'program.ui.uploadVideo', defaultMessage: '上傳影片' },
  uploadCaption: { id: 'program.ui.uploadCaption', defaultMessage: '上傳字幕' },
  duration: { id: 'program.label.duration', defaultMessage: '內容時長（分鐘）' },
  contentContext: { id: 'program.label.contentContext', defaultMessage: '內文' },
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
  const { updateProgramContent, deleteProgramContent } = useMutateProgramContent()

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
  const [video, setVideo] = useState<any>(programContentBody.data.video || null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [realDuration, setRealDuration] = useState(0)
  const uploadCanceler = useRef<Canceler>()
  const [materialFiles, setMaterialFiles] = useState<File[]>(programContentBody.materials.map(v => v.data) || [])

  const handleUploadVideo = async (info: UploadChangeParam<UploadFile>) => {
    const file = info.file.originFileObj as File
    if (file == null) {
      console.warn('File is null')
    }
    // const duration = Math.ceil(await getFileDuration(file))
    const duration = 0
    setRealDuration(duration)
    form.setFields([{ name: 'duration', value: Math.ceil(duration / 60 || 0) }])
    setUploading(false)
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    Promise.all([
      updateProgramContent({
        variables: {
          programContentId: programContent.id,
          price: isTrial ? 0 : null,
          publishedAt: program.isSubscription
            ? values.publishedAt
              ? values.publishedAt || new Date()
              : null
            : isPublished
            ? new Date()
            : null,
          title: values.title,
          description: values.description?.getCurrentContent().hasText() ? values.description.toRAW() : null,
          duration:
            realDuration !== 0
              ? realDuration
              : values.duration !== Math.ceil((programContent.duration || 0) / 60)
              ? values.duration * 60
              : programContent.duration,
          type: video ? 'video' : 'text',
          data: {
            video: video || null,
            texttrack: values.texttrack || null,
          },
          isNotifyUpdate: values.isNotifyUpdate,
          notifiedAt: values.isNotifyUpdate ? new Date() : programContent?.notifiedAt,
        },
      }),
      program.isSubscription
        ? updateProgramContentPlan({
            variables: {
              programContentId: programContent.id,
              programContentPlans:
                values.planIds?.map((planId: string) => ({
                  program_content_id: programContent.id,
                  program_plan_id: planId,
                })) || [],
            },
          })
        : null,
      updateProgramContentMaterials({
        variables: {
          programContentId: programContent.id,
          materials: materialFiles.map(file => ({
            program_content_id: programContent.id,
            data: {
              lastModified: file.lastModified,
              name: file.name,
              size: file.size,
              type: file.type,
            },
          })),
        },
      }),
    ])
      .then(async () => {
        try {
          const existedFiles: File[] = programContentBody.materials.map(material => material.data).flat()

          for (const file of materialFiles) {
            if (
              existedFiles.some(
                existedFile => existedFile.name === file.name && existedFile.lastModified === file.lastModified,
              )
            ) {
              continue
            }
            await uploadFile(`materials/${appId}/${programContent.id}_${file.name}`, file, authToken, apiHost, {
              cancelToken: new axios.CancelToken(canceler => {
                uploadCanceler.current = canceler
              }),
            })
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
      })
      .catch(handleError)
      .finally(() => setLoading(false))
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
            typeof values.video !== 'undefined' && setVideo(values.video)
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
              <Button disabled={loading || uploading} onClick={() => setVisible(false)} className="mr-2">
                {formatMessage(commonMessages.ui.cancel)}
              </Button>
              <Button type="primary" htmlType="submit" disabled={uploading} loading={loading} className="mr-2">
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
                        deleteProgramContent({
                          variables: { programContentId: programContent.id },
                        }).then(() => onRefetch?.())
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

          <Form.Item label={formatMessage(messages.contentTitle)} name="title">
            <Input />
          </Form.Item>
          {program.isSubscription && (
            <Form.Item label={formatMessage(messages.contentPlan)} name="planIds">
              <ProgramPlanSelector programId={program.id} placeholder={formatMessage(messages.contentPlan)} />
            </Form.Item>
          )}
          <Form.Item label={formatMessage(commonMessages.term.video)} name="video">
            <SingleUploader
              accept="video/*"
              uploadText={formatMessage(messages.uploadVideo)}
              path={`videos/${appId}/${programContentBody.id}`}
              onUploading={() => setUploading(true)}
              onSuccess={handleUploadVideo}
              onError={() => setUploading(false)}
              onCancel={() => setUploading(false)}
            />
          </Form.Item>
          {(video?.status === 'done' || programContentBody.data.video) && (
            <Form.Item label={formatMessage(commonMessages.term.caption)} name="texttrack">
              <SingleUploader
                uploadText={formatMessage(messages.uploadCaption)}
                path={`texttracks/${appId}/${programContentBody.id}`}
                onUploading={() => setUploading(true)}
                onSuccess={() => setUploading(false)}
                onError={() => setUploading(false)}
                onCancel={() => setUploading(false)}
              />
            </Form.Item>
          )}
          <Form.Item label={formatMessage(messages.duration)} name="duration">
            <InputNumber min={0} />
          </Form.Item>
          {enabledModules.program_content_material && (
            <Form.Item label={formatMessage(commonMessages.term.material)}>
              <FileUploader
                multiple
                showUploadList
                fileList={materialFiles}
                onChange={files => setMaterialFiles(files)}
              />
            </Form.Item>
          )}
          <Form.Item label={formatMessage(messages.contentContext)} name="description">
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
