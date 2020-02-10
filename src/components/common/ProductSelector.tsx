import { Spin, TreeSelect } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { commonMessages, errorMessages } from '../../helpers/translation'

const productTypes = ['Program', 'ProgramPlan', 'ProgramContent', 'Card', 'ActivityTicket', 'Merchandise']
const productTypeLabel = (productType: string) => {
  switch (productType) {
    case 'Program':
      return commonMessages.label.allProgram
    case 'ProgramPlan':
      return commonMessages.label.allProgramPlan
    case 'ProgramContent':
      return commonMessages.label.allProgramContent
    case 'Card':
      return commonMessages.label.allMembershipCard
    case 'ActivityTicket':
      return commonMessages.label.allActivityTicket
    case 'Merchandise':
      return commonMessages.label.allMerchandise
    default:
      return commonMessages.term.unknownProduct
  }
}

const messages = defineMessages({
  selectProducts: { id: 'voucher.label.selectProducts', defaultMessage: '選擇兌換項目' },
})

type ProductSelectorProps = {
  loading?: boolean
  error?: Error
  products: {
    id: string
    title: string
    type: string
  }[]
  value?: string[]
  onChange?: (value: string[]) => void
}
const ProductSelector: React.FC<ProductSelectorProps> = ({ loading, error, products, value, onChange }, ref) => {
  const { formatMessage } = useIntl()

  if (loading) {
    return <Spin />
  }

  if (error) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  const treeData = productTypes
    .filter(productType => products.filter(product => product.type === productType).length)
    .map(productType => ({
      title: formatMessage(productTypeLabel(productType)),
      value: productType,
      key: productType,
      children: products
        .filter(product => product.type === productType)
        .map(product => {
          return {
            title: product.title,
            value: product.id,
            key: product.id,
          }
        }),
    }))

  return (
    <TreeSelect
      value={value}
      onChange={onChange}
      treeData={treeData}
      treeCheckable
      showCheckedStrategy="SHOW_PARENT"
      searchPlaceholder={formatMessage(messages.selectProducts)}
      treeNodeFilterProp="title"
      dropdownStyle={{
        maxHeight: '30vh',
      }}
    />
  )
}

export default ProductSelector
