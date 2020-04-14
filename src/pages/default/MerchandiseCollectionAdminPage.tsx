import { Button, Icon, Input, Tabs } from 'antd'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import useRouter from 'use-react-router'
import { AdminPageTitle } from '../../components/admin'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import CreatorAdminLayout from '../../components/layout/CreatorAdminLayout'
import OwnerAdminLayout from '../../components/layout/OwnerAdminLayout'
import MerchandiseAdminItem from '../../components/merchandise/MerchandiseAdminItem'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { useInsertMerchandise, useMerchandiseCollection } from '../../hooks/merchandise'
import { ReactComponent as ShopIcon } from '../../images/icon/shop.svg'
import LoadingPage from './LoadingPage'

const StyledHeader = styled.div<{ width?: string }>`
  ${props => (props.width ? `width: ${props.width};` : '')}
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
`

const MerchandiseCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { history } = useRouter()
  const [activeKey, setActiveKey] = useQueryParam('tabkey', StringParam)
  const { currentMemberId, currentUserRole } = useAuth()

  const { id: appId } = useContext(AppContext)
  const insertMerchandise = useInsertMerchandise()
  const { merchandises, refetchMerchandises } = useMerchandiseCollection()
  const [searchText, setSearchText] = useState('')

  const tabContents = [
    {
      key: 'selling',
      name: formatMessage(merchandiseMessages.status.selling),
      merchandises: merchandises.filter(
        merchandise => merchandise.publishedAt && merchandise.publishedAt.getTime() < Date.now(),
      ),
    },
    // {
    //   key: 'soldOut',
    //   name: formatMessage(merchandiseMessages.status.soldOut),
    //   merchandises: [],
    // },
    {
      key: 'unpublished',
      name: formatMessage(merchandiseMessages.status.unpublished),
      merchandises: merchandises.filter(
        merchandise => !merchandise.publishedAt || merchandise.publishedAt.getTime() > Date.now(),
      ),
    },
  ]

  if (!currentMemberId || !currentUserRole || !appId) {
    return <LoadingPage />
  }

  const AdminLayout = currentUserRole === 'app-owner' ? OwnerAdminLayout : CreatorAdminLayout

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <ShopIcon />} className="mr-2" />
        <span>{formatMessage(commonMessages.menu.merchandiseAdmin)}</span>
      </AdminPageTitle>

      <div className="mb-4">
        <div className="row">
          <div className="col-8">
            <ProductCreationModal
              renderTrigger={({ setVisible }) => (
                <Button type="primary" icon="file-add" onClick={() => setVisible(true)}>
                  {formatMessage(merchandiseMessages.ui.createMerchandise)}
                </Button>
              )}
              title={formatMessage(merchandiseMessages.ui.createMerchandise)}
              onCreate={({ title, categoryIds }) =>
                insertMerchandise({
                  variables: {
                    appId,
                    title,
                    merchandiseCategories: categoryIds.map((categoryId, index) => ({
                      category_id: categoryId,
                      position: index,
                    })),
                  },
                }).then(({ data }) => {
                  refetchMerchandises().then(() => {
                    const merchandiseId = data?.insert_merchandise?.returning[0].id
                    merchandiseId && history.push(`/merchandises/${merchandiseId}`)
                  })
                })
              }
            />
          </div>
          <div className="col-4">
            <Input.Search
              placeholder={formatMessage(merchandiseMessages.text.searchMerchandise)}
              onChange={e => setSearchText(e.target.value.toLowerCase())}
            />
          </div>
        </div>
      </div>

      <Tabs activeKey={activeKey || 'selling'} onChange={key => setActiveKey(key)}>
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={`${tabContent.name} (${tabContent.merchandises.length})`}>
            <div className="d-flex align-items-center justify-content-between p-3">
              <StyledHeader className="flex-grow-1">{formatMessage(commonMessages.term.merchandise)}</StyledHeader>
              <StyledHeader className="flex-shrink-0" width="7rem">
                {formatMessage(commonMessages.label.price)}
              </StyledHeader>
            </div>

            {tabContent.merchandises
              .filter(merchandise => !searchText || merchandise.title.toLowerCase().includes(searchText))
              .map(merchandise => (
                <MerchandiseAdminItem key={merchandise.id} {...merchandise} />
              ))}
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export default MerchandiseCollectionAdminPage
