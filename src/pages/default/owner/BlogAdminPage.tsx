import { Button, PageHeader, Tabs } from 'antd'
import React, { useContext, useEffect } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import useRouter from 'use-react-router'
import BlogPostAdminPane from '../../../components/blog/BlogPostAdminPane'
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
  const { data: post, refetch: refetchPost } = usePost(postId)
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
            <BlogPostAdminPane post={post} onRefetch={refetchPost} />
          </Tabs.TabPane>
          {/* <Tabs.TabPane tab={formatMessage(blogMessages.label.postManagement)} key="general">
            <BlogSettingAdminPane post={post} onRefetch={refetchPost} />
          </Tabs.TabPane>
          <Tabs.TabPane tab={formatMessage(commonMessages.label.roleAdmin)} key="roles">
            <BlogRoleAdminPane post={post} onRefetch={refetchPost} />
          </Tabs.TabPane>
          <Tabs.TabPane tab={formatMessage(commonMessages.label.publishSettings)} key="publishing">
            <BlogPublishingAdminPane post={post} onRefetch={refetchPost} />
          </Tabs.TabPane> */}
        </Tabs>
      </div>
    </>
  )
}

export default ProgramAdminPage
