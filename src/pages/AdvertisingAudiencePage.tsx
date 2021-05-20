import { Bar } from '@ant-design/charts'
import { BarConfig } from '@ant-design/charts/es/bar'
import { BarChartOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Form, Select } from 'antd'
import gql from 'graphql-tag'
import { AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import CategorySelector from 'lodestar-app-admin/src/components/form/CategorySelector'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import { countBy, map, pipe, toPairs } from 'ramda'
import React, { useState } from 'react'
import styled from 'styled-components'
import hasura from '../hasura'

const memberPropertySelectNames = [
  '學習動機',
  '學生程度',
  '身分',
  '職業',
  '是否有轉職意願',
  '是否為相關職務',
  '每月學習預算',
]

const StyledSelectorWrapper = styled.div`
  width: 300px;
`

const AdvertisingAudiencePage: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const { loadingProperties, errorProperties, properties } = useProperty({
    propertyNames: memberPropertySelectNames,
  })
  const { members } = useAdvertisingMembers({
    categoryId: selectedCategoryId,
    propertyId: selectedPropertyId,
  })

  const countByPropertyAndMaterial = pipe(
    countBy<{ id: string; propertyValue: string; materialValue: string }>(v => v.propertyValue + ',' + v.materialValue),
    toPairs,
    map(v => ({
      propertyValue: v[0].split(',')[0],
      materialValue: v[0].split(',')[1],
      count: v[1],
    })),
  )

  const data = countByPropertyAndMaterial(
    members?.flatMap(v =>
      v.materialValue?.split(',').map(y => ({
        id: v.id,
        propertyValue: v.propertyValue,
        materialValue: y,
      })),
    ) || [],
  )

  const config: BarConfig = {
    data,
    xField: 'count',
    yField: 'materialValue',
    isStack: true,
    seriesField: 'propertyValue',
    label: {
      position: 'middle',
      layout: [{ type: 'interval-adjust-position' }, { type: 'interval-hide-overlap' }, { type: 'adjust-color' }],
    },
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <BarChartOutlined className="mr-3" />
        <span>廣告受眾</span>
      </AdminPageTitle>
      <Form colon={false} labelAlign="left">
        <Form.Item label="領域">
          <StyledSelectorWrapper>
            <CategorySelector
              single={true}
              classType="member"
              onChange={category => {
                setSelectedCategoryId(category)
              }}
            />
          </StyledSelectorWrapper>
        </Form.Item>
        <Form.Item label="資料類別">
          <StyledSelectorWrapper>
            <Select
              loading={loadingProperties || !!errorProperties}
              onChange={(value: string) => setSelectedPropertyId(value)}
            >
              {properties.map(v => (
                <Select.Option key={v.id} value={v.id}>
                  {v.name}
                </Select.Option>
              ))}
            </Select>
          </StyledSelectorWrapper>
        </Form.Item>
      </Form>
      {members?.length && <Bar {...config} />}
    </AdminLayout>
  )
}

const useProperty = (options?: { propertyNames?: string[] }) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_PROPERTY, hasura.GET_PROPERTYVariables>(
    gql`
      query GET_PROPERTY($type: String!, $propertyNames: [String!]) {
        property(where: { type: { _eq: $type }, name: { _in: $propertyNames } }, order_by: { position: asc }) {
          id
          name
          placeholder
        }
      }
    `,
    {
      variables: {
        type: 'member',
        propertyNames: options?.propertyNames,
      },
    },
  )

  const properties =
    data?.property.map(v => ({
      id: v.id,
      name: v.name,
      options: v.placeholder?.replace(/^\(|\)$/g, '').split('/') || null,
    })) || []

  return {
    loadingProperties: loading,
    errorProperties: error,
    properties,
    refetchProperties: refetch,
  }
}

const useAdvertisingMembers = (filter?: { categoryId?: string; propertyId?: string }) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_ADVERTISING_MEMBER,
    hasura.GET_ADVERTISING_MEMBERVariables
  >(
    gql`
      query GET_ADVERTISING_MEMBER($categoryId: String!, $propertyId: uuid!) {
        member(
          where: {
            _and: [
              { member_properties: { property_id: { _eq: $propertyId }, value: { _neq: "" } } }
              { member_properties: { property: { name: { _eq: "廣告素材" } }, value: { _is_null: false } } }
              { member_categories: { category_id: { _eq: $categoryId } } }
            ]
          }
        ) {
          id
          member_properties(where: { property_id: { _eq: $propertyId } }) {
            id
            v: value
          }
          material: member_properties(where: { property: { name: { _eq: "廣告素材" } } }) {
            id
            v: value
          }
        }
      }
    `,
    {
      variables: {
        categoryId: filter?.categoryId || '',
        propertyId: filter?.propertyId || '',
      },
    },
  )

  const members = data?.member.map(v => ({
    id: v.id,
    propertyValue: v.member_properties[0].v,
    materialValue: v.material[0]?.v,
  }))

  return {
    loadingMembers: loading,
    errorMembers: error,
    members,
    refetchMember: refetch,
  }
}

export default AdvertisingAudiencePage
