import { useMutation } from '@apollo/client'
import { Button, Form, Input, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { gql } from '@apollo/client'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { MerchandiseProps } from '../../types/merchandise'
import CategorySelector from '../form/CategorySelector'
import TagSelector from '../form/TagSelector'

type FieldProps = {
  title: string
  categoryIds: string[]
  tags: string[]
}

const MerchandiseBasicForm: React.FC<{
  merchandise: MerchandiseProps
  merchandiseId: string
  onRefetch?: () => void
}> = ({ merchandise, merchandiseId, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [updateMerchandiseBasic] = useMutation<
    hasura.UPDATE_MERCHANDISE_BASIC,
    hasura.UPDATE_MERCHANDISE_BASICVariables
  >(UPDATE_MERCHANDISE_BASIC)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateMerchandiseBasic({
      variables: {
        merchandiseId: merchandiseId,
        title: values.title || '',
        categories:
          values.categoryIds?.map((categoryId: string, index: number) => ({
            merchandise_id: merchandiseId,
            category_id: categoryId,
            position: index,
          })) || [],
        tags:
          values.tags?.map((tag: string) => ({
            name: tag,
            type: '',
          })) || [],
        merchandiseTags:
          values.tags?.map((tag: string, index: number) => ({
            merchandise_id: merchandiseId,
            tag_name: tag,
            position: index,
          })) || [],
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
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      colon={false}
      hideRequiredMark
      initialValues={{
        title: merchandise.title || '',
        categoryIds: merchandise.categories.map(category => category.id),
        tags: merchandise.tags,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        label={formatMessage(commonMessages.label.title)}
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
        <CategorySelector classType="merchandise" />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.label.tags)} name="tags">
        <TagSelector />
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

const UPDATE_MERCHANDISE_BASIC = gql`
  mutation UPDATE_MERCHANDISE_BASIC(
    $merchandiseId: uuid!
    $title: String
    $categories: [merchandise_category_insert_input!]!
    $tags: [tag_insert_input!]!
    $merchandiseTags: [merchandise_tag_insert_input!]!
  ) {
    update_merchandise(where: { id: { _eq: $merchandiseId } }, _set: { title: $title }) {
      affected_rows
    }

    # update categories
    delete_merchandise_category(where: { merchandise_id: { _eq: $merchandiseId } }) {
      affected_rows
    }
    insert_merchandise_category(objects: $categories) {
      affected_rows
    }

    # update tags
    insert_tag(objects: $tags, on_conflict: { constraint: tag_pkey, update_columns: [updated_at] }) {
      affected_rows
    }
    delete_merchandise_tag(where: { merchandise_id: { _eq: $merchandiseId } }) {
      affected_rows
    }
    insert_merchandise_tag(objects: $merchandiseTags) {
      affected_rows
    }
  }
`

export default MerchandiseBasicForm
