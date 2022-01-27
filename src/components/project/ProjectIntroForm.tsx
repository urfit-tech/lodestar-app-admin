import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton, Tabs } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, projectMessages } from '../../helpers/translation'
import { ProjectAdminProps } from '../../types/project'
import AdminBraftEditor from '../form/AdminBraftEditor'
import ImageInput from '../form/ImageInput'
import VideoInput from '../form/VideoInput'

const messages = defineMessages({
  introductionDefaultNotice: {
    id: 'project.text.introductionDefaultNotice',
    defaultMessage: '預設顯示在手機版與電腦版的圖文內容',
  },
  introductionDesktopNotice: {
    id: 'project.text.introductionDesktopNotice',
    defaultMessage: '優先顯示在電腦版的圖文內容，若與「預設」一樣可留空',
  },
})

const StyledNotice = styled.div`
  font-size: 12px;
  color: #9b9b9b;
  padding: 0 0 8px 0;
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
  const [updateProjectCover] = useMutation<hasura.UPDATE_PROJECT_COVER, hasura.UPDATE_PROJECT_COVERVariables>(
    UPDATE_PROJECT_COVER,
  )
  const [updateProjectIntro] = useMutation<hasura.UPDATE_PROJECT_INTRO, hasura.UPDATE_PROJECT_INTROVariables>(
    UPDATE_PROJECT_INTRO,
  )
  const [loading, setLoading] = useState(false)
  const coverId = uuid()

  if (!project) {
    return <Skeleton active />
  }

  const handleUpdateCover = () => {
    setLoading(true)
    updateProjectCover({
      variables: {
        projectId: project.id,
        previewUrl: `https://${process.env.REACT_APP_S3_BUCKET}/project_covers/${appId}/${project.id}/${coverId}`,
        coverUrl:
          project.coverUrl === null
            ? `https://${process.env.REACT_APP_S3_BUCKET}/project_covers/${appId}/${project.id}/${coverId}`
            : project.coverUrl,
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
        introductionDesktop: values.introductionDesktop?.getCurrentContent().hasText()
          ? values.introductionDesktop.toRAW()
          : null,
        coverUrl: values.coverUrl || project.coverUrl,
        coverType: values.coverUrl ? 'video' : 'image',
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
        coverUrl: project.coverType === 'video' ? project.coverUrl : null,
        abstract: project.abstract,
        introduction: BraftEditor.createEditorState(project.introduction),
        introductionDesktop: BraftEditor.createEditorState(project.introductionDesktop),
      }}
      onFinish={handleSubmit}
    >
      <Form.Item label={<span>{formatMessage(projectMessages.label.projectCover)}</span>}>
        <ImageInput
          path={`project_covers/${appId}/${project.id}/${coverId}`}
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

      <Form.Item label={formatMessage(projectMessages.label.projectContent)} wrapperCol={{ md: { span: 20 } }}>
        <Tabs defaultActiveKey="default">
          <Tabs.TabPane key="default" tab={formatMessage(commonMessages.label.default)}>
            <StyledNotice>{formatMessage(messages.introductionDefaultNotice)}</StyledNotice>
            <Form.Item name="introduction">
              <AdminBraftEditor />
            </Form.Item>
          </Tabs.TabPane>
          <Tabs.TabPane key="desktop" tab={formatMessage(commonMessages.label.desktop)}>
            <StyledNotice>{formatMessage(messages.introductionDesktopNotice)}</StyledNotice>
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
  mutation UPDATE_PROJECT_COVER($projectId: uuid!, $previewUrl: String, $coverUrl: String) {
    update_project(where: { id: { _eq: $projectId } }, _set: { preview_url: $previewUrl, cover_url: $coverUrl }) {
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
