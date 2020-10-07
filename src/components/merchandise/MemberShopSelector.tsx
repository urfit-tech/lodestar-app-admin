import { useQuery } from '@apollo/react-hooks'
import { Select, Spin } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { useIntl } from 'react-intl'
import { merchandiseMessages } from '../../helpers/translation'
import types from '../../types'

const MemberShopSelector: React.FC<{
  allText?: string
  value?: string
  onChange?: (value: string) => void
}> = ({ allText, value, onChange }) => {
  const { formatMessage } = useIntl()
  const { loading, data } = useQuery<types.GET_MEMBER_SHOP_TITLE_COLLECTION>(GET_MEMBER_SHOP_TITLE_COLLECTION)

  if (loading) {
    return <Spin />
  }

  return (
    <Select<string>
      showSearch
      optionFilterProp="title"
      placeholder={formatMessage(merchandiseMessages.text.selectMemberShopPlaceholder)}
      value={value}
      onChange={value => onChange && onChange(value)}
      style={{ width: '100%' }}
    >
      {allText && <Select.Option value="">{allText}</Select.Option>}
      {data?.member_shop.map(memberShop => (
        <Select.Option value={memberShop.id} title={memberShop.title}>
          {memberShop.title}
        </Select.Option>
      ))}
    </Select>
  )
}

const GET_MEMBER_SHOP_TITLE_COLLECTION = gql`
  query GET_MEMBER_SHOP_TITLE_COLLECTION {
    member_shop {
      id
      title
    }
  }
`

export default MemberShopSelector
