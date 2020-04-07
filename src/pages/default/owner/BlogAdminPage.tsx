import { Button, Icon, Tabs } from 'antd'
import React, { useContext, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { StringParam, useQueryParam } from 'use-query-params'
import useRouter from 'use-react-router'
import { AdminBlock, AdminBlockTitle, AdminHeader, AdminHeaderTitle, AdminPaneTitle } from '../../../components/admin'
import AdminPublishBlock from '../../../components/admin/AdminPublishBlock'
import RoleAdminBlock from '../../../components/admin/RoleAdminBlock'
import BlogPostBasicAdminForm from '../../../components/blog/BlogPostBasicAdminForm'
import BlogPostContentAdminForm from '../../../components/blog/BlogPostContentAdminForm'
import BlogPostDeletionAdminModal from '../../../components/blog/BlogPostDeletionAdminModal'
import BlogPostSettingAdminForm from '../../../components/blog/BlogPostSettingAdminForm'
import BlogPostVideoAdminForm from '../../../components/blog/BlogPostVideoAdminForm'
import AppContext from '../../../contexts/AppContext'
import { blogMessages, commonMessages } from '../../../helpers/translation'
import { usePost } from '../../../hooks/blog'
import { usePublicMember } from '../../../hooks/member'

const BlogAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { history, match } = useRouter<{ postId: string }>()
  const postId = match.params.postId
  const { post, refetch: refetchPost } = usePost(postId)
  const { member } = usePublicMember(post?.memberId || '')
  const [active, setActive] = useQueryParam('active', StringParam)
  const { settings } = useContext(AppContext)

  useEffect(() => {
    !active && setActive('content')
  }, [active, setActive])

  return (
    <>
      <AdminHeader>
        <Button type="link" onClick={() => history.goBack()} className="mr-3">
          <Icon type="arrow-left" />
        </Button>

        <AdminHeaderTitle>{post.title || postId}</AdminHeaderTitle>

        <a href={`https://${settings['host']}/posts/${postId}`} target="_blank" rel="noopener noreferrer">
          <Button>{formatMessage(commonMessages.ui.preview)}</Button>
        </a>
      </AdminHeader>

      <div style={{ backgroundColor: '#f7f8f8', minHeight: 'calc(100vh - 64px)' }}>
        <Tabs
          activeKey={active}
          onChange={setActive}
          renderTabBar={(tabsProps, DefaultTabBar) => (
            <div style={{ backgroundColor: 'white' }}>
              <div className="container text-center">
                <DefaultTabBar {...tabsProps} />
              </div>
            </div>
          )}
        >
          <Tabs.TabPane tab={formatMessage(blogMessages.label.postContent)} key="content">
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(blogMessages.label.postContent)}</AdminPaneTitle>

              <AdminBlock>
                <AdminBlockTitle>{formatMessage(blogMessages.ui.video)}</AdminBlockTitle>
                <BlogPostVideoAdminForm post={post} onRefetch={refetchPost} />
              </AdminBlock>

              <AdminBlock>
                <AdminBlockTitle>{formatMessage(blogMessages.ui.contentDescription)}</AdminBlockTitle>
                <BlogPostContentAdminForm post={post} onRefetch={refetchPost} />
              </AdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane tab={formatMessage(blogMessages.label.postManagement)} key="general">
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(blogMessages.label.postManagement)}</AdminPaneTitle>

              <AdminBlock>
                <AdminBlockTitle>{formatMessage(commonMessages.label.basicSettings)}</AdminBlockTitle>
                <BlogPostBasicAdminForm post={post} onRefetch={refetchPost} />
              </AdminBlock>

              <AdminBlock>
                <AdminBlockTitle>{formatMessage(blogMessages.ui.postSetting)}</AdminBlockTitle>
                <BlogPostSettingAdminForm post={post} onRefetch={refetchPost} />
              </AdminBlock>

              <AdminBlock>
                <AdminPaneTitle>{formatMessage(blogMessages.label.deletePost)}</AdminPaneTitle>
                <BlogPostDeletionAdminModal post={post} onRefetch={refetchPost} />
              </AdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane tab={formatMessage(commonMessages.label.roleAdmin)} key="roles">
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.roleAdmin)}</AdminPaneTitle>

              <AdminBlock>
                <AdminBlockTitle>{formatMessage(commonMessages.term.owner)}</AdminBlockTitle>
                <RoleAdminBlock name={member?.name || ''} pictureUrl={member?.pictureUrl || ''} />
              </AdminBlock>

              <AdminBlock>
                <AdminBlockTitle>{formatMessage(commonMessages.term.author)}</AdminBlockTitle>
              </AdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane tab={formatMessage(commonMessages.label.publishSettings)} key="publishing">
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.publishSettings)}</AdminPaneTitle>

              <AdminBlock>
                <AdminPublishBlock
                  type={'ordinary'}
                  title={'title'}
                  description={'description'}
                  checklist={[]}
                  onPublish={() => {}}
                />
              </AdminBlock>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </>
  )
}

export default BlogAdminPage
