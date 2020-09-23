import { QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, podcastMessages } from '../../helpers/translation'
import types from '../../types'
import { CategoryProps } from '../../types/general'
import { PodcastProgramAdminProps } from '../../types/podcast'
import { StyledTips } from '../admin'
import CategorySelector from '../form/CategorySelector'
import LanguageSelector from '../form/LanguageSelector'
import TagSelector from '../form/TagSelector'

const PodcastProgramBasicForm: React.FC<{
  podcastProgramAdmin:
    | (PodcastProgramAdminProps & {
        categories: CategoryProps[]
        tags: string[]
      })
    | null
  onRefetch?: () => void
}> = ({ podcastProgramAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const { id: appId, enabledModules } = useContext(AppContext)
  const [loading, setLoading] = useState(false)

  const [updatePodcastProgramBasic] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_BASIC,
    types.UPDATE_PODCAST_PROGRAM_BASICVariables
  >(UPDATE_PODCAST_PROGRAM_BASIC)

  if (!podcastProgramAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = (values: any) => {
    setLoading(true)
    updatePodcastProgramBasic({
      variables: {
        updatedAt: new Date(),
        podcastProgramId: podcastProgramAdmin.id,
        title: values.title,
        supportLocales: !values.languages || values.languages.length === 0 ? null : values.languages,
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
          app_id: appId,
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
        onRefetch && onRefetch()
        message.success(formatMessage(commonMessages.event.successfullySaved))
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
        title: podcastProgramAdmin.title,
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
              field: formatMessage(commonMessages.term.title),
            }),
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.category)} name="categoryIds">
        <CategorySelector classType="podcastProgram" />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.tags)} name="tags">
        <TagSelector />
      </Form.Item>
      {enabledModules.locale && (
        <Form.Item
          label={
            <span>
              {formatMessage(commonMessages.label.languages)}
              <Tooltip placement="top" title={<StyledTips>{formatMessage(commonMessages.text.locale)}</StyledTips>}>
                <QuestionCircleFilled className="ml-2" />
              </Tooltip>
            </span>
          }
          name="languages"
        >
          <LanguageSelector />
        </Form.Item>
      )}

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
    delete_podcast_program_category(where: { podcast_program_id: { _eq: $podcastProgramId } }) {
      affected_rows
    }
    insert_podcast_program_category(objects: $podcastCategories) {
      affected_rows
    }
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
