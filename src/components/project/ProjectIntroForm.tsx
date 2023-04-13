import { gql, useMutation } from '@apollo/client'
import { Button, Checkbox, Form, Input, message, Skeleton, Tabs } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios, { Canceler } from 'axios'
import BraftEditor, { EditorState } from 'braft-editor'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { uploadFile } from 'lodestar-app-element/src/helpers'
import React, { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import hasura from '../../hasura'
import { getImageSizedUrl, handleError, isImageUrlResized } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { ProjectAdminProps } from '../../types/project'
import ImageUploader from '../common/ImageUploader'
import AdminBraftEditor from '../form/AdminBraftEditor'
import VideoInput from '../form/VideoInput'
import projectMessages from './translation'

const StyledNotice = styled.div`
  font-size: 12px;
  color: #9b9b9b;
  padding: 0 0 8px 0;
`

const StyledUploadWarning = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
  height: 100%;
`

type FieldProps = {
  coverUrl: string
  abstract: string
  introduction: EditorState
  introductionDesktop: EditorState
}

const ProjectIntroForm: React.FC<{
  project: ProjectAdminProps | null
  onRefetch?: () => void
}> = ({ project, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { id: appId } = useApp()
  const { authToken } = useAuth()
  const uploadCanceler = useRef<Canceler>()
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [isUseOriginSizeCoverImage, setIsUseOriginSizeCoverImage] = useState(
    project?.coverUrl === '' || !project?.coverUrl ? false : !isImageUrlResized(project?.coverUrl),
  )

  const [updateProjectCover] = useMutation<hasura.UPDATE_PROJECT_COVER, hasura.UPDATE_PROJECT_COVERVariables>(
    UPDATE_PROJECT_COVER,
  )
  const [updateProjectIntro] = useMutation<hasura.UPDATE_PROJECT_INTRO, hasura.UPDATE_PROJECT_INTROVariables>(
    UPDATE_PROJECT_INTRO,
  )
  const [loading, setLoading] = useState(false)
  const coverId = uuid()
  const coverUrl = project?.previewUrl || ''

  if (!project) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateProjectIntro({
      variables: {
        projectId: project.id,
        abstract: values.abstract || '',
        introduction: values.introduction?.getCurrentContent().hasText() ? values.introduction.toRAW() : null,
        introductionDesktop: values.introductionDesktop?.getCurrentContent().hasText()
          ? values.introductionDesktop.toRAW()
          : null,
        coverUrl: values.coverUrl || project.coverUrl,
        coverType: values.coverUrl ? 'video' : 'image',
      },
    })
      .then(async () => {
        if (coverImage) {
          try {
            await uploadFile(`project_covers/${appId}/${project.id}/${coverId}`, coverImage, authToken, {
              cancelToken: new axios.CancelToken(canceler => {
                uploadCanceler.current = canceler
              }),
            })
          } catch (error) {
            process.env.NODE_ENV === 'development' && console.log(error)
          }
        }
        const uploadCoverUrl = getImageSizedUrl(
          isUseOriginSizeCoverImage,
          coverImage
            ? `https://${process.env.REACT_APP_S3_BUCKET}/project_covers/${appId}/${project.id}/${coverId}`
            : coverUrl,
        )
        await updateProjectCover({
          variables: {
            projectId: project.id,
            previewUrl: uploadCoverUrl,
          },
        })
      })
      .then(() => {
        setCoverImage(null)
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
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 13 } }}
      initialValues={{
        coverUrl: project.coverType === 'video' ? project.coverUrl : null,
        abstract: project.abstract || '',
        introduction: BraftEditor.createEditorState(project.introduction),
        introductionDesktop: BraftEditor.createEditorState(project.introductionDesktop),
      }}
      onFinish={handleSubmit}
    >
      <Form.Item label={<span>{formatMessage(projectMessages['*'].projectCover)}</span>}>
        <div className="d-flex align-items-center">
          <ImageUploader
            file={coverImage}
            initialCoverUrl={coverUrl}
            onChange={file => {
              setCoverImage(file)
              setIsUseOriginSizeCoverImage(false)
            }}
          />
          {(coverUrl || coverImage) && (
            <Checkbox
              className="ml-2"
              checked={isUseOriginSizeCoverImage}
              onChange={e => {
                setIsUseOriginSizeCoverImage(e.target.checked)
              }}
            >
              {formatMessage(projectMessages.ProjectIntroForm.showOriginSize)}
            </Checkbox>
          )}
          {coverImage && (
            <StyledUploadWarning className="ml-2">
              {formatMessage(projectMessages.ProjectIntroForm.notUploaded)}
            </StyledUploadWarning>
          )}
        </div>
      </Form.Item>

      <Form.Item label={formatMessage(commonMessages.label.introductionVideo)} name="coverUrl">
        <VideoInput appId={appId} productId={project.id} productType="program" />
      </Form.Item>

      <Form.Item label={formatMessage(projectMessages['*'].projectAbstract)} name="abstract">
        <Input.TextArea rows={5} />
      </Form.Item>

      <Form.Item label={formatMessage(projectMessages['*'].projectContent)} wrapperCol={{ md: { span: 20 } }}>
        <Tabs defaultActiveKey="default">
          <Tabs.TabPane key="default" tab={formatMessage(commonMessages.label.default)}>
            <StyledNotice>{formatMessage(projectMessages.ProjectIntroForm.introductionDefaultNotice)}</StyledNotice>
            <Form.Item name="introduction">
              <AdminBraftEditor />
            </Form.Item>
          </Tabs.TabPane>
          <Tabs.TabPane key="desktop" tab={formatMessage(commonMessages.label.desktop)}>
            <StyledNotice>{formatMessage(projectMessages.ProjectIntroForm.introductionDesktopNotice)}</StyledNotice>
            <Form.Item name="introductionDesktop">
              <AdminBraftEditor />
            </Form.Item>
          </Tabs.TabPane>
        </Tabs>
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

const UPDATE_PROJECT_COVER = gql`
  mutation UPDATE_PROJECT_COVER($projectId: uuid!, $previewUrl: String) {
    update_project(where: { id: { _eq: $projectId } }, _set: { preview_url: $previewUrl }) {
      affected_rows
    }
  }
`
const UPDATE_PROJECT_INTRO = gql`
  mutation UPDATE_PROJECT_INTRO(
    $projectId: uuid!
    $abstract: String
    $introduction: String
    $introductionDesktop: String
    $coverUrl: String
    $coverType: String
  ) {
    update_project(
      where: { id: { _eq: $projectId } }
      _set: {
        abstract: $abstract
        introduction: $introduction
        introduction_desktop: $introductionDesktop
        cover_url: $coverUrl
        cover_type: $coverType
      }
    ) {
      affected_rows
    }
  }
`

export default ProjectIntroForm
