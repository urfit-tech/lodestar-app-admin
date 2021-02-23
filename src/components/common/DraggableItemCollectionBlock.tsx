import { Select } from 'antd'
import { move } from 'ramda'
import React from 'react'
import { useIntl } from 'react-intl'
import { ReactSortable } from 'react-sortablejs'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import DraggableItem from './DraggableItem'
import { BraftContent } from './StyledBraftEditor'

const StyledSelect = styled(Select)`
  display: inline-flex;
  align-items: center;
  border-left: solid 1px var(--gray-light);
  width: 50px;
  height: 100%;
  text-align: center;
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

const StyledDraggableItem = styled(DraggableItem)`
  && {
    border: solid 1px var(--gray-light);
    border-radius: 4px;
    padding: 0 0 0 14px;
    background: white;
  }
`

const StyledSelectOptionWrapper = styled.div`
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

export type ItemProps = {
  id: string
  description: string | null
}

const DraggableItemCollectionBlock: React.FC<{
  items: ItemProps[]
  onSort: (newItems: ItemProps[]) => void
}> = ({ items, onSort }) => {
  const { formatMessage } = useIntl()
  return (
    <StyledReactSortableWrapper>
      <ReactSortable handle=".draggable-item" list={items} setList={onSort} ghostClass="hover-background">
        {items.map((v, i) => (
          <StyledDraggableItem
            handlerClassName="draggable-item"
            key={v.id}
            dataId={v.id}
            className="mb-2"
            actions={[
              <StyledSelect
                key={v.id}
                value={i + 1}
                showArrow={false}
                bordered={false}
                onSelect={position => onSort(move(i, Number(position) - 1, items))}
                optionLabelProp="label"
                dropdownStyle={{ minWidth: '120px', borderRadius: '4px' }}
                dropdownRender={menu => <StyledSelectOptionWrapper>{menu}</StyledSelectOptionWrapper>}
              >
                {Array.from(Array(items.length).keys()).map((value, index) => (
                  <Select.Option
                    className={i === index ? 'active' : i > index ? 'hover-top' : 'hover-bottom'}
                    key={value}
                    value={value + 1}
                    label={value + 1}
                  >
                    <span>{value + 1}</span>
                    {i === index ? `（${formatMessage(commonMessages.label.current)}）` : ''}
                  </Select.Option>
                ))}
              </StyledSelect>,
            ]}
          >
            <BraftContent>{v.description}</BraftContent>
          </StyledDraggableItem>
        ))}
      </ReactSortable>
    </StyledReactSortableWrapper>
  )
}

export default DraggableItemCollectionBlock
