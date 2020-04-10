import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Icon, Input, message, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useContext, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import TagSelector from '../../containers/common/TagSelector'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { blogMessages, commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'
import { BlogPostProps } from '../../types/blog'
import { StyledTips } from '../admin'
import CategorySelector from '../common/CategorySelector'

type BlogPostBasicFormProps = BlogPostProps & FormComponentProps

const StyledText = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
  line-height: 1.2;
`

const BlogPostBasicForm: React.FC<BlogPostBasicFormProps> = ({
  post,
  onRefetch,
  form: { getFieldDecorator, resetFields, validateFields },
}) => {
  const { settings } = useContext(AppContext)
  const { formatMessage } = useIntl()
  const [codeName, setCodeName] = useState<string>('')
  const updatePostBasic = useUpdatePostBasic(post.id)
  const canCodeNameUse = !(post && post.codeNames && post.codeNames.includes(codeName))

  useEffect(() => {
    setCodeName(post.codeName)
  }, [JSON.stringify(post)])

  const handleSubmit = () => {
    validateFields((error, { title, categoryIds, tags, codeName }) => {
      if (error) {
        return
      }
      if (!canCodeNameUse) {
        message.error(formatMessage(errorMessages.event.checkSameCodeName))
        return
      }
      updatePostBasic({
        title,
        categoryIds,
        postTags: tags,
        codeName: codeName.length ? codeName : null,
      }).then(() => {
        onRefetch && onRefetch()
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
    })
  }

  return (
    post && (
      <Form
        labelCol={{ span: 24, md: { span: 4 } }}
        wrapperCol={{ span: 24, md: { span: 8 } }}
        onSubmit={e => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <Form.Item label={formatMessage(commonMessages.term.title)}>
          {getFieldDecorator('title', { initialValue: post.title })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(commonMessages.term.category)}>
          {getFieldDecorator('categoryIds', {
            initialValue: post.categories.map(category => category.id),
          })(<CategorySelector classType="program" />)}
        </Form.Item>
        <Form.Item label={formatMessage(commonMessages.term.tag)}>
          {getFieldDecorator('tags', {
            initialValue: post.tagNames,
          })(<TagSelector />)}
        </Form.Item>
        <Form.Item
          label={
            <>
              {formatMessage(blogMessages.label.codeName)}
              <Tooltip placement="topLeft" title={<StyledTips>{formatMessage(blogMessages.text.url)}</StyledTips>}>
                <Icon type="question-circle" theme="filled" className="ml-2" />
              </Tooltip>
            </>
          }
          hasFeedback
          validateStatus={codeName.length ? (canCodeNameUse ? 'success' : 'error') : ''}
        >
          {getFieldDecorator('codeName', {
            initialValue: post.codeName,
          })(<Input maxLength={20} onChange={e => setCodeName(e.target.value)} />)}
          <StyledText>{`https://${settings['host']}/posts/${codeName}`}</StyledText>
        </Form.Item>
        <Form.Item wrapperCol={{ md: { offset: 4 } }}>
          <Button onClick={() => resetFields()}>{formatMessage(commonMessages.ui.cancel)}</Button>
          <Button className="ml-2" type="primary" htmlType="submit">
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </Form.Item>
      </Form>
    )
  )
}

const useUpdatePostBasic = (postId: string) => {
  const { id: appId } = useContext(AppContext)
  const [updateBasic] = useMutation<types.UPDATE_POST_BASIC, types.UPDATE_POST_BASICVariables>(UPDATE_POST_BASIC)

  const updatePostBasic: (data: {
    title: string
    codeName: string
    categoryIds: string[]
    postTags: string[]
  }) => Promise<void> = async ({ title, categoryIds, postTags, codeName }) => {
    try {
      await updateBasic({
        variables: {
          postId,
          title,
          codeName,
          categories: categoryIds?.map((categoryId, i) => ({
            post_id: postId,
            category_id: categoryId,
            position: i,
          })),
          tags: postTags?.map(postTag => ({
            app_id: appId,
            name: postTag,
            type: '',
          })),
          postTags: postTags?.map((postTag, i) => ({
            post_id: postId,
            tag_name: postTag,
            position: i,
          })),
        },
      })
    } catch (error) {
      handleError(error)
    }
  }
  return updatePostBasic
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

    # update post category
    delete_post_category(where: { post_id: { _eq: $postId } }) {
      affected_rows
    }
    insert_post_category(objects: $categories) {
      affected_rows
    }

    # update post tag
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

export default Form.create<BlogPostBasicFormProps>()(BlogPostBasicForm)
