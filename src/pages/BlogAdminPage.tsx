import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { Link, useParams } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import {
  AdminHeader,
  AdminHeaderTitle,
  AdminPaneTitle,
  AdminTabBarWrapper,
  StyledAdminBlock,
  StyledAdminBlockTitle,
} from '../components/admin'
import RoleAdminBlock from '../components/admin/RoleAdminBlock'
import BlogPostAuthorCollectionBlock from '../components/blog/BlogPostAuthorCollectionBlock'
import BlogPostBasicForm from '../components/blog/BlogPostBasicForm'
import BlogPostContentForm from '../components/blog/BlogPostContentForm'
import BlogPostDeletionModal from '../components/blog/BlogPostDeletionModal'
import BlogPostPublishBlock from '../components/blog/BlogPostPublishBlock'
import BlogPostSettingForm from '../components/blog/BlogPostSettingForm'
import BlogPostVideoForm from '../components/blog/BlogPostVideoForm'
import { StyledLayoutContent } from '../components/layout/DefaultLayout'
import { blogMessages, commonMessages } from '../helpers/translation'
import { usePost } from '../hooks/blog'
import { usePublicMember } from '../hooks/member'

const BlogAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { postId } = useParams<{ postId: string }>()
  const { host } = useApp()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)

  const { post, refetchPost } = usePost(postId)
  const { member } = usePublicMember(post?.creatorId || '')

  return (
    <>
      <AdminHeader>
        <Link to="/blog">
          <Button type="link" className="mr-3">
            <ArrowLeftOutlined />
          </Button>
        </Link>

        <AdminHeaderTitle>{post?.title || postId}</AdminHeaderTitle>

        <a href={`https://${host}/posts/${postId}`} target="_blank" rel="noopener noreferrer">
          <Button>{formatMessage(commonMessages.ui.preview)}</Button>
        </a>
      </AdminHeader>

      <StyledLayoutContent variant="gray">
        <Tabs
          activeKey={activeKey || 'content'}
          onChange={key => setActiveKey(key)}
          renderTabBar={(props, DefaultTabBar) => (
            <AdminTabBarWrapper>
              <DefaultTabBar {...props} className="mb-0" />
            </AdminTabBarWrapper>
          )}
        >
          <Tabs.TabPane tab={formatMessage(blogMessages.label.postContent)} key="content">
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(blogMessages.label.postContent)}</AdminPaneTitle>

              <StyledAdminBlock>
                <StyledAdminBlockTitle>{formatMessage(blogMessages.ui.video)}</StyledAdminBlockTitle>
                <BlogPostVideoForm post={post} onRefetch={refetchPost} />
              </StyledAdminBlock>

              <StyledAdminBlock>
                <StyledAdminBlockTitle>{formatMessage(blogMessages.ui.contentDescription)}</StyledAdminBlockTitle>
                <BlogPostContentForm post={post} onRefetch={refetchPost} />
              </StyledAdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane tab={formatMessage(blogMessages.label.postManagement)} key="general">
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(blogMessages.label.postManagement)}</AdminPaneTitle>

              <StyledAdminBlock>
                <StyledAdminBlockTitle>{formatMessage(commonMessages.label.basicSettings)}</StyledAdminBlockTitle>
                <BlogPostBasicForm post={post} onRefetch={refetchPost} />
              </StyledAdminBlock>

              <StyledAdminBlock>
                <StyledAdminBlockTitle>{formatMessage(blogMessages.ui.postSetting)}</StyledAdminBlockTitle>
                <BlogPostSettingForm post={post} onRefetch={refetchPost} />
              </StyledAdminBlock>

              <StyledAdminBlock>
                <StyledAdminBlockTitle>{formatMessage(blogMessages.label.deletePost)}</StyledAdminBlockTitle>
                <BlogPostDeletionModal post={post} onRefetch={refetchPost} />
              </StyledAdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane tab={formatMessage(commonMessages.label.roleAdmin)} key="roles">
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.roleAdmin)}</AdminPaneTitle>

              <StyledAdminBlock>
                <StyledAdminBlockTitle>{formatMessage(commonMessages.label.owner)}</StyledAdminBlockTitle>
                <RoleAdminBlock name={member?.name || ''} pictureUrl={member?.pictureUrl || ''} />
              </StyledAdminBlock>

              <StyledAdminBlock>
                <StyledAdminBlockTitle>{formatMessage(commonMessages.label.postAuthor)}</StyledAdminBlockTitle>
                <BlogPostAuthorCollectionBlock post={post} onRefetch={refetchPost} />
              </StyledAdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane tab={formatMessage(commonMessages.label.publishSettings)} key="publishing">
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.publishSettings)}</AdminPaneTitle>

              <StyledAdminBlock>
                <BlogPostPublishBlock post={post} onRefetch={refetchPost} />
              </StyledAdminBlock>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </StyledLayoutContent>
    </>
  )
}

export default BlogAdminPage
