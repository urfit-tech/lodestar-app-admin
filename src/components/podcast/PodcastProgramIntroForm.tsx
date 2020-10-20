import { QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { AppContext } from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, podcastMessages } from '../../helpers/translation'
import types from '../../types'
import { PodcastProgramAdminProps } from '../../types/podcast'
import { StyledTips } from '../admin/index'
import ImageInput from '../form/ImageInput'

type FieldProps = {
  abstract: string
}

const PodcastProgramIntroForm: React.FC<{
  podcastProgramAdmin: PodcastProgramAdminProps | null
  onRefetch?: () => void
}> = ({ podcastProgramAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { id: appId } = useContext(AppContext)
  const [loading, setLoading] = useState(false)

  const [updatePodcastProgramCover] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_COVER,
    types.UPDATE_PODCAST_PROGRAM_COVERVariables
  >(UPDATE_PODCAST_PROGRAM_COVER)

  const [updatePodcastProgramIntro] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_INTRO,
    types.UPDATE_PODCAST_PROGRAM_INTROVariables
  >(UPDATE_PODCAST_PROGRAM_INTRO)

  if (!podcastProgramAdmin) {
    return <Skeleton active />
  }

  const handleUpload = () => {
    setLoading(true)
    updatePodcastProgramCover({
      variables: {
        updatedAt: new Date(),
        podcastProgramId: podcastProgramAdmin.id,
        coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/podcast_program_covers/${appId}/${
          podcastProgramAdmin.id
        }?t=${Date.now()}`,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullyUpload))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updatePodcastProgramIntro({
      variables: {
        updatedAt: new Date(),
        podcastProgramId: podcastProgramAdmin.id,
        abstract: values.abstract,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      colon={false}
      hideRequiredMark
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      initialValues={{
        abstract: podcastProgramAdmin.abstract,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        label={
          <span>
            <span className="mr-2">{formatMessage(podcastMessages.term.podcastCover)}</span>
            <Tooltip
              placement="top"
              title={<StyledTips>{formatMessage(podcastMessages.text.podcastCoverTips)}</StyledTips>}
            >
              <QuestionCircleFilled />
            </Tooltip>
          </span>
        }
      >
        <ImageInput
          path={`podcast_program_covers/${appId}/${podcastProgramAdmin.id}`}
          image={{
            width: '120px',
            ratio: 1,
          }}
          value={podcastProgramAdmin.coverUrl}
          onChange={() => handleUpload()}
        />
      </Form.Item>
      <Form.Item label={formatMessage(podcastMessages.term.podcastAbstract)} name="abstract">
        <Input.TextArea rows={4} maxLength={100} placeholder={formatMessage(podcastMessages.text.abstractLimit)} />
      </Form.Item>

      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
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
const UPDATE_PODCAST_PROGRAM_COVER = gql`
  mutation UPDATE_PODCAST_PROGRAM_COVER($podcastProgramId: uuid!, $coverUrl: String, $updatedAt: timestamptz!) {
    update_podcast_program(
      where: { id: { _eq: $podcastProgramId } }
      _set: { cover_url: $coverUrl, updated_at: $updatedAt }
    ) {
      affected_rows
    }
  }
`
const UPDATE_PODCAST_PROGRAM_INTRO = gql`
  mutation UPDATE_PODCAST_PROGRAM_INTRO($podcastProgramId: uuid!, $abstract: String, $updatedAt: timestamptz!) {
    update_podcast_program(
      where: { id: { _eq: $podcastProgramId } }
      _set: { abstract: $abstract, updated_at: $updatedAt }
    ) {
      affected_rows
    }
  }
`

export default PodcastProgramIntroForm
