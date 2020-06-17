import { Checkbox, Radio, TreeSelect } from 'antd'
import React, { useState, useContext } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { promotionMessages } from '../../helpers/translation'
import { useAllBriefProductCollection } from '../../hooks/data'
import { ProductType } from '../../types/general'
import ProductTypeLabel from '../common/ProductTypeLabel'
import AppContext from '../../contexts/AppContext'

const messages = defineMessages({
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

const CouponPlanScopeSelector: React.FC<{
  value?: {
    scope: string[] | null
    productIds: string[]
  }
  onChange?: (value: { scope: string[] | null; productIds: string[] }) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useContext(AppContext)
  const { briefProducts } = useAllBriefProductCollection()

  const [scopeType, setScopeType] = useState<'all' | 'specific'>(
    !value || (value.scope === null && value.productIds.length === 0) ? 'all' : 'specific',
  )
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>(value?.scope || [])
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
                    scope: null,
                    productIds: [],
                  }
                : {
                    scope: selectedProductTypes,
                    productIds: selectedProductIds,
                  },
            )
        }}
      >
        <Radio value="all" className="d-block mb-4">
          {formatMessage(promotionMessages.label.allProductScope)}
        </Radio>
        <Radio value="specific" className="d-block">
          {formatMessage(promotionMessages.label.specificProductScope)}
        </Radio>

        <div className={`mt-3 pl-3 ${scopeType === 'all' ? 'd-none' : ''}`}>
          <Checkbox.Group
            className="mb-3"
            value={selectedProductTypes}
            onChange={value => {
              setSelectedProductTypes(value as string[])
              onChange &&
                onChange({
                  scope: value as string[],
                  productIds: selectedProductIds,
                })
            }}
          >
            <div className="row">
              <div className="col-6 mb-3">
                <Checkbox value="Program">{formatMessage(messages.allProgram)}</Checkbox>
              </div>
              {enabledModules.appointment && (
                <div className="col-6 mb-3">
                  <Checkbox value="AppointmentPlan">{formatMessage(messages.allAppointmentPlan)}</Checkbox>
                </div>
              )}
              <div className="col-6 mb-3">
                <Checkbox value="ProgramPlan">{formatMessage(messages.allProgramPlan)}</Checkbox>
              </div>
              {enabledModules.merchandise && (
                <div className="col-6 mb-3">
                  <Checkbox value="Merchandise">{formatMessage(messages.allMerchandise)}</Checkbox>
                </div>
              )}
              {enabledModules.activity && (
                <div className="col-6 mb-3">
                  <Checkbox value="ActivityTicket">{formatMessage(messages.allActivityTicket)}</Checkbox>
                </div>
              )}
              <div className="col-6 mb-3">
                <Checkbox value="ProjectPlan">{formatMessage(messages.allProjectPlan)}</Checkbox>
              </div>
              {enabledModules.podcast && (
                <div className="col-6 mb-3">
                  <Checkbox value="PodcastProgram">{formatMessage(messages.allPodcastProgram)}</Checkbox>
                </div>
              )}
              {enabledModules.program_package && (
                <div className="col-6 mb-3">
                  <Checkbox value="ProgramPackagePlan">{formatMessage(messages.allProgramPackagePlan)}</Checkbox>
                </div>
              )}
              {enabledModules.podcast && (
                <div className="col-6 mb-3">
                  <Checkbox value="PodcastPlan">{formatMessage(messages.allPodcastPlan)}</Checkbox>
                </div>
              )}
            </div>
          </Checkbox.Group>

          <StyledLabel>{formatMessage(promotionMessages.label.otherSpecificProduct)}</StyledLabel>
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
                  scope: selectedProductTypes,
                  productIds: value,
                })
            }}
          >
            {Object.keys(briefProducts).map(productType => (
              <TreeSelect.TreeNode
                key={productType}
                value={productType}
                title={<ProductTypeLabel productType={productType} />}
                checkable={false}
              >
                {briefProducts[productType as ProductType]?.map(product => (
                  <TreeSelect.TreeNode key={product.productId} value={product.productId} title={product.title} />
                ))}
              </TreeSelect.TreeNode>
            ))}
          </TreeSelect>
        </div>
      </Radio.Group>
    </div>
  )
}

export default CouponPlanScopeSelector
