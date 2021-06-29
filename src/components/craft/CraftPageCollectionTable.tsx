// components/user/Card.js
import { SearchOutlined } from '@ant-design/icons'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
// import { craftPageMessages } from '../../helpers/translation'

type CraftPageProps = {
  id: string
  pageName: string
  url: string
  updateAt: Date
}

const StyledText = styled.div`
  color: var(--gray-darker);
  line-height: 1.5;
  letter-spacing: 0.2px;
`
const filterIcon = (filtered: boolean) => <SearchOutlined style={{ color: filtered ? 'var(--primary)' : undefined }} />

const CraftPageCollectionTable: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [searchPageName, setSearchPageName] = useState<string | null>(null)

  // const columns: ColumnProps<CraftPageProps>[] = [
  //   {
  //     dataIndex: 'pageName',
  //     title: formatMessage(craftPageMessages.label.pageName),
  //     width: '55%',
  //     render: (text, record, index) => <StyledText>{text}</StyledText>,
  //     filterDropdown: () => (
  //       <div className="p-2">
  //         <Input
  //           autoFocus
  //           value={searchPageName || ''}
  //           onChange={e => {
  //             searchPageName && setSearchPageName('')
  //             setSearchPageName(e.target.value)
  //           }}
  //         />
  //       </div>
  //     ),
  //     filterIcon,
  //   },
  //   {
  //     dataIndex: 'url',
  //     title: formatMessage(craftPageMessages.label.url),
  //     width: '25%',
  //     render: (text, record, index) => <StyledText>{text}</StyledText>,
  //   },
  //   {
  //     dataIndex: 'updateAt',
  //     title: formatMessage(craftPageMessages.label.latestUpdatedAt),
  //     width: '40%',
  //     render: (text, record, index) => <StyledText>{text}</StyledText>,
  //     sorter: (a, b) => b.updateAt?.getTime() || 0 - a.updateAt?.getTime() || 0,
  //   },
  // ]

  return <>{/* <Table columns={columns} /> */}</>
}
export default CraftPageCollectionTable
