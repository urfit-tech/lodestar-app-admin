import Icon from '@ant-design/icons'
import { Tabs } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Redirect } from 'react-router-dom'
import { AdminPageTitle } from '../../../components/admin'
import CreatorCollectionAdminTable from '../../../components/creator/CreatorCollectionAdminTable'
import AdminLayout from '../../../components/layout/AdminLayout'
import { useApp } from '../../../contexts/AppContext'
import { useAuth } from '../../../contexts/AuthContext'
import { commonMessages } from '../../../helpers/translation'
import { useCreator } from '../../../hooks/creators'
import { ReactComponent as CalendarAltIcon } from '../../../images/icon/calendar-alt.svg'
import LoadingPage from '../LoadingPage'

const messages = defineMessages({
  published: { id: 'creator.label.published', defaultMessage: '已公開 ({count})' },
  hidden: { id: 'creator.label.hidden', defaultMessage: '隱藏 ({count})' },
})

const CreatorCollectionAdminPage: React.FC<{}> = () => {
  const { formatMessage } = useIntl()
  const { loading, enabledModules } = useApp()
  const { isAuthenticating, currentUserRole } = useAuth()
  const { creators } = useCreator()

  if (loading || isAuthenticating) {
    return <LoadingPage />
  }

  if (!enabledModules.creator_display || currentUserRole === 'content-creator') {
    return <Redirect to="/studio/sales" />
  }

  const tabContents = [
    {
      key: 'published',
      tab: formatMessage(messages.published, { count: creators.filter(v => v.isPublished).length }),
      creators: creators.filter(v => v.isPublished),
    },
    {
      key: 'hidden',
      tab: formatMessage(messages.hidden, { count: creators.filter(v => !v.isPublished).length }),
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
            <CreatorCollectionAdminTable creators={v.creators} />
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export default CreatorCollectionAdminPage
