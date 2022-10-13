import { QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios, { Canceler } from 'axios'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import ReactPlayer from 'react-player'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import hasura from '../../hasura'
import { handleError, uploadFile } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { ProjectAdminProps } from '../../types/project'
import { StyledTips } from '../admin'
import ImageUploader from '../common/ImageUploader'
import projectMessages from './translation'

const StyledVideoBlock = styled.div`
  position: relative;
  padding-top: 56.25%;
  .react-player {
    position: absolute;
    top: 0;
    left: 0;
  }
`

type FieldProps = {
  coverUrl: string
  videoUrl: string
}

const ProjectPortfolioSettingsForm: React.FC<{
  project: ProjectAdminProps | null
  onRefetch?: () => void
}> = ({ project, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { authToken } = useAuth()
  const uploadCanceler = useRef<Canceler>()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [coverImg, setCoverImg] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>(project?.coverUrl || '')
  const [updatePortfolioSettings] = useMutation<
    hasura.UPDATE_PORTFOLIO_PROJECT_SETTINGS,
    hasura.UPDATE_PORTFOLIO_PROJECT_SETTINGSVariables
  >(UPDATE_PORTFOLIO_PROJECT_SETTINGS)

  if (!project) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    console.log(values)
    updatePortfolioSettings({
      variables: {
        projectId: project.id,
        previewUrl: project.previewUrl,
        coverUrl: values.videoUrl || project.coverUrl,
        coverType: values.videoUrl ? 'video' : 'image',
      },
    })
      .then(async () => {
        if (coverImg) {
          const coverId = uuid()
          try {
            await uploadFile(`project_covers/${appId}/${project.id}/${coverId}`, coverImg, authToken, {
              cancelToken: new axios.CancelToken(canceler => {
                uploadCanceler.current = canceler
              }),
            })
          } catch (error) {
            process.env.NODE_ENV === 'development' && console.log(error)
            return error
          }
          await updatePortfolioSettings({
            variables: {
              projectId: project.id,
              previewUrl: `https://${process.env.REACT_APP_S3_BUCKET}/project_covers/${appId}/${project.id}/${coverId}/400`,
              coverUrl: values.videoUrl || project.coverUrl,
              coverType: values.videoUrl ? 'video' : 'image',
            },
          })
            .then(() => {
              message.success(formatMessage(commonMessages.event.successfullySaved))
              onRefetch?.()
            })
            .catch(handleError)
        }
      })
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      colon={false}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 20 } }}
      initialValues={{
        coverUrl: project.previewUrl,
        videoUrl: project.coverUrl,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        name="coverUrl"
        label={
          <span className="d-flex align-items-center">
            {formatMessage(projectMessages.ProjectPortfolioSettingsForm.cover)}
            <Tooltip
              placement="top"
              title={
                <StyledTips>{formatMessage(projectMessages.ProjectPortfolioSettingsForm.defaultImageTips)}</StyledTips>
              }
            >
              <QuestionCircleFilled className="ml-2" />
            </Tooltip>
          </span>
        }
      >
        <ImageUploader file={coverImg} initialCoverUrl={project.previewUrl} onChange={file => setCoverImg(file)} />
      </Form.Item>

      <Form.Item label={formatMessage(projectMessages.ProjectPortfolioSettingsForm.videoUrl)}>
        <Form.Item name="videoUrl">
          <Input onChange={e => setVideoUrl(e.target.value)} />
        </Form.Item>
        {videoUrl && (
          <StyledVideoBlock>
            <ReactPlayer className="react-player" url={videoUrl} width="100%" height="100%" autoPlay={false} />
          </StyledVideoBlock>
        )}
      </Form.Item>

      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button className="mr-2" onClick={() => form.resetFields()}>
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const UPDATE_PORTFOLIO_PROJECT_SETTINGS = gql`
  mutation UPDATE_PORTFOLIO_PROJECT_SETTINGS(
    $projectId: uuid!
    $previewUrl: String
    $coverUrl: String
    $coverType: String
  ) {
    update_project(
      where: { id: { _eq: $projectId } }
      _set: { preview_url: $previewUrl, cover_url: $coverUrl, cover_type: $coverType }
    ) {
      affected_rows
    }
  }
`

export default ProjectPortfolioSettingsForm
