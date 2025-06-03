import { Spin, Tag, TreeSelect } from 'antd'
import { ProductType } from 'lodestar-app-element/src/types/product'
import React, { useCallback, useMemo } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import { useProductData, useProductSearch, useProductSelection, useTreeDataBase } from '../../hooks/productSelector'
import formMessages from './translation'

const productTypeLabel = (productType: string) => {
  switch (productType) {
    case 'ProgramPackagePlan':
      return commonMessages.label.allProgramPackagePlan
    case 'ProgramPlan':
      return commonMessages.label.allProgramPlan
    case 'ProgramContent':
      return commonMessages.label.allProgramContent
    case 'Card':
      return commonMessages.label.allMembershipCard
    case 'ActivityTicket':
      return commonMessages.label.allActivityTicket
    case 'PodcastProgram':
      return commonMessages.label.allPodcastProgram
    case 'Merchandise':
      return commonMessages.label.allMerchandise
    case 'MerchandiseSpec':
      return commonMessages.label.allMerchandiseSpec
    case 'GeneralPhysicalMerchandiseSpec':
      return formMessages.ProductSelector.generalPhysicalMerchandiseSpec
    case 'GeneralVirtualMerchandiseSpec':
      return formMessages.ProductSelector.generalVirtualMerchandiseSpec
    case 'CustomizedPhysicalMerchandiseSpec':
      return formMessages.ProductSelector.customizedPhysicalMerchandiseSpec
    case 'CustomizedVirtualMerchandiseSpec':
      return formMessages.ProductSelector.customizedVirtualMerchandiseSpec
    case 'ProjectPlan':
      return commonMessages.label.allProjectPlan
    case 'AppointmentPlan':
      return commonMessages.label.allAppointmentPlan
    case 'PodcastPlan':
      return commonMessages.label.allPodcastPlan
    case 'CouponPlan':
      return commonMessages.label.allCouponPlan
    case 'VoucherPlan':
      return commonMessages.label.allVoucherPlan
    case 'Estimator':
      return commonMessages.label.allEstimator
    default:
      return commonMessages.label.unknownProduct
  }
}

const messages = defineMessages({
  selectProducts: { id: 'promotion.label.selectProducts', defaultMessage: '選擇項目' },
  loading: { id: 'common.status.loading', defaultMessage: '載入中...' },
  searchingDatabase: { id: 'common.status.searchingDatabase', defaultMessage: '搜尋資料庫中...' },
})

interface ProductSelectorProps {
  allowTypes: (
    | ProductType
    | 'CouponPlan'
    | 'GeneralPhysicalMerchandiseSpec'
    | 'GeneralVirtualMerchandiseSpec'
    | 'CustomizedPhysicalMerchandiseSpec'
    | 'CustomizedVirtualMerchandiseSpec'
  )[]
  multiple?: boolean
  value?: string[]
  onlyValid?: boolean
  onChange?: (value: string[]) => void
  onProductChange?: (
    value: {
      id: string
      title: string
      publishedAt?: Date | null
      tag?: string
      children?: string[]
    }[],
  ) => void
  onFullSelected?: (types: (ProductType | 'CouponPlan')[]) => void
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  allowTypes,
  multiple,
  value,
  onlyValid,
  onChange,
  onProductChange,
  onFullSelected,
}) => {
  const { formatMessage } = useIntl()

  const { productSelections, loadedTypes, isLoading, loadProductType } = useProductData(allowTypes, onlyValid)

  const { expandedKeys, isSearchingDatabase, setExpandedKeys, setSearchTerm, handleSearch } = useProductSearch(
    productSelections,
    allowTypes,
    loadProductType,
  )

  const { handleTreeSelect, handleTreeExpand } = useProductSelection(
    value,
    multiple,
    productSelections,
    loadProductType,
    loadedTypes,
    onChange,
    onProductChange,
    onFullSelected,
  )

  const baseTreeData = useTreeDataBase(productSelections, allowTypes, multiple)

  const generateProductTag = useCallback(
    (product: any) => {
      if (product.originalData?.auto_renewed) {
        return formatMessage(commonMessages.ui.subscriptionPlan)
      } else if (product.originalData?.period_amount && product.originalData?.period_type) {
        return formatMessage(commonMessages.ui.periodPlan)
      } else if (product.id.startsWith('ProgramPlan_')) {
        return formatMessage(commonMessages.ui.perpetualPlan)
      }
      return undefined
    },
    [formatMessage],
  )

  const treeData = useMemo(() => {
    return baseTreeData.map(productSelection => ({
      key: productSelection.productType,
      title: formatMessage(productTypeLabel(productSelection.productType)),
      value: productSelection.value,
      selectable: productSelection.selectable,
      isLeaf: productSelection.isLeaf,
      children: productSelection.products.map((product: any) => {
        const dynamicTag = generateProductTag(product)

        return {
          key: product.id,
          title: (
            <div className="d-flex align-items-center" title={product.title}>
              {product.publishedAt === null
                ? `(${formatMessage(commonMessages.label.unPublished)}) `
                : product.publishedAt && product.publishedAt.getTime() > Date.now()
                ? `(${formatMessage(commonMessages.status.notSold)}) `
                : ''}
              {dynamicTag && <Tag className="mr-2">{dynamicTag}</Tag>}
              <span>{product.title}</span>
            </div>
          ),
          name: product.title || '',
          value: product.id,
          isLeaf: true,
        }
      }),
    }))
  }, [baseTreeData, formatMessage, generateProductTag])

  return (
    <>
      {/* 載入狀態指示器 */}
      {(isLoading || isSearchingDatabase) && (
        <div style={{ marginBottom: '8px' }}>
          <Spin size="small" />
          <span style={{ marginLeft: '8px' }}>
            {isSearchingDatabase ? formatMessage(messages.searchingDatabase) : formatMessage(messages.loading)}
          </span>
        </div>
      )}

      {/* 樹狀選擇器主體 */}
      <TreeSelect
        value={value}
        onChange={handleTreeSelect}
        treeData={treeData}
        treeCheckable={multiple}
        showCheckedStrategy="SHOW_PARENT"
        placeholder={formatMessage(messages.selectProducts)}
        treeNodeFilterProp="name"
        onTreeExpand={keys => handleTreeExpand(keys, setSearchTerm, setExpandedKeys)}
        treeExpandedKeys={expandedKeys}
        showSearch
        allowClear
        onSearch={handleSearch}
        dropdownStyle={{
          maxHeight: '40vh',
        }}
      />
    </>
  )
}

export default ProductSelector
