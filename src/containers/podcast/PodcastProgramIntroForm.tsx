import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Icon, Input, message, Skeleton, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { StyledTips } from '../../components/admin/index'
import { CustomRatioImage } from '../../components/common/Image'
import SingleUploader from '../../components/common/SingleUploader'
import PodcastProgramContext from '../../contexts/PodcastProgramContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, podcastMessages } from '../../helpers/translation'
import types from '../../types'

const StyledCoverBlock = styled.div`
  overflow: hidden;
  width: 120px;
  max-width: 120px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
`
const StyledSingleUploader = styled(SingleUploader)`
  && {
    width: auto;
  }

  .ant-upload.ant-upload-select-picture-card {
    margin: 0;
    height: auto;
    width: 120px;
    border: none;
    background: none;

    .ant-upload {
      padding: 0;
    }
  }
`

const PodcastProgramIntroForm: React.FC<FormComponentProps> = ({ form }) => {
  const { formatMessage } = useIntl()
  const { loadingPodcastProgram, errorPodcastProgram, podcastProgram, refetchPodcastProgram } = useContext(
    PodcastProgramContext,
  )
  const [loading, setLoading] = useState(false)

  const [updatePodcastProgramIntro] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_INTRO,
    types.UPDATE_PODCAST_PROGRAM_INTROVariables
  >(UPDATE_PODCAST_PROGRAM_INTRO)

  if (loadingPodcastProgram) {
    return <Skeleton active />
  }

  if (errorPodcastProgram || !podcastProgram) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
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

  const handleUploadSuccess = () => {
    updatePodcastProgramIntro({
      variables: {
        updatedAt: new Date(),
        podcastProgramId: podcastProgram.id,
        coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/podcast_program_covers/${localStorage.getItem(
          'kolable.app.id',
        )}/${podcastProgram.id}?t=${Date.now()}`,
      },
    })
      .then(() => {
        refetchPodcastProgram && refetchPodcastProgram()
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .catch(error => handleError(error))
      .finally(() => setLoading(false))
  }

  return (
    <Form
      hideRequiredMark
      colon={false}
      labelCol={{ span: 24, md: { span: 4 } }}
      wrapperCol={{ span: 24, md: { span: 8 } }}
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Form.Item
        label={
          <span>
            <span className="mr-2">{formatMessage(podcastMessages.term.podcastCover)}</span>
            <Tooltip title={<StyledTips>{formatMessage(podcastMessages.text.podcastCoverTips)}</StyledTips>}>
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
              path={`podcast_program_covers/${localStorage.getItem('kolable.app.id')}/${podcastProgram.id}`}
              isPublic
              onSuccess={() => handleUploadSuccess()}
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

export default Form.create()(PodcastProgramIntroForm)
