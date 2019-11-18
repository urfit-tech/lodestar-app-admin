import { Button, Dropdown, Icon, Menu } from 'antd'
import React from 'react'
import { getPeriodTypeLabel } from '../../helpers'
import { ProgramPlanPeriodType } from '../../schemas/program'

type ProgramPeriodTypeDropdownProps = {
  value?: ProgramPlanPeriodType
  onChange?: (periodType: ProgramPlanPeriodType) => void
}
const ProgramPeriodTypeDropdown: React.FC<ProgramPeriodTypeDropdownProps> = ({ value, onChange }, form) => {
  const periodTypes: ProgramPlanPeriodType[] = ['W', 'M', 'Y']
  return (
    <Dropdown
      trigger={['click']}
      overlay={
        <Menu>
          {periodTypes.map(periodType => (
            <Menu.Item key={periodType} onClick={() => onChange && onChange(periodType)}>
              {getPeriodTypeLabel(periodType)}
            </Menu.Item>
          ))}
        </Menu>
      }
    >
      <Button>
        {value && getPeriodTypeLabel(value)} <Icon type="down" />
      </Button>
    </Dropdown>
  )
}

export default React.forwardRef(ProgramPeriodTypeDropdown)
