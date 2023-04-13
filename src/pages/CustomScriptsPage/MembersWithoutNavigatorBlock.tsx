import { LinkOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/client'
import { Skeleton, Table } from 'antd'
import { ColumnProps } from 'antd/es/table'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import moment from 'moment'
import React from 'react'
import styled from 'styled-components'
import { AdminBlock, AdminBlockTitle } from '../../components/admin'
import { AvatarImage } from '../../components/common/Image'
import hasura from '../../hasura'

const StyledMemberName = styled.div`
  color: var(--gray-darker);
  line-height: 1.5;
  letter-spacing: 0.2px;
`
const StyledMemberEmail = styled.div`
  color: var(--gray-dark);
  font-size: 12px;
  letter-spacing: 0.6px;
`
const StyledTableWrapper = styled.div`
  th,
  td {
    white-space: nowrap;
  }
`

type Member = {
  id: string
  name: string
  email: string
  pictureUrl: string | null
  agreedAt: Date | null
  projectPlanName: string
  abilityLevel: string
}

const MembersWithoutNavigatorBlock: React.VFC = () => {
  const { loading, loadingMemberSpecificProperties, error, errorMemberSpecificProperties, memberWithoutNavigatorList } =
    useMemberWithoutNavigator()

  if (loading || loadingMemberSpecificProperties) return <Skeleton active />

  if (error || errorMemberSpecificProperties) return <div>讀取錯誤</div>

  const columns: ColumnProps<Member>[] = [
    {
      key: 'name',
      title: '學員姓名',
      render: (_, record) => (
        <div className="d-flex align-items-center">
          <AvatarImage size="36px" src={record.pictureUrl} className="flex-shrink-0 mr-2" />
          <div className="flex-grow-1">
            <StyledMemberName>{record.name}</StyledMemberName>
            <StyledMemberEmail>{record.email}</StyledMemberEmail>
          </div>
          <div>
            <a href={`/admin/members/${record.id}/profile`} target="_blank" rel="noreferrer">
              <LinkOutlined />
            </a>
          </div>
        </div>
      ),
    },
    {
      key: 'agreedAt',
      title: '簽署日期',
      dataIndex: 'agreedAt',
      render: (_, record) => <span>{moment(record.agreedAt).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      key: '產品',
      title: '產品',
      render: (_, record) => <span>{record.projectPlanName}</span>,
    },
    {
      key: '學員程度',
      title: '學員程度',
      render: (_, record) => <span>{record.abilityLevel}</span>,
    },
  ]

  return (
    <AdminBlock>
      <AdminBlockTitle>沒有領航員的學員</AdminBlockTitle>
      <StyledTableWrapper>
        <Table<Member>
          rowKey="id"
          rowClassName="no-wrap"
          columns={columns}
          dataSource={memberWithoutNavigatorList}
          pagination={false}
          scroll={{ x: true }}
        />
      </StyledTableWrapper>
    </AdminBlock>
  )
}

const useMemberWithoutNavigator = () => {
  const { id: appId } = useApp()
  const { loading, error, data } = useQuery<
    hasura.GET_VALID_MEMBER_CONTRACT,
    hasura.GET_VALID_MEMBER_CONTRACTVariables
  >(
    gql`
      query GET_VALID_MEMBER_CONTRACT($appId: String!) {
        member_contract(
          where: {
            agreed_at: { _is_null: false }
            revoked_at: { _is_null: true }
            ended_at: { _gte: "now()" }
            member: { app_id: { _eq: $appId } }
          }
          order_by: { agreed_at: desc }
        ) {
          id
          values
          member {
            id
            name
            email
            picture_url
          }
          agreed_at
        }
      }
    `,
    { variables: { appId } },
  )

  const contractMemberIds = data?.member_contract.map(v => v.member.id) || []

  const {
    loading: loadingMemberSpecificProperties,
    error: errorMemberSpecificProperties,
    data: memberSpecificProperties,
  } = useQuery<hasura.GET_MEMBER_WITH_NAVIGATOR_OR_ABILITY, hasura.GET_MEMBER_WITH_NAVIGATOR_OR_ABILITYVariables>(
    gql`
      query GET_MEMBER_WITH_NAVIGATOR_OR_ABILITY($appId: String!, $memberIds: [String!]!) {
        member_property(
          where: {
            property: { name: { _in: ["領航員", "學生程度"] } }
            member_id: { _in: $memberIds }
            member: { app_id: { _eq: $appId } }
          }
        ) {
          member_id
          value
          property {
            name
          }
        }
      }
    `,
    {
      variables: {
        appId,
        memberIds: contractMemberIds,
      },
    },
  )

  const memberWithNavigatorList = memberSpecificProperties?.member_property
    .filter(v => v.property.name === '領航員')
    .map(w => w.member_id)

  const memberWithAbilityList = memberSpecificProperties?.member_property
    .filter(v => v.property.name === '學生程度')
    .map(w => ({
      id: w.member_id,
      value: w.value,
    }))

  const memberWithoutNavigatorList: Member[] =
    data?.member_contract
      .filter(v => !memberWithNavigatorList?.some(w => w === v.member.id))
      .map(y => ({
        id: y.member.id,
        name: y.member.name,
        email: y.member.email,
        pictureUrl: y.member.picture_url || null,
        agreedAt: y.agreed_at ? y.agreed_at : new Date(y.agreed_at),
        projectPlanName:
          y.values?.projectPlanName || y.values?.orderProducts?.map((z: { name: string }) => z.name).join('、') || null,
        abilityLevel: memberWithAbilityList?.find(z => z.id === y.member.id)?.value || '',
      })) || []

  return {
    loading,
    error,
    loadingMemberSpecificProperties,
    errorMemberSpecificProperties,
    memberWithoutNavigatorList,
  }
}

export default MembersWithoutNavigatorBlock
