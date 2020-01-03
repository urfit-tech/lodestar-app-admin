import { useQuery } from '@apollo/react-hooks'
import { Button, Icon, Spin, Typography } from 'antd'
import gql from 'graphql-tag'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { BooleanParam, StringParam, useQueryParam } from 'use-query-params'
import DefaultLayout from '../../components/layout/DefaultLayout'
import ProgramCard from '../../components/program/ProgramCard'
import ProgramCategorySelector from '../../components/program/ProgramCategorySelector'
import { useAuth } from '../../contexts/AuthContext'
import types from '../../types'

const StyledWrapper = styled.div`
  background: #f7f8f8;
`
const StyledButton = styled(Button)`
  padding: 0 20px;
  font-size: 14px;
`

const ProgramCollectionPage = () => {
  const [defaultActive, setDefaultActive] = useQueryParam('active', StringParam)
  const [type] = useQueryParam('type', StringParam)
  const [title] = useQueryParam('title', StringParam)
  const [noPrice] = useQueryParam('noPrice', BooleanParam)
  const [noMeta] = useQueryParam('noMeta', BooleanParam)
  const [selectedCategoryId, setSelectedCategoryId] = useState(defaultActive)
  const { currentMemberId } = useAuth()

  useEffect(() => {
    setSelectedCategoryId(defaultActive)
  }, [defaultActive])

  return (
    <DefaultLayout white>
      <StyledWrapper>
        <div className="py-5 container">
          {title ? (
            <Typography.Title level={4} className="mb-0">
              <Icon type="appstore" theme="filled" className="mr-3" />
              <span>{title}</span>
            </Typography.Title>
          ) : (
            <div>
              <Typography.Title level={4} className="mb-4">
                <Icon type="appstore" theme="filled" className="mr-3" />
                <span>探索</span>
              </Typography.Title>

              <StyledButton
                shape="round"
                className="mb-2 mr-2"
                onClick={() => setDefaultActive(undefined)}
                type={selectedCategoryId ? 'default' : 'primary'}
              >
                全部分類
              </StyledButton>

              <ProgramCategorySelector flatten value={selectedCategoryId} onChange={setDefaultActive} />
            </div>
          )}
        </div>
      </StyledWrapper>

      <div className="container py-4">
        {currentMemberId && (
          <ProgramCollectionBlock
            type={type}
            noPrice={noPrice}
            memberId={currentMemberId}
            selectedCategoryId={selectedCategoryId}
            withMetadata={!noMeta}
          />
        )}
      </div>
    </DefaultLayout>
  )
}

const ProgramCollectionBlock: React.FC<{
  type?: string
  noPrice?: boolean
  withMetadata?: boolean
  selectedCategoryId?: string
  memberId: string
}> = ({ memberId, selectedCategoryId, noPrice, withMetadata, type }) => {
  const { loading, data, error } = useQuery<types.GET_PROGRAM_COLLECTION, types.GET_PROGRAM_COLLECTIONVariables>(
    GET_PROGRAM_COLLECTION,
    {
      variables: { appId: localStorage.getItem('kolable.app.id') || '' },
    },
  )

  const selectedPrograms =
    loading || error || !data
      ? []
      : data.program.filter((value: any) =>
          selectedCategoryId
            ? value.program_categories.find(
                (programCategory: any) => programCategory.category_id === selectedCategoryId,
              )
            : true,
        )

  return (
    <div className="row">
      {loading ? (
        <Spin />
      ) : error ? (
        '無法載入'
      ) : selectedPrograms.length === 0 ? (
        <div>沒有任何內容</div>
      ) : (
        selectedPrograms.map((value: any) => (
          <div key={value.id} className="col-12 mb-4 col-md-6 col-lg-4">
            <ProgramCard
              memberId={memberId}
              programId={value.id}
              withMetadata={withMetadata}
              noPrice={noPrice}
              programType={type}
            />
          </div>
        ))
      )}
    </div>
  )
}

const GET_PROGRAM_COLLECTION = gql`
  query GET_PROGRAM_COLLECTION($appId: String!) {
    program(
      where: { app_id: { _eq: $appId }, published_at: { _is_null: false }, funding_id: { _is_null: true } }
      order_by: [{ position: asc }, { published_at: desc }]
    ) {
      id
      program_categories {
        category_id
      }
    }
  }
`

export default ProgramCollectionPage
