import { Select } from 'antd'
import React, { useMemo, useRef, useState } from 'react'
import { useProductData } from '../../../hooks/productSelector'

const ProductSelectWithoutParent: React.VFC<{
  allowTypes: string[]
  onlyValid?: boolean
  value?: string[]
  onChange?: (value: string[]) => void
  onProductChange?: (productId: string | undefined, productTitle?: string) => void
}> = ({ allowTypes, onlyValid, value, onChange, onProductChange }) => {
  const { productSelections, isLoading, loadProductType } = useProductData(allowTypes, onlyValid)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const loadProductTypeRef = useRef(loadProductType)
  const allowTypesRef = useRef(allowTypes)

  // 更新 refs
  loadProductTypeRef.current = loadProductType
  allowTypesRef.current = allowTypes

  console.log({ productSelections })
  // 防抖处理搜索词
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // 加载所有产品类型（仅在首次加载时）
  const allowTypesKey = useMemo(() => allowTypes.join(','), [allowTypes])
  React.useEffect(() => {
    const typesToLoad = allowTypesRef.current.filter((type, index) => allowTypesRef.current.indexOf(type) === index)
    typesToLoad.forEach(type => {
      loadProductTypeRef.current(type)
    })
  }, [allowTypesKey])

  // 当搜索词变化时，如果本地没有匹配结果，触发数据库搜索
  React.useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setIsSearching(false)
      return
    }

    const hasLocalResults = productSelections.some(selection =>
      selection.products.some((product: any) =>
        product.title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
      ),
    )

    if (!hasLocalResults && debouncedSearchTerm.trim().length >= 2) {
      setIsSearching(true)
      // 触发数据库搜索
      allowTypesRef.current.forEach(type => {
        loadProductTypeRef.current(type, debouncedSearchTerm)
      })
      // 设置一个延迟来重置搜索状态
      setTimeout(() => setIsSearching(false), 1000)
    }
  }, [debouncedSearchTerm, productSelections])

  // 扁平化所有产品
  const allProducts = React.useMemo(() => {
    return productSelections
      .filter(selection => allowTypes.includes(selection.productType))
      .flatMap(selection =>
        selection.products.map(product => ({
          id: product.id,
          title: product.title || '',
          productType: selection.productType,
        })),
      )
  }, [productSelections, allowTypes])

  // 根据搜索词过滤产品，并限制显示数量
  const displayedProducts = React.useMemo(() => {
    let filtered = allProducts

    // 如果有搜索词，进行过滤
    if (debouncedSearchTerm.trim()) {
      const lowerSearchTerm = debouncedSearchTerm.toLowerCase()
      filtered = allProducts.filter(product => product.title.toLowerCase().includes(lowerSearchTerm))
    } else {
      // 没有搜索词时，只显示前 20 笔
      filtered = allProducts.slice(0, 20)
    }

    return filtered
  }, [allProducts, debouncedSearchTerm])

  // 如果当前选中的值不在显示列表中，确保它被包含
  const selectedProduct = React.useMemo(() => {
    if (!value || value.length === 0) return null
    const selectedId = value[0]
    return allProducts.find(p => p.id === selectedId)
  }, [value, allProducts])

  // 合并显示的产品和选中的产品（如果不在显示列表中）
  const finalProducts = React.useMemo(() => {
    const productMap = new Map(displayedProducts.map(p => [p.id, p]))

    // 如果选中的产品不在显示列表中，添加到列表开头
    if (selectedProduct && !productMap.has(selectedProduct.id)) {
      return [selectedProduct, ...displayedProducts]
    }

    return displayedProducts
  }, [displayedProducts, selectedProduct])

  const handleChange = (val: string | undefined) => {
    onChange?.(val ? [val] : [])
    // 查找选中的产品标题
    const changedProduct = val ? allProducts.find(p => p.id === val) : null
    onProductChange?.(val, changedProduct?.title)
  }

  return (
    <Select
      value={value && value.length > 0 ? value[0] : undefined}
      onChange={handleChange}
      showSearch
      allowClear
      loading={isLoading || isSearching}
      placeholder="請選擇商品（輸入關鍵字搜尋）"
      filterOption={false}
      onSearch={setSearchTerm}
      notFoundContent={
        isLoading || isSearching ? (
          <div style={{ padding: '8px', textAlign: 'center' }}>載入中...</div>
        ) : debouncedSearchTerm.trim() ? (
          <div style={{ padding: '8px', textAlign: 'center' }}>找不到符合的商品</div>
        ) : (
          <div style={{ padding: '8px', textAlign: 'center' }}>顯示前 20 筆資料，輸入關鍵字可搜尋更多</div>
        )
      }
      style={{ width: '100%' }}
    >
      {finalProducts.map(product => (
        <Select.Option key={product.id} value={product.id}>
          {product.title}
        </Select.Option>
      ))}
    </Select>
  )
}

export default ProductSelectWithoutParent
