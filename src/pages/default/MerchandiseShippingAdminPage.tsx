import { Icon, Input, Tabs } from 'antd'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import MerchandiseOrderCollectionBlock from '../../components/merchandise/MerchandiseOrderCollectionBlock'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { useMerchandiseOrderLogCollection } from '../../hooks/merchandise'
import { ReactComponent as ShopIcon } from '../../images/icon/shop.svg'

const messages = defineMessages({
  noMerchandiseOrder: { id: 'merchandise.ui.noMerchandiseOrder', defaultMessage: '沒有任何商品記錄' },
})

const MerchandiseShippingAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { merchandiseOrderLogs, refetch } = useMerchandiseOrderLogCollection()
  const [searchText, setSearchText] = useState('')

  const tabContents = [
    {
      key: 'shipping',
      name: formatMessage(merchandiseMessages.status.shipping),
      merchandiseOrderLogs: merchandiseOrderLogs.filter(merchandiseOrderLog => !merchandiseOrderLog.deliveredAt),
    },
    {
      key: 'shipped',
      name: formatMessage(merchandiseMessages.status.shipped),
      merchandiseOrderLogs: merchandiseOrderLogs.filter(merchandiseOrderLog => merchandiseOrderLog.deliveredAt),
    },
  ]

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <ShopIcon />} className="mr-2" />
        <span>{formatMessage(commonMessages.menu.merchandiseShipping)}</span>
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
          <Tabs.TabPane key={tabContent.key} tab={`${tabContent.name} (${tabContent.merchandiseOrderLogs.length})`}>
            {tabContent.merchandiseOrderLogs.length ? (
              <MerchandiseOrderCollectionBlock
                merchandiseOrderLogs={tabContent.merchandiseOrderLogs}
                searchText={searchText}
                onRefetch={refetch}
              />
            ) : (
              formatMessage(messages.noMerchandiseOrder)
            )}
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export default MerchandiseShippingAdminPage
