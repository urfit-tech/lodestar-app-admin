import { Button, Icon, Tabs } from 'antd'
import React, { useContext } from 'react'
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
import MerchandiseBasicForm from '../../components/merchandise/MerchandiseBasicForm'
import MerchandiseDeleteBlock from '../../components/merchandise/MerchandiseDeleteBlock'
import MerchandiseDescriptionForm from '../../components/merchandise/MerchandiseDescriptionForm'
import MerchandiseIntroductionForm from '../../components/merchandise/MerchandiseIntroductionForm'
import MerchandisePublishBlock from '../../components/merchandise/MerchandisePublishBlock'
import MerchandiseSalesForm from '../../components/merchandise/MerchandiseSalesForm'
import AppContext from '../../contexts/AppContext'
import { useMerchandise } from '../../hooks/merchandise'

const messages = defineMessages({
  settings: { id: 'merchandise.label.settings', defaultMessage: '商品資訊' },
  salesAdmin: { id: 'merchandise.label.salesAdmin', defaultMessage: '銷售設定' },
  publishAdmin: { id: 'merchandise.label.publishAdmin', defaultMessage: '上架設定' },
  basicSettings: { id: 'merchandise.label.basicSettings', defaultMessage: '基本設定' },
  introduction: { id: 'merchandise.label.introduction', defaultMessage: '商品介紹' },
  description: { id: 'merchandise.label.description', defaultMessage: '商品詳情' },
  delete: { id: 'merchandise.label.delete', defaultMessage: '刪除商品' },
  price: { id: 'merchandise.label.price', defaultMessage: '商品售價' },
})

const MerchandiseAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { match } = useRouter<{ merchandiseId: string }>()
  const merchandiseId = match.params.merchandiseId
  const [activeKey, setActiveKey] = useQueryParam('tabkey', StringParam)
  const { settings } = useContext(AppContext)
  const { merchandise, refetchMerchandise } = useMerchandise(merchandiseId)

  return (
    <>
      <AdminHeader>
        <Link to="/merchandises">
          <Button type="link" className="mr-3">
            <Icon type="arrow-left" />
          </Button>
        </Link>

        <AdminHeaderTitle>{merchandise?.title || merchandiseId}</AdminHeaderTitle>

        {/* <a href={`//${settings['host']}/merchandises/${merchandiseId}`} target="_blank" rel="noopener noreferrer">
          <Button>預覽</Button>
        </a> */}
      </AdminHeader>

      <StyledLayoutContent variant="gray">
        <Tabs
          defaultActiveKey="settings"
          activeKey={activeKey || 'settings'}
          onChange={key => setActiveKey(key)}
          renderTabBar={(props, DefaultTabBar) => (
            <AdminTabBarWrapper>
              <DefaultTabBar {...props} />
            </AdminTabBarWrapper>
          )}
        >
          <Tabs.TabPane key="settings" tab={formatMessage(messages.settings)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(messages.settings)}</AdminPaneTitle>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(messages.basicSettings)}</AdminBlockTitle>
                <MerchandiseBasicForm
                  merchandise={merchandise}
                  merchandiseId={merchandiseId}
                  refetch={refetchMerchandise}
                />
              </AdminBlock>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(messages.introduction)}</AdminBlockTitle>
                <MerchandiseIntroductionForm
                  merchandise={merchandise}
                  merchandiseId={merchandiseId}
                  refetch={refetchMerchandise}
                />
              </AdminBlock>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(messages.description)}</AdminBlockTitle>
                <MerchandiseDescriptionForm
                  merchandise={merchandise}
                  merchandiseId={merchandiseId}
                  refetch={refetchMerchandise}
                />
              </AdminBlock>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(messages.delete)}</AdminBlockTitle>
                <MerchandiseDeleteBlock merchandiseId={merchandiseId} />
              </AdminBlock>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane key="sales" tab={formatMessage(messages.salesAdmin)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(messages.salesAdmin)}</AdminPaneTitle>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(messages.price)}</AdminBlockTitle>
                <MerchandiseSalesForm
                  merchandise={merchandise}
                  merchandiseId={merchandiseId}
                  refetch={refetchMerchandise}
                />
              </AdminBlock>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane key="publish" tab={formatMessage(messages.publishAdmin)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(messages.publishAdmin)}</AdminPaneTitle>
              <AdminBlock>
                <MerchandisePublishBlock
                  merchandise={merchandise}
                  merchandiseId={merchandiseId}
                  refetch={refetchMerchandise}
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
