import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, Dropdown, Form, Icon, Input, InputNumber, Menu, Modal, Spin } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import AppContext from '../../contexts/AppContext'
import { commonMessages } from '../../helpers/translation'
import { useProgram, useProgramContent } from '../../hooks/program'
import types from '../../types'
import AdminBraftEditor from '../admin/AdminBraftEditor'
import DatetimePicker from '../common/DatetimePicker'
import SingleUploader from '../common/SingleUploader'
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

type ProgramContentAdminModalProps = FormComponentProps & {
  programId: string
  programContentId: string
  onSubmit?: () => void
}
const ProgramContentAdminModal: React.FC<ProgramContentAdminModalProps> = ({
  form,
  programId,
  programContentId,
  onSubmit,
}) => {
  const { id: appId } = useContext(AppContext)
  const { formatMessage } = useIntl()
  const { program } = useProgram(programId)
  const { programContent, refetchProgramContent } = useProgramContent(programContentId)

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
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((err, values) => {
      if (err) {
        return
      }

      setLoading(true)

      program &&
        Promise.all([
          updateProgramContent({
            variables: {
              programContentId,
              price: values.isTrial ? 0 : null,
              publishedAt: values.published ? values.publishedAt || new Date() : null,
              title: values.title,
              description: values.description.toRAW(),
              duration: values.duration && values.duration * 60,
              type: values.video ? 'video' : null,
              data: {
                video: values.video || null,
                texttrack: values.texttrack || null,
              },
              isNotifyUpdate: values.isNotifyUpdate,
              notifiedAt: values.isNotifyUpdate ? new Date() : programContent.notifiedAt,
            },
          }),
          program.isSubscription
            ? updateProgramContentPlan({
                variables: {
                  programContentId,
                  programContentPlans: values.planIds.map((planId: string) => ({
                    program_content_id: programContentId,
                    program_plan_id: planId,
                  })),
                },
              })
            : null,
        ])
          .then(() => {
            onSubmit && onSubmit()
            setVisible(false)
          })
          .finally(() => {
            refetchProgramContent()
            setLoading(false)
          })
    })
  }

  const videoFieldValue = form.getFieldValue('video')
  const bodyData = (programContent && programContent.programContentBody && programContent.programContentBody.data) || {}

  // useEffect(() => {
  //   const videoElement = document.createElement("video");
  //   videoElement.preload = "metadata";
  //   videoElement.onloadedmetadata = () => {
  //     window.URL.revokeObjectURL(videoElement.src);
  //     const duration = videoElement.duration;
  //     console.log(duration);
  //   };
  //   if (videoFieldValue) {
  //     console.log(videoFieldValue.originFileObj);
  //     videoElement.src = URL.createObjectURL(videoFieldValue);
  //   }
  // }, [videoFieldValue]);

  return (
    <>
      <Icon
        type="edit"
        onClick={() => {
          setVisible(true)
        }}
      />

      <Modal
        maskClosable={false}
        closable={false}
        visible={visible}
        width="70vw"
        maskStyle={{ background: 'rgba(255, 255, 255, 0.8)' }}
        footer={null}
      >
        {programContent ? (
          <Form
            onSubmit={e => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              {program ? (
                <div className="d-flex align-items-center">
                  {form.getFieldDecorator('isTrial', {
                    initialValue: programContent.price === 0,
                  })(
                    <Checkbox checked={form.getFieldValue('isTrial')}>
                      {formatMessage(commonMessages.ui.trial)}
                    </Checkbox>,
                  )}
                  <Form.Item className="mb-0">
                    {form.getFieldDecorator('published', {
                      initialValue: !!programContent.publishedAt,
                    })(<Checkbox checked={form.getFieldValue('published')}>{formatMessage(messages.show)}</Checkbox>)}
                  </Form.Item>
                  {form.getFieldValue('published') &&
                    program.isSubscription &&
                    form.getFieldDecorator('publishedAt', {
                      initialValue: programContent.publishedAt && moment(programContent.publishedAt),
                    })(<DatetimePicker />)}
                  <Form.Item className="mb-0">
                    {form.getFieldDecorator('isNotifyUpdate', {
                      initialValue: programContent.isNotifyUpdate,
                    })(<Checkbox>{formatMessage(messages.notifyUpdate)}</Checkbox>)}
                  </Form.Item>
                </div>
              ) : (
                <div />
              )}
              <div>
                <Button
                  disabled={loading || uploading}
                  onClick={() => {
                    setVisible(false)
                  }}
                  className="mr-2"
                >
                  {formatMessage(commonMessages.ui.cancel)}
                </Button>
                <Button type="primary" htmlType="submit" disabled={uploading} loading={loading} className="mr-2">
                  {formatMessage(commonMessages.ui.save)}
                </Button>
                <Dropdown
                  placement="bottomRight"
                  overlay={
                    <Menu>
                      <Menu.Item
                        onClick={() =>
                          window.confirm(formatMessage(messages.deleteContentWarning)) &&
                          deleteProgramContent({
                            variables: { programContentId },
                          }).then(() => onSubmit && onSubmit())
                        }
                      >
                        {formatMessage(messages.deleteContent)}
                      </Menu.Item>
                    </Menu>
                  }
                  trigger={['click']}
                >
                  <Icon type="more" />
                </Dropdown>
              </div>
            </div>
            <Form.Item label={formatMessage(messages.contentTitle)}>
              {form.getFieldDecorator('title', {
                initialValue: programContent && programContent.title,
              })(<Input />)}
            </Form.Item>
            {program && program.isSubscription && (
              <Form.Item label={formatMessage(messages.contentPlan)}>
                {form.getFieldDecorator('planIds', {
                  initialValue:
                    (programContent &&
                      programContent.programContentPlans.map(
                        programContentPlan => programContentPlan.programPlan.id,
                      )) ||
                    [],
                })(<ProgramPlanSelector programId={programId} placeholder={formatMessage(messages.contentPlan)} />)}
              </Form.Item>
            )}
            <Form.Item label={formatMessage(commonMessages.term.video)}>
              {programContent.programContentBody &&
                form.getFieldDecorator('video', { initialValue: bodyData.video })(
                  <SingleUploader
                    accept="video/*"
                    uploadText={formatMessage(messages.uploadVideo)}
                    path={`videos/${appId}/${programContent.programContentBody.id}`}
                    onUploading={() => setUploading(true)}
                    onSuccess={() => setUploading(false)}
                    onError={() => setUploading(false)}
                    onCancel={() => setUploading(false)}
                  />,
                )}
            </Form.Item>
            {((videoFieldValue && videoFieldValue.status === 'done') || bodyData.video) && (
              <Form.Item label={formatMessage(commonMessages.term.caption)}>
                {programContent.programContentBody &&
                  form.getFieldDecorator('texttrack', {
                    initialValue: bodyData.texttrack,
                  })(
                    <SingleUploader
                      uploadText={formatMessage(messages.uploadCaption)}
                      path={`texttracks/${appId}/${programContent.programContentBody.id}`}
                      onUploading={() => setUploading(true)}
                      onSuccess={() => setUploading(false)}
                      onError={() => setUploading(false)}
                      onCancel={() => setUploading(false)}
                    />,
                  )}
              </Form.Item>
            )}
            <Form.Item label={formatMessage(messages.duration)}>
              {form.getFieldDecorator('duration', {
                initialValue: programContent.duration && programContent.duration / 60,
              })(<InputNumber />)}
            </Form.Item>
            <Form.Item label={formatMessage(messages.contentContext)}>
              {programContent.programContentBody &&
                programContent.programContentBody.id &&
                form.getFieldDecorator('description', {
                  initialValue: BraftEditor.createEditorState(programContent.programContentBody.description),
                })(<AdminBraftEditor />)}
            </Form.Item>
          </Form>
        ) : (
          <Spin />
        )}
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
    delete_program_content(where: { id: { _eq: $programContentId } }) {
      affected_rows
    }
  }
`

export default Form.create<ProgramContentAdminModalProps>()(ProgramContentAdminModal)
