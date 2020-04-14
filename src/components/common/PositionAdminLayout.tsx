import { insert, remove } from 'ramda'
import React from 'react'

type MoveTargetProps = (from: number, to: number) => void
type PositionAdminLayoutProps<V> = {
  value: V[]
  onChange?: (value: V[]) => void
  renderItem: (item: V, moveTarget: MoveTargetProps) => React.ReactElement
}
const PositionAdminLayout: <T>(props: PositionAdminLayoutProps<T>) => React.ReactElement<PositionAdminLayoutProps<T>> = ({
  value,
  onChange,
  renderItem,
}) => {
  const moveTarget: MoveTargetProps = (from, to) => {
    onChange && onChange(insert(to, value[from], remove(from, 1, value)))
  }

  return <>{value.map(item => renderItem(item, moveTarget))}</>
}

export default PositionAdminLayout
