import { Bar } from '@ant-design/charts'
import { BarConfig } from '@ant-design/charts/es/index'
import { BarChartOutlined, SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/client'
import { Form, Input, Select } from 'antd'
import gql from 'graphql-tag'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { countBy, map, pipe, toPairs } from 'ramda'
import React, { useState } from 'react'
import styled from 'styled-components'
import { AdminPageTitle } from '../components/admin'
import AdminLayout from '../components/layout/AdminLayout'
import hasura from '../hasura'
import ForbiddenPage from './ForbiddenPage'

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
const StyledSearchIcon = styled(SearchOutlined)`
  color: var(--gray);
`

const AdvertisingAudiencePage: React.FC = () => {
  const { permissions } = useAuth()
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [learningAreaSearchTexts, setLearningAreaSearchTexts] = useState<string[]>([])
  const { loadingProperties, errorProperties, properties } = useProperty({
    propertyNames: memberPropertySelectNames,
  })
  const { members } = useAdvertisingMembers({
    learningAreaSearchTexts,
    propertyId: selectedPropertyId,
  })

  const countByPropertyAndMaterial = pipe(
    countBy<{ id: string; propertyValue: string; materialValue: string }>(v => v.propertyValue + ',' + v.materialValue),
    toPairs,
    map(v => ({
      propertyValue: v[0].split(',')[0],
      materialValue: v[0].split(',')[1],
      count: v[1] as number,
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
    .filter(v => learningAreaSearchTexts?.some(t => v.materialValue.toLowerCase().includes(t)))
    .sort((a, b) => b.count - a.count)

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

  if (!permissions.ANALYSIS_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <BarChartOutlined className="mr-3" />
        <span>廣告受眾</span>
      </AdminPageTitle>
      <Form colon={false} labelAlign="left">
        <Form.Item label="領域" name="learningArea">
          <StyledSelectorWrapper>
            <Input
              suffix={<StyledSearchIcon />}
              placeholder="關鍵字搜尋"
              onChange={e =>
                setLearningAreaSearchTexts(
                  e.target.value
                    .toLowerCase()
                    .split(' ')
                    .filter(v => v),
                )
              }
            />
          </StyledSelectorWrapper>
        </Form.Item>
        <Form.Item label="資料類別" name="memberProperty">
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
      {!!members?.length && <Bar {...config} />}
    </AdminLayout>
  )
}

const useProperty = (options?: { propertyNames?: string[] }) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_PROPERTY_XUEMI, hasura.GET_PROPERTY_XUEMIVariables>(
    gql`
      query GET_PROPERTY_XUEMI($type: String!, $propertyNames: [String!]) {
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

const useAdvertisingMembers = (filter?: { learningAreaSearchTexts?: string[]; propertyId?: string }) => {
  const condition: hasura.GET_ADVERTISING_MEMBERVariables['condition'] = {
    _and: [
      { member_properties: { property_id: { _eq: filter?.propertyId || undefined }, value: { _neq: '' } } },
      {
        _or:
          filter?.learningAreaSearchTexts?.map(v => ({
            member_properties: {
              property: { name: { _eq: '廣告素材' } },
              value: { _ilike: `%${v}%` },
            },
          })) || [],
      },
    ],
  }

  const { loading, error, data, refetch } = useQuery<
    hasura.GET_ADVERTISING_MEMBER,
    hasura.GET_ADVERTISING_MEMBERVariables
  >(
    gql`
      query GET_ADVERTISING_MEMBER($condition: member_bool_exp, $propertyId: uuid!) {
        member(where: $condition) {
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
        condition,
        propertyId: filter?.propertyId || undefined,
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
