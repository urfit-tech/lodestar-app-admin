import Icon from '@ant-design/icons'
import { AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import { ReactComponent as PhoneIcon } from 'lodestar-app-admin/src/images/icon/phone.svg'
import React from 'react'
import { useIntl } from 'react-intl'
import { salesMessages } from '../helpers/translation'

const SalesCallPage: React.FC = () => {
  const { formatMessage } = useIntl()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon className="mr-3" component={() => <PhoneIcon />} />
        <span>{formatMessage(salesMessages.label.salesCall)}</span>
      </AdminPageTitle>
    </AdminLayout>
  )
}

export default SalesCallPage
