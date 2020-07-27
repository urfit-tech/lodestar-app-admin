import Icon from '@ant-design/icons'
import { Input, Skeleton, Tabs } from 'antd'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import OrderPhysicalProductCollectionBlock from '../../components/shipping/OrderPhysicalProductCollectionBlock'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { useOrderPhysicalProductLog } from '../../hooks/data'
import { ReactComponent as ShopIcon } from '../../images/icon/shop.svg'

const messages = defineMessages({
  noMerchandiseOrder: { id: 'merchandise.ui.noMerchandiseOrder', defaultMessage: '沒有任何商品紀錄' },
})

const ShippingAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { loading, orderPhysicalProductLogs, refetch } = useOrderPhysicalProductLog()
  const [searchText, setSearchText] = useState('')

  const tabContents = [
    {
      key: 'shipping',
      name: formatMessage(merchandiseMessages.status.shipping),
      orderPhysicalProductLogs: orderPhysicalProductLogs.filter(
        orderPhysicalProductLog => !orderPhysicalProductLog.deliveredAt,
      ),
    },
    {
      key: 'shipped',
      name: formatMessage(merchandiseMessages.status.shipped),
      orderPhysicalProductLogs: orderPhysicalProductLogs.filter(
        orderPhysicalProductLog => orderPhysicalProductLog.deliveredAt,
      ),
    },
  ]

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <ShopIcon />} className="mr-2" />
        <span>{formatMessage(commonMessages.menu.shipping)}</span>
      </AdminPageTitle>
      <div className="row">
        <div className="col-12 col-lg-4 mb-4">
          <Input.Search
            placeholder={formatMessage(merchandiseMessages.text.searchMerchandiseOrder)}
            onChange={e => setSearchText(e.target.value.toLowerCase())}
          />
        </div>
      </div>

      <Tabs>
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={`${tabContent.name} (${tabContent.orderPhysicalProductLogs.length})`}>
            {loading ? (
              <Skeleton active />
            ) : tabContent.orderPhysicalProductLogs.length === 0 ? (
              formatMessage(messages.noMerchandiseOrder)
            ) : (
              <OrderPhysicalProductCollectionBlock
                orderPhysicalProductLogs={tabContent.orderPhysicalProductLogs}
                searchText={searchText}
                onRefetch={refetch}
              />
            )}
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export default ShippingAdminPage
