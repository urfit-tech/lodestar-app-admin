import Icon, { FileAddOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Input, Tabs, Select } from 'antd'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { AdminPaneTitle } from '../../components/admin'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import MerchandiseAdminItem from '../../components/merchandise/MerchandiseAdminItem'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { ReactComponent as ShopIcon } from '../../images/icon/shop.svg'
import types from '../../types'
import { MerchandisePreviewProps } from '../../types/merchandise'
import LoadingPage from './LoadingPage'

type MerchandiseClass = 'generalPhysical' | 'generalVirtual' | 'customizedPhysical' | 'customizedVirtual'

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

const filteredCondition = {
  generalPhysical: { isCustomized: false, isPhysical: true },
  generalVirtual: { isCustomized: false, isPhysical: false },
  customizedPhysical: { isCustomized: true, isPhysical: true },
  customizedVirtual: { isCustomized: true, isPhysical: false },
}

const MerchandiseCollectionAdminBlock: React.FC<{
  shopId: string
  merchandises: MerchandisePreviewProps[]
}> = ({ shopId, merchandises }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { currentMemberId } = useAuth()
  const { loading, id: appId, enabledModules } = useContext(AppContext)

  const [insertMerchandise] = useMutation<types.INSERT_MERCHANDISE, types.INSERT_MERCHANDISEVariables>(
    INSERT_MERCHANDISE,
  )
  const [searchText, setSearchText] = useState('')
  const [merchandiseClass, setMerchandiseClass] = useState<MerchandiseClass | ''>('')

  const onSelect = (selectedClass: MerchandiseClass | '') => setMerchandiseClass(selectedClass)

  const filteredMerchandises = merchandises.filter(
    v =>
      !merchandiseClass ||
      (v.isCustomized === filteredCondition[merchandiseClass].isCustomized &&
        v.isPhysical === filteredCondition[merchandiseClass].isPhysical),
  )

  const tabContents = [
    {
      key: 'selling',
      name: formatMessage(merchandiseMessages.status.selling),
      merchandises: filteredMerchandises.filter(
        merchandise => merchandise.publishedAt && merchandise.publishedAt.getTime() < Date.now(),
      ),
    },
    {
      key: 'unpublished',
      name: formatMessage(merchandiseMessages.status.unpublished),
      merchandises: filteredMerchandises.filter(
        merchandise => !merchandise.publishedAt || merchandise.publishedAt.getTime() > Date.now(),
      ),
    },
  ]

  if (!currentMemberId || loading) {
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
              renderTrigger={({ setVisible }) => (
                <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
                  {formatMessage(merchandiseMessages.ui.createMerchandise)}
                </Button>
              )}
              title={formatMessage(merchandiseMessages.ui.createMerchandise)}
              categoryClassType="merchandise"
              withMerchandiseType
              onCreate={({ title, categoryIds, isPhysical, isCustomized }) =>
                insertMerchandise({
                  variables: {
                    appId,
                    memberId: currentMemberId,
                    memberShopId: shopId,
                    title,
                    merchandiseCategories:
                      categoryIds?.map((categoryId, index) => ({
                        category_id: categoryId,
                        position: index,
                      })) || [],
                    isPhysical,
                    isCustomized,
                    isLimited: isPhysical && !isCustomized,
                  },
                })
                  .then(({ data }) => {
                    const merchandiseId = data?.insert_merchandise_one?.id
                    merchandiseId && history.push(`/merchandises/${merchandiseId}`)
                  })
                  .catch(handleError)
              }
            />
          </div>
          <div className="col-8 d-flex">
            <Select
              showSearch
              className="mr-3"
              style={{ minWidth: 200 }}
              defaultValue={''}
              onChange={val => onSelect(val)}
            >
              <Select.Option value="">{formatMessage(messages.allMerchandiseType)}</Select.Option>
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

      <Tabs defaultActiveKey="selling">
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
                  soldQuantity={merchandise.soldQuantity}
                />
              ))}
          </Tabs.TabPane>
        ))}
      </Tabs>
    </>
  )
}

const INSERT_MERCHANDISE = gql`
  mutation INSERT_MERCHANDISE(
    $appId: String!
    $memberId: String!
    $memberShopId: uuid!
    $title: String!
    $merchandiseCategories: [merchandise_category_insert_input!]!
    $isPhysical: Boolean
    $isCustomized: Boolean
    $isLimited: Boolean
  ) {
    insert_merchandise_one(
      object: {
        app_id: $appId
        title: $title
        member_id: $memberId
        member_shop_id: $memberShopId
        merchandise_categories: { data: $merchandiseCategories }
        is_physical: $isPhysical
        is_customized: $isCustomized
        is_limited: $isLimited
      }
    ) {
      id
    }
  }
`

export default MerchandiseCollectionAdminBlock
