import Icon from '@ant-design/icons'
import { Skeleton, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import { AdminPageTitle } from '../components/admin'
import { CustomRatioImage } from '../components/common/Image'
import AdminLayout from '../components/layout/AdminLayout'
import MemberShopCreationModal from '../components/merchandise/MemberShopCreationModal'
import { commonMessages, merchandiseMessages } from '../helpers/translation'
import { useMemberShopCollection } from '../hooks/merchandise'
import DefaultAvatar from '../images/default/avatar.svg'
import { ReactComponent as ShopIcon } from '../images/icon/shop.svg'
import ForbiddenPage from './ForbiddenPage'

const StyledCard = styled.div`
  padding-top: 2.5rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);

  > div {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`
const StyledCardTitle = styled.div`
  color: var(--gray-darker);
  font-weight: bold;
`
const StyledCardSubTitle = styled.div`
  font-size: 14px;
  color: var(--gray-dark);
`
const StyledCardMeta = styled.div`
  padding: 0.5rem 0;
  background-color: var(--gray-lighter);
  color: var(--gray-dark);
  font-size: 14px;
`

const MemberShopCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const { enabledModules } = useApp()
  const { currentMemberId, permissions, isAuthenticating } = useAuth()
  const { loadingMemberShops, memberShops } = useMemberShopCollection(
    permissions.MERCHANDISE_ADMIN ? undefined : permissions.MERCHANDISE_NORMAL ? currentMemberId || '' : '',
  )

  const tabContents = [
    {
      key: 'activated',
      tab: formatMessage(merchandiseMessages.status.inOperation),
      memberShops: memberShops.filter(memberShop => memberShop.publishedAt),
    },
    {
      key: 'inactivated',
      tab: formatMessage(merchandiseMessages.status.inactivated),
      memberShops: memberShops.filter(memberShop => !memberShop.publishedAt),
    },
  ]

  if (!enabledModules.merchandise || (!permissions.MERCHANDISE_ADMIN && !permissions.MERCHANDISE_NORMAL)) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <ShopIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.merchandiseShop)}</span>
      </AdminPageTitle>

      <div className="mb-5">
        <MemberShopCreationModal />
      </div>

      <Tabs activeKey={activeKey || 'activated'} onChange={key => setActiveKey(key)}>
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={tabContent.tab}>
            <div className="row py-3">
              {isAuthenticating || loadingMemberShops ? (
                <Skeleton active />
              ) : (
                tabContent.memberShops.map(memberShop => (
                  <div key={memberShop.id} className="col-6 col-md-4 col-lg-3">
                    <Link to={`/member-shops/${memberShop.id}`}>
                      <StyledCard className="text-center">
                        <CustomRatioImage
                          width="128px"
                          ratio={1}
                          src={memberShop.member.pictureUrl || DefaultAvatar}
                          shape="circle"
                          className="mb-4 mx-auto"
                        />
                        <StyledCardTitle className="mb-2">{memberShop.title}</StyledCardTitle>
                        <StyledCardSubTitle className="mb-4">{memberShop.member.name}</StyledCardSubTitle>
                        <StyledCardMeta>
                          {formatMessage(commonMessages.label.merchandise)} {memberShop.merchandisesCount}
                        </StyledCardMeta>
                      </StyledCard>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export default MemberShopCollectionAdminPage
