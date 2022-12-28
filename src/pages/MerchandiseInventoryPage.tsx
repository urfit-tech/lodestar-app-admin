import Icon from '@ant-design/icons'
import { Input, Select, Skeleton, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminPageTitle } from '../components/admin'
import AdminLayout from '../components/layout/AdminLayout'
import MerchandiseInventoryCard from '../components/merchandise/MerchandiseInventoryCard'
import { commonMessages, merchandiseMessages } from '../helpers/translation'
import { useMemberShopCollection, useMerchandiseSpecCollection } from '../hooks/merchandise'
import { ReactComponent as ShopIcon } from '../images/icon/shop.svg'
import ForbiddenPage from './ForbiddenPage'

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
  const { enabledModules } = useApp()
  const { isAuthenticating, currentMemberId, permissions, authToken } = useAuth()
  const { loadingMerchandiseSpecs, merchandiseSpecs, refetchMerchandiseSpecs } = useMerchandiseSpecCollection({
    merchandiseSearch,
    isLimited: true,
    memberId: permissions.MERCHANDISE_ADMIN ? undefined : permissions.MERCHANDISE_NORMAL ? currentMemberId || '' : '',
  })

  const tabContents = [
    {
      key: 'selling',
      tab: formatMessage(merchandiseMessages.status.selling),
      merchandiseSpecs:
        selectedMemberShop === 'all'
          ? merchandiseSpecs.filter(
              merchandiseSpec => merchandiseSpec.publishedAt && merchandiseSpec.inventoryStatus.buyableQuantity > 0,
            )
          : merchandiseSpecs
              .filter(merchandiseSpec => selectedMemberShop === merchandiseSpec.memberShop.id)
              .filter(
                merchandiseSpec => merchandiseSpec.publishedAt && merchandiseSpec.inventoryStatus.buyableQuantity > 0,
              ),
    },
    {
      key: 'soldOut',
      tab: formatMessage(merchandiseMessages.status.soldOut),
      merchandiseSpecs:
        selectedMemberShop === 'all'
          ? merchandiseSpecs.filter(
              merchandiseSpec => merchandiseSpec.publishedAt && merchandiseSpec.inventoryStatus.buyableQuantity <= 0,
            )
          : merchandiseSpecs
              .filter(merchandiseSpec => selectedMemberShop === merchandiseSpec.memberShop.id)
              .filter(
                merchandiseSpec => merchandiseSpec.publishedAt && merchandiseSpec.inventoryStatus.buyableQuantity <= 0,
              ),
    },
    {
      key: 'unpublished',
      tab: formatMessage(merchandiseMessages.status.unpublished),
      merchandiseSpecs:
        selectedMemberShop === 'all'
          ? merchandiseSpecs.filter(merchandiseSpec => !merchandiseSpec.publishedAt)
          : merchandiseSpecs
              .filter(merchandiseSpec => selectedMemberShop === merchandiseSpec.memberShop.id)
              .filter(merchandiseSpec => !merchandiseSpec.publishedAt),
    },
  ]

  if (!enabledModules.merchandise || (!permissions.MERCHANDISE_ADMIN && !permissions.MERCHANDISE_NORMAL)) {
    return <ForbiddenPage />
  }

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
          <Tabs.TabPane key={tabContent.key} tab={`${tabContent.tab} (${tabContent.merchandiseSpecs.length})`}>
            {(isAuthenticating && !authToken) || loadingMerchandiseSpecs ? (
              <Skeleton active />
            ) : tabContent.merchandiseSpecs.length === 0 ? (
              <StyledNoMatching>
                <div>{formatMessage(merchandiseMessages.text.noMatchingItems)}</div>
              </StyledNoMatching>
            ) : (
              tabContent.merchandiseSpecs.map(merchandiseSpec => (
                <MerchandiseInventoryCard
                  key={merchandiseSpec.id}
                  id={merchandiseSpec.id}
                  title={merchandiseSpec.title}
                  coverUrl={merchandiseSpec.coverUrl}
                  inventoryStatus={merchandiseSpec.inventoryStatus}
                  merchandiseTitle={merchandiseSpec.merchandiseTitle}
                  isPhysical={merchandiseSpec.isPhysical}
                  isCustomized={merchandiseSpec.isCustomized}
                  memberShop={merchandiseSpec.memberShop}
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
