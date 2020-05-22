import { Icon, Tabs } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import { AdminPageTitle } from '../../components/admin'
import { CustomRatioImage } from '../../components/common/Image'
import AdminLayout from '../../components/layout/AdminLayout'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { useMemberShopCollection } from '../../hooks/merchandise'
import DefaultAvatar from '../../images/default/avatar.svg'
import { ReactComponent as ShopIcon } from '../../images/icon/shop.svg'

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

const MerchandiseShopCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { memberShops } = useMemberShopCollection()
  const [activeKey, setActiveKey] = useQueryParam('activeKey', StringParam)

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

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <ShopIcon />} className="mr-2" />
        <span>{formatMessage(commonMessages.menu.merchandiseShop)}</span>
      </AdminPageTitle>

      <Tabs activeKey={activeKey || 'activated'} onChange={key => setActiveKey(key)}>
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={tabContent.tab}>
            <div className="row py-3">
              {tabContent.memberShops.map(memberShop => (
                <div key={memberShop.id} className="col-6 col-md-4 col-lg-3">
                  <Link to={`/merchandise-shops/${memberShop.id}`}>
                    <StyledCard className="text-center">
                      <CustomRatioImage
                        width="128px"
                        ratio={1}
                        src={memberShop.member.pictureUrl || DefaultAvatar}
                        shape="circle"
                        className="mb-4 mx-auto"
                      />
                      <StyledCardTitle className="mb-2">{memberShop.name}</StyledCardTitle>
                      <StyledCardSubTitle className="mb-4">{memberShop.member.name}</StyledCardSubTitle>
                      <StyledCardMeta>
                        {formatMessage(commonMessages.term.merchandise)} {memberShop.merchandisesCount}
                      </StyledCardMeta>
                    </StyledCard>
                  </Link>
                </div>
              ))}
            </div>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export default MerchandiseShopCollectionAdminPage
