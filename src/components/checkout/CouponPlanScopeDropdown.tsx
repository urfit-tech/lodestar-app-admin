import { Button, Dropdown, Menu } from 'antd'
import React from 'react'

const menuItemValues = ['all']
const CouponPlanScopeDropdownDropdown: React.FC<{
  value?: string
  onChange?: (value: string) => void
}> = ({ value, onChange }, ref) => (
  <Dropdown
    overlay={
      <Menu onClick={({ key }) => onChange && onChange(key)}>
        {menuItemValues.map(value => (
          <Menu.Item key={value}>{getCouponPlanScopeLabel(value)}</Menu.Item>
        ))}
      </Menu>
    }
    trigger={['click']}
  >
    <Button>{getCouponPlanScopeLabel(value)}</Button>
  </Dropdown>
)

const getCouponPlanScopeLabel = (value?: string) => {
  switch (value) {
    case 'all':
      return '不限'
  }
}

export default React.forwardRef(CouponPlanScopeDropdownDropdown)
