import { Icon, Menu, Tag, Typography } from 'antd'
import { ClickParam, MenuProps } from 'antd/lib/menu'
import React from 'react'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import { useEnrolledMembershipCardIds } from '../../hooks/card'
import { ReactComponent as BookIcon } from '../../images/default/book.svg'
import { ReactComponent as CalendarAltIcon } from '../../images/default/calendar-alt.svg'
import { ReactComponent as ClipboardListIcon } from '../../images/default/clipboard-list.svg'
import { ReactComponent as CommentsIcon } from '../../images/default/comments.svg'
import { ReactComponent as GiftIcon } from '../../images/default/gift.svg'
import { ReactComponent as MembercardIcon } from '../../images/default/membercard.svg'
import { ReactComponent as MicrophoneIcon } from '../../images/default/microphone.svg'
import { ReactComponent as PointIcon } from '../../images/default/point.svg'
import { ReactComponent as TicketIcon } from '../../images/default/ticket.svg'
import { ReactComponent as UserIcon } from '../../images/default/user.svg'
import { routesProps } from '../../Routes'
import settings from '../../settings'
import { useAuth } from '../auth/AuthContext'

const StyledMenu = styled(Menu)`
  && {
    border-right: none;
  }
`

const AdminMenu: React.FC<MenuProps> = ({ children, ...menuProps }) => {
  const { history } = useRouter()
  const handleClick = ({ key, item }: ClickParam) => {
    if (key.startsWith('_blank')) {
      window.open(item.props['data-href'])
    } else {
      const route = routesProps[key]
      route ? history.push(route.path) : alert('無此路徑')
    }
  }
  return (
    <StyledMenu {...menuProps} mode="inline" onClick={handleClick}>
      {children}
    </StyledMenu>
  )
}

export const OwnerAdminMenu = (props: MenuProps) => (
  <div className="d-flex flex-column flex-grow-1">
    <div className="p-3">
      <Tag style={{ border: '0px' }}>管理者</Tag>
    </div>
    <AdminMenu {...props} defaultOpenKeys={['owner_promotion_admin', 'owner_podcast_admin']}>
      <Menu.Item key="owner_sales_admin">
        <Icon type="dollar" className="mr-2" />
        <span>銷售管理</span>
      </Menu.Item>
      {/* <Menu.Item key="owner_point_admin">點數設定</Menu.Item> */}

      <Menu.SubMenu
        key="owner_promotion_admin"
        title={
          <>
            <Icon type="shopping" />
            <Typography.Text>促銷管理</Typography.Text>
          </>
        }
      >
        <Menu.Item key="owner_coupon_plans_admin">
          <span>折價方案</span>
        </Menu.Item>
        {process.env.REACT_APP_MODULE_VOUCHER === 'ENABLED' && (
          <Menu.Item key="owner_voucher_plans_admin">
            <span>兌換方案</span>
          </Menu.Item>
        )}
      </Menu.SubMenu>

      <Menu.SubMenu
        key="owner_podcast_admin"
        title={
          <>
            <Icon component={() => <MicrophoneIcon />} />
            <Typography.Text>音頻廣播</Typography.Text>
          </>
        }
      >
        <Menu.Item key="owner_podcast_collection_admin">
          <span>廣播管理</span>
        </Menu.Item>
      </Menu.SubMenu>

      <Menu.Item key="owner_program_general_admin">
        <Icon type="book" className="mr-2" />
        <span>分類設定</span>
      </Menu.Item>
      <Menu.Item key="owner_members_admin">
        <Icon type="user" className="mr-2" />
        <span>會員管理</span>
      </Menu.Item>
      {/* <Menu.Item key="owner_edm_admin">電子郵件行銷</Menu.Item> */}
    </AdminMenu>
  </div>
)

export const CreatorAdminMenu = (props: MenuProps) => (
  <div className="d-flex flex-column flex-grow-1">
    <div className="p-3">
      <Tag style={{ border: '0px' }}>創作者</Tag>
    </div>
    <AdminMenu {...props} defaultOpenKeys={['creator_programs_admin', 'creator_activities_admin']}>
      <Menu.Item key="creator_sales_admin">
        <Icon type="pay-circle" />
        <Typography.Text>銷售管理</Typography.Text>
      </Menu.Item>
      <Menu.SubMenu
        key="creator_programs_admin"
        title={
          <>
            <Icon type="shopping" />
            <Typography.Text>課程</Typography.Text>
          </>
        }
      >
        <Menu.Item key="creator_programs_admin">課程內容</Menu.Item>
        <Menu.Item key="creator_program_issues_admin">課程問題</Menu.Item>
      </Menu.SubMenu>
      {process.env.REACT_APP_MODULE_ACTIVITY === 'ENABLED' && (
        <Menu.SubMenu
          key="creator_activities_admin"
          title={
            <>
              <Icon component={() => <CalendarAltIcon />} />
              <Typography.Text>線下實體</Typography.Text>
            </>
          }
        >
          <Menu.Item key="creator_activities_admin">線下實體管理</Menu.Item>
        </Menu.SubMenu>
      )}
      {/* <Menu.SubMenu
          key="creator_products_admin"
          title={
            <div>
              <Icon type="shopping" />
              <Typography.Text>商品</Typography.Text>
            </div>
          }
        >
          <Menu.Item key="creator_products_admin">產品內容</Menu.Item>
          <Menu.Item key="creator_product_issues_admin">產品問題</Menu.Item>
        </Menu.SubMenu> */}
      <Menu.Item key="_blank" data-href={settings.customerSupportLink}>
        <div>
          <Icon type="message" />
          <Typography.Text>客服留言</Typography.Text>
        </div>
      </Menu.Item>
    </AdminMenu>
  </div>
)

export const MemberAdminMenu = (props: MenuProps) => {
  const { currentMemberId } = useAuth()
  const { enrolledMembershipCardIds } = useEnrolledMembershipCardIds(currentMemberId || '')

  return (
    <AdminMenu {...props} style={{ background: 'transparent', border: 'none' }}>
      <Menu.Item key="member_profile_admin">
        <Icon component={() => <UserIcon />} className="mr-2" />
        個人設定
      </Menu.Item>
      <Menu.Item key="member_program_issues_admin">
        <Icon component={() => <BookIcon />} className="mr-2" />
        課程問題
      </Menu.Item>
      <Menu.Item key="member_orders_admin">
        <Icon component={() => <ClipboardListIcon />} className="mr-2" />
        訂單記錄
      </Menu.Item>
      <Menu.Item key="member_point_history_admin">
        <Icon component={() => <PointIcon />} className="mr-2" />
        點數紀錄
      </Menu.Item>
      <Menu.Item key="member_coupons_admin">
        <Icon component={() => <TicketIcon />} className="mr-2" />
        折價券
      </Menu.Item>
      {process.env.REACT_APP_MODULE_VOUCHER === 'ENABLED' && (
        <Menu.Item key="member_voucher_admin">
          <Icon component={() => <GiftIcon />} className="mr-2" />
          兌換券
        </Menu.Item>
      )}
      {process.env.REACT_APP_MODULE_MEMBERSHIPCARD === 'ENABLED' && enrolledMembershipCardIds.length > 0 && (
        <Menu.Item key="member_cards_admin">
          <Icon component={() => <MembercardIcon />} className="mr-2" />
          會員卡
        </Menu.Item>
      )}
      {/* <Menu.Item key="member_product_issues_admin">
        <Icon type="qrcode" className="mr-2" />
        產品問題
      </Menu.Item> */}
      <Menu.Item key="_blank" data-href={settings.customerSupportLink}>
        <Icon component={() => <CommentsIcon />} className="mr-2" />
        聯絡客服
      </Menu.Item>
    </AdminMenu>
  )
}
