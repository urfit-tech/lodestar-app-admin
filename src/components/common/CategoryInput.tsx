import { useQuery } from '@apollo/react-hooks'
import { Select } from 'antd'
import gql from 'graphql-tag'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'

export default function CategoryInput({
  class: categoryClass,
  value,
  onChange,
}: {
  class: string
  value?: string
  onChange?: (category: string | null) => void
}) {
  const { formatMessage } = useIntl()
  const { loading, error, data } = useQuery<hasura.GET_CATEGORY_LIST>(
    gql`
      query GET_CATEGORY_LIST($class: String!) {
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
      mode="multiple"
      allowClear
      loading={loading || !!error}
      style={{ width: '100%' }}
      value={value}
      onChange={value => onChange?.(value || null)}
    >
      {data?.category.map(v => (
        <Select.Option key={v.id} value={v.name}>
          {v.name}
        </Select.Option>
      ))}
    </Select>
  )
}
