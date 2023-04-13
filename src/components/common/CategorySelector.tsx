import { useQuery } from '@apollo/client'
import { Select } from 'antd'
import gql from 'graphql-tag'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'

export default function CategorySelector({
  class: categoryClass,
  onChange,
}: {
  class: string
  onChange: (category: string | null) => void
}) {
  const { formatMessage } = useIntl()
  const { loading, error, data } = useQuery<hasura.GET_CATEGORY>(
    gql`
      query GET_CATEGORY($class: String!) {
        category(where: { class: { _eq: $class } }) {
          id
          name
        }
      }
    `,
    {
      variables: {
        class: categoryClass,
      },
    },
  )

  return (
    <Select
      loading={loading || !!error}
      style={{ width: 120 }}
      defaultValue=""
      onChange={value => onChange(value || null)}
    >
      <Select.Option key="" value="">
        {formatMessage(commonMessages.label.all)}
      </Select.Option>
      {data?.category.map(v => (
        <Select.Option key={v.id} value={v.name}>
          {v.name}
        </Select.Option>
      ))}
    </Select>
  )
}
