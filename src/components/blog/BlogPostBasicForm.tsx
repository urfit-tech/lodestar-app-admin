import { QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { blogMessages, commonMessages, errorMessages } from '../../helpers/translation'
import { PostProps } from '../../types/blog'
import { StyledTips } from '../admin'
import CategorySelector from '../form/CategorySelector'
import TagSelector from '../form/TagSelector'

const StyledText = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
  line-height: 1.2;
`

type FieldProps = {
  title: string
  categoryIds: string[]
  tags: string[]
  codeName: string
}

const BlogPostBasicForm: React.FC<{
  post: PostProps | null
  onRefetch?: () => {}
}> = ({ post, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { host } = useApp()
  const [updatePostBasic] = useMutation<hasura.UPDATE_POST_BASIC, hasura.UPDATE_POST_BASICVariables>(UPDATE_POST_BASIC)
  const [codeName, setCodeName] = useState('')
  const [loading, setLoading] = useState(false)

  if (!post) {
    return <Skeleton active />
  }

  const canCodeNameUse = !post.codeNames.filter(codeName => codeName !== post.codeName).includes(codeName)

  const handleSubmit = (values: FieldProps) => {
    if (!canCodeNameUse) {
      message.error(formatMessage(errorMessages.event.checkSameCodeName))
      return
    }
    setLoading(true)
    updatePostBasic({
      variables: {
        postId: post.id,
        title: values.title,
        categories: values.categoryIds.map((categoryId: string, index: number) => ({
          post_id: post.id,
          category_id: categoryId,
          position: index,
        })),
        tags: values.tags.map((tag: string) => ({
          name: tag,
          type: '',
        })),
        postTags: values.tags.map((tag: string, index: number) => ({
          post_id: post.id,
          tag_name: tag,
          position: index,
        })),
        codeName: values.codeName || null,
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
        title: post.title,
        categoryIds: post.categories.map(category => category.id),
        tags: post.tagNames,
        codeName: post.codeName,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item label={formatMessage(blogMessages.label.title)} name="title">
        <Input />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.label.category)} name="categoryIds">
        <CategorySelector classType="post" />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.label.tag)} name="tags">
        <TagSelector />
      </Form.Item>
      <Form.Item
        label={
          <span className="d-flex align-items-center">
            {formatMessage(blogMessages.label.codeName)}
            <Tooltip placement="top" title={<StyledTips>{formatMessage(blogMessages.text.url)}</StyledTips>}>
              <QuestionCircleFilled className="ml-2" />
            </Tooltip>
          </span>
        }
        hasFeedback
        validateStatus={codeName.length ? (canCodeNameUse ? 'success' : 'error') : ''}
        extra={<StyledText className="mt-2">{`https://${host}/posts/${codeName || post.codeName || ''}`}</StyledText>}
        name="codeName"
      >
        <Input maxLength={20} placeholder={post.codeName || ''} onChange={e => setCodeName(e.target.value)} />
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

const UPDATE_POST_BASIC = gql`
  mutation UPDATE_POST_BASIC(
    $postId: uuid!
    $title: String
    $codeName: String
    $categories: [post_category_insert_input!]!
    $tags: [tag_insert_input!]!
    $postTags: [post_tag_insert_input!]!
  ) {
    # update post
    update_post(where: { id: { _eq: $postId } }, _set: { title: $title, code_name: $codeName }) {
      affected_rows
    }

    # update categories
    delete_post_category(where: { post_id: { _eq: $postId } }) {
      affected_rows
    }
    insert_post_category(objects: $categories) {
      affected_rows
    }

    # update tags
    insert_tag(objects: $tags, on_conflict: { constraint: tag_pkey, update_columns: [updated_at] }) {
      affected_rows
    }
    delete_post_tag(where: { post_id: { _eq: $postId } }) {
      affected_rows
    }
    insert_post_tag(objects: $postTags) {
      affected_rows
    }
  }
`

export default BlogPostBasicForm
