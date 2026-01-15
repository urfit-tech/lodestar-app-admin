import { Select } from 'antd'
import React, { useMemo, useState } from 'react'
import { useCouponPlanCollection } from '../../../hooks/checkout'
import { useVoucherPlanCollection } from '../../../hooks/checkout'

const DiscountTargetSelector: React.VFC<{
  discountType: string
  value?: string
  onChange?: (value: string | undefined) => void
  onTargetChange?: (targetId: string | undefined) => void
}> = ({ discountType, value, onChange, onTargetChange }) => {
  const [searchTerm, setSearchTerm] = useState('')

  // 只在需要时获取优惠券计划列表
  const { couponPlans, loadingCouponPlans } = useCouponPlanCollection()

  // 只在需要时获取兑换券计划列表（使用空的 condition 获取所有）
  const { voucherPlans, loading: loadingVoucherPlans } = useVoucherPlanCollection({})

  // 根据折扣类型获取选项
  const options = useMemo(() => {
    switch (discountType) {
      case 'Coupon':
        return couponPlans.map(plan => ({
          id: plan.id,
          title: plan.title,
        }))
      case 'Voucher':
        return voucherPlans.map(plan => ({
          id: plan.id,
          title: plan.title,
        }))
      case 'Coin':
      case 'DownPrice':
      default:
        // Coin 和 DownPrice 类型可能不需要 target，返回空数组
        return []
    }
  }, [discountType, couponPlans, voucherPlans])

  // 根据搜索词过滤选项
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) {
      return options.slice(0, 50) // 限制显示前 50 笔
    }
    const lowerSearchTerm = searchTerm.toLowerCase()
    return options.filter(option => option.title.toLowerCase().includes(lowerSearchTerm))
  }, [options, searchTerm])

  // 如果当前选中的值不在显示列表中，确保它被包含
  const selectedOption = useMemo(() => {
    if (!value) return null
    return options.find(opt => opt.id === value)
  }, [value, options])

  const finalOptions = useMemo(() => {
    const optionMap = new Map(filteredOptions.map(opt => [opt.id, opt]))
    if (selectedOption && !optionMap.has(selectedOption.id)) {
      return [selectedOption, ...filteredOptions]
    }
    return filteredOptions
  }, [filteredOptions, selectedOption])

  const isLoading = (discountType === 'Coupon' && loadingCouponPlans) || (discountType === 'Voucher' && loadingVoucherPlans)

  const handleChange = (val: string | undefined) => {
    onChange?.(val)
    onTargetChange?.(val)
  }

  // 如果折扣类型不需要 target（Coin, DownPrice），显示提示或隐藏
  if (discountType === 'Coin' || discountType === 'DownPrice') {
    return (
      <Select
        value={value}
        onChange={handleChange}
        allowClear
        placeholder="此折扣類型不需要目標 ID"
        disabled
        style={{ width: '100%' }}
      />
    )
  }

  return (
    <Select
      value={value}
      onChange={handleChange}
      showSearch
      allowClear
      loading={isLoading}
      placeholder="請選擇折扣目標（輸入關鍵字搜尋）"
      filterOption={false}
      onSearch={setSearchTerm}
      notFoundContent={
        isLoading ? (
          <div style={{ padding: '8px', textAlign: 'center' }}>載入中...</div>
        ) : searchTerm.trim() ? (
          <div style={{ padding: '8px', textAlign: 'center' }}>找不到符合的選項</div>
        ) : (
          <div style={{ padding: '8px', textAlign: 'center' }}>顯示前 50 筆資料，輸入關鍵字可搜尋更多</div>
        )
      }
      style={{ width: '100%' }}
    >
      {finalOptions.map(option => (
        <Select.Option key={option.id} value={option.id}>
          {option.title}
        </Select.Option>
      ))}
    </Select>
  )
}

export default DiscountTargetSelector
