import { EditOutlined, MoreOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, DatePicker, Dropdown, Form, Input, InputNumber, Menu, Modal } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import gql from 'graphql-tag'
import moment, { Moment } from 'moment'
import React, { useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useApp } from '../../contexts/AppContext'
import { handleError } from '../../helpers'
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
  programContentBody: ProgramContentBodyType
  onRefetch?: () => void
}> = ({ program, programContent, programContentBody, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { id: appId } = useApp()

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

  const [visible, setVisible] = useState(false)
  const [isTrial, setIsTrial] = useState(programContent.listPrice === 0)
  const [isPublished, setIsPublished] = useState(!!programContent.publishedAt)
  const [video, setVideo] = useState<any>(programContentBody.data.video || null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

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
          duration: values.duration && values.duration * 60,
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
    ])
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
            duration: (programContent.duration || 0) / 60,
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
              onSuccess={() => setUploading(false)}
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
            <InputNumber />
          </Form.Item>
          <Form.Item label={formatMessage(messages.contentContext)} name="description">
            <AdminBraftEditor />
          </Form.Item>
        </Form>
      </Modal>
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

export default ProgramContentAdminModal
