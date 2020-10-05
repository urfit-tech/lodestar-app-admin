import Icon, { FileAddOutlined } from '@ant-design/icons'
import { Button, Input, Select, Tabs } from 'antd'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { AdminPaneTitle } from '../../components/admin'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import MerchandiseAdminItem from '../../components/merchandise/MerchandiseAdminItem'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { useInsertMerchandise } from '../../hooks/merchandise'
import { ReactComponent as ShopIcon } from '../../images/icon/shop.svg'
import { MerchandisePreviewProps } from '../../types/merchandise'
import LoadingPage from './LoadingPage'

const StyledHeader = styled.div<{ width?: string }>`
  ${props => (props.width ? `width: ${props.width};` : '')}
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
`

const messages = defineMessages({
  allMerchandiseType: { id: 'merchandise.label.allMerchandiseType', defaultMessage: '所有商品類型' },
  soldQuantity: { id: 'merchandise.label.soldQuantity', defaultMessage: '已售' },
})

const merchandiseTypes = {
  allMerchandiseType: null,
  generalPhysical: { isCustomized: false, isPhysical: true },
  generalVirtual: { isCustomized: false, isPhysical: false },
  customizedPhysical: { isCustomized: true, isPhysical: true },
  customizedVirtual: { isCustomized: true, isPhysical: false },
}

const MerchandiseCollectionAdminBlock: React.FC<{
  shopId: string
  merchandises: MerchandisePreviewProps[]
  onRefetchMemberShop: () => void
}> = ({ shopId, merchandises, onRefetchMemberShop }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { currentMemberId } = useAuth()
  const { id: appId, enabledModules } = useContext(AppContext)

  const insertMerchandise = useInsertMerchandise()
  const [searchText, setSearchText] = useState('')
  const [currentMerchandiseType, setCurrentMerchandiseType] = useState<{
    isPhysical: boolean
    isCustomized: boolean
  } | null>(null)

  const onSelect = (
    type: 'allMerchandiseType' | 'generalPhysical' | 'generalVirtual' | 'customizedPhysical' | 'customizedVirtual',
  ) => setCurrentMerchandiseType(merchandiseTypes[type])

  const filteredMerchandises = !currentMerchandiseType
    ? merchandises
    : merchandises
        .filter(v => v.isCustomized === currentMerchandiseType.isCustomized)
        .filter(v => v.isPhysical === currentMerchandiseType.isPhysical)

  const tabContents = [
    {
      key: 'selling',
      name: formatMessage(merchandiseMessages.status.selling),
      merchandises: filteredMerchandises.filter(
        merchandise => merchandise.publishedAt && merchandise.publishedAt.getTime() < Date.now(),
      ),
    },
    // {
    //   key: 'soldOut',
    //   name: formatMessage(commonMessages.status.soldOut),
    //   merchandises: [],
    // },
    {
      key: 'unpublished',
      name: formatMessage(merchandiseMessages.status.unpublished),
      merchandises: filteredMerchandises.filter(
        merchandise => !merchandise.publishedAt || merchandise.publishedAt.getTime() > Date.now(),
      ),
    },
  ]

  if (!currentMemberId || !appId) {
    return <LoadingPage />
  }

  return (
    <>
      <AdminPaneTitle className="mb-4">
        <Icon component={() => <ShopIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.merchandiseAdmin)}</span>
      </AdminPaneTitle>

      <div className="mb-4">
        <div className="row">
          <div className="col-4">
            <ProductCreationModal
              withCategorySelector
              withMerchandiseType
              classType="merchandise"
              renderTrigger={({ setVisible }) => (
                <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
                  {formatMessage(merchandiseMessages.ui.createMerchandise)}
                </Button>
              )}
              title={formatMessage(merchandiseMessages.ui.createMerchandise)}
              onCreate={({ title, categoryIds, isPhysical }) =>
                insertMerchandise({
                  variables: {
                    appId,
                    memberId: currentMemberId,
                    memberShopId: shopId,
                    title,
                    merchandiseCategories: categoryIds.map((categoryId, index) => ({
                      category_id: categoryId,
                      position: index,
                    })),
                    isPhysical,
                  },
                }).then(({ data }) => {
                  onRefetchMemberShop()
                  const merchandiseId = data?.insert_merchandise_one?.id
                  merchandiseId && history.push(`/merchandises/${merchandiseId}`)
                })
              }
            />
          </div>
          <div className="col-8 d-flex">
            <Select
              showSearch
              className="mr-3"
              style={{ minWidth: 200 }}
              defaultValue={'allMerchandiseType'}
              onChange={val => onSelect(val)}
            >
              <Select.Option value="allMerchandiseType">{formatMessage(messages.allMerchandiseType)}</Select.Option>
              <Select.Option value="generalPhysical">
                {formatMessage(merchandiseMessages.label.generalPhysical)}
              </Select.Option>
              <Select.Option value="generalVirtual">
                {formatMessage(merchandiseMessages.label.generalVirtual)}
              </Select.Option>
              {enabledModules.merchandise_customization && (
                <>
                  <Select.Option value="customizedPhysical">
                    {formatMessage(merchandiseMessages.label.customizedPhysical)}
                  </Select.Option>
                  <Select.Option value="customizedVirtual">
                    {formatMessage(merchandiseMessages.label.customizedVirtual)}
                  </Select.Option>
                </>
              )}
            </Select>
            <Input.Search
              placeholder={formatMessage(merchandiseMessages.text.searchMerchandise)}
              onChange={e => setSearchText(e.target.value.toLowerCase())}
            />
          </div>
        </div>
      </div>

      <Tabs>
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={`${tabContent.name} (${tabContent.merchandises.length})`}>
            <div className="d-flex align-items-center justify-content-between p-3">
              <StyledHeader className="flex-grow-1">{formatMessage(commonMessages.term.merchandise)}</StyledHeader>
              <StyledHeader className="flex-shrink-0" width="7rem">
                {formatMessage(commonMessages.label.price)}
              </StyledHeader>
              <StyledHeader className="flex-shrink-0" width="7rem">
                {formatMessage(messages.soldQuantity)}
              </StyledHeader>
            </div>

            {tabContent.merchandises
              .filter(merchandise => !searchText || merchandise.title.toLowerCase().includes(searchText))
              .map(merchandise => (
                <MerchandiseAdminItem
                  key={merchandise.id}
                  id={merchandise.id}
                  coverUrl={merchandise.coverUrl}
                  title={merchandise.title}
                  listPrice={merchandise.listPrice}
                  salePrice={merchandise.salePrice}
                  soldAt={merchandise.soldAt}
                />
              ))}
          </Tabs.TabPane>
        ))}
      </Tabs>
    </>
  )
}

export default MerchandiseCollectionAdminBlock
