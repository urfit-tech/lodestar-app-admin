import { MoreOutlined, SearchOutlined } from '@ant-design/icons'
import { Dropdown, Input, Menu, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { EmptyBlock } from '../../components/admin'
import GiftPlanCollectionAdminModal from '../../components/gift/GiftPlanCollectionAdminModal'
import GiftPlanDeleteAdminModal from '../../components/gift/GiftPlanDeleteAdminModal'
import { GiftPlan } from '../../types/giftPlan'
import pageMessages from '../translation'
import GiftPlanCollectionAdminPageMessages from './translation'

const StyledDiv = styled.div`
  .ant-table-content {
    padding: 0.25rem 1.5rem 2.5rem;
  }
`

const StyledTitle = styled.div`
  color: var(--gray-darker);
  line-height: normal;
  letter-spacing: 0.2px;
  cursor: pointer;
`

const DetailItem = styled(Menu.Item)`
  padding: 0.5rem 1rem;
`

const filterIcon = (filtered: boolean) => <SearchOutlined style={{ color: filtered ? 'var(--primary)' : undefined }} />

const GiftPlanCollectionBlock: React.VFC<{
  giftPlanCollection: GiftPlan[]
  searchTitle: string
  onSearch?: (searchTitle: string) => void
  onRefetch?: () => void
}> = ({ giftPlanCollection, searchTitle, onSearch, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [giftPlanProps, setGiftPlanProps] = useState<{
    id: string
    title: string
    giftPlanProductId: string
    giftId: string
  }>()
  const [isModalVisible, setIsModalVisible] = useState(false)

  const columns: ColumnProps<GiftPlan>[] = [
    {
      key: 'title',
      title: formatMessage(pageMessages['*'].title),
      width: '70%',
      render: (_, record) => (
        <StyledTitle
          className="flex-grow-1"
          onClick={() => {
            setIsModalVisible(true)
            setGiftPlanProps({
              id: record.id,
              title: record.title,
              giftPlanProductId: record.giftPlanProductIdList[0],
              giftId: record.giftIdList[0],
            })
          }}
        >
          {record.title}
        </StyledTitle>
      ),
      filterDropdown: () => (
        <div className="p-2">
          <Input
            autoFocus
            value={searchTitle}
            onChange={e => {
              onSearch?.(e.target.value)
            }}
          />
        </div>
      ),
      filterIcon,
    },
    // TODO: 排序
    {
      key: 'createdAt',
      title: formatMessage(GiftPlanCollectionAdminPageMessages.GiftPlanCollectionBlock.createAt),
      width: '25%',
      render: (_, record) => <>{record.createdAt}</>,
    },
    {
      key: '',
      title: '',
      width: '5%',
      render: (_, record) => (
        <Dropdown
          placement="bottomRight"
          overlay={
            <Menu>
              {/* TODO: 先註解，之後看情況再決定要不要加上/下架 */}
              {/* <DetailItem>
                <GiftPlanPublishAdminModal giftPlanId={record.id} />
              </DetailItem> */}
              <DetailItem>
                <GiftPlanDeleteAdminModal giftPlanId={record.id} onRefetch={onRefetch} />
              </DetailItem>
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
    <>
      {giftPlanProps && (
        <GiftPlanCollectionAdminModal
          visible={isModalVisible}
          setModalVisible={setIsModalVisible}
          giftPlan={{
            id: giftPlanProps.id,
            title: giftPlanProps.title,
            giftPlanProductId: giftPlanProps.giftPlanProductId,
          }}
          giftId={giftPlanProps.giftId}
          onRefetch={onRefetch}
        />
      )}
      {giftPlanCollection.length === 0 && searchTitle === '' ? (
        <EmptyBlock>{formatMessage(pageMessages.VoucherPlanCollectionBlock.emptyVoucherPlan)}</EmptyBlock>
      ) : (
        <StyledDiv>
          <Table<GiftPlan> loading={false} rowKey="id" columns={columns} dataSource={giftPlanCollection} />
        </StyledDiv>
      )}
    </>
  )
}

export default GiftPlanCollectionBlock
