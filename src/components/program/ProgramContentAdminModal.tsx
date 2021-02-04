import { CloseOutlined, EditOutlined, MoreOutlined, UploadOutlined } from '@ant-design/icons'
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
import styled from 'styled-components'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { getFileDuration, handleError, uploadFile } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramContentBodyType, ProgramContentProps, ProgramProps } from '../../types/program'
import AdminBraftEditor from '../form/AdminBraftEditor'
import SingleUploader from '../form/SingleUploader'
import ProgramPlanSelector from './ProgramPlanSelector'

const messages = defineMessages({
  show: { id: 'program.ui.show', defaultMessage: '顯示' },
  deleteContentWarning: {
    id: 'program.text.deleteContentWarning',
    defaultMessage: '你確定要刪除此內容？此動作無法還原',
  },
  deleteContent: { id: 'program.ui.deleteContent', defaultMessage: '刪除內容' },
  contentTitle: { id: 'program.label.contentTitle', defaultMessage: '標題' },
  contentPlan: { id: 'program.label.contentPlan', defaultMessage: '適用方案' },
  uploadVideo: { id: 'program.ui.uploadVideo', defaultMessage: '上傳影片' },
  uploadCaption: { id: 'program.ui.uploadCaption', defaultMessage: '上傳字幕' },
  duration: { id: 'program.label.duration', defaultMessage: '內容時長（分鐘）' },
  contentContext: { id: 'program.label.contentContext', defaultMessage: '內文' },
  notifyUpdate: { id: 'program.label.notifyUpdate', defaultMessage: '通知內容更新' },
  uploadMaterial: { id: 'program.ui.uploadMaterial', defaultMessage: '上傳教材' },
})

const StyledCloseIcon = styled(CloseOutlined)`
  color: transparent;
`
const StyledFileItem = styled.div`
  color: var(--gray-darker);
  font-size: 14px;

  :hover {
    background-color: var(--gray-lighter);
    ${StyledCloseIcon} {
      color: var(--gray-darker);
    }
  }
`

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
  programContentBody: ProgramContentBodyType
  onRefetch?: () => void
}> = ({ program, programContent, programContentBody, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { id: appId, enabledModules } = useApp()
  const { authToken, apiHost } = useAuth()

  const [updateProgramContent] = useMutation<types.UPDATE_PROGRAM_CONTENT, types.UPDATE_PROGRAM_CONTENTVariables>(
    UPDATE_PROGRAM_CONTENT,
  )
  const [updateProgramContentPlan] = useMutation<
    types.UPDATE_PROGRAM_CONTENT_PLAN,
    types.UPDATE_PROGRAM_CONTENT_PLANVariables
  >(UPDATE_PROGRAM_CONTENT_PLAN)
  const [deleteProgramContent] = useMutation<types.DELETE_PROGRAM_CONTENT, types.DELETE_PROGRAM_CONTENTVariables>(
    DELETE_PROGRAM_CONTENT,
  )

  const [updateProgramContentMaterials] = useMutation<
    types.UPDATE_PROGRAM_CONTENT_MATERIALS,
    types.UPDATE_PROGRAM_CONTENT_MATERIALSVariables
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
    const duration = Math.ceil(await getFileDuration(file))
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
          type: video ? 'video' : null,
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
                {formatMessage(messages.show)}
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
                <Checkbox>{formatMessage(messages.notifyUpdate)}</Checkbox>
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
            <>
              <Form.Item label={formatMessage(commonMessages.term.material)}>
                <MaterialFileUpload value={materialFiles} onChange={value => setMaterialFiles(value)} />
              </Form.Item>
              <div className="mb-4">
                {materialFiles?.map(file => (
                  <StyledFileItem
                    key={file.name}
                    className="d-flex align-items-center justify-content-between py-1 px-2"
                  >
                    <div className="flex-grow-1">{file.name}</div>
                    <StyledCloseIcon
                      className="flex-shrink-0 ml-2 pointer-cursor"
                      onClick={() => {
                        setMaterialFiles(materialFiles.filter(v => v.name !== file.name))
                      }}
                    />
                  </StyledFileItem>
                ))}
              </div>
            </>
          )}
          <Form.Item label={formatMessage(messages.contentContext)} name="description">
            <AdminBraftEditor />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

const MaterialFileUpload: React.FC<{
  value?: File[]
  onChange?: (value: File[]) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const inputRef = useRef<HTMLInputElement | null>(null)
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={e => {
          if (!e.target.files || !e.target.files.length || !onChange) {
            return
          }

          // append new file into input value
          const files: File[] = value?.slice() || []
          for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files.item(i)
            file && !files.some(v => v.name === file.name) && files.push(file)
          }

          onChange(files)
          e.target.value = ''
          e.target.files = null
        }}
      />

      <Button icon={<UploadOutlined />} onClick={() => inputRef.current?.click()}>
        {formatMessage(messages.uploadMaterial)}
      </Button>
    </>
  )
}

const UPDATE_PROGRAM_CONTENT = gql`
  mutation UPDATE_PROGRAM_CONTENT(
    $programContentId: uuid!
    $title: String
    $description: String
    $type: String
    $data: jsonb
    $price: numeric
    $publishedAt: timestamptz
    $duration: numeric
    $isNotifyUpdate: Boolean
    $notifiedAt: timestamptz
  ) {
    update_program_content(
      where: { id: { _eq: $programContentId } }
      _set: {
        title: $title
        duration: $duration
        list_price: $price
        sale_price: $price
        published_at: $publishedAt
        is_notify_update: $isNotifyUpdate
        notified_at: $notifiedAt
      }
    ) {
      affected_rows
    }
    update_program_content_body(
      where: { program_contents: { id: { _eq: $programContentId } } }
      _set: { description: $description, type: $type }
      _append: { data: $data }
    ) {
      affected_rows
    }
  }
`
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
const DELETE_PROGRAM_CONTENT = gql`
  mutation DELETE_PROGRAM_CONTENT($programContentId: uuid!) {
    delete_program_content_progress(where: { program_content_id: { _eq: $programContentId } }) {
      affected_rows
    }
    delete_program_content_body(where: { program_contents: { id: { _eq: $programContentId } } }) {
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
