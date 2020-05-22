import { Icon } from 'antd'
import React from 'react'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as ShopIcon } from '../../images/icon/shop.svg'
import { useIntl } from 'react-intl'

const MerchandiseShopCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <ShopIcon />} className="mr-2" />
        <span>{formatMessage(commonMessages.menu.merchandiseShop)}</span>
      </AdminPageTitle>
    </AdminLayout>
  )
}

export default MerchandiseShopCollectionAdminPage
