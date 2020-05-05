import { Button, Dropdown, Icon, Menu } from 'antd'
import React from 'react'
import { ProgramPlanPeriodType } from '../../schemas/program'
import { PeriodTypeLabel, ShortenPeriodTypeLabel } from '../common/Period'

type ProgramPeriodTypeDropdownProps = {
  isShortenPeriodType?: boolean
  value?: ProgramPlanPeriodType
  onChange?: (periodType: ProgramPlanPeriodType) => void
}
const ProgramPeriodTypeDropdown: React.FC<ProgramPeriodTypeDropdownProps> = (
  { isShortenPeriodType, value, onChange },
  form,
) => {
  const periodTypes: ProgramPlanPeriodType[] = ['W', 'M', 'Y']

  return (
    <Dropdown
      trigger={['click']}
      overlay={
        <Menu>
          {periodTypes.map(periodType => (
            <Menu.Item key={periodType} onClick={() => onChange && onChange(periodType)}>
              {isShortenPeriodType ? (
                <ShortenPeriodTypeLabel periodType={periodType} />
              ) : (
                <PeriodTypeLabel periodType={periodType} />
              )}
            </Menu.Item>
          ))}
        </Menu>
      }
    >
      <Button>
        {value && !isShortenPeriodType && <PeriodTypeLabel periodType={value} />}
        {value && isShortenPeriodType && <ShortenPeriodTypeLabel periodType={value} />}
        <Icon type="down" />
      </Button>
    </Dropdown>
  )
}

export default React.forwardRef(ProgramPeriodTypeDropdown)
