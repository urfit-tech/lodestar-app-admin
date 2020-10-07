import Icon, { DownloadOutlined } from '@ant-design/icons'
import { Button, Input, Skeleton, Tabs } from 'antd'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import MemberShopSelector from '../../components/merchandise/MemberShopSelector'
import OrderPhysicalProductCollectionBlock from '../../components/shipping/OrderPhysicalProductCollectionBlock'
import { downloadCSV, toCSV } from '../../helpers'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { useOrderPhysicalProductLog } from '../../hooks/data'
import { ReactComponent as ShopIcon } from '../../images/icon/shop.svg'

const messages = defineMessages({
  allShop: { id: 'common.label.allShop', defaultMessage: '全部商店' },
  noMerchandiseOrder: { id: 'merchandise.ui.noMerchandiseOrder', defaultMessage: '沒有任何商品紀錄' },
  exportShippingList: { id: 'merchandise.ui.exportShippingList', defaultMessage: '匯出總表' },
})

const ShippingAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { loading, orderPhysicalProductLogs, refetch } = useOrderPhysicalProductLog()
  const [searchText, setSearchText] = useState('')
  const [selectedShopId, setSelectedShopId] = useState<string>('')
  const [tapActiveKey, setTapActiveKey] = useState<string>('shipping')

  const filteredProductLogs = orderPhysicalProductLogs.filter(orderPhysicalProductLog =>
    orderPhysicalProductLog.orderPhysicalProducts.some(
      orderPhysicalProduct =>
        orderPhysicalProduct.key.toLowerCase().includes(searchText) &&
        (selectedShopId ? orderPhysicalProduct.memberShopId === selectedShopId : true),
    ),
  )
  const tabContents = [
    {
      key: 'shipping',
      name: formatMessage(merchandiseMessages.status.shipping),
      orderPhysicalProductLogs: filteredProductLogs.filter(
        orderPhysicalProductLog => !orderPhysicalProductLog.deliveredAt,
      ),
    },
    {
      key: 'shipped',
      name: formatMessage(merchandiseMessages.status.shipped),
      orderPhysicalProductLogs: filteredProductLogs.filter(
        orderPhysicalProductLog => orderPhysicalProductLog.deliveredAt,
      ),
    },
  ]

  const exportShippingList = () => {
    const data: string[][] = [
      [
        '訂單編號',
        '會員姓名',
        '項目名稱',
        '數量',
        formatMessage(merchandiseMessages.ui.shippingMethod),
        '收件門市',
        formatMessage(merchandiseMessages.ui.shippingName),
        formatMessage(merchandiseMessages.ui.shippingPhone),
        formatMessage(merchandiseMessages.ui.shippingAddress),
        '商品規格與備註',
        '發票姓名',
        '發票信箱',
        '發票電話',
        '發票對象',
        '發票捐贈碼',
        '發票載具',
        '發票統編',
        '發票抬頭',
        '發票地址',
        '發票編號',
        '發票狀態',
      ],
    ]

    tabContents
      .filter(tabContent => tabContent.key === tapActiveKey)[0]
      .orderPhysicalProductLogs.forEach(({ id, member, orderPhysicalProducts, invoice, shipping }) => {
        orderPhysicalProducts.forEach(orderPhysicalProduct => {
          data.push([
            id,
            member,
            orderPhysicalProduct.name,
            `${orderPhysicalProduct.quantity}`,
            shipping.shippingMethod,
            shipping.storeName || '',
            shipping.name,
            shipping.phone,
            shipping.address,
            orderPhysicalProduct.description || '',
            invoice.name,
            invoice.email,
            invoice.phone,
            '',
            invoice?.donationCode || '',
            '',
            '',
            '',
            invoice?.address || '',
            '',
            '發票狀態',
          ])
        })
      })
    downloadCSV(`${tapActiveKey}_.csv`, toCSV(data))
  }
  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <ShopIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.shipping)}</span>
      </AdminPageTitle>

      <div className="row mx-0 justify-content-between mb-4">
        <div className="row mx-0 px-0 col-12 col-md-8 mb-2 mb-md-0">
          <div className="col-12 col-sm-4 mb-2 mb-sm-0 px-0 pr-sm-3">
            <MemberShopSelector
              value={selectedShopId}
              allText={formatMessage(messages.allShop)}
              onChange={shopId => setSelectedShopId(`${shopId}`)}
            />
          </div>
          <div className="col-12 col-sm-8 px-0">
            <Input.Search
              placeholder={formatMessage(merchandiseMessages.text.searchMerchandiseOrder)}
              onChange={e => setSearchText(e.target.value.toLowerCase())}
            />
          </div>
        </div>

        <Button icon={<DownloadOutlined />} onClick={() => exportShippingList()}>
          {formatMessage(messages.exportShippingList)}
        </Button>
      </div>

      <Tabs
        onChange={activeKey => {
          setTapActiveKey(activeKey)
        }}
      >
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={`${tabContent.name} (${tabContent.orderPhysicalProductLogs.length})`}>
            {loading ? (
              <Skeleton active />
            ) : tabContent.orderPhysicalProductLogs.length === 0 ? (
              formatMessage(messages.noMerchandiseOrder)
            ) : (
              <OrderPhysicalProductCollectionBlock
                orderPhysicalProductLogs={tabContent.orderPhysicalProductLogs}
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
