import Icon, { QuestionCircleFilled } from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Form, Input, message, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios, { Canceler } from 'axios'
import { debounce } from 'lodash'
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
import { ReactComponent as ExclamationCircleIcon } from '../../images/icon/exclamation-circle.svg'
import { ProjectAdminProps } from '../../types/project'
import { StyledTips } from '../admin'
import { CustomRatioImage } from '../common/Image'
import ImageUploader from '../common/ImageUploader'
import projectMessages from './translation'

const StyledVideoBlock = styled.div`
  width: 100%;
  position: relative;
  padding-top: 56.25%;
  .react-player {
    position: absolute;
    top: 0;
    left: 0;
  }
`

const ErrorBlock = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: rgba(255, 125, 98, 0.1);
  color: var(--error);
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.4px;
`

const NoticeBlock = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: 500;
  line-height: 1.57;
  letter-spacing: 0.18px;
`

const OriginalPortfolioBlock = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  margin-top: 16px;
  background-color: #f7f8f8;
  border-radius: 4px;
  .portfolio-title {
    font-size: 20px;
    font-weight: bold;
    letter-spacing: 0.2px;
  }
  &:hover {
    cursor: pointer;
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
  const { id: appId, host } = useApp()
  const { authToken } = useAuth()
  const uploadCanceler = useRef<Canceler>()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [coverImg, setCoverImg] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>(project?.coverUrl || '')
  const { originalSourceProject, hasSameOriginalSource, refetchHasSameOriginalSource } = usePortfolioVideoUrlCount(
    project?.id,
    videoUrl,
  )
  const [updatePortfolioSettings] = useMutation<
    hasura.UPDATE_PORTFOLIO_PROJECT_SETTINGS,
    hasura.UPDATE_PORTFOLIO_PROJECT_SETTINGSVariables
  >(UPDATE_PORTFOLIO_PROJECT_SETTINGS)

  if (!project) {
    return <Skeleton active />
  }

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value)
    refetchHasSameOriginalSource()
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updatePortfolioSettings({
      variables: {
        projectId: project.id,
        previewUrl: project.previewUrl,
        coverUrl: values.videoUrl,
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
        } else {
          message.success(formatMessage(commonMessages.event.successfullySaved))
          onRefetch?.()
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
      <Form.Item
        label={
          <span className="d-flex align-items-center">
            {formatMessage(projectMessages.ProjectPortfolioSettingsForm.videoUrl)}
            <Tooltip
              placement="top"
              title={
                <StyledTips>{formatMessage(projectMessages.ProjectPortfolioSettingsForm.defaultVideoTips)}</StyledTips>
              }
            >
              <QuestionCircleFilled className="ml-2" />
            </Tooltip>
          </span>
        }
      >
        <Form.Item name="videoUrl">
          <Input onChange={debounce(handleVideoUrlChange, 500)} />
        </Form.Item>

        {hasSameOriginalSource && (
          <ErrorBlock className="mb-3">
            <Icon className="mr-1" component={() => <ExclamationCircleIcon />} />
            {formatMessage(projectMessages.ProjectPortfolioSettingsForm.hasSameOriginalSource)}
          </ErrorBlock>
        )}

        {videoUrl && (
          <StyledVideoBlock>
            <ReactPlayer
              className="react-player"
              url={videoUrl}
              width="100%"
              height="100%"
              controls={true}
              autoPlay={false}
              config={{
                facebook: {
                  attributes: {
                    'data-width': '790px',
                    'data-height': '445px',
                  },
                },
              }}
            />
          </StyledVideoBlock>
        )}

        {hasSameOriginalSource && (
          <NoticeBlock className="mt-3">
            <p>{formatMessage(projectMessages.ProjectPortfolioSettingsForm.hasSameOriginalSourceNoticeTitle)}</p>
            <p>{formatMessage(projectMessages.ProjectPortfolioSettingsForm.hasSameOriginalSourceNotice1)}</p>
            <p>{formatMessage(projectMessages.ProjectPortfolioSettingsForm.hasSameOriginalSourceNotice2)}</p>
            <OriginalPortfolioBlock
              onClick={() => {
                window.open(`https://${host}/projects/${originalSourceProject.id}`, '_blank')
              }}
            >
              <div>
                <p className="portfolio-title">{originalSourceProject.title}</p>
                <p className="portfolio-creator">
                  {formatMessage(projectMessages.ProjectPortfolioSettingsForm.creator, {
                    name: originalSourceProject.creator.name,
                  })}
                </p>
              </div>
              <CustomRatioImage width="74px" ratio={3 / 4} shape="rounded" src={originalSourceProject.coverUrl} />
            </OriginalPortfolioBlock>
          </NoticeBlock>
        )}
      </Form.Item>

      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button
          className="mr-2"
          onClick={() => {
            setVideoUrl(project?.coverUrl || '')
            form.resetFields()
          }}
        >
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading} disabled={hasSameOriginalSource}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const usePortfolioVideoUrlCount = (projectId: string | undefined, videoUrl: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PORTFOLIO_VIDEO_URL_COUNT,
    hasura.GET_PORTFOLIO_VIDEO_URL_COUNTVariables
  >(
    gql`
      query GET_PORTFOLIO_VIDEO_URL_COUNT($videoUrl: String) {
        project_aggregate(
          where: { type: { _eq: "portfolio" }, cover_type: { _eq: "video" }, cover_url: { _eq: $videoUrl } }
        ) {
          nodes {
            id
            title
            creator {
              id
              name
            }
            preview_url
          }
          aggregate {
            count(columns: cover_url)
          }
        }
      }
    `,
    {
      variables: {
        videoUrl,
      },
    },
  )

  const originalSourceProject = {
    id: data?.project_aggregate?.nodes[0]?.id,
    title: data?.project_aggregate?.nodes[0]?.title || '',
    creator: {
      id: data?.project_aggregate?.nodes[0]?.creator?.id,
      name: data?.project_aggregate?.nodes[0]?.creator?.name,
    },
    coverUrl: data?.project_aggregate?.nodes[0]?.preview_url || null,
  }

  return {
    originalSourceProject,
    hasSameOriginalSource:
      originalSourceProject.id !== projectId && (data?.project_aggregate?.aggregate?.count || 0) > 0 ? true : false,
    refetchHasSameOriginalSource: refetch,
  }
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
