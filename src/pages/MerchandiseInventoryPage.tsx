import Icon from '@ant-design/icons'
import { Input, Select, Skeleton, Tabs } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminPageTitle } from '../components/admin'
import AdminLayout from '../components/layout/AdminLayout'
import MerchandiseInventoryCard from '../components/merchandise/MerchandiseInventoryCard'
import { useAuth } from '../contexts/AuthContext'
import { commonMessages, merchandiseMessages } from '../helpers/translation'
import { useMemberShopCollection, useMerchandiseSpecCollection } from '../hooks/merchandise'
import { ReactComponent as ShopIcon } from '../images/icon/shop.svg'

const { Search } = Input

const StyledNoMatching = styled.div`
  text-align: center;
  font-size: 14px;
  margin-top: 25%;
  letter-spacing: 0.4px;
  color: var(--gray-dark);
`

const MerchandiseInventoryPage: React.FC<{}> = () => {
  const { formatMessage } = useIntl()
  const { memberShops } = useMemberShopCollection()
  const [selectedMemberShop, setSelectedMemberShop] = useState<string>('all')
  const [merchandiseSearch, setMerchandiseSearch] = useState<string | undefined>(undefined)
  const { isAuthenticating, currentMemberId, currentUserRole } = useAuth()
  const { loadingMerchandiseSpecs, merchandiseSpecs, refetchMerchandiseSpecs } = useMerchandiseSpecCollection({
    merchandiseSearch,
    isLimited: true,
    memberId: currentUserRole === 'content-creator' ? currentMemberId || '' : undefined,
  })

  const tabContents = [
    {
      key: 'selling',
      tab: formatMessage(merchandiseMessages.status.selling),
      merchandises:
        selectedMemberShop === 'all'
          ? merchandiseSpecs.filter(
              merchandiseSpec =>
                merchandiseSpec.published_at && merchandiseSpec.merchandiseSpecInventoryStatus.buyableQuantity > 0,
            )
          : merchandiseSpecs
              .filter(merchandiseSpec => selectedMemberShop === merchandiseSpec.merchandiseMemberShopId)
              .filter(
                merchandiseSpec =>
                  merchandiseSpec.published_at && merchandiseSpec.merchandiseSpecInventoryStatus.buyableQuantity > 0,
              ),
    },
    {
      key: 'soldOut',
      tab: formatMessage(merchandiseMessages.status.soldOut),
      merchandises:
        selectedMemberShop === 'all'
          ? merchandiseSpecs.filter(
              merchandiseSpec =>
                merchandiseSpec.published_at && merchandiseSpec.merchandiseSpecInventoryStatus.buyableQuantity <= 0,
            )
          : merchandiseSpecs
              .filter(merchandiseSpec => selectedMemberShop === merchandiseSpec.merchandiseMemberShopId)
              .filter(
                merchandiseSpec =>
                  merchandiseSpec.published_at && merchandiseSpec.merchandiseSpecInventoryStatus.buyableQuantity <= 0,
              ),
    },
    {
      key: 'unpublished',
      tab: formatMessage(merchandiseMessages.status.unpublished),
      merchandises:
        selectedMemberShop === 'all'
          ? merchandiseSpecs.filter(merchandiseSpec => !merchandiseSpec.published_at)
          : merchandiseSpecs
              .filter(merchandiseSpec => selectedMemberShop === merchandiseSpec.merchandiseMemberShopId)
              .filter(merchandiseSpec => !merchandiseSpec.published_at),
    },
  ]

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <ShopIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.merchandiseInventory)}</span>
      </AdminPageTitle>

      <div className="row mb-4">
        <div className="col-12 col-sm-3">
          <Select
            style={{ width: '100%' }}
            value={selectedMemberShop}
            onChange={(key: string) => setSelectedMemberShop(key)}
          >
            <Select.Option value="all">{formatMessage(commonMessages.label.allMerchandise)}</Select.Option>
            {memberShops.map(memberShop => (
              <Select.Option value={memberShop.id} key={memberShop.id}>
                {memberShop.title}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="col-12 col-sm-9">
          <Search
            placeholder={formatMessage(merchandiseMessages.text.searchMerchandise)}
            onSearch={value => {
              value === '' ? setMerchandiseSearch(undefined) : setMerchandiseSearch(value)
            }}
          />
        </div>
      </div>

      <Tabs defaultActiveKey="selling">
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={`${tabContent.tab} (${tabContent.merchandises.length})`}>
            {isAuthenticating || loadingMerchandiseSpecs ? (
              <Skeleton active />
            ) : tabContent.merchandises.length === 0 ? (
              <StyledNoMatching>
                <div>{formatMessage(merchandiseMessages.text.noMatchingItems)}</div>
              </StyledNoMatching>
            ) : (
              tabContent.merchandises.map(merchandise => (
                <MerchandiseInventoryCard
                  key={merchandise.merchandiseSpecId}
                  merchandiseSpecId={merchandise.merchandiseSpecId}
                  coverUrl={merchandise.coverUrl}
                  merchandiseTitle={merchandise.merchandiseTitle}
                  merchandiseSpecTitle={merchandise.merchandiseSpecTitle}
                  merchandiseSpecInventoryStatus={merchandise.merchandiseSpecInventoryStatus}
                  merchandiseMemberShop={merchandise.merchandiseMemberShop}
                  isPhysical={merchandise.isPhysical}
                  isCustomized={merchandise.isCustomized}
                  onRefetch={refetchMerchandiseSpecs}
                />
              ))
            )}
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export default MerchandiseInventoryPage
