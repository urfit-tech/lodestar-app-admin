import Icon, { CloseOutlined, ExclamationCircleFilled, QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { UploadChangeParam } from 'antd/lib/upload'
import { UploadFile } from 'antd/lib/upload/interface'
import BraftEditor, { EditorState } from 'braft-editor'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { durationFormatter, durationFormatToSeconds, handleError, isiPhoneChrome, isWebview } from '../../helpers'
import { getAudioDuration } from '../../helpers/audio'
import { commonMessages, podcastMessages } from '../../helpers/translation'
import { ReactComponent as MicrophoneIcon } from '../../images/icon/microphone.svg'
import { appendPodcastProgramAudio, deletePodcastProgramAudio } from '../../pages/default/RecordingPageHelpers'
import types from '../../types'
import { PodcastProgramAdminProps } from '../../types/podcast'
import { StyledTips } from '../admin'
import AdminBraftEditor from '../form/AdminBraftEditor'
import SingleUploader from '../form/SingleUploader'

const StyledFileBlock = styled.div`
  padding: 0.25rem 0.5rem;
  transition: background 0.2s ease-in-out;
  line-height: normal;

  :hover {
    background: var(--gray-lighter);
  }
`

type FieldProps = {
  duration: string
  description: EditorState
}

const StyledIcon = styled(ExclamationCircleFilled)`
  color: #ff7d62;
`

const PodcastProgramContentForm: React.FC<{
  podcastProgramAdmin: PodcastProgramAdminProps | null
  onRefetch?: () => void
}> = ({ podcastProgramAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { authToken, backendEndpoint } = useAuth()
  const { id: appId, enabledModules } = useApp()
  const history = useHistory()

  const [updatePodcastProgramBody] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_BODY,
    types.UPDATE_PODCAST_PROGRAM_BODYVariables
  >(UPDATE_PODCAST_PROGRAM_BODY)

  const [updatePodcastProgramDuration] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_DURATION,
    types.UPDATE_PODCAST_PROGRAM_DURATIONVariables
  >(UPDATE_PODCAST_PROGRAM_DURATION)

  const [loading, setLoading] = useState(false)
  const [uploadAudioBase, setUploadAudioBase] = useState<string>(uuid())

  if (!podcastProgramAdmin) {
    return <Skeleton active />
  }

  const handleUploadAudio = async (info: UploadChangeParam<UploadFile>) => {
    const file = info.file.originFileObj as File

    if (file == null) {
      console.warn('File is null / undefined')

      return
    }

    const key = `audios/${appId}/${podcastProgramAdmin.id}/${uploadAudioBase}.mp3`
    setUploadAudioBase(uuid())

    const duration = await getAudioDuration(file)
    const totalDurationSecond = podcastProgramAdmin.audios.reduce((sum, audio) => (sum += audio.duration), 0)
    const totalDuration = Math.ceil((duration + totalDurationSecond) / 60 || 0)

    setLoading(true)
    appendPodcastProgramAudio(authToken, backendEndpoint, appId, podcastProgramAdmin.id, key, file.name, duration)
      .then(async () => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        form.setFields([{ name: 'duration', value: totalDuration }])
        await updatePodcastProgramDuration({
          variables: {
            updatedAt: new Date(),
            podcastProgramId: podcastProgramAdmin.id,
            duration: totalDuration,
            durationSecond: totalDurationSecond,
          },
        })
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updatePodcastProgramBody({
      variables: {
        updatedAt: new Date(),
        podcastProgramId: podcastProgramAdmin.id,
        duration: durationFormatToSeconds(values.duration),
        description: values.description?.getCurrentContent().hasText() ? values.description.toRAW() : null,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  const handleRecording = () => {
    if (isiPhoneChrome() || isWebview()) {
      message.error(formatMessage(podcastMessages.text.browserNotSupported))
    } else {
      history.push(`/podcast-programs/${podcastProgramAdmin.id}/recording`)
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      hideRequiredMark
      initialValues={{
        duration: durationFormatter(podcastProgramAdmin.duration),
        description: BraftEditor.createEditorState(podcastProgramAdmin.description),
      }}
      onFinish={handleSubmit}
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
        className={podcastProgramAdmin.audios.length > 0 ? 'mb-1' : ''}
      >
        <Form.Item name="audio" noStyle>
          <SingleUploader
            withExtension={false}
            accept=".mp3"
            // accept=".mp3,.m4a,.mp4,.3gp,.m4a,.aac"
            uploadText={formatMessage(podcastMessages.ui.uploadAudioFile)}
            showUploadList={false}
            path={`audios/${appId}/${podcastProgramAdmin.id}/${uploadAudioBase}.mp3`}
            onSuccess={handleUploadAudio}
            className="mr-2"
          />
        </Form.Item>
        {enabledModules.podcast_recording && (
          <Button onClick={handleRecording} className="ml-2">
            <Icon component={() => <MicrophoneIcon />} />
            <span>
              {podcastProgramAdmin.duration
                ? formatMessage(podcastMessages.ui.editAudio)
                : formatMessage(podcastMessages.ui.recordAudio)}
            </span>
          </Button>
        )}
        {(isiPhoneChrome() || isWebview()) && (
          <div>
            <StyledIcon className="ml-2 mr-1" />
            <span>{formatMessage(podcastMessages.text.browserNotSupported)}</span>
          </div>
        )}
        {podcastProgramAdmin.audios.length > 1 && (
          <>
            <StyledIcon className="ml-2 mr-1" />
            <span>{formatMessage(podcastMessages.label.notMerged)}</span>
          </>
        )}
      </Form.Item>
      <>
        {podcastProgramAdmin.audios.map(audio => {
          return (
            <StyledFileBlock className="d-flex align-items-center justify-content-between mb-3">
              <span>{audio.filename}</span>
              <CloseOutlined
                className="cursor-pointer"
                onClick={() => {
                  setLoading(true)
                  const totalDurationSecond = podcastProgramAdmin.audios
                    .filter(_audio => _audio.id !== audio.id)
                    .reduce((sum, audio) => (sum += audio.duration), 0)
                  const totalDuration = Math.ceil(totalDurationSecond / 60 || 0)
                  deletePodcastProgramAudio(authToken, backendEndpoint, appId, audio.id)
                    .then(async () => {
                      message.success(formatMessage(commonMessages.event.successfullySaved))
                      await updatePodcastProgramDuration({
                        variables: {
                          updatedAt: new Date(),
                          podcastProgramId: podcastProgramAdmin.id,
                          duration: totalDuration,
                          durationSecond: totalDurationSecond,
                        },
                      })
                      form.setFields([{ name: 'duration', value: totalDuration }])
                      onRefetch?.()
                    })
                    .catch(handleError)
                    .finally(() => setLoading(false))
                }}
              />
            </StyledFileBlock>
          )
        })}
      </>
      <Form.Item label={formatMessage(podcastMessages.label.duration)} name="duration">
        <Input />
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

export const UPDATE_PODCAST_PROGRAM_DURATION = gql`
  mutation UPDATE_PODCAST_PROGRAM_DURATION(
    $podcastProgramId: uuid!
    $duration: numeric
    $durationSecond: numeric
    $updatedAt: timestamptz!
  ) {
    update_podcast_program(
      where: { id: { _eq: $podcastProgramId } }
      _set: { duration: $duration, duration_second: $durationSecond, updated_at: $updatedAt }
    ) {
      affected_rows
    }
  }
`

export default PodcastProgramContentForm
