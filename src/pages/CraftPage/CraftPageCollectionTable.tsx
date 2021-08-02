import { SearchOutlined } from '@ant-design/icons'
import { Input, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { craftPageMessages } from '../../helpers/translation'

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
  pageName: string
  path: string
  updatedAt: Date | null
  editor: string
}

const CraftPageCollectionTable: React.VFC<{ pages: CraftPageColumnProps[] }> = ({ pages }) => {
  const { formatMessage } = useIntl()
  const [searchPageName, setSearchPageName] = useState<string>('')

  const columns: ColumnProps<CraftPageColumnProps>[] = [
    {
      key: 'pageName',
      title: formatMessage(craftPageMessages.label.pageName),
      width: '55%',
      render: (_, record) => <StyledText>{record.pageName}</StyledText>,
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
  ]

  return (
    <>
      <Table<CraftPageColumnProps>
        rowKey="id"
        columns={columns}
        dataSource={pages.filter(page => !searchPageName || page.pageName.includes(searchPageName))}
        onRow={record => ({
          onClick: () => {
            window.open(`${process.env.PUBLIC_URL}/craft_page/${record.id}?tab=editor`, '_blank')
          },
        })}
      />
    </>
  )
}
export default CraftPageCollectionTable
