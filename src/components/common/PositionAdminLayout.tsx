import { insert, remove } from 'ramda'
import React from 'react'

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
