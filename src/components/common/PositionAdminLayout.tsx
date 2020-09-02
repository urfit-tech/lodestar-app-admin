import { List } from 'antd'
import { insert, remove } from 'ramda'
import React from 'react'
import styled from 'styled-components'

export const OverlayWrapper = styled.div`
  position: relative;
`
export const OverlayBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;

  :hover {
    opacity: 1;
  }

  > div {
    width: 8rem;
  }
`
export const OverlayList = styled(List)`
  width: 25rem;
  overflow: hidden;
  .ant-list-header {
    padding: 1rem;
  }
`
export const OverlayListContent = styled.div`
  max-height: 20rem;
  overflow: auto;
`
export const OverlayListItem = styled(List.Item)`
  && {
    justify-content: start;
    padding: 0.75rem 1rem;
    cursor: pointer;
  }
  &.active,
  :hover {
    background: var(--gray-lighter);
    color: ${props => props.theme['@primary-color']};
  }
  &.hoverTop:hover {
    border-top: 2px solid ${props => props.theme['@primary-color']};
  }
  &.hoverBottom:hover {
    border-bottom: 2px solid ${props => props.theme['@primary-color']};
  }
  > span:first-child {
    width: 2rem;
  }
  > span:nth-child(2) {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`

type MoveTargetProps = (from: number, to: number) => void
type PositionAdminLayoutProps<V> = {
  value: V[]
  onChange?: (value: V[]) => void
  renderItem: (item: V, index: number, moveTarget: MoveTargetProps) => React.ReactElement
}
const PositionAdminLayout: <T>(
  props: PositionAdminLayoutProps<T>,
) => React.ReactElement<PositionAdminLayoutProps<T>> = ({ value, onChange, renderItem }) => {
  const moveTarget: MoveTargetProps = (from, to) => {
    if (from === to) {
      return
    }

    onChange && onChange(insert(to, value[from], remove(from, 1, value)))
  }

  return <>{value.map((item, index) => renderItem(item, index, moveTarget))}</>
}

export default PositionAdminLayout
