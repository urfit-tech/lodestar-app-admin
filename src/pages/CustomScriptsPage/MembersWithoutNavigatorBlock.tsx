import { useQuery } from '@apollo/react-hooks'
import { Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import gql from 'graphql-tag'
import React from 'react'
import styled from 'styled-components'
import hasura from '../../hasura'

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
  agreedAt: Date
  projectPlanName: string
  abilityLevel: string
}

const MembersWithoutNavigatorBlock: React.VFC = () => {
  const columns: ColumnsType<Member> = [{}]

  return (
    <StyledTableWrapper>
      <Table<Member>
        rowKey="id"
        rowClassName="no-wrap"
        columns={columns}
        dataSource={[]}
        pagination={false}
        scroll={{ x: true }}
      />
    </StyledTableWrapper>
  )
}

const useMemberWithoutNavigator = () => {
  const { loading, error, data } = useQuery<hasura.GET_VALID_MEMBER_CONTRACT>(gql`
    query GET_VALID_MEMBER_CONTRACT {
      member_contract(where: { agreed_at: { _is_null: false }, member: { app_id: { _eq: "xuemi" } } }) {
        id
        member {
          id
          name
          email
        }
      }
    }
  `)
  return {
    loading,
    error,
    data,
  }
}

export default MembersWithoutNavigatorBlock
