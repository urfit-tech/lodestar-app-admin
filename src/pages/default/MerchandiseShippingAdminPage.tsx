import { Icon } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as ShopIcon } from '../../images/icon/shop.svg'

const MerchandiseShippingAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <ShopIcon />} className="mr-2" />
        <span>{formatMessage(commonMessages.menu.merchandiseShipping)}</span>
      </AdminPageTitle>
    </AdminLayout>
  )
}

export default MerchandiseShippingAdminPage
