import { DragOutlined } from '@ant-design/icons'
import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const StyledDraggableItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f7f8f8;
`

const StyledChildren = styled.div`
  padding: 8px;
  padding-left: 0;
  width: 100%;
`

const DraggableItem: React.FC<
  HTMLAttributes<HTMLDivElement> & {
    dataId: string
    handlerClassName?: string
    actions?: React.ReactNode[]
  }
> = ({ dataId, handlerClassName, children, actions, ...divProps }) => {
  return (
    <StyledDraggableItem {...divProps} data-id={dataId}>
      <div className="d-flex align-items-center" style={{ width: '100%' }}>
        <DragOutlined onClick={() => {}} className={handlerClassName + ' mr-3'} />
        <StyledChildren>{children}</StyledChildren>
      </div>
      <div className="d-flex align-items-center">{actions}</div>
    </StyledDraggableItem>
  )
}

export default DraggableItem
