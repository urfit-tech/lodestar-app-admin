import { UserOutlined } from '@ant-design/icons'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import { commonMessages } from '../../helpers/translation'

const NoteCollectionPage: React.FC = () => {
  const { formatMessage } = useIntl()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <UserOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.noteAdmin)}</span>
      </AdminPageTitle>
    </AdminLayout>
  )
}

export default NoteCollectionPage
