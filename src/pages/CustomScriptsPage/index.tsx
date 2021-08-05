import { ExportOutlined } from '@ant-design/icons'
import { Form, Select } from 'antd'
import { AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import { useAuth } from 'lodestar-app-admin/src/contexts/AuthContext'
import LoadingPage from 'lodestar-app-admin/src/pages/LoadingPage'
import NotFoundPage from 'lodestar-app-admin/src/pages/NotFoundPage'
import React, { useState } from 'react'
import DeadlinePracticesBlock from './DeadlinePracticesBlock'
import ExpiringSoonMembersBlock from './ExpiringSoonMembersBlock'
import ExtraPermissionsMembersBlock from './ExtraPermissionsMembersBlock'

const CustomScriptsPage: React.VFC = () => {
  const { isAuthenticating, currentUserRole } = useAuth()
  const [selectedScript, setSelectedScript] = useState('')

  if (isAuthenticating) {
    return <LoadingPage />
  }

  if (currentUserRole !== 'app-owner') {
    return <NotFoundPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <ExportOutlined className="mr-3" />
        <span>自訂腳本</span>
      </AdminPageTitle>

      <Form.Item label="選擇腳本">
        <Select<string> style={{ width: '100%' }} onChange={value => setSelectedScript(value)}>
          <Select.Option value="deadline-practices">實戰營作業</Select.Option>
          <Select.Option value="expiring-soon-members">即將到期的私塾學員</Select.Option>
          <Select.Option value="extra-permissions-members">擁有其他權限的會員</Select.Option>
        </Select>
      </Form.Item>

      {selectedScript === 'deadline-practices' && <DeadlinePracticesBlock />}
      {selectedScript === 'expiring-soon-members' && <ExpiringSoonMembersBlock />}
      {selectedScript === 'extra-permissions-members' && <ExtraPermissionsMembersBlock />}
    </AdminLayout>
  )
}

export default CustomScriptsPage
