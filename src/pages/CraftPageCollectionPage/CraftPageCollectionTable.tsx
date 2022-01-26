import { MoreOutlined, SearchOutlined } from '@ant-design/icons'
import { Dropdown, Input, Menu, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import CraftReplicateModal from '../../components/craft/CraftReplicateModal'
import { craftPageMessages } from '../../helpers/translation'
import CraftPageCollectionPageMessages from './translation'

const StyledText = styled.div`
  color: var(--gray-darker);
  line-height: 24px;
  letter-spacing: 0.2px;
`
const StyledUpdatedAtAndEditor = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  line-height: 22px;
  letter-spacing: 0.18px;
`

const filterIcon = (filtered: boolean) => <SearchOutlined style={{ color: filtered ? 'var(--primary)' : undefined }} />

type CraftPageColumnProps = {
  id: string
  title: string | null
  path: string | null
  updatedAt: Date | null
  editor: string | null
}

const CraftPageCollectionTable: React.VFC<{ pages: CraftPageColumnProps[] }> = ({ pages }) => {
  const { formatMessage } = useIntl()
  const [searchPageName, setSearchPageName] = useState<string>('')
  const [dropdownVisible, setDropdownVisible] = useState(false)

  const columns: ColumnProps<CraftPageColumnProps>[] = [
    {
      key: 'pageName',
      title: formatMessage(craftPageMessages.label.pageName),
      width: '55%',
      render: (_, record) => <StyledText>{record.title}</StyledText>,
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

      title: formatMessage(craftPageMessages.label.url),
      width: '25%',
      render: (_, record) => <StyledText>{record.path}</StyledText>,
    },
    {
      key: 'updatedAtAndEditor',
      title: formatMessage(craftPageMessages.label.latestUpdatedAt),
      width: '40%',
      render: (_, record) => (
        <StyledUpdatedAtAndEditor>
          <div>{moment(record.updatedAt).format('YYYY-MM-DD HH:MM')}</div>
          <div>{record.editor}</div>
        </StyledUpdatedAtAndEditor>
      ),
      sorter: (a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0),
    },
    {
      key: 'dropdownMenu',
      title: '',
      width: '100px',
      render: () => (
        <Dropdown
          placement="bottomRight"
          overlay={
            <Menu>
              <Menu.Item>
                <CraftReplicateModal
                  renderTrigger={() => (
                    <span>
                      {formatMessage(CraftPageCollectionPageMessages.CraftPageCollectionTable.duplicateCraftPage)}
                    </span>
                  )}
                />
              </Menu.Item>
              {/* add deletion menu item */}
            </Menu>
          }
          trigger={['hover']}
        >
          <MoreOutlined style={{ fontSize: '20px' }} onClick={e => e.stopPropagation()} />
        </Dropdown>
      ),
    },
  ]

  return (
    <>
      <Table<CraftPageColumnProps>
        rowKey="id"
        columns={columns}
        dataSource={pages.filter(page => !searchPageName || page.title?.includes(searchPageName))}
        onRow={(record, index) => ({
          onClick: e => {
            // if ( !== 'dropdownMenu') {
            console.log(index)
            // window.open(`${process.env.PUBLIC_URL}/craft-page/${record.id}?tab=editor`, '_blank')
            // }
          },
        })}
      />
    </>
  )
}
export default CraftPageCollectionTable
