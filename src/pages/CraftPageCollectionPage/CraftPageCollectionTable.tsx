import { MoreOutlined, SearchOutlined } from '@ant-design/icons'
import { Dropdown, Input, Menu, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AppPageProps } from '../../hooks/appPage'
import CraftPageReplicateModal from './CraftPageReplicateModal'
import craftPageCollectionPageMessages from './translation'

const StyledText = styled.div`
  color: var(--gray-darker);
  line-height: 24px;
  letter-spacing: 0.2px;
  cursor: pointer;
`
const StyledUpdatedAtAndEditor = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  line-height: 22px;
  letter-spacing: 0.18px;
  cursor: pointer;
`

const filterIcon = (filtered: boolean) => <SearchOutlined style={{ color: filtered ? 'var(--primary)' : undefined }} />

type CraftPageColumnProps = Pick<AppPageProps, 'id' | 'title' | 'path' | 'updatedAt' | 'editorName' | 'craftData'>

const CraftPageCollectionTable: React.VFC<{
  loading: boolean
  pages: CraftPageColumnProps[]
  onRefetch?: () => Promise<any>
}> = ({ loading, pages, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [searchPageName, setSearchPageName] = useState<string>('')

  const openCraftPage = (recordId: string) => {
    window.open(`${process.env.PUBLIC_URL}/craft-page/${recordId}?tab=editor`, '_blank')
  }

  const columns: ColumnProps<CraftPageColumnProps>[] = [
    {
      key: 'pageName',
      title: formatMessage(craftPageCollectionPageMessages['*'].pageName),
      width: '55%',
      render: (_, record) => <StyledText onClick={() => openCraftPage(record.id)}>{record.title}</StyledText>,
      filterDropdown: () => (
        <div className="p-2">
          <Input
            autoFocus
            value={searchPageName || ''}
            onChange={e => {
              searchPageName && setSearchPageName('')
              setSearchPageName(e.target.value)
            }}
          />
        </div>
      ),
      filterIcon,
    },
    {
      key: 'path',
      title: formatMessage(craftPageCollectionPageMessages.CraftPageCollectionTable.url),
      width: '25%',
      render: (_, record) => <StyledText onClick={() => openCraftPage(record.id)}>{record.path}</StyledText>,
    },
    {
      key: 'updatedAtAndEditor',
      title: formatMessage(craftPageCollectionPageMessages.CraftPageCollectionTable.latestUpdatedAt),
      width: '40%',
      render: (_, record) => (
        <StyledUpdatedAtAndEditor onClick={() => openCraftPage(record.id)}>
          <div>{moment(record.updatedAt).format('YYYY-MM-DD HH:mm')}</div>
          <div>{record.editorName}</div>
        </StyledUpdatedAtAndEditor>
      ),
      sorter: (a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0),
    },
    {
      key: 'dropdownMenu',
      title: '',
      width: '100px',
      render: (_, record) => (
        <Dropdown
          placement="bottomRight"
          overlay={
            <Menu>
              <Menu.Item>
                <CraftPageReplicateModal
                  originCraftPage={{
                    id: record.id,
                    path: record?.path || '',
                    title: record?.title || '',
                    craftData: record.craftData,
                  }}
                  renderTrigger={({ setVisible }) => (
                    <span onClick={() => setVisible(true)}>
                      {formatMessage(craftPageCollectionPageMessages['*'].duplicateCraftPage)}
                    </span>
                  )}
                  onRefetch={onRefetch}
                />
              </Menu.Item>
              {/* add deletion menu item */}
            </Menu>
          }
          trigger={['click']}
        >
          <MoreOutlined style={{ fontSize: '20px' }} onClick={e => e.stopPropagation()} />
        </Dropdown>
      ),
    },
  ]

  return (
    <Table<CraftPageColumnProps>
      loading={loading}
      rowKey="id"
      columns={columns}
      dataSource={pages.filter(page => !searchPageName || page.title?.includes(searchPageName))}
    />
  )
}
export default CraftPageCollectionTable
