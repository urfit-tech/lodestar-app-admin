import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { FormComponentProps } from '@ant-design/compatible/lib/form'
import { useMutation } from '@apollo/react-hooks'
import { Button, Input, message } from 'antd'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import TagSelector from '../../containers/common/TagSelector'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'
import { MerchandiseProps } from '../../types/merchandise'
import CategorySelector from '../admin/CategorySelector'

type MerchandiseBasicFormProps = FormComponentProps & {
  merchandise: MerchandiseProps
  merchandiseId: string
  refetch?: () => void
}
const MerchandiseBasicForm: React.FC<MerchandiseBasicFormProps> = ({ form, merchandise, merchandiseId, refetch }) => {
  const { formatMessage } = useIntl()
  const updateMerchandiseBasic = useUpdateMerchandiseBasic(merchandiseId)
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }
      setLoading(true)
      updateMerchandiseBasic({
        title: values.title,
        categoryIds: values.categoryIds,
        merchandiseTags: values.tags,
      })
        .then(() => {
          refetch && refetch()
          message.success(formatMessage(commonMessages.event.successfullySaved))
        })
        .finally(() => setLoading(false))
    })
  }

  return (
    <Form
      hideRequiredMark
      colon={false}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Form.Item label={formatMessage(commonMessages.term.title)}>
        {form.getFieldDecorator('title', {
          initialValue: merchandise.title,
          rules: [
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.term.title),
              }),
            },
          ],
        })(<Input />)}
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.category)}>
        {form.getFieldDecorator('categoryIds', {
          initialValue: merchandise.categories.map(category => category.id),
        })(<CategorySelector classType="merchandise" />)}
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.tags)}>
        {form.getFieldDecorator('tags', {
          initialValue: merchandise.tags,
        })(<TagSelector />)}
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

const useUpdateMerchandiseBasic = (merchandiseId: string) => {
  const app = useContext(AppContext)
  const [updateBasic] = useMutation<types.UPDATE_MERCHANDISE_BASIC, types.UPDATE_MERCHANDISE_BASICVariables>(
    gql`
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
        delete_merchandise_category(where: { merchandise_id: { _eq: $merchandiseId } }) {
          affected_rows
        }
        insert_merchandise_category(objects: $categories) {
          affected_rows
        }
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
    `,
  )

  const updateMerchandiseBasic: (data: {
    title: string
    categoryIds: string[]
    merchandiseTags: string[]
  }) => Promise<void> = async ({ title, categoryIds, merchandiseTags }) => {
    try {
      await updateBasic({
        variables: {
          merchandiseId: merchandiseId,
          title,
          categories: categoryIds?.map((categoryId, index) => ({
            merchandise_id: merchandiseId,
            category_id: categoryId,
            position: index,
          })),
          tags: merchandiseTags?.map(merchandiseTag => ({
            app_id: app.id,
            name: merchandiseTag,
            type: '',
          })),
          merchandiseTags: merchandiseTags?.map((merchandiseTag, index) => ({
            merchandise_id: merchandiseId,
            tag_name: merchandiseTag,
            position: index,
          })),
        },
      })
    } catch (error) {
      handleError(error)
    }
  }

  return updateMerchandiseBasic
}

export default Form.create<MerchandiseBasicFormProps>()(MerchandiseBasicForm)
