import { FileTextFilled } from '@ant-design/icons'
import { Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { StringParam, useQueryParam } from 'use-query-params'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import ForbiddenPage from '../ForbiddenPage'
import LoadingPage from '../LoadingPage'
import pageMessages from '../translation'
import ProgramPackageProcessBlock from './ProgramPackageProcessBlock'
import ProgramProcessBlock from './ProgramProcessBlock'

const ProgramProgressCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId, permissions } = useAuth()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const { enabledModules, loading } = useApp()

  if (!currentMemberId || loading) {
    return <LoadingPage />
  }

  if (!enabledModules.learning_statistics && !permissions.PROGRAM_PROGRESS_READ) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-5">
        <FileTextFilled className="mr-3" />
        <span>{formatMessage(pageMessages.ProgramProgressCollectionAdminPage.programProgress)}</span>
      </AdminPageTitle>

      <Tabs
        defaultActiveKey="programPackage"
        activeKey={activeKey || 'programPackage'}
        onChange={key => setActiveKey(key)}
      >
        <Tabs.TabPane key="program" tab={formatMessage(pageMessages['*'].program)}>
          <ProgramProcessBlock />
        </Tabs.TabPane>
        <Tabs.TabPane key="programPackage" tab={formatMessage(pageMessages['*'].programPackage)}>
          <ProgramPackageProcessBlock />
        </Tabs.TabPane>
      </Tabs>
    </AdminLayout>
  )
}

export default ProgramProgressCollectionAdminPage
