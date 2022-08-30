import { MoreOutlined, SearchOutlined } from '@ant-design/icons'
import { Dropdown, Input, Menu, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { EmptyBlock } from '../../components/admin'
import GiftPlanCollectionAdminModal from '../../components/gift/GiftPlanCollectionAdminModal'
import GiftPlanDeleteAdminModal from '../../components/gift/GiftPlanDeleteAdminModal'
import GiftPlanPublishAdminModal from '../../components/gift/GiftPlanPublishAdminModal'
import pageMessages from '../translation'

const StyledDiv = styled.div`
  .ant-table-content {
    padding: 0.25rem 1.5rem 2.5rem;
  }
`

const DetailItem = styled(Menu.Item)`
  padding: 0.5rem 1rem;
`

const filterIcon = (filtered: boolean) => <SearchOutlined style={{ color: filtered ? 'var(--primary)' : undefined }} />

type GiftPlanColumn = {
  id: string
  title: string
}

const GiftPlanCollectionBlock: React.VFC<{
  tab: string
}> = ({ tab }) => {
  const { formatMessage } = useIntl()
  const [searchTitle, setSearchTitle] = useState('')

  const columns: ColumnProps<GiftPlanColumn>[] = [
    {
      key: 'title',
      title: formatMessage(pageMessages['*'].title),
      width: '95%',
      render: (_, record) => <GiftPlanCollectionAdminModal giftPlanId={record.id} />,
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
              <DetailItem>
                <GiftPlanPublishAdminModal giftPlanId={record.id} />
              </DetailItem>
              <DetailItem>
                <GiftPlanDeleteAdminModal giftPlanId={record.id} />
              </DetailItem>
            </Menu>
          }
          trigger={['click']}
        >
          <MoreOutlined style={{ fontSize: '20px' }} onClick={e => e.stopPropagation()} />
        </Dropdown>
      ),
      filterDropdown: () => (
        <div className="p-2">
          <Input
            autoFocus
            value={searchTitle}
            onChange={e => {
              searchTitle && setSearchTitle('')
              setSearchTitle(e.target.value)
            }}
          />
        </div>
      ),
      filterIcon,
    },
  ]

  // if (loadingVoucherPlans) {
  //   return <Skeleton active />
  // }

  // if (error) {
  //   return <div>{formatMessage(pageMessages.VoucherPlanCollectionBlock.fetchDataError)}</div>
  // }

  const giftPlansData: any[] = [{ id: 1, title: '大麥克' }]

  return (
    <>
      {giftPlansData.length === 0 ? (
        <EmptyBlock>{formatMessage(pageMessages.VoucherPlanCollectionBlock.emptyVoucherPlan)}</EmptyBlock>
      ) : (
        <StyledDiv>
          <Table<GiftPlanColumn> loading={false} rowKey="id" columns={columns} dataSource={giftPlansData} />
        </StyledDiv>
      )}
    </>
  )
}

export default GiftPlanCollectionBlock

// const useGiftPlanCollection = (condition: hasura.GET_GIFT_PLAN_COLLECTIONVariables['condition']) => {
//   const { loading, error, data, refetch } = useQuery<
//     hasura.GET_GIFT_PLAN_COLLECTION,
//     hasura.GET_GIFT_PLAN_COLLECTIONVariables
//   >(GET_GIFT_PLAN_COLLECTION, {
//     variables: {
//       condition,
//     },
//   })
//   const giftPlans: GiftPlanColumn[] =
//     data?.gift_plan.map(v => ({
//       id: v.id,
//       title: v.title,
//     })) || []

//   return {
//     giftPlans: giftPlans,
//     refetchQuestionLibrary: refetch,
//     giftPlansLoading: loading,
//     giftPlansError: error,
//   }
// }

const GET_GIFT_PLAN_COLLECTION = gql`
  query GET_GIFT_PLAN_COLLECTION($condition: gift_plan_bool_exp!) {
    gift_plan(where: $condition, order_by: { updated_at: desc }) {
      id
      title
    }
  }
`
