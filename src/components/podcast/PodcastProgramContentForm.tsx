import Icon, { CloseOutlined, QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, InputNumber, message, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import { extname } from 'path'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { AppContext } from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, podcastMessages } from '../../helpers/translation'
import { useUpdatePodcastProgramContent } from '../../hooks/podcast'
import { ReactComponent as MicrophoneIcon } from '../../images/icon/microphone.svg'
import types from '../../types'
import { PodcastProgramAdminProps } from '../../types/podcast'
import { StyledTips } from '../admin'
import AdminBraftEditor from '../admin/AdminBraftEditor'
import SingleUploader from '../common/SingleUploader'

const StyledFileBlock = styled.div`
  padding: 0.25rem 0.5rem;
  transition: background 0.2s ease-in-out;
  line-height: normal;

  :hover {
    background: var(--gray-lighter);
  }
`

const PodcastProgramContentForm: React.FC<{
  podcastProgramAdmin: PodcastProgramAdminProps | null
  refetch?: () => Promise<any>
}> = ({ podcastProgramAdmin, refetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const { id: appId, enabledModules } = useContext(AppContext)

  const updatePodcastProgramContent = useUpdatePodcastProgramContent()
  const [updatePodcastProgramBody] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_BODY,
    types.UPDATE_PODCAST_PROGRAM_BODYVariables
  >(UPDATE_PODCAST_PROGRAM_BODY)

  const [loading, setLoading] = useState(false)

  if (!podcastProgramAdmin) {
    return <Skeleton active />
  }

  const handleUploadAudio = (contentType: string | null) => {
    updatePodcastProgramContent({
      variables: {
        updatedAt: new Date(),
        podcastProgramId: podcastProgramAdmin.id,
        contentType,
      },
    })
      .then(() => {
        refetch && refetch().then(() => message.success(formatMessage(commonMessages.event.successfullySaved)))
      })
      .catch(error => handleError(error))
  }

  const handleSubmit = (values: any) => {
    setLoading(true)

    updatePodcastProgramBody({
      variables: {
        updatedAt: new Date(),
        podcastProgramId: podcastProgramAdmin.id,
        duration: values.duration,
        description: values.description.toRAW(),
      },
    })
      .then(() => {
        refetch && refetch()
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      colon={false}
      hideRequiredMark
      onFinish={handleSubmit}
      initialValues={{
        duration: podcastProgramAdmin.duration,
        description: BraftEditor.createEditorState(podcastProgramAdmin.description),
      }}
    >
      <Form.Item
        label={
          <span>
            <span className="mr-2">{formatMessage(podcastMessages.term.audioFile)}</span>
            <Tooltip title={<StyledTips>{formatMessage(podcastMessages.text.audioFileTips)}</StyledTips>}>
              <QuestionCircleFilled />
            </Tooltip>
          </span>
        }
        name="audio"
      >
        <SingleUploader
          withExtension
          accept=".mp3"
          // accept=".mp3,.m4a,.mp4,.3gp,.m4a,.aac"
          uploadText={formatMessage(podcastMessages.ui.uploadAudioFile)}
          showUploadList={false}
          path={`audios/${appId}/${podcastProgramAdmin.id}`}
          onSuccess={info => handleUploadAudio(extname(info.file.name).replace('.', ''))}
          className="mr-2"
        />
        {enabledModules.podcast_recording && (
          <Link to={`/podcast-programs/${podcastProgramAdmin.id}/recording`} className="ml-2">
            <Button>
              <Icon component={() => <MicrophoneIcon />} />
              <span>
                {podcastProgramAdmin.contentType
                  ? formatMessage(podcastMessages.ui.editAudio)
                  : formatMessage(podcastMessages.ui.recordAudio)}
              </span>
            </Button>
          </Link>
        )}
        {podcastProgramAdmin.contentType ? (
          <StyledFileBlock className="d-flex align-items-center justify-content-between">
            <span>
              {podcastProgramAdmin.id}.{podcastProgramAdmin.contentType}
            </span>
            <CloseOutlined className="cursor-pointer" onClick={() => handleUploadAudio(null)} />
          </StyledFileBlock>
        ) : null}
      </Form.Item>
      <Form.Item label={formatMessage(podcastMessages.label.duration)} name="duration">
        <InputNumber min={0} />
      </Form.Item>
      <Form.Item label={formatMessage(podcastMessages.label.description)} name="description">
        <AdminBraftEditor />
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

export default PodcastProgramContentForm
