import { Collapse, Icon } from 'antd'
import React from 'react'

type CollapseProps = {
  IconPosition?: 'left' | 'right'
  IconType?: string
  children?: React.ReactNode
}

const ProgramCollapse: React.FC<CollapseProps> = ({ IconPosition, IconType, children }) => {
  return (
    <Collapse
      accordion
      bordered={false}
      expandIconPosition={IconPosition}
      expandIcon={({ isActive }) => <Icon type={IconType} rotate={isActive ? 90 : 0} />}
    >
      {children}
    </Collapse>
  )
}

export default ProgramCollapse
