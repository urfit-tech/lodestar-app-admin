import { Collapse, Icon } from 'antd'
import React from 'react'
import styled from 'styled-components'

const { Panel } = Collapse

const CustomPanelStyle = styled(Panel)`
  background: #f7f7f7;
  border-radius: 4px;
  margin-bottom: 24px;
  border: 0;
  overflow: hidden;
  position: relative;
`

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
