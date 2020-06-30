import { Button, Icon, Skeleton, Tabs } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import useRouter from 'use-react-router'
import {
  AdminBlock,
  AdminBlockTitle,
  AdminHeader,
  AdminHeaderTitle,
  AdminPaneTitle,
  AdminTabBarWrapper,
} from '../../components/admin'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import MemberShopBasicForm from '../../components/merchandise/MemberShopBasicForm'
import MemberShopPublishBlock from '../../components/merchandise/MemberShopPublishBlock'
import ShippingMethodAdminBlock from '../../components/merchandise/ShippingMethodAdminBlock'
import { useMemberShop } from '../../hooks/merchandise'

const messages = defineMessages({
  settingsAdmin: { id: 'merchandise.label.settingsAdmin', defaultMessage: '賣場資訊' },
  shippingMethodsAdmin: { id: 'merchandise.label.shippingMethodsAdmin', defaultMessage: '物流設定' },
  publishAdmin: { id: 'merchandise.label.publishAdmin', defaultMessage: '啟用設定' },

  basicSettings: { id: 'merchandise.label.basicSettings', defaultMessage: '基本設定' },
  shippingMethod: { id: 'merchandise.label.shippingMethod', defaultMessage: '寄送方式' },
})

const MemberShopAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { match } = useRouter<{ shopId: string }>()
  const shopId = match.params.shopId
  const { memberShop, refetchMemberShop } = useMemberShop(shopId)
  const [activeKey, setActiveKey] = useQueryParam('tabKey', StringParam)

  return (
    <>
      <AdminHeader>
        <Link to="/member-shops">
          <Button type="link" className="mr-3">
            <Icon type="arrow-left" />
          </Button>
        </Link>

        <AdminHeaderTitle>{memberShop?.title || shopId}</AdminHeaderTitle>
      </AdminHeader>

      <StyledLayoutContent variant="gray">
        <Tabs
          activeKey={activeKey || 'settings'}
          onChange={key => setActiveKey(key)}
          renderTabBar={(props, DefaultTabBar) => (
            <AdminTabBarWrapper>
              <DefaultTabBar {...props} />
            </AdminTabBarWrapper>
          )}
        >
          <Tabs.TabPane key="settings" tab={formatMessage(messages.settingsAdmin)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(messages.settingsAdmin)}</AdminPaneTitle>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(messages.basicSettings)}</AdminBlockTitle>
                {memberShop ? (
                  <MemberShopBasicForm memberShop={memberShop} refetch={refetchMemberShop} />
                ) : (
                  <Skeleton active />
                )}
              </AdminBlock>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane key="shipping-methods" tab={formatMessage(messages.shippingMethodsAdmin)}>
            <div className="container py-5">
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
          </Tabs.TabPane>
          <Tabs.TabPane key="publish" tab={formatMessage(messages.publishAdmin)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(messages.publishAdmin)}</AdminPaneTitle>
              <AdminBlock>
                {memberShop ? (
                  <MemberShopPublishBlock memberShop={memberShop} refetch={refetchMemberShop} />
                ) : (
                  <Skeleton active />
                )}
              </AdminBlock>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </StyledLayoutContent>
    </>
  )
}

export default MemberShopAdminPage
