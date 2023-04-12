import { useQuery } from '@apollo/client'
import { Select } from 'antd'
import { SelectProps } from 'antd/lib/select'
import { gql } from '@apollo/client'
import { useIntl } from 'react-intl'
import * as hasura from '../../hasura'
import { craftPageMessages } from '../../helpers/translation'

const PostCategorySelect: React.VFC<SelectProps<string | string[]>> = props => {
  const { formatMessage } = useIntl()
  const { data, loading } = useQuery<hasura.GET_POST_CATEGORIES>(GET_POST_CATEGORIES)
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
      {data?.category.map(v => (
        <Select.Option key={v.id} value={v.id}>
          {v.name}
        </Select.Option>
      ))}
    </Select>
  )
}

const GET_POST_CATEGORIES = gql`
  query GET_POST_CATEGORIES {
    category(where: { class: { _eq: "post" } }) {
      id
      name
    }
  }
`

export default PostCategorySelect
