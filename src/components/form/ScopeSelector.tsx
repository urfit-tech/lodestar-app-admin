import { Checkbox, Radio, TreeSelect } from 'antd'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import AppContext from '../../contexts/AppContext'
import { useAllBriefProductCollection } from '../../hooks/data'
import { ProductType } from '../../types/general'
import ProductTypeLabel from '../common/ProductTypeLabel'

const messages = defineMessages({
  allItem: { id: 'common.product.allItem', defaultMessage: '全部項目' },
  specificItem: { id: 'common.product.specificItem', defaultMessage: '指定項目' },
  otherItem: { id: 'common.product.otherItem', defaultMessage: '其他指定項目' },
  allProgram: { id: 'common.product.allProgram', defaultMessage: '全部單次課程' },
  allProgramPlan: { id: 'common.product.allProgramPlan', defaultMessage: '全部訂閱課程' },
  allActivityTicket: { id: 'common.product.allActivityTicket', defaultMessage: '全部線下實體' },
  allPodcastProgram: { id: 'common.product.allPodcastProgram', defaultMessage: '全部廣播' },
  allPodcastPlan: { id: 'common.product.allPodcastPlan', defaultMessage: '全部廣播訂閱頻道' },
  allAppointmentPlan: { id: 'common.product.allAppointmentPlan', defaultMessage: '全部預約' },
  allMerchandise: { id: 'common.product.allMerchandise', defaultMessage: '全部商品' },
  allProjectPlan: { id: 'common.product.allProjectPlan', defaultMessage: '全部專案' },
  allProgramPackagePlan: { id: 'common.product.allProgramPackagePlan', defaultMessage: '全部課程組合' },
  selectProducts: { id: 'promotion.text.selectProducts', defaultMessage: '選擇指定項目' },
})

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
  const { enabledModules } = useContext(AppContext)
  const { briefProducts } = useAllBriefProductCollection()

  const [scopeType, setScopeType] = useState<'all' | 'specific'>(
    !value || (value.productTypes === null && value.productIds.length === 0) ? 'all' : 'specific',
  )
  const [selectedProductTypes, setSelectedProductTypes] = useState<ProductType[]>(value?.productTypes || [])
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(value?.productIds || [])

  return (
    <div>
      <Radio.Group
        value={scopeType}
        onChange={value => {
          setScopeType(value.target.value)
          onChange &&
            onChange(
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
          {allText || formatMessage(messages.allItem)}
        </Radio>
        <Radio value="specific" className="d-block">
          {specificTypeText || formatMessage(messages.specificItem)}
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
                <Checkbox value="Program">{formatMessage(messages.allProgram)}</Checkbox>
              </div>
              <div className="mb-3">
                <Checkbox value="ProgramPlan">{formatMessage(messages.allProgramPlan)}</Checkbox>
              </div>
              {enabledModules.activity && (
                <div className="mb-3">
                  <Checkbox value="ActivityTicket">{formatMessage(messages.allActivityTicket)}</Checkbox>
                </div>
              )}
              {enabledModules.podcast && (
                <div className="mb-3">
                  <Checkbox value="PodcastProgram">{formatMessage(messages.allPodcastProgram)}</Checkbox>
                </div>
              )}
              {enabledModules.podcast && (
                <div className="mb-3">
                  <Checkbox value="PodcastPlan">{formatMessage(messages.allPodcastPlan)}</Checkbox>
                </div>
              )}
              {enabledModules.appointment && (
                <div className="mb-3">
                  <Checkbox value="AppointmentPlan">{formatMessage(messages.allAppointmentPlan)}</Checkbox>
                </div>
              )}
              {enabledModules.merchandise && (
                <div className="mb-3">
                  <Checkbox value="Merchandise">{formatMessage(messages.allMerchandise)}</Checkbox>
                </div>
              )}
              <div className="mb-3">
                <Checkbox value="ProjectPlan">{formatMessage(messages.allProjectPlan)}</Checkbox>
              </div>
              {enabledModules.program_package && (
                <div className="mb-3">
                  <Checkbox value="ProgramPackagePlan">{formatMessage(messages.allProgramPackagePlan)}</Checkbox>
                </div>
              )}
            </StyledColumns>
          </Checkbox.Group>

          <StyledLabel>{otherProductText || formatMessage(messages.otherItem)}</StyledLabel>
          <TreeSelect
            showSearch
            multiple
            allowClear
            treeCheckable
            placeholder={formatMessage(messages.selectProducts)}
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
          >
            {Object.keys(briefProducts).map(
              productType =>
                briefProducts[productType as ProductType]?.length && (
                  <TreeSelect.TreeNode
                    key={productType}
                    value={productType}
                    title={<ProductTypeLabel productType={productType} />}
                    checkable={false}
                  >
                    {briefProducts[productType as ProductType]?.map(product => (
                      <TreeSelect.TreeNode
                        key={product.productId}
                        value={product.productId}
                        title={
                          <div className="d-flex">
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
    </div>
  )
}

export default ScopeSelector
