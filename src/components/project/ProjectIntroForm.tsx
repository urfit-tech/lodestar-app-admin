import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useApp } from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, projectMessages } from '../../helpers/translation'
import types from '../../types'
import { ProjectAdminProps } from '../../types/project'
import AdminBraftEditor from '../form/AdminBraftEditor'
import ImageInput from '../form/ImageInput'
import VideoInput from '../form/VideoInput'

type FieldProps = {
  coverUrl: string
  abstract: string
  introduction: EditorState
}

const ProjectIntroForm: React.FC<{
  project: ProjectAdminProps | null
  onRefetch?: () => void
}> = ({ project, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { id: appId } = useApp()
  const [updateProjectCover] = useMutation<types.UPDATE_PROJECT_COVER, types.UPDATE_PROJECT_COVERVariables>(
    UPDATE_PROJECT_COVER,
  )
  const [updateProjectIntro] = useMutation<types.UPDATE_PROJECT_INTRO, types.UPDATE_PROJECT_INTROVariables>(
    UPDATE_PROJECT_INTRO,
  )
  const [loading, setLoading] = useState(false)

  if (!project) {
    return <Skeleton active />
  }

  const handleUpdateCover = () => {
    setLoading(true)
    const uploadTime = Date.now()
    updateProjectCover({
      variables: {
        projectId: project.id,
        coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/project_covers/${appId}/${project.id}?t=${uploadTime}`,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateProjectIntro({
      variables: {
        projectId: project.id,
        abstract: values.abstract,
        introduction: values.introduction?.getCurrentContent().hasText() ? values.introduction.toRAW() : null,
        coverUrl: values.coverUrl,
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
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 10 } }}
      initialValues={{
        coverVideoUrl: project.coverType === 'video' ? project.coverUrl : '',
        abstract: project.abstract,
        introduction: BraftEditor.createEditorState(project.introduction),
      }}
      onFinish={handleSubmit}
    >
      <Form.Item label={<span>{formatMessage(projectMessages.label.projectCover)}</span>}>
        <ImageInput
          path={`project_covers/${appId}/${project.id}`}
          image={{
            width: '160px',
            ratio: 9 / 16,
            shape: 'rounded',
          }}
          value={project.previewUrl}
          onChange={() => handleUpdateCover()}
        />
      </Form.Item>

      <Form.Item label={formatMessage(commonMessages.label.introductionVideo)} name="coverUrl">
        <VideoInput appId={appId} productId={project.id} productType="program" />
      </Form.Item>

      <Form.Item label={formatMessage(projectMessages.label.projectAbstract)} name="abstract">
        <Input.TextArea rows={5} />
      </Form.Item>

      <Form.Item
        label={formatMessage(projectMessages.label.projectContent)}
        wrapperCol={{ md: { span: 20 } }}
        name="introduction"
      >
        <AdminBraftEditor />
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
  mutation UPDATE_PROJECT_COVER($projectId: uuid!, $coverUrl: String) {
    update_project(where: { id: { _eq: $projectId } }, _set: { preview_url: $coverUrl }) {
      affected_rows
    }
  }
`
const UPDATE_PROJECT_INTRO = gql`
  mutation UPDATE_PROJECT_INTRO($projectId: uuid!, $abstract: String, $introduction: String, $coverUrl: String) {
    update_project(
      where: { id: { _eq: $projectId } }
      _set: { abstract: $abstract, introduction: $introduction, cover_url: $coverUrl }
    ) {
      affected_rows
    }
  }
`

export default ProjectIntroForm
