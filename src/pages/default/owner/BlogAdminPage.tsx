import { Button, PageHeader, Tabs } from 'antd'
import React, { useContext, useEffect } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import useRouter from 'use-react-router'
import { AdminBlock, AdminBlockTitle, AdminPaneTitle } from '../../../components/admin'
import BlogPostBasicAdminForm from '../../../components/blog/BlogPostBasicAdminForm'
import BlogPostContentAdminForm from '../../../components/blog/BlogPostContentAdminForm'
import BlogPostDeletionAdminModal from '../../../components/blog/BlogPostDeletionAdminModal'
import BlogPostSettingAdminForm from '../../../components/blog/BlogPostSettingAdminForm'
import BlogPostVideoAdminForm from '../../../components/blog/BlogPostVideoAdminForm'
import AppContext from '../../../contexts/AppContext'
import { blogMessages, commonMessages } from '../../../helpers/translation'
import { usePost } from '../../../hooks/blog'

const StyledPageHeader = styled(PageHeader)`
  && {
    padding: 10px 24px;
    height: 64px;
  }

  .ant-page-header-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ant-page-header-heading-title {
    flex-grow: 1;
    font-size: 16px;
  }

  .ant-page-header-heading-extra {
    width: auto;
    padding: 0;
  }
`

const ProgramAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { history, match } = useRouter<{ postId: string }>()
  const postId = match.params.postId
  const { post, refetch: refetchPost } = usePost(postId)
  const [active, setActive] = useQueryParam('active', StringParam)
  const app = useContext(AppContext)

  useEffect(() => {
    !active && setActive('content')
  }, [active, setActive])

  return (
    <>
      <StyledPageHeader
        onBack={() => history.push('/admin/blog')}
        title={post.title}
        extra={
          post && (
            <a href={`https://${app.settings['host']}/posts/${post.id}`} target="_blank" rel="noopener noreferrer">
              <Button>{formatMessage(commonMessages.ui.preview)}</Button>
            </a>
          )
        }
      />

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

          {/* <Tabs.TabPane tab={formatMessage(commonMessages.label.roleAdmin)} key="roles">
            <BlogRoleAdminPane post={post} onRefetch={refetchPost} />
          </Tabs.TabPane> */}
          {/* <Tabs.TabPane tab={formatMessage(commonMessages.label.publishSettings)} key="publishing">
            <BlogPublishingAdminPane post={post} onRefetch={refetchPost} />
          </Tabs.TabPane> */}
        </Tabs>
      </div>
    </>
  )
}

export default ProgramAdminPage
