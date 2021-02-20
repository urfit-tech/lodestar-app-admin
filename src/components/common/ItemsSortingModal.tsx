import { DragOutlined } from '@ant-design/icons'
import { Button, Select } from 'antd'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { ReactSortable } from 'react-sortablejs'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import DraggableItem from './DraggableItem'

export const StyledDraggableItem = styled(DraggableItem)`
  padding: 0 0 0 14px;
  background: white;
  border: solid 1px var(--gray-light);
  border-radius: 4px;
`
export const StyledSelect = styled(Select)`
  text-align: center;
  border-left: solid 1px var(--gray-light);
  height: 100%;
  width: 50px;
`
export const StyledReactSortableWrapper = styled.div`
  & .hover-background {
    border: 0;
    padding: 0;
    height: 2px;
    background: ${props => props.theme['@primary-color']};
    color: transparent;
    p {
      color: transparent;
    }
    & ${StyledSelect} {
      color: transparent;
      border-left: none;
    }
  }
`
export const StyledSelectOptionWrapper = styled.div`
  & .ant-select-item {
    transition: all 0.08s;
    border-top: 2px solid transparent;
    border-bottom: 2px solid transparent;
    &.hover-top:hover {
      border-top: 2px solid ${props => props.theme['@primary-color']};
    }
    &.hover-bottom:hover {
      border-bottom: 2px solid ${props => props.theme['@primary-color']};
    }
  }
`

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
      <StyledReactSortableWrapper>
        <ReactSortable
          handle=".draggable-items"
          list={sortingItems}
          ghostClass="hover-background"
          setList={setSortingItems}
        >
          {sortingItems.map((sortingItem, sortingItemIndex) => (
            <StyledDraggableItem
              key={sortingItem.id}
              className="mb-2"
              dataId={sortingItem.id}
              handlerClassName="draggable-items"
              actions={[
                <StyledSelect
                  key={sortingItem.id}
                  value={sortingItemIndex + 1}
                  showArrow={false}
                  bordered={false}
                  onSelect={position => {
                    const cloneData = sortingItems.slice()
                    cloneData.splice(Number(sortingItemIndex), 1)
                    cloneData.splice(Number(position) - 1, 0, sortingItem)
                    setSortingItems(cloneData)
                  }}
                  optionLabelProp="label"
                  dropdownStyle={{ minWidth: '120px', borderRadius: '4px' }}
                  dropdownRender={menu => <StyledSelectOptionWrapper>{menu}</StyledSelectOptionWrapper>}
                >
                  {Array.from(Array(sortingItems.length).keys()).map((value, index) => (
                    <Select.Option
                      className={
                        sortingItemIndex === index ? 'active' : sortingItemIndex > index ? 'hover-top' : 'hover-bottom'
                      }
                      key={value}
                      value={value + 1}
                      label={value + 1}
                    >
                      <span>{value + 1}</span>
                      {sortingItemIndex === index ? `（${formatMessage(commonMessages.label.current)}）` : ''}
                    </Select.Option>
                  ))}
                </StyledSelect>,
              ]}
            >
              {sortingItem.title}
            </StyledDraggableItem>
          ))}
        </ReactSortable>
      </StyledReactSortableWrapper>
    </AdminModal>
  )
}

export default ItemsSortingModal
