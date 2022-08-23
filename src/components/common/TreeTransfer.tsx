import { Transfer, Tree } from 'antd'
import { TransferDirection, TransferItem } from 'antd/lib/transfer'
import { DataNode } from 'antd/lib/tree'
import styled from 'styled-components'

const StyledWrapper = styled.div`
  && .ant-btn.ant-btn-primary {
    display: inline-flex !important;
  }
`

interface TreeTransferProps {
  dataSource: DataNode[]
  targetKeys: string[]
  onChange: (targetKeys: string[], direction: TransferDirection, moveKeys: string[]) => void
}

const isChecked = (selectedKeys: (string | number)[], eventKey: string | number) => selectedKeys.includes(eventKey)

const generateTree = (treeNodes: DataNode[] = [], checkedKeys: string[] = []): DataNode[] =>
  treeNodes.map(({ children, ...props }) => ({
    ...props,
    disabled: checkedKeys.includes(props.key as string),
    children: generateTree(children, checkedKeys),
  }))

const TreeTransfer = ({ dataSource, targetKeys, ...restProps }: TreeTransferProps) => {
  const transferDataSource: TransferItem[] = []
  function flatten(list: DataNode[] = []) {
    list.forEach(item => {
      transferDataSource.push(item as TransferItem)
      flatten(item.children)
    })
  }
  flatten(dataSource)

  return (
    <StyledWrapper>
      <Transfer
        {...restProps}
        targetKeys={targetKeys}
        dataSource={transferDataSource}
        className="tree-transfer"
        render={item => item.title!}
        showSelectAll={false}
      >
        {({ direction, onItemSelect, selectedKeys }) => {
          if (direction === 'left') {
            const checkedKeys = [...selectedKeys, ...targetKeys]
            return (
              <Tree
                blockNode
                checkable
                checkStrictly
                defaultExpandAll
                checkedKeys={checkedKeys}
                treeData={generateTree(dataSource, targetKeys)}
                onCheck={(_, { node: { key } }) => {
                  onItemSelect(key as string, !isChecked(checkedKeys, key))
                }}
                onSelect={(_, { node: { key } }) => {
                  onItemSelect(key as string, !isChecked(checkedKeys, key))
                }}
              />
            )
          }
        }}
      </Transfer>
    </StyledWrapper>
  )
}

export default TreeTransfer
