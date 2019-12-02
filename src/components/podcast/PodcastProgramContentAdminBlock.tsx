import { Button, Form, Icon, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import BraftEditor from 'braft-editor'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import { PodcastProgramAdminContext } from '../../containers/podcast/PodcastProgramAdminBlock'
import SingleUploader from '../common/SingleUploader'
import StyledBraftEditor from '../common/StyledBraftEditor'
import { StyledAdminBlock, StyledAdminPaneTitle } from './PodcastProgramAdminBlock'

const StyledTips = styled.div`
  font-size: 12px;
  letter-spacing: 0.58px;
  white-space: pre-line;
`

const PodcastProgramContentAdminBlock: React.FC<FormComponentProps> = ({ form }) => {
  const { podcastProgramAdmin, updatePodcastProgram } = useContext(PodcastProgramAdminContext)
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      updatePodcastProgram({
        onBefore: () => setLoading(true),
        onFinally: () => setLoading(false),
        data: {
          audioUrl: values.audioUrl,
          description: values.description.toRAW(),
        },
      })
    })
  }

  return (
    <div className="container py-5">
      <StyledAdminPaneTitle>廣播內容</StyledAdminPaneTitle>

      <StyledAdminBlock>
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
            {form.getFieldDecorator('coverImg', {
              initialValue: podcastProgramAdmin.audioUrl && {
                uid: '-1',
                name: podcastProgramAdmin.title,
                status: 'done',
                url: podcastProgramAdmin.audioUrl,
              },
            })(
              <SingleUploader
                accept="audio/aac,audio/mp3"
                showUploadList={false}
                path=""
                onSuccess={() => handleSubmit()}
              />,
            )}
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
      </StyledAdminBlock>
    </div>
  )
}

export default Form.create()(PodcastProgramContentAdminBlock)
