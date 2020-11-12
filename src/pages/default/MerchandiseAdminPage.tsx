import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Skeleton, Tabs, Tag } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import {
  AdminBlock,
  AdminBlockSubTitle,
  AdminBlockTitle,
  AdminHeader,
  AdminHeaderTitle,
  AdminPaneTitle,
  AdminTabBarWrapper,
} from '../../components/admin'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import MerchandiseBasicForm from '../../components/merchandise/MerchandiseBasicForm'
import MerchandiseDeleteBlock from '../../components/merchandise/MerchandiseDeleteBlock'
import MerchandiseDescriptionForm from '../../components/merchandise/MerchandiseDescriptionForm'
import MerchandiseIntroductionForm from '../../components/merchandise/MerchandiseIntroductionForm'
import MerchandiseInventoryCard from '../../components/merchandise/MerchandiseInventoryCard'
import MerchandisePublishBlock from '../../components/merchandise/MerchandisePublishBlock'
import MerchandiseSalesForm from '../../components/merchandise/MerchandiseSalesForm'
import MerchandiseSpecForm from '../../components/merchandise/MerchandiseSpecForm'
import { useApp } from '../../contexts/AppContext'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { useMerchandise, useMerchandiseSpecCollection } from '../../hooks/merchandise'

const messages = defineMessages({
  settings: { id: 'merchandise.label.settings', defaultMessage: '商品資訊' },
  specAdmin: { id: 'merchandise.label.specAdmin', defaultMessage: '規格售價' },
  salesAdmin: { id: 'merchandise.label.salesAdmin', defaultMessage: '販售設定' },
  specDetail: { id: 'merchandise.label.specDetail', defaultMessage: '規格與售價' },
  inventoryAdmin: { id: 'merchandise.label.inventoryAdmin', defaultMessage: '庫存管理' },
  publishAdmin: { id: 'merchandise.label.publishAdmin', defaultMessage: '上架設定' },
  basicSettings: { id: 'merchandise.label.basicSettings', defaultMessage: '基本設定' },
  introduction: { id: 'merchandise.label.introduction', defaultMessage: '商品介紹' },
  description: { id: 'merchandise.label.description', defaultMessage: '商品詳情' },
  price: { id: 'merchandise.label.price', defaultMessage: '商品售價' },
})

const StyledTag = styled(Tag)`
  color: var(--gray-dark);
`

const MerchandiseAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { merchandiseId } = useParams<{ merchandiseId: string }>()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const { settings } = useApp()
  const { loadingMerchandise, errorMerchandise, merchandise, refetchMerchandise } = useMerchandise(merchandiseId)
  const { loadingMerchandiseSpecs, merchandiseSpecs, refetchMerchandiseSpecs } = useMerchandiseSpecCollection({
    isLimited: true,
    merchandiseId,
  })

  if (loadingMerchandise || errorMerchandise || !merchandise) {
    return <Skeleton active />
  }

  return (
    <>
      <AdminHeader>
        <Link to={`/member-shops/${merchandise.memberShopId}`}>
          <Button type="link" className="mr-2">
            <ArrowLeftOutlined />
          </Button>
        </Link>

        {merchandise.isCustomized ? (
          merchandise.isPhysical ? (
            <StyledTag>{formatMessage(merchandiseMessages.label.customizedPhysicalTag)}</StyledTag>
          ) : (
            <StyledTag>{formatMessage(merchandiseMessages.label.customizedVirtualTag)}</StyledTag>
          )
        ) : merchandise.isPhysical ? (
          <StyledTag>{formatMessage(merchandiseMessages.label.generalPhysicalTag)}</StyledTag>
        ) : (
          <StyledTag>{formatMessage(merchandiseMessages.label.generalVirtualTag)}</StyledTag>
        )}

        <AdminHeaderTitle>{merchandise?.title || merchandiseId}</AdminHeaderTitle>

        <a href={`https://${settings['host']}/merchandises/${merchandiseId}`} target="_blank" rel="noopener noreferrer">
          <Button>{formatMessage(commonMessages.ui.preview)}</Button>
        </a>
      </AdminHeader>

      <StyledLayoutContent variant="gray">
        <Tabs
          defaultActiveKey="settings"
          activeKey={activeKey || 'settings'}
          onChange={key => setActiveKey(key)}
          renderTabBar={(props, DefaultTabBar) => (
            <AdminTabBarWrapper>
              <DefaultTabBar {...props} className="mb-0" />
            </AdminTabBarWrapper>
          )}
        >
          <Tabs.TabPane key="settings" tab={formatMessage(messages.settings)}>
            <div className="container py-5">
              <AdminPaneTitle className="mb-2">{formatMessage(messages.settings)}</AdminPaneTitle>
              <AdminBlockSubTitle className="mb-4">
                {merchandise.isCustomized
                  ? merchandise.isPhysical
                    ? formatMessage(merchandiseMessages.text.customizedPhysicalDescription)
                    : formatMessage(merchandiseMessages.text.customizedVirtualDescription)
                  : merchandise.isPhysical
                  ? formatMessage(merchandiseMessages.text.generalPhysicalDescription)
                  : formatMessage(merchandiseMessages.text.generalVirtualDescription)}
              </AdminBlockSubTitle>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(messages.basicSettings)}</AdminBlockTitle>
                <MerchandiseBasicForm
                  merchandise={merchandise}
                  merchandiseId={merchandiseId}
                  onRefetch={refetchMerchandise}
                />
              </AdminBlock>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(messages.introduction)}</AdminBlockTitle>
                <MerchandiseIntroductionForm
                  merchandise={merchandise}
                  merchandiseId={merchandiseId}
                  onRefetch={refetchMerchandise}
                />
              </AdminBlock>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(messages.description)}</AdminBlockTitle>
                <MerchandiseDescriptionForm
                  merchandise={merchandise}
                  merchandiseId={merchandiseId}
                  onRefetch={refetchMerchandise}
                />
              </AdminBlock>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(merchandiseMessages.label.delete)}</AdminBlockTitle>
                <MerchandiseDeleteBlock
                  merchandiseId={merchandiseId}
                  memberShopId={merchandise.memberShopId}
                  onRefetch={refetchMerchandise}
                />
              </AdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="spec" tab={formatMessage(messages.specAdmin)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(messages.specAdmin)}</AdminPaneTitle>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(messages.salesAdmin)}</AdminBlockTitle>
                <MerchandiseSalesForm
                  merchandise={merchandise}
                  merchandiseId={merchandiseId}
                  onRefetch={refetchMerchandise}
                />
              </AdminBlock>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(messages.specDetail)}</AdminBlockTitle>
                <MerchandiseSpecForm
                  merchandise={merchandise}
                  merchandiseId={merchandiseId}
                  onRefetch={refetchMerchandise}
                />
              </AdminBlock>
            </div>
          </Tabs.TabPane>
          {merchandise.isLimited && (
            <Tabs.TabPane key="inventory" tab={formatMessage(messages.inventoryAdmin)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(messages.inventoryAdmin)}</AdminPaneTitle>
                {loadingMerchandiseSpecs ? (
                  <Skeleton active />
                ) : (
                  merchandiseSpecs.map(merchandiseSpec => (
                    <MerchandiseInventoryCard
                      key={merchandiseSpec.merchandiseSpecId}
                      merchandiseSpecId={merchandiseSpec.merchandiseSpecId}
                      coverUrl={merchandiseSpec.coverUrl}
                      merchandiseTitle={merchandiseSpec.merchandiseTitle}
                      merchandiseSpecTitle={merchandiseSpec.merchandiseSpecTitle}
                      merchandiseSpecInventoryStatus={merchandiseSpec.merchandiseSpecInventoryStatus}
                      merchandiseMemberShop={merchandiseSpec.merchandiseMemberShop}
                      onRefetch={refetchMerchandiseSpecs}
                    />
                  ))
                )}
              </div>
            </Tabs.TabPane>
          )}
          <Tabs.TabPane key="publish" tab={formatMessage(messages.publishAdmin)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(messages.publishAdmin)}</AdminPaneTitle>
              <AdminBlock>
                <MerchandisePublishBlock
                  merchandise={merchandise}
                  merchandiseId={merchandiseId}
                  onRefetch={refetchMerchandise}
                />
              </AdminBlock>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </StyledLayoutContent>
    </>
  )
}

export default MerchandiseAdminPage
