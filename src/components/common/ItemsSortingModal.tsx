import { DragOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { filter, head, map, pipe, prop, propEq } from 'ramda'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import DraggableItemCollectionBlock from './DraggableItemCollectionBlock'

type ItemsSortingModalProps<V> = AdminModalProps & {
  items: V[]
  triggerText?: string
  onSubmit?: (value: V[]) => Promise<any>
}
const ItemsSortingModal: <T extends { id: string; title: string }>(
  props: ItemsSortingModalProps<T>,
) => React.ReactElement<ItemsSortingModalProps<T>> = ({ items, triggerText, onSubmit, ...props }) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const [sortingItems, setSortingItems] = useState(items)

  useEffect(() => {
    setSortingItems(items)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(items)])

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (!items.length) {
      setVisible(false)
      return
    }
    setLoading(true)
    onSubmit?.(sortingItems)
      .then(() => {
        setVisible(false)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="link" icon={<DragOutlined />} onClick={() => setVisible(true)}>
          {triggerText || formatMessage(commonMessages.ui.sortItems)}
        </Button>
      )}
      title={formatMessage(commonMessages.ui.sortItems)}
      footer={null}
      renderFooter={({ setVisible }) => (
        <div className="mt-4">
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(setVisible)}>
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </div>
      )}
      {...props}
    >
      <DraggableItemCollectionBlock
        items={sortingItems.map(v => ({ id: v.id, description: v.title }))}
        onSort={pipe(
          map((pipe as any)(prop('id'), (id: string) => filter(propEq(id, 'id'))(sortingItems), head)),
          setSortingItems,
        )}
      />
    </AdminModal>
  )
}

export default ItemsSortingModal
