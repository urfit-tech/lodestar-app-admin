import { Button, Checkbox, Dropdown, Form, Icon, Input, InputNumber, Menu, Modal, Spin } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { braftLanguageFn } from '../../helpers'
import { useProgram, useProgramContent } from '../../hooks/data'
import DatetimePicker from '../common/DatetimePicker'
import SingleUploader from '../common/SingleUploader'
import StyledBraftEditor from '../common/StyledBraftEditor'
import ProgramPlanSelector from './ProgramPlanSelector'

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
  const { program } = useProgram(programId)
  const { programContent, refetchProgramContent } = useProgramContent(programContentId)
  const updateProgramContent = useMutation(UPDATE_PROGRAM_CONTENT)
  const updateProgramContentPlan = useMutation(UPDATE_PROGRAM_CONTENT_PLAN)
  const deleteProgramContent = useMutation(DELETE_PROGRAM_CONTENT)
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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
          <Form onSubmit={handleSubmit}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              {program ? (
                <div className="d-flex align-items-center">
                  {form.getFieldDecorator('isTrial', {
                    initialValue: programContent.price === 0,
                  })(<Checkbox checked={form.getFieldValue('isTrial')}>試看</Checkbox>)}
                  <Form.Item className="mb-0">
                    {form.getFieldDecorator('published', {
                      initialValue: !!programContent.publishedAt,
                    })(<Checkbox checked={form.getFieldValue('published')}>顯示</Checkbox>)}
                  </Form.Item>
                  {form.getFieldValue('published') &&
                    program.isSubscription &&
                    form.getFieldDecorator('publishedAt', {
                      initialValue: programContent.publishedAt && moment(programContent.publishedAt),
                    })(<DatetimePicker />)}
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
                  取消
                </Button>
                <Button type="primary" htmlType="submit" disabled={uploading} loading={loading} className="mr-2">
                  儲存
                </Button>
                <Dropdown
                  placement="bottomRight"
                  overlay={
                    <Menu>
                      <Menu.Item
                        onClick={() =>
                          window.confirm('你確定要刪除此內容？此動作無法還原') &&
                          deleteProgramContent({
                            variables: { programContentId },
                          }).then(() => onSubmit && onSubmit())
                        }
                      >
                        刪除內容
                      </Menu.Item>
                    </Menu>
                  }
                  trigger={['click']}
                >
                  <Icon type="more" />
                </Dropdown>
              </div>
            </div>
            <Form.Item label="標題">
              {form.getFieldDecorator('title', {
                initialValue: programContent && programContent.title,
              })(<Input placeholder="標題名稱" />)}
            </Form.Item>
            {program && program.isSubscription && (
              <Form.Item label="適用方案">
                {form.getFieldDecorator('planIds', {
                  initialValue:
                    (programContent &&
                      programContent.programContentPlans.map(
                        programContentPlan => programContentPlan.programPlan.id,
                      )) ||
                    [],
                })(<ProgramPlanSelector programId={programId} placeholder="選擇方案" />)}
              </Form.Item>
            )}
            <Form.Item label="影片">
              {programContent.programContentBody &&
                form.getFieldDecorator('video', { initialValue: bodyData.video })(
                  <SingleUploader
                    accept="video/*"
                    uploadText="上傳影片"
                    path={`videos/${process.env.REACT_APP_ID}/${programContent.programContentBody.id}`}
                    onUploading={() => setUploading(true)}
                    onSuccess={() => setUploading(false)}
                    onError={() => setUploading(false)}
                    onCancel={() => setUploading(false)}
                  />,
                )}
            </Form.Item>
            {((videoFieldValue && videoFieldValue.status === 'done') || bodyData.video) && (
              <Form.Item label="字幕">
                {programContent.programContentBody &&
                  form.getFieldDecorator('texttrack', {
                    initialValue: bodyData.texttrack,
                  })(
                    <SingleUploader
                      uploadText="上傳字幕"
                      path={`texttracks/${process.env.REACT_APP_ID}/${programContent.programContentBody.id}`}
                      onUploading={() => setUploading(true)}
                      onSuccess={() => setUploading(false)}
                      onError={() => setUploading(false)}
                      onCancel={() => setUploading(false)}
                    />,
                  )}
              </Form.Item>
            )}
            <Form.Item label="內容時長（分鐘）">
              {form.getFieldDecorator('duration', {
                initialValue: programContent.duration && programContent.duration / 60,
              })(<InputNumber />)}
            </Form.Item>
            <Form.Item label="內文">
              {programContent.programContentBody &&
                programContent.programContentBody.id &&
                form.getFieldDecorator('description', {
                  initialValue: BraftEditor.createEditorState(programContent.programContentBody.description),
                })(
                  <StyledBraftEditor
                    language={braftLanguageFn}
                    controls={[
                      'headings',
                      { key: 'font-size', title: '字級' },
                      'line-height',
                      'text-color',
                      'bold',
                      'italic',
                      'underline',
                      'strike-through',
                      { key: 'remove-styles', title: '清除樣式' },
                      'separator',
                      'text-align',
                      'separator',
                      'list-ol',
                      'list-ul',
                      'blockquote',
                      { key: 'code', title: '程式碼' },
                      'separator',
                      'media',
                      { key: 'link', title: '連結' },
                      { key: 'hr', title: '水平線' },
                      'separator',
                      { key: 'fullscreen', title: '全螢幕' },
                    ]}
                  />,
                )}
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
  ) {
    update_program_content(
      where: { id: { _eq: $programContentId } }
      _set: { title: $title, duration: $duration, list_price: $price, sale_price: $price, published_at: $publishedAt }
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
