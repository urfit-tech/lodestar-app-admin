import Icon, { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Layout, Menu, Skeleton } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Link, useParams } from 'react-router-dom'
import { AdminBlock, AdminBlockTitle, AdminHeader, AdminHeaderTitle, AdminPaneTitle } from '../../components/admin'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import ShippingMethodAdminBlock from '../../components/merchandise/ShippingMethodAdminBlock'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { useMemberShop } from '../../hooks/merchandise'
import { ReactComponent as ShopIcon } from '../../images/icon/shop.svg'
import { MemberShopAdminMenu } from './MemberShopAdminPage'

const messages = defineMessages({
  settingsAdmin: { id: 'merchandise.label.settingsAdmin', defaultMessage: '商店資訊' },
  shippingMethodsAdmin: { id: 'merchandise.label.shippingMethodsAdmin', defaultMessage: '物流設定' },
  publishAdmin: { id: 'merchandise.label.publishAdmin', defaultMessage: '啟用設定' },

  basicSettings: { id: 'merchandise.label.basicSettings', defaultMessage: '基本設定' },
  shippingMethod: { id: 'merchandise.label.shippingMethod', defaultMessage: '寄送方式' },
})

const MemberShopAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { shopId } = useParams<{ shopId: string }>()
  const { memberShop, refetchMemberShop } = useMemberShop(shopId)

  return (
    <>
      <AdminHeader>
        <Link to="/member-shops">
          <Button type="link" className="mr-3">
            <ArrowLeftOutlined />
          </Button>
        </Link>

        <AdminHeaderTitle>{memberShop?.title || shopId}</AdminHeaderTitle>
      </AdminHeader>

      <Layout>
        <Layout.Sider width="320">
          <MemberShopAdminMenu mode="inline" defaultOpenKeys={['owner_merchandise', 'owner_member_shop_setting']}>
            <Menu.SubMenu
              key="owner_merchandise"
              title={
                <span>
                  <Icon component={() => <ShopIcon />} />
                  <span>{formatMessage(commonMessages.menu.merchandiseAdmin)}</span>
                </span>
              }
            >
              <Menu.Item key="merchandise_shop">{formatMessage(commonMessages.menu.merchandises)}</Menu.Item>
            </Menu.SubMenu>

            <Menu.SubMenu
              key="owner_member_shop_setting"
              title={
                <span>
                  <Icon component={() => <ShopIcon />} />
                  <span>{formatMessage(merchandiseMessages.menu.memberShopSetting)}</span>
                </span>
              }
            >
              <Menu.Item key="merchandise_shop_info">
                {formatMessage(merchandiseMessages.menu.memberShopInfo)}
              </Menu.Item>
              <Menu.Item key="merchandise_shop_shipping_methods">
                {formatMessage(messages.shippingMethodsAdmin)}
              </Menu.Item>
              <Menu.Item key="merchandise_shop_publish">{formatMessage(messages.publishAdmin)}</Menu.Item>
            </Menu.SubMenu>
          </MemberShopAdminMenu>
        </Layout.Sider>

        <StyledLayoutContent variant="gray">
          <div className="container p-5">
            <AdminPaneTitle>{formatMessage(messages.shippingMethodsAdmin)}</AdminPaneTitle>
            <AdminBlock>
              <AdminBlockTitle>{formatMessage(messages.shippingMethod)}</AdminBlockTitle>
              {memberShop ? (
                <ShippingMethodAdminBlock memberShop={memberShop} refetch={refetchMemberShop} />
              ) : (
                <Skeleton active />
              )}
            </AdminBlock>
          </div>
        </StyledLayoutContent>
      </Layout>
    </>
  )
}

export default MemberShopAdminPage
