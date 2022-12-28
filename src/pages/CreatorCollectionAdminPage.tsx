import Icon from '@ant-design/icons'
import { Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Redirect } from 'react-router-dom'
import { AdminPageTitle } from '../components/admin'
import AdminCard from '../components/admin/AdminCard'
import CreatorCollectionAdminTable from '../components/creator/CreatorCollectionAdminTable'
import AdminLayout from '../components/layout/AdminLayout'
import { commonMessages } from '../helpers/translation'
import { useCreator } from '../hooks/creators'
import { ReactComponent as CalendarAltIcon } from '../images/icon/calendar-alt.svg'
import LoadingPage from './LoadingPage'

const messages = defineMessages({
  publishedCreators: { id: 'common.label.publishedCreators', defaultMessage: '已公開 ({count})' },
  hiddenCreators: { id: 'common.label.hiddenCreators', defaultMessage: '隱藏 ({count})' },
})

const CreatorCollectionAdminPage: React.FC<{}> = () => {
  const { formatMessage } = useIntl()
  const { loading, enabledModules } = useApp()
  const { isAuthenticating, currentUserRole, authToken } = useAuth()
  const { creators, refetchCreators } = useCreator()

  if (loading || (isAuthenticating && !authToken)) {
    return <LoadingPage />
  }

  if (!enabledModules.creator_display || currentUserRole === 'content-creator') {
    return <Redirect to="/studio/sales" />
  }

  const tabContents = [
    {
      key: 'published',
      tab: formatMessage(messages.publishedCreators, { count: creators.filter(v => v.isPublished).length }),
      creators: creators.filter(v => v.isPublished),
    },
    {
      key: 'hidden',
      tab: formatMessage(messages.hiddenCreators, { count: creators.filter(v => !v.isPublished).length }),
      creators: creators.filter(v => !v.isPublished),
    },
  ]

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <CalendarAltIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.creatorDisplayManagement)}</span>
      </AdminPageTitle>

      <Tabs defaultActiveKey="published">
        {tabContents.map(v => (
          <Tabs.TabPane key={v.key} tab={v.tab}>
            <AdminCard>
              <CreatorCollectionAdminTable creators={v.creators} onRefetch={refetchCreators} />
            </AdminCard>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export default CreatorCollectionAdminPage
