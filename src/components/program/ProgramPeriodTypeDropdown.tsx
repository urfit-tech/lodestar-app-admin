import { DownOutlined } from '@ant-design/icons'
import { Button, Dropdown, Menu } from 'antd'
import React from 'react'
import { PeriodType } from '../../types/general'
import { PeriodTypeLabel, ShortenPeriodTypeLabel } from '../common/Period'

type ProgramPeriodTypeDropdownProps = {
  isShortenPeriodType?: boolean
  value?: PeriodType
  onChange?: (periodType: PeriodType) => void
}
const ProgramPeriodTypeDropdown: React.FC<ProgramPeriodTypeDropdownProps> = ({
  isShortenPeriodType,
  value,
  onChange,
}) => {
  const periodTypes: PeriodType[] = ['D', 'W', 'M', 'Y']

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
        <DownOutlined />
      </Button>
    </Dropdown>
  )
}

export default ProgramPeriodTypeDropdown
