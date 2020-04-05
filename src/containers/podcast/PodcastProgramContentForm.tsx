import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Icon, InputNumber, message, Skeleton, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import { extname } from 'path'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { StyledTips } from '../../components/admin'
import AdminBraftEditor from '../../components/admin/AdminBraftEditor'
import SingleUploader from '../../components/common/SingleUploader'
import { AppContext } from '../../contexts/AppContext'
import PodcastProgramContext from '../../contexts/PodcastProgramContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, podcastMessages } from '../../helpers/translation'
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
  const { id: appId } = useContext(AppContext)
  const { formatMessage } = useIntl()
  const { loadingPodcastProgram, errorPodcastProgram, podcastProgram, refetchPodcastProgram } = useContext(
    PodcastProgramContext,
  )

  const [updatePodcastProgramContent] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_CONTENT,
    types.UPDATE_PODCAST_PROGRAM_CONTENTVariables
  >(UPDATE_PODCAST_PROGRAM_CONTENT)
  const [updatePodcastProgramBody] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_BODY,
    types.UPDATE_PODCAST_PROGRAM_BODYVariables
  >(UPDATE_PODCAST_PROGRAM_BODY)

  const [loading, setLoading] = useState(false)

  if (loadingPodcastProgram) {
    return <Skeleton active />
  }

  if (errorPodcastProgram || !podcastProgram) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
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
        message.success(formatMessage(commonMessages.event.successfullySaved))
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
          message.success(formatMessage(commonMessages.event.successfullySaved))
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
            <span className="mr-2">{formatMessage(podcastMessages.term.audioFile)}</span>
            <Tooltip title={<StyledTips>{formatMessage(podcastMessages.text.audioFileTips)}</StyledTips>}>
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
            uploadText={formatMessage(podcastMessages.ui.uploadAudioFile)}
            showUploadList={false}
            path={`audios/${appId}/${podcastProgram.id}`}
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
      <Form.Item label={formatMessage(podcastMessages.label.duration)}>
        {form.getFieldDecorator('duration', {
          initialValue: podcastProgram.duration,
        })(<InputNumber min={0} />)}
      </Form.Item>
      <Form.Item label={formatMessage(podcastMessages.label.description)}>
        {form.getFieldDecorator('description', {
          initialValue: BraftEditor.createEditorState(podcastProgram.description),
        })(<AdminBraftEditor />)}
      </Form.Item>
      <Form.Item>
        <Button onClick={() => form.resetFields()} className="mr-2">
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
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
