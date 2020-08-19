import { FileAddOutlined, ShoppingFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Tabs } from 'antd'
import gql from 'graphql-tag'
import React, { useContext, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { AdminPageTitle } from '../../components/admin'
import BlogPostCard from '../../components/blog/BlogPostCard'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import AdminLayout from '../../components/layout/AdminLayout'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { blogMessages, commonMessages } from '../../helpers/translation'
import { usePostCollection } from '../../hooks/blog'
import types from '../../types'

const BlogAdminCollectionPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { id: appId } = useContext(AppContext)
  const { currentMemberId } = useAuth()
  const { posts, refetch } = usePostCollection()
  const [insertPost] = useMutation<types.INSERT_POST, types.INSERT_POSTVariables>(INSERT_POST)

  useEffect(() => {
    refetch()
  }, [refetch])

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <ShoppingFilled className="mr-3" />
        <span>{formatMessage(commonMessages.menu.blogPosts)}</span>
      </AdminPageTitle>

      <div className="mb-4">
        <ProductCreationModal
          withCategorySelector
          classType="post"
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
                postCategories: categoryIds.map((categoryId, i) => ({
                  category_id: categoryId,
                  position: i,
                })),
              },
            }).then(({ data }) => {
              const blogId = data?.insert_post?.returning[0].id
              blogId && history.push(`/blog/${blogId}`)
            })
          }
        />
      </div>

      <Tabs defaultActiveKey="published">
        <Tabs.TabPane key="published" tab={formatMessage(commonMessages.status.published)}>
          <div className="row py-5">
            {posts
              .filter(post => post.publishedAt)
              .map(post => (
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
        <Tabs.TabPane key="draft" tab={formatMessage(commonMessages.status.draft)}>
          <div className="row py-5">
            {posts
              .filter(post => !post.publishedAt)
              .map(post => (
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
