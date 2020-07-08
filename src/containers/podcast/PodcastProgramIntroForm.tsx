import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Icon, Input, message, Skeleton, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { StyledTips } from '../../components/admin/index'
import { CustomRatioImage } from '../../components/common/Image'
import { StyledSingleUploader } from '../../components/program/ProgramIntroAdminCard'
import { AppContext } from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, podcastMessages } from '../../helpers/translation'
import types from '../../types'
import { PodcastProgramProps } from '../../types/podcast'

const StyledCoverBlock = styled.div`
  overflow: hidden;
  width: 120px;
  max-width: 120px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
`

type PodcastProgramIntroFormProps = FormComponentProps & {
  podcastProgram: PodcastProgramProps | null
  onRefetch?: () => Promise<any>
}
const PodcastProgramIntroForm: React.FC<PodcastProgramIntroFormProps> = ({ form, podcastProgram, onRefetch }) => {
  const { id: appId } = useContext(AppContext)
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)

  const [updatePodcastProgramIntro] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_INTRO,
    types.UPDATE_PODCAST_PROGRAM_INTROVariables
  >(UPDATE_PODCAST_PROGRAM_INTRO)

  if (!podcastProgram) {
    return <Skeleton active />
  }

  const handleUpload = () => {
    form.validateFields(error => {
      if (error) {
        return
      }

      updatePodcastProgramIntro({
        variables: {
          updatedAt: new Date(),
          podcastProgramId: podcastProgram.id,
          abstract: podcastProgram.abstract,
          coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/podcast_program_covers/${appId}/${
            podcastProgram.id
          }?t=${Date.now()}`,
        },
      })
        .then(() => {
          onRefetch && onRefetch().then(() => message.success(formatMessage(commonMessages.event.successfullyUpload)))
        })
        .catch(error => handleError(error))
    })
  }

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      setLoading(true)
      updatePodcastProgramIntro({
        variables: {
          updatedAt: new Date(),
          podcastProgramId: podcastProgram.id,
          abstract: values.abstract,
          coverUrl: podcastProgram.coverUrl,
        },
      })
        .then(() => {
          onRefetch && onRefetch().then(() => message.success(formatMessage(commonMessages.event.successfullySaved)))
        })
        .catch(error => handleError(error))
        .finally(() => setLoading(false))
    })
  }

  return (
    <Form
      hideRequiredMark
      colon={false}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Form.Item
        label={
          <span>
            <span className="mr-2">{formatMessage(podcastMessages.term.podcastCover)}</span>
            <Tooltip
              placement="top"
              title={<StyledTips>{formatMessage(podcastMessages.text.podcastCoverTips)}</StyledTips>}
            >
              <Icon type="question-circle" theme="filled" />
            </Tooltip>
          </span>
        }
      >
        <div className="d-flex align-items-center">
          {!!podcastProgram.coverUrl && (
            <StyledCoverBlock className="mr-4">
              <CustomRatioImage src={podcastProgram.coverUrl} width="100%" ratio={1} />
            </StyledCoverBlock>
          )}

          {form.getFieldDecorator('coverUrl', {
            initialValue: podcastProgram.coverUrl && {
              uid: '-1',
              name: podcastProgram.title,
              status: 'done',
              url: podcastProgram.coverUrl,
            },
          })(
            <StyledSingleUploader
              accept="image/*"
              listType="picture-card"
              showUploadList={false}
              path={`podcast_program_covers/${appId}/${podcastProgram.id}`}
              isPublic
              onSuccess={() => handleUpload()}
            />,
          )}
        </div>
      </Form.Item>
      <Form.Item label={formatMessage(podcastMessages.term.podcastAbstract)}>
        {form.getFieldDecorator('abstract', {
          initialValue: podcastProgram.abstract,
        })(<Input.TextArea rows={4} maxLength={100} placeholder={formatMessage(podcastMessages.text.abstractLimit)} />)}
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

const UPDATE_PODCAST_PROGRAM_INTRO = gql`
  mutation UPDATE_PODCAST_PROGRAM_INTRO(
    $podcastProgramId: uuid!
    $coverUrl: String
    $abstract: String
    $updatedAt: timestamptz!
  ) {
    update_podcast_program(
      where: { id: { _eq: $podcastProgramId } }
      _set: { cover_url: $coverUrl, abstract: $abstract, updated_at: $updatedAt }
    ) {
      affected_rows
    }
  }
`

export default Form.create<PodcastProgramIntroFormProps>()(PodcastProgramIntroForm)
