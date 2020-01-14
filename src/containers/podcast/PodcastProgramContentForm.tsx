import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Icon, InputNumber, message, Skeleton, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import { extname } from 'path'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import { StyledTips } from '../../components/admin'
import SingleUploader from '../../components/common/SingleUploader'
import StyledBraftEditor from '../../components/common/StyledBraftEditor'
import PodcastProgramContext from '../../contexts/PodcastProgramContext'
import { handleError } from '../../helpers'
import types from '../../types'

const StyledFileBlock = styled.div`
  padding: 0.25rem 0.5rem;
  transition: background 0.2s ease-in-out;
  line-height: normal;

  :hover {
    background: var(--gray-lighter);
  }
`

const PodcastProgramContentForm: React.FC<FormComponentProps> = ({ form }) => {
  const { loadingPodcastProgram, errorPodcastProgram, podcastProgram, refetchPodcastProgram } = useContext(
    PodcastProgramContext,
  )
  const [loading, setLoading] = useState(false)

  const [updatePodcastProgramContent] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_CONTENT,
    types.UPDATE_PODCAST_PROGRAM_CONTENTVariables
  >(UPDATE_PODCAST_PROGRAM_CONTENT)
  const [updatePodcastProgramBody] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_BODY,
    types.UPDATE_PODCAST_PROGRAM_BODYVariables
  >(UPDATE_PODCAST_PROGRAM_BODY)

  if (loadingPodcastProgram) {
    return <Skeleton active />
  }

  if (errorPodcastProgram || !podcastProgram) {
    return <div>讀取錯誤</div>
  }

  const handleUploadAudio = (contentType: string | null) => {
    updatePodcastProgramContent({
      variables: {
        updatedAt: new Date(),
        podcastProgramId: podcastProgram.id,
        contentType,
      },
    })
      .then(() => {
        refetchPodcastProgram && refetchPodcastProgram()
        message.success('儲存成功')
      })
      .catch(error => handleError(error))
  }

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      setLoading(true)

      updatePodcastProgramBody({
        variables: {
          updatedAt: new Date(),
          podcastProgramId: podcastProgram.id,
          duration: values.duration,
          description: values.description.toRAW(),
        },
      })
        .then(() => {
          refetchPodcastProgram && refetchPodcastProgram()
          message.success('儲存成功')
        })
        .catch(error => handleError(error))
        .finally(() => setLoading(false))
    })
  }

  return (
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
            <Tooltip title={<StyledTips>{'建議格式：MP3\n檔案大小限制：5MB'}</StyledTips>}>
              <Icon type="question-circle" theme="filled" />
            </Tooltip>
          </span>
        }
      >
        {form.getFieldDecorator('coverImg')(
          <SingleUploader
            withExtension
            accept=".mp3"
            // accept=".mp3,.m4a,.mp4,.3gp,.m4a,.aac"
            uploadText="上傳音檔"
            showUploadList={false}
            path={`audios/${localStorage.getItem('kolable.app.id')}/${podcastProgram.id}`}
            onSuccess={info => handleUploadAudio(extname(info.file.name).replace('.', ''))}
          />,
        )}
        {podcastProgram.contentType ? (
          <StyledFileBlock className="d-flex align-items-center justify-content-between">
            <span>
              {podcastProgram.id}.{podcastProgram.contentType}
            </span>
            <Icon type="close" className="cursor-pointer" onClick={() => handleUploadAudio(null)} />
          </StyledFileBlock>
        ) : null}
      </Form.Item>
      <Form.Item label="內容時長（分鐘）">
        {form.getFieldDecorator('duration', {
          initialValue: podcastProgram.duration,
        })(<InputNumber min={0} />)}
      </Form.Item>
      <Form.Item label="內容描述">
        {form.getFieldDecorator('description', {
          initialValue: BraftEditor.createEditorState(podcastProgram.description),
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
  )
}

const UPDATE_PODCAST_PROGRAM_CONTENT = gql`
  mutation UPDATE_PODCAST_PROGRAM_CONTENT($podcastProgramId: uuid!, $contentType: String, $updatedAt: timestamptz!) {
    update_podcast_program(
      where: { id: { _eq: $podcastProgramId } }
      _set: { content_type: $contentType, updated_at: $updatedAt }
    ) {
      affected_rows
    }
  }
`
const UPDATE_PODCAST_PROGRAM_BODY = gql`
  mutation UPDATE_PODCAST_PROGRAM_BODY(
    $podcastProgramId: uuid!
    $description: String
    $duration: numeric
    $updatedAt: timestamptz!
  ) {
    update_podcast_program(
      where: { id: { _eq: $podcastProgramId } }
      _set: { duration: $duration, updated_at: $updatedAt }
    ) {
      affected_rows
    }
    update_podcast_program_body(
      where: { podcast_program_id: { _eq: $podcastProgramId } }
      _set: { description: $description }
    ) {
      affected_rows
    }
  }
`

export default Form.create()(PodcastProgramContentForm)
