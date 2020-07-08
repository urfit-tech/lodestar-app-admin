import { Button, Icon, Tabs } from 'antd'
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
import { useInsertPost, usePostCollection } from '../../hooks/blog'

const BlogAdminCollectionPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { id: appId } = useContext(AppContext)
  const { currentMemberId } = useAuth()
  const { posts, refetch } = usePostCollection()
  const insertPost = useInsertPost()

  useEffect(() => {
    refetch()
  }, [refetch])

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon type="shopping" theme="filled" className="mr-3" />
        <span>{formatMessage(commonMessages.menu.blogPosts)}</span>
      </AdminPageTitle>

      <div className="mb-4">
        <ProductCreationModal
          withCategorySelector
          classType="post"
          renderTrigger={({ setVisible }) => (
            <Button type="primary" icon="file-add" onClick={() => setVisible(true)}>
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
              const id = data?.insert_post?.returning[0].id
              id && history.push(`/blog/${id}`)
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

export default BlogAdminCollectionPage
