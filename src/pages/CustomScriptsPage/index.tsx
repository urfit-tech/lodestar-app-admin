import { ExportOutlined } from '@ant-design/icons'
import { Form, Select } from 'antd'
import { AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import { useAuth } from 'lodestar-app-admin/src/contexts/AuthContext'
import LoadingPage from 'lodestar-app-admin/src/pages/default/LoadingPage'
import NotFoundPage from 'lodestar-app-admin/src/pages/default/NotFoundPage'
import React, { useState } from 'react'
import DeadlinePracticesBlock from './DeadlinePracticesBlock'

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
        </Select>
      </Form.Item>

      {selectedScript === 'deadline-practices' && <DeadlinePracticesBlock />}
    </AdminLayout>
  )
}

export default CustomScriptsPage
