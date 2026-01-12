import { QuestionCircleFilled } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Form, Input, message, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, podcastMessages } from '../../helpers/translation'
import { Category } from '../../types/general'
import { PodcastProgramAdminProps } from '../../types/podcast'
import { StyledTips } from '../admin'
import CategorySelector from '../form/CategorySelector'
import LanguageSelector from '../form/LanguageSelector'
import TagSelector from '../form/TagSelector'

type FieldProps = {
  title: string
  categoryIds: string[]
  tags: string[]
  languages?: string[]
}

const PodcastProgramBasicForm: React.FC<{
  podcastProgramAdmin:
    | (PodcastProgramAdminProps & {
        categories: Category[]
        tags: string[]
      })
    | null
  onRefetch?: () => void
}> = ({ podcastProgramAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { enabledModules } = useApp()
  const [updatePodcastProgramBasic] = useMutation<
    hasura.UPDATE_PODCAST_PROGRAM_BASIC,
    hasura.UPDATE_PODCAST_PROGRAM_BASICVariables
  >(UPDATE_PODCAST_PROGRAM_BASIC)
  const [loading, setLoading] = useState(false)

  if (!podcastProgramAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updatePodcastProgramBasic({
      variables: {
        updatedAt: new Date(),
        podcastProgramId: podcastProgramAdmin.id,
        title: values.title || '',
        supportLocales: values.languages?.length ? values.languages : null,
        podcastCategories: values.categoryIds
          ? values.categoryIds.map((categoryId: string, position: number) => ({
              podcast_program_id: podcastProgramAdmin.id,
              category_id: categoryId,
              position,
            }))
          : podcastProgramAdmin.categories.map((category, position) => ({
              podcast_program_id: podcastProgramAdmin.id,
              category_id: category.id,
              position,
            })),
        tags: values.tags.map((podcastProgramTag: string) => ({
          name: podcastProgramTag,
          type: '',
        })),
        podcastProgramTags: values.tags.map((podcastProgramTag: string, index: number) => ({
          podcast_program_id: podcastProgramAdmin.id,
          tag_name: podcastProgramTag,
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
      hideRequiredMark
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      initialValues={{
        title: podcastProgramAdmin.title || '',
        categoryIds: podcastProgramAdmin.categories.map(category => category.id),
        tags: podcastProgramAdmin.tags,
        languages: podcastProgramAdmin.supportLocales.map(supportLocale => supportLocale),
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        label={formatMessage(podcastMessages.label.podcastProgramTitle)}
        name="title"
        rules={[
          {
            required: true,
            message: formatMessage(errorMessages.form.isRequired, {
              field: formatMessage(commonMessages.label.title),
            }),
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.label.category)} name="categoryIds">
        <CategorySelector classType="podcastProgram" />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.label.tags)} name="tags">
        <TagSelector />
      </Form.Item>
      <Form.Item
        label={
          <span className="d-flex align-items-center">
            {formatMessage(commonMessages.label.languages)}
            <Tooltip placement="top" title={<StyledTips>{formatMessage(commonMessages.text.locale)}</StyledTips>}>
              <QuestionCircleFilled className="ml-2" />
            </Tooltip>
          </span>
        }
        name="languages"
        className={enabledModules.locale ? '' : 'd-none'}
      >
        <LanguageSelector />
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

const UPDATE_PODCAST_PROGRAM_BASIC = gql`
  mutation UPDATE_PODCAST_PROGRAM_BASIC(
    $podcastProgramId: uuid!
    $title: String
    $podcastCategories: [podcast_program_category_insert_input!]!
    $tags: [tag_insert_input!]!
    $podcastProgramTags: [podcast_program_tag_insert_input!]!
    $updatedAt: timestamptz!
    $supportLocales: jsonb
  ) {
    update_podcast_program(
      where: { id: { _eq: $podcastProgramId } }
      _set: { title: $title, updated_at: $updatedAt, support_locales: $supportLocales }
    ) {
      affected_rows
    }

    # update categories
    delete_podcast_program_category(where: { podcast_program_id: { _eq: $podcastProgramId } }) {
      affected_rows
    }
    insert_podcast_program_category(objects: $podcastCategories) {
      affected_rows
    }

    # update tags
    insert_tag(objects: $tags, on_conflict: { constraint: tag_pkey, update_columns: [updated_at] }) {
      affected_rows
    }
    delete_podcast_program_tag(where: { podcast_program_id: { _eq: $podcastProgramId } }) {
      affected_rows
    }
    insert_podcast_program_tag(objects: $podcastProgramTags) {
      affected_rows
    }
  }
`

export default PodcastProgramBasicForm
