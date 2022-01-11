import { Checkbox, Radio, Tag, TreeSelect } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { keys } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import { useAllBriefProductCollection } from '../../hooks/data'
import { ProductType } from '../../types/general'
import ProductTypeLabel from '../common/ProductTypeLabel'

const StyledLabel = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  line-height: 1.71;
  letter-spacing: 0.4px;
`
const StyledProductParent = styled.div`
  max-width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
`
const StyledProductTitle = styled.div`
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;

  ${StyledProductParent} + & {
    max-width: 14rem;
    :before {
      content: ' - ';
    }
  }
`
const StyledColumns = styled.div`
  columns: 2;
`

// TODO: unify all ProductType someday

export type ScopeProps = {
  productTypes: ProductType[] | null
  productIds: string[]
}

const ScopeSelector: React.FC<{
  value?: ScopeProps
  onChange?: (value: ScopeProps) => void
  allText?: string
  specificTypeText?: string
  otherProductText?: string
}> = ({ value, onChange, allText, specificTypeText, otherProductText }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { briefProducts } = useAllBriefProductCollection()

  const [scopeType, setScopeType] = useState<'all' | 'specific'>(
    !value || (value.productTypes === null && value.productIds.length === 0) ? 'all' : 'specific',
  )
  const [selectedProductTypes, setSelectedProductTypes] = useState<ProductType[]>(value?.productTypes || [])
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(value?.productIds || [])

  return (
    <Radio.Group
      value={scopeType}
      onChange={value => {
        setScopeType(value.target.value)
        onChange?.(
          value.target.value === 'all'
            ? {
                productTypes: null,
                productIds: [],
              }
            : {
                productTypes: selectedProductTypes,
                productIds: selectedProductIds,
              },
        )
      }}
    >
      <Radio value="all" className="d-block mb-4">
        {allText || formatMessage(commonMessages.product.allItem)}
      </Radio>
      <Radio value="specific" className="d-block">
        {specificTypeText || formatMessage(commonMessages.product.specificItem)}
      </Radio>

      <div className={`mt-3 pl-3 ${scopeType === 'all' ? 'd-none' : ''}`}>
        <Checkbox.Group
          className="mb-3"
          value={selectedProductTypes}
          onChange={value => {
            setSelectedProductTypes(value as ProductType[])
            onChange &&
              onChange({
                productTypes: value as ProductType[],
                productIds: selectedProductIds,
              })
          }}
          style={{ width: '100%' }}
        >
          <StyledColumns>
            <div className="mb-3">
              <Checkbox value="ProgramPlan">{formatMessage(commonMessages.product.allProgramPlan)}</Checkbox>
            </div>
            {enabledModules.activity && (
              <div className="mb-3">
                <Checkbox value="ActivityTicket">{formatMessage(commonMessages.product.allActivityTicket)}</Checkbox>
              </div>
            )}
            {enabledModules.podcast && (
              <div className="mb-3">
                <Checkbox value="PodcastProgram">{formatMessage(commonMessages.product.allPodcastProgram)}</Checkbox>
              </div>
            )}
            {enabledModules.podcast && (
              <div className="mb-3">
                <Checkbox value="PodcastPlan">{formatMessage(commonMessages.product.allPodcastPlan)}</Checkbox>
              </div>
            )}
            {enabledModules.appointment && (
              <div className="mb-3">
                <Checkbox value="AppointmentPlan">{formatMessage(commonMessages.product.allAppointmentPlan)}</Checkbox>
              </div>
            )}
            {enabledModules.merchandise && (
              <div className="mb-3">
                <Checkbox value="MerchandiseSpec">{formatMessage(commonMessages.product.allMerchandise)}</Checkbox>
              </div>
            )}
            <div className="mb-3">
              <Checkbox value="ProjectPlan">{formatMessage(commonMessages.product.allProjectPlan)}</Checkbox>
            </div>
            {enabledModules.program_package && (
              <div className="mb-3">
                <Checkbox value="ProgramPackagePlan">
                  {formatMessage(commonMessages.product.allProgramPackagePlan)}
                </Checkbox>
              </div>
            )}
          </StyledColumns>
        </Checkbox.Group>

        <StyledLabel>{otherProductText || formatMessage(commonMessages.product.otherItem)}</StyledLabel>
        <TreeSelect
          showSearch
          multiple
          allowClear
          treeCheckable
          placeholder={formatMessage(commonMessages.product.selectProducts)}
          style={{ width: '100%' }}
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
          value={selectedProductIds}
          onChange={value => {
            setSelectedProductIds(value)
            onChange &&
              onChange({
                productTypes: selectedProductTypes,
                productIds: value,
              })
          }}
          treeNodeFilterProp="name"
        >
          {keys(briefProducts).map(
            productType =>
              briefProducts[productType]?.length && (
                <TreeSelect.TreeNode
                  key={productType}
                  value={productType}
                  title={<ProductTypeLabel productType={productType} />}
                  checkable={false}
                >
                  {briefProducts[productType]?.map(product => (
                    <TreeSelect.TreeNode
                      key={product.productId}
                      value={product.productId}
                      name={(product.parent || '') + product.title}
                      title={
                        <div className="d-flex align-items-center flex-wrap">
                          <div className="mr-1">
                            {product.publishedAt === null
                              ? `(${formatMessage(commonMessages.label.unPublished)})`
                              : product.publishedAt && product.publishedAt.getTime() > Date.now()
                              ? `(${formatMessage(commonMessages.status.notSold)})`
                              : ''}
                          </div>
                          {product.tag && <Tag className="mr-2">{product.tag}</Tag>}
                          {product.parent && <StyledProductParent>{product.parent}</StyledProductParent>}
                          <StyledProductTitle>{product.title}</StyledProductTitle>
                        </div>
                      }
                    />
                  ))}
                </TreeSelect.TreeNode>
              ),
          )}
        </TreeSelect>
      </div>
    </Radio.Group>
  )
}

export default ScopeSelector
