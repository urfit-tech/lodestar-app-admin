import { Button, Form, Icon, InputNumber, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import BraftEditor from 'braft-editor'
import { extname } from 'path'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import { PodcastProgramAdminContext } from '../../containers/podcast/PodcastProgramAdminBlock'
import { AdminBlock, AdminPaneTitle, StyledTips } from '../admin'
import SingleUploader from '../common/SingleUploader'
import StyledBraftEditor from '../common/StyledBraftEditor'

const StyledFileBlock = styled.div`
  padding: 0.25rem 0.5rem;
  transition: background 0.2s ease-in-out;
  line-height: normal;

  :hover {
    background: var(--gray-lighter);
  }
`

const PodcastProgramContentAdminBlock: React.FC<FormComponentProps> = ({ form }) => {
  const { podcastProgramAdmin, updatePodcastProgram } = useContext(PodcastProgramAdminContext)
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      setLoading(true)

      updatePodcastProgram({
        onFinally: () => setLoading(false),
        data: {
          duration: values.duration,
          description: values.description.toRAW(),
        },
      })
    })
  }

  return (
    <div className="container py-5">
      <AdminPaneTitle>廣播內容</AdminPaneTitle>

      <AdminBlock>
        <Form
          hideRequiredMark
          colon={false}
          onSubmit={e => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <Form.Item
            label={
              <span>
                <span className="mr-2">音頻</span>
                <Tooltip title={<StyledTips>{'建議格式：MP3、AAC\n檔案大小限制：5MB'}</StyledTips>}>
                  <Icon type="question-circle" theme="filled" />
                </Tooltip>
              </span>
            }
          >
            {form.getFieldDecorator('coverImg')(
              <SingleUploader
                accept=".mp3,.m4a,.mp4,.3gp"
                uploadText="上傳音檔"
                showUploadList={false}
                path={`audios/${localStorage.getItem('kolable.app.id')}/${podcastProgramAdmin.id}`}
                onSuccess={info => {
                  const contentType = extname(info.file.name).replace('.', '')
                  updatePodcastProgram({
                    data: {
                      contentType,
                    },
                  })
                }}
              />,
            )}
            {podcastProgramAdmin.contentType ? (
              <StyledFileBlock className="d-flex align-items-center justify-content-between">
                <span>
                  {podcastProgramAdmin.id}.{podcastProgramAdmin.contentType}
                </span>
                <Icon
                  type="close"
                  className="cursor-pointer"
                  onClick={() => {
                    updatePodcastProgram({
                      data: {
                        contentType: null,
                      },
                    })
                  }}
                />
              </StyledFileBlock>
            ) : null}
          </Form.Item>
          <Form.Item label="內容時長（分鐘）">
            {form.getFieldDecorator('duration', {
              initialValue: podcastProgramAdmin.duration,
            })(<InputNumber min={0} />)}
          </Form.Item>
          <Form.Item label="內容描述">
            {form.getFieldDecorator('description', {
              initialValue: BraftEditor.createEditorState(podcastProgramAdmin.description),
            })(
              <StyledBraftEditor
                language="zh-hant"
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
          <Form.Item>
            <Button onClick={() => form.resetFields()} className="mr-2">
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              儲存
            </Button>
          </Form.Item>
        </Form>
      </AdminBlock>
    </div>
  )
}

export default Form.create()(PodcastProgramContentAdminBlock)
