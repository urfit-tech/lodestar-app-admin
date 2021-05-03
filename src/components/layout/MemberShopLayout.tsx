import Icon, { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Layout } from 'antd'
import Menu, { MenuProps } from 'antd/lib/menu'
import { MenuClickEventHandler } from 'rc-menu/lib/interface'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Link, useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages, errorMessages, merchandiseMessages } from '../../helpers/translation'
import { useRouteKeys } from '../../hooks/util'
import DefaultAvatar from '../../images/default/avatar.svg'
import { ReactComponent as ShopIcon } from '../../images/icon/shop.svg'
import { routesProps } from '../../Routes'
import { StyledMenu } from '../admin/AdminMenu'
import { CustomRatioImage } from '../common/Image'
import { DefaultLayoutHeader, StyledLayoutContent } from './DefaultLayout'

const messages = defineMessages({
  settingsAdmin: { id: 'merchandise.label.settingsAdmin', defaultMessage: '商店資訊' },
  shippingMethodsAdmin: { id: 'merchandise.label.shippingMethodsAdmin', defaultMessage: '物流設定' },
  publishAdmin: { id: 'merchandise.label.publishAdmin', defaultMessage: '啟用設定' },
  basicSettings: { id: 'merchandise.label.basicSettings', defaultMessage: '基本設定' },
  shippingMethod: { id: 'merchandise.label.shippingMethod', defaultMessage: '寄送方式' },
})

const StyledMemberInfo = styled.div`
  border-bottom: 1px solid var(--gray-light);
  padding: 0.5rem 1.5rem 1.5rem;
`

const StyledMemberName = styled.div`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: var(--gray-dark);
`

const StyledMemberShopTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
`

const StyledButton = styled(Button)`
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-darker);
  letter-spacing: 0.4px;
`

const MemberShopAdminMenu: React.FC<MenuProps> = ({ children, ...menuProps }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { shopId } = useParams<{ shopId: string }>()

  const handleClick: MenuClickEventHandler = ({ key }) => {
    if (typeof key === 'string' && key.startsWith('_blank')) {
    } else {
      const route = routesProps[key]
      route ? history.push(route.path.replace(':shopId', shopId)) : alert(formatMessage(errorMessages.route.notFound))
    }
  }

  return (
    <StyledMenu mode="inline" {...menuProps} onClick={handleClick}>
      {children}
    </StyledMenu>
  )
}

const MemberShopLayout: React.FC<{
  memberShopTitle: string
  member: { id: string; name: string; pictureUrl: string | null }
}> = ({ memberShopTitle, member, children }) => {
  const defaultSelectedKeys = useRouteKeys()
  const { currentUserRole } = useAuth()
  const { formatMessage } = useIntl()

  return (
    <>
      <DefaultLayoutHeader
        renderTitle={() => (
          <Link to={`/`} className="d-flex">
            <Button type="link">
              {currentUserRole === 'app-owner'
                ? formatMessage(commonMessages.ui.ownerBackstage)
                : currentUserRole === 'content-creator'
                ? formatMessage(commonMessages.ui.creatorStudio)
                : null}
            </Button>
          </Link>
        )}
      />
      <Layout>
        <Layout.Sider width="320">
          <Link to="/member-shops">
            <StyledButton type="link">
              <Icon component={() => <ArrowLeftOutlined />} />
              <span className="mr-2">{formatMessage(commonMessages.ui.back)}</span>
            </StyledButton>
          </Link>

          <StyledMemberInfo className="d-flex align-items-start">
            <CustomRatioImage
              className="flex-shrink-0"
              width="3rem"
              ratio={1}
              src={member.pictureUrl || DefaultAvatar}
              shape="circle"
            />
            <div className="ml-3 flex-grow-1">
              <StyledMemberName>{member.name}</StyledMemberName>
              <StyledMemberShopTitle>{memberShopTitle}</StyledMemberShopTitle>
            </div>
          </StyledMemberInfo>

          <MemberShopAdminMenu
            mode="inline"
            defaultOpenKeys={['owner_merchandise', 'owner_member_shop_setting']}
            defaultSelectedKeys={defaultSelectedKeys}
          >
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
          <div className="container p-5">{children}</div>
        </StyledLayoutContent>
      </Layout>
    </>
  )
}

export default MemberShopLayout
