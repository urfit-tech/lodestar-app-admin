import Icon, { CaretDownOutlined, CaretUpOutlined, DownloadOutlined } from '@ant-design/icons'
import { Button, Input, Skeleton, Tabs } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { AdminPageTitle } from '../components/admin'
import AdminLayout from '../components/layout/AdminLayout'
import MemberShopSelector from '../components/merchandise/MemberShopSelector'
import OrderPhysicalProductCollectionBlock from '../components/shipping/OrderPhysicalProductCollectionBlock'
import { downloadCSV, toCSV } from '../helpers'
import { commonMessages, merchandiseMessages } from '../helpers/translation'
import { useOrderPhysicalProductLog } from '../hooks/data'
import { ReactComponent as ShopIcon } from '../images/icon/shop.svg'

const messages = defineMessages({
  allShop: { id: 'common.label.allShop', defaultMessage: '全部商店' },
  noMerchandiseOrder: { id: 'merchandise.ui.noMerchandiseOrder', defaultMessage: '沒有任何商品紀錄' },
  exportShippingList: { id: 'merchandise.ui.exportShippingList', defaultMessage: '匯出總表' },
  shippingStoreName: { id: 'merchandise.ui.shippingStoreName', defaultMessage: '收件門市' },
  shippingSpecification: { id: 'merchandise.ui.shippingSpecification', defaultMessage: '商品規格與備註' },
  orderLogsTimeSort: { id: 'common.ui.orderLogsTimeSort', defaultMessage: '下單時間排序' },
})

const ShippingAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { isAuthenticating, currentMemberId, permissions } = useAuth()
  const { loading, orderPhysicalProductLogs, refetch } = useOrderPhysicalProductLog(
    permissions.SHIPPING_ADMIN ? undefined : permissions.SHIPPING_NORMAL ? currentMemberId || '' : '',
  )
  const [searchText, setSearchText] = useState('')
  const [selectedShopId, setSelectedShopId] = useState('')
  const [activeKey, setActiveKey] = useState('shipping')
  const [isPaidAtDesc, setIsPaidAtDesc] = useState(false)

  const filteredProductLogs = orderPhysicalProductLogs
    .filter(orderPhysicalProductLog =>
      orderPhysicalProductLog.orderPhysicalProducts.some(
        orderPhysicalProduct =>
          orderPhysicalProduct.key.toLowerCase().includes(searchText) &&
          (selectedShopId ? orderPhysicalProduct.memberShopId === selectedShopId : true),
      ),
    )
    .sort((a, b) => {
      const condition = new Date(a.lastPaidAt).valueOf() - new Date(b.lastPaidAt).valueOf()
      return isPaidAtDesc ? condition : -condition
    })

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
        formatMessage(commonMessages.label.orderLogId),
        formatMessage(commonMessages.label.orderLogMemberName),
        formatMessage(commonMessages.label.orderProductName),
        formatMessage(merchandiseMessages.label.quantity),
        formatMessage(merchandiseMessages.label.shippingMethod),
        formatMessage(messages.shippingStoreName),
        formatMessage(merchandiseMessages.label.shippingName),
        formatMessage(merchandiseMessages.label.shippingPhone),
        formatMessage(merchandiseMessages.label.shippingAddress),
        formatMessage(messages.shippingSpecification),
        formatMessage(commonMessages.label.invoiceName),
        formatMessage(commonMessages.label.invoiceEmail),
        formatMessage(commonMessages.label.invoicePhone),
        formatMessage(commonMessages.label.invoiceTarget),
        formatMessage(commonMessages.label.invoiceDonationCode),
        formatMessage(commonMessages.label.invoiceCarrier),
        formatMessage(commonMessages.label.invoiceUniformNumber),
        formatMessage(commonMessages.label.invoiceUniformTitle),
        formatMessage(commonMessages.label.invoiceAddress),
        formatMessage(commonMessages.label.invoiceId),
        formatMessage(commonMessages.label.invoiceStatus),
      ],
    ]

    tabContents
      .filter(tabContent => tabContent.key === activeKey)[0]
      .orderPhysicalProductLogs.forEach(({ id, member, orderPhysicalProducts, invoice, shipping }) => {
        orderPhysicalProducts.forEach(orderPhysicalProduct => {
          data.push([
            id,
            member,
            orderPhysicalProduct.name,
            `${orderPhysicalProduct.quantity}`,
            shipping?.shippingMethod || '',
            shipping?.storeName || '',
            shipping?.name || '',
            shipping?.phone || '',
            shipping?.address || '',
            shipping?.specification || '',
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
            invoice?.status || '',
          ])
        })
      })
    downloadCSV(`${activeKey}_.csv`, toCSV(data))
  }
  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <ShopIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.shipping)}</span>
      </AdminPageTitle>

      <div className="d-flex flex-wrap justify-content-between mb-4">
        <div className="d-flex flex-wrap px-0 col-12 col-md-8 mb-2 mb-md-0">
          <div className="col-12 col-sm-4 mb-2 mb-sm-0 px-0 pr-sm-3">
            <MemberShopSelector
              value={selectedShopId}
              allText={formatMessage(messages.allShop)}
              onChange={shopId => setSelectedShopId(shopId)}
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
      <div className="d-flex flex-row-reverse mb-4">
        <div className="cursor-pointer" onClick={() => setIsPaidAtDesc(!isPaidAtDesc)}>
          {formatMessage(messages.orderLogsTimeSort)}
          <span className="mr-2"></span>
          {isPaidAtDesc ? <CaretDownOutlined /> : <CaretUpOutlined />}
        </div>
      </div>

      <Tabs onChange={key => setActiveKey(key)}>
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={`${tabContent.name} (${tabContent.orderPhysicalProductLogs.length})`}>
            {loading || isAuthenticating ? (
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
