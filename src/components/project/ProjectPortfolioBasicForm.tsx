import { gql, useMutation } from '@apollo/client'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { ProjectAdminProps } from '../../types/project'
import CategorySelector from '../form/CategorySelector'
import TagSelector from '../form/TagSelector'
import projectMessages from './translation'

type FieldProps = {
  title: string
  categoryIds: string[]
  tags: string[]
}

const ProjectPortfolioBasicForm: React.FC<{
  project: ProjectAdminProps | null
  onRefetch?: () => void
}> = ({ project, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [updatePortfolioProjectBasic] = useMutation<
    hasura.UPDATE_PORTFOLIO_PROJECT_BASIC,
    hasura.UPDATE_PORTFOLIO_PROJECT_BASICVariables
  >(UPDATE_PORTFOLIO_PROJECT_BASIC)
  const [loading, setLoading] = useState(false)

  if (!project) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updatePortfolioProjectBasic({
      variables: {
        projectId: project.id,
        title: values.title || '',
        projectCategories: values.categoryIds.map((categoryId: string, index: number) => ({
          project_id: project.id,
          category_id: categoryId,
          position: index,
        })),
        tags: values.tags.map(tag => ({
          name: tag,
          type: '',
        })),
        projectTags: values.tags.map((projectTag, index) => ({
          project_id: project.id,
          tag_name: projectTag,
          position: index,
        })),
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
      wrapperCol={{ md: { span: 12 } }}
      initialValues={{
        title: project.title || '',
        categoryIds: project.categories.map(category => category.id),
        tags: project.tags,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item label={formatMessage(projectMessages['*'].portfolioTitle)} name="title">
        <Input />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.label.category)} name="categoryIds">
        <CategorySelector classType="project" />
      </Form.Item>
      <Form.Item label={formatMessage(projectMessages.ProjectPortfolioBasicForm.tag)} name="tags">
        <TagSelector />
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

const UPDATE_PORTFOLIO_PROJECT_BASIC = gql`
  mutation UPDATE_PORTFOLIO_PROJECT_BASIC(
    $projectId: uuid!
    $title: String
    $projectCategories: [project_category_insert_input!]!
    $tags: [tag_insert_input!]!
    $projectTags: [project_tag_insert_input!]!
  ) {
    update_project(where: { id: { _eq: $projectId } }, _set: { title: $title }) {
      affected_rows
    }

    # update categories
    delete_project_category(where: { project_id: { _eq: $projectId } }) {
      affected_rows
    }
    insert_project_category(objects: $projectCategories) {
      affected_rows
    }

    # update tags
    insert_tag(objects: $tags, on_conflict: { constraint: tag_pkey, update_columns: [updated_at] }) {
      affected_rows
    }
    delete_project_tag(where: { project_id: { _eq: $projectId } }) {
      affected_rows
    }
    insert_project_tag(objects: $projectTags) {
      affected_rows
    }
  }
`

export default ProjectPortfolioBasicForm
