import { gql, useQuery } from '@apollo/client'
import { Select } from 'antd'
import { SelectProps } from 'antd/lib/select'
import { useIntl } from 'react-intl'
import * as hasura from '../../hasura'
import { craftPageMessages } from '../../helpers/translation'

const MemberPropertySelector: React.VFC<SelectProps<string | string[]>> = props => {
  const { formatMessage } = useIntl()
  const { data, loading } = useQuery<hasura.GET_MEMBER_PROPERTIES>(GET_MEMBER_PROPERTIES)
  return (
    <Select
      loading={loading}
      showSearch
      mode="multiple"
      allowClear
      style={{ width: '100%' }}
      placeholder={formatMessage(craftPageMessages.text.chooseCategories)}
      optionFilterProp="children"
      filterOption={(input, option) => option?.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
      {...props}
    >
      {data?.property.map(v => (
        <Select.Option key={v.id} value={v.id}>
          {v.name}
        </Select.Option>
      ))}
    </Select>
  )
}

const GET_MEMBER_PROPERTIES = gql`
  query GET_MEMBER_PROPERTIES {
    property(where: { type: { _eq: "member" } }) {
      id
      name
    }
  }
`

export default MemberPropertySelector
