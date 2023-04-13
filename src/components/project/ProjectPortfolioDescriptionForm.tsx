import { gql, useMutation } from '@apollo/client'
import { Button, Form, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import AdminBraftEditor from '../../components/form/AdminBraftEditor'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { ProjectAdminProps } from '../../types/project'

type FieldProps = {
  description: EditorState
}

const ProjectPortfolioDescriptionForm: React.FC<{
  project: ProjectAdminProps | null
  onRefetch?: () => void
}> = ({ project, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [updateProjectDescription] = useMutation<
    hasura.UPDATE_PROJECT_PORTFOLIO_DESCRIPTION,
    hasura.UPDATE_PROJECT_PORTFOLIO_DESCRIPTIONVariables
  >(UPDATE_PROJECT_PORTFOLIO_DESCRIPTION)
  const [loading, setLoading] = useState(false)

  if (!project) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateProjectDescription({
      variables: {
        projectId: project.id,
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

  return (
    <Form
      form={form}
      colon={false}
      labelAlign="left"
      initialValues={{
        description: BraftEditor.createEditorState(project.description),
      }}
      onFinish={handleSubmit}
    >
      <Form.Item name="description">
        <AdminBraftEditor />
      </Form.Item>
      <Form.Item>
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

const UPDATE_PROJECT_PORTFOLIO_DESCRIPTION = gql`
  mutation UPDATE_PROJECT_PORTFOLIO_DESCRIPTION($projectId: uuid!, $description: String) {
    update_project(where: { id: { _eq: $projectId } }, _set: { description: $description }) {
      affected_rows
    }
  }
`

export default ProjectPortfolioDescriptionForm
