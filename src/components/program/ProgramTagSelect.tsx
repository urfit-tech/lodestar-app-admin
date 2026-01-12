import { gql, useQuery } from '@apollo/client'
import { Select } from 'antd'
import { SelectProps } from 'antd/lib/select'
import { useIntl } from 'react-intl'
import * as hasura from '../../hasura'
import { craftPageMessages } from '../../helpers/translation'

const ProgramTagSelect: React.VFC<SelectProps<string | string[]>> = props => {
  const { formatMessage } = useIntl()
  const { data, loading } = useQuery<hasura.GET_PROGRAM_TAGS>(GET_PROGRAM_TAGS)
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
      {data?.program_tag.map(v => (
        <Select.Option key={v.tag_name} value={v.tag_name}>
          {v.tag_name}
        </Select.Option>
      ))}
    </Select>
  )
}

const GET_PROGRAM_TAGS = gql`
  query GET_PROGRAM_TAGS {
    program_tag {
      tag_name
    }
  }
`

export default ProgramTagSelect
