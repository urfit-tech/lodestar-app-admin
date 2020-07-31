import Icon from '@ant-design/icons'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../../components/admin'
import AdminLayout from '../../../components/layout/AdminLayout'
import { commonMessages } from '../../../helpers/translation'
import { ReactComponent as PointIcon } from '../../../images/icon/point.svg'

const PointHistoryAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <PointIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.pointHistory)}</span>
      </AdminPageTitle>
    </AdminLayout>
  )
}

export default PointHistoryAdminPage
