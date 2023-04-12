import { useQuery } from '@apollo/client'
import { Select } from 'antd'
import { SelectProps } from 'antd/lib/select'
import { gql } from '@apollo/client'
import { useIntl } from 'react-intl'
import * as hasura from '../../hasura'
import { craftPageMessages } from '../../helpers/translation'

const PostTagSelect: React.VFC<SelectProps<string | string[]>> = props => {
  const { formatMessage } = useIntl()
  const { data, loading } = useQuery<hasura.GET_POST_TAGS>(GET_POST_TAGS)
  return (
    <Select
      loading={loading}
      showSearch
      mode="multiple"
      allowClear
      style={{ width: '100%' }}
      placeholder={formatMessage(craftPageMessages.text.chooseTags)}
      optionFilterProp="children"
      filterOption={(input, option) => option?.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
      {...props}
    >
      {data?.post_tag.map(v => (
        <Select.Option key={v.tag_name} value={v.tag_name}>
          {v.tag_name}
        </Select.Option>
      ))}
    </Select>
  )
}

const GET_POST_TAGS = gql`
  query GET_POST_TAGS {
    post_tag {
      tag_name
    }
  }
`

export default PostTagSelect
