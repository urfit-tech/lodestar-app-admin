import { Spin, TreeSelect } from 'antd'
import React from 'react'

const ProductTypeLabel: { [key: string]: string } = {
  Program: '所有單次課程',
  ProgramPlan: '所有訂閱方案',
  ProgramContent: '所有課程內容',
  Card: '所有會員卡',
  ActivityTicket: '所有實體',
  Merchandise: '所有商品',
}

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
  if (loading) {
    return <Spin />
  }

  if (error) {
    return <div>讀取產品錯誤</div>
  }

  const treeData = Object.keys(ProductTypeLabel)
    .filter(
      productType => ProductTypeLabel[productType] && products.filter(product => product.type === productType).length,
    )
    .map(productType => ({
      title: ProductTypeLabel[productType],
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
      searchPlaceholder="選擇兌換項目"
      treeNodeFilterProp="title"
      dropdownStyle={{
        maxHeight: '30vh',
      }}
    />
  )
}

export default ProductSelector
