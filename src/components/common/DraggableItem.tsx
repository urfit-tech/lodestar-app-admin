import { Icon } from 'antd'
import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const StyledDraggableItem = styled.div`
  padding: 20px;
  background: #f7f8f8;
  display: flex;
  justify-content: space-between;
  align-items: center;
`
type DraggableItemProps = HTMLAttributes<HTMLDivElement> & {
  dataId: string
  handlerClassName?: string
  actions?: React.ReactNode[]
}
const DraggableItem: React.FC<DraggableItemProps> = ({ dataId, handlerClassName, children, actions, ...divProps }) => {
  return (
    <StyledDraggableItem {...divProps} data-id={dataId}>
      <div className="d-flex align-items-center">
        <Icon type="drag" onClick={() => {}} className={handlerClassName + ' mr-3'} />
        {children}
      </div>
      <div>{actions}</div>
    </StyledDraggableItem>
  )
}

export default DraggableItem
