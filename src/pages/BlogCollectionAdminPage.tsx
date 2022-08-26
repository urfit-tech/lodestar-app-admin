import { FileAddOutlined, ShoppingFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Tabs } from 'antd'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { AdminPageTitle } from '../components/admin'
import BlogPostCard from '../components/blog/BlogPostCard'
import ProductCreationModal from '../components/common/ProductCreationModal'
import AdminLayout from '../components/layout/AdminLayout'
import hasura from '../hasura'
import { handleError } from '../helpers'
import { blogMessages, commonMessages } from '../helpers/translation'
import { usePostCollection } from '../hooks/blog'
import ForbiddenPage from './ForbiddenPage'

const BlogAdminCollectionPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { currentMemberId, permissions } = useAuth()
  const { id: appId, enabledModules } = useApp()
  const { posts, refetchPosts } = usePostCollection()
  const [insertPost] = useMutation<hasura.INSERT_POST, hasura.INSERT_POSTVariables>(INSERT_POST)

  const tabContents = [
    {
      key: 'published',
      tab: formatMessage(commonMessages.status.published),
      posts: posts.filter(post => post.publishedAt),
    },
    {
      key: 'draft',
      tab: formatMessage(commonMessages.status.draft),
      posts: posts.filter(post => !post.publishedAt),
    },
  ]

  if (!enabledModules.blog || (!permissions.POST_ADMIN && !permissions.POST_NORMAL)) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <ShoppingFilled className="mr-3" />
        <span>{formatMessage(commonMessages.menu.blogPosts)}</span>
      </AdminPageTitle>

      <div className="mb-4">
        <ProductCreationModal
          categoryClassType="post"
          renderTrigger={({ setVisible }) => (
            <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
              {formatMessage(blogMessages.ui.createPost)}
            </Button>
          )}
          title={formatMessage(blogMessages.ui.createPost)}
          onCreate={({ title, categoryIds }) =>
            insertPost({
              variables: {
                appId,
                title,
                postRoles: [
                  {
                    member_id: currentMemberId,
                    name: 'creator',
                    position: -1,
                  },
                  {
                    member_id: currentMemberId,
                    name: 'author',
                    position: -1,
                  },
                ],
                postCategories:
                  categoryIds?.map((categoryId, index) => ({
                    category_id: categoryId,
                    position: index,
                  })) || [],
              },
            })
              .then(({ data }) => {
                refetchPosts().then(() => {
                  const postId = data?.insert_post?.returning[0].id
                  postId && history.push(`/blog/${postId}`)
                })
              })
              .catch(handleError)
          }
        />
      </div>

      <Tabs defaultActiveKey="published">
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={tabContent.tab}>
            <div className="row py-5">
              {tabContent.posts.map(post => (
                <div key={post.id} className="col-12 col-md-6 col-lg-4 mb-5">
                  <BlogPostCard
                    title={post.title}
                    coverUrl={post.coverUrl}
                    videoUrl={post.videoUrl}
                    views={post.views}
                    memberName={post.authorName}
                    publishedAt={post.publishedAt}
                    link={`/blog/${post.id}`}
                  />
                </div>
              ))}
            </div>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

const INSERT_POST = gql`
  mutation INSERT_POST(
    $appId: String!
    $title: String!
    $postCategories: [post_category_insert_input!]!
    $postRoles: [post_role_insert_input!]!
  ) {
    insert_post(
      objects: {
        app_id: $appId
        title: $title
        post_categories: { data: $postCategories }
        post_roles: { data: $postRoles }
      }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`

export default BlogAdminCollectionPage
